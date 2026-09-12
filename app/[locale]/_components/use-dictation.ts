"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Speaking instead of typing, using the browser's own recogniser.
 *
 * Deliberately NOT a recording uploaded to a speech model. Two reasons, and
 * the second is the one that decides it:
 *
 *  1. It is free and instant — no audio leaves the device, no model call, no
 *     daily budget spent on someone dictating a sentence.
 *  2. This dictates what the learner wants to SAY, in a language they already
 *     have. It is not transcribing Swiss German — which nothing can do well;
 *     the state of the art translates dialect INTO Standard German, throwing
 *     away exactly the information a learner needs. Promising dialect
 *     transcription here would be the overclaim this product exists to avoid.
 *
 * Support is genuinely partial (Chrome, Edge, Safari; not Firefox) and — worse
 * — sometimes a lie: Chromium builds without Google's speech service accept
 * `start()` and then never fire an event. Measured against the live site on
 * 2026-09-12: nine seconds, zero events. Saying so is not enough; the person
 * still cannot dictate, which was the whole point.
 *
 * So the recogniser is the FAST PATH, not the only one. When it is missing, or
 * when it goes silent (START_TIMEOUT_MS), the same button records instead and
 * sends the audio to /api/transcribe. Cost and privacy are the reason that is
 * second and not first, never a reason to leave people with a dead control.
 */

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionCtor = new () => RecognitionLike;

function recogniser(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** Why a dictation produced no text, in terms the learner can act on. */
export type DictationProblem = "mic" | "silence" | "unavailable";

/**
 * Which recogniser failures the fallback can rescue.
 *
 * Only "unavailable": it means the RECOGNISER cannot do this — no speech
 * service behind the API, network refused, language unsupported — and
 * recording locally does not care about any of that. "mic" is about the
 * person's hardware or a permission they denied, and "silence" is about
 * whether they spoke; recording again would tell them the same thing twice.
 */
export function fallbackCanRescue(problem: DictationProblem | null): boolean {
  return problem === "unavailable";
}

/** Can this browser record at all? The fallback needs nothing more than this. */
export function canRecord(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

/**
 * Turn getUserMedia and fetch failures into the same three words the browser
 * path already speaks, so the UI never grows a second vocabulary for the same
 * three situations.
 */
export function problemForRecording(error: unknown): DictationProblem {
  const name = (error as { name?: string })?.name ?? "";
  if (name === "NotAllowedError" || name === "SecurityError") return "mic";
  if (name === "NotFoundError" || name === "NotReadableError") return "mic";
  return "unavailable";
}

/**
 * Anything unrecognised is `unavailable`, never nothing: a control that fails
 * without a word looks broken rather than unsupported.
 */
export function problemFor(error: string | undefined): DictationProblem | null {
  switch (error) {
    case "aborted":
      return null;
    case "not-allowed":
    case "service-not-allowed":
    case "audio-capture":
      return "mic";
    case "no-speech":
      return "silence";
    default:
      return "unavailable";
  }
}

/**
 * Some browsers expose the API, accept `start()`, and then never fire another
 * event — Chromium builds without Google's speech service among them. Once the
 * microphone is allowed, a working recogniser fires `start` well inside this;
 * without a limit the control would say "listening" forever.
 */
const START_TIMEOUT_MS = 4000;

/**
 * How long a pending permission may hold off the fallback.
 *
 * The wait itself is right — someone reading a permission dialog has not
 * failed. Making it UNBOUNDED was the bug: `permissions.query` reports
 * "prompt" both while a dialog is open AND when no dialog will ever appear,
 * and a recogniser with no speech service behind it never asks. So the button
 * said "Ich höre …" forever and the fallback never ran. Reproduced on the live
 * site 2026-09-12: twenty-two seconds, no timeout, nothing.
 *
 * Falling back is safe even with a real dialog open: getUserMedia asks for the
 * same permission, and the browser coalesces the two rather than stacking them.
 */
const PERMISSION_WAIT_MS = 10_000;

/** A permission prompt still waiting on the learner is not a dead recogniser. */
async function awaitingPermission(): Promise<boolean> {
  try {
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
    return status.state === "prompt";
  } catch {
    return false;
  }
}

/**
 * Pure: may the fallback keep waiting for a permission answer?
 *
 * Exported because "never forever" is the whole property, and it lived inside
 * a self-rescheduling timeout where nothing could see it.
 */
export function mayKeepWaitingForPermission(elapsedMs: number, permissionPending: boolean): boolean {
  return permissionPending && elapsedMs < PERMISSION_WAIT_MS;
}

/** Support never changes after load, so there is nothing to subscribe to. */
const noop = () => () => {};

export function useDictation(lang: string, onText: (text: string) => void) {
  /**
   * The server has no `window`, so support must be read on the client only —
   * but reading it in an effect and calling setState causes a cascading render,
   * and reading it during render would hydrate a tree different from the one
   * that was sent. `useSyncExternalStore` is the tool for exactly this: a
   * server snapshot of `false`, a client snapshot of the real answer.
   */
  const supported = useSyncExternalStore(
    noop,
    // Either path counts. Hiding the control in Firefox was right when the
    // recogniser was the only implementation; it is not right now that the
    // same button can record and have the server transcribe.
    () => Boolean(recogniser()) || canRecord(),
    () => false,
  );

  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [problem, setProblem] = useState<DictationProblem | null>(null);
  const ref = useRef<RecognitionLike | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);

  // Kept in a ref so restarting recognition never resurrects a stale closure
  // over an old input value. Assigned in an effect, not during render — a ref
  // written while rendering is not safe under concurrent rendering.
  const sink = useRef(onText);
  useEffect(() => {
    sink.current = onText;
  }, [onText]);

  const stop = useCallback(() => {
    const rec = ref.current;
    ref.current = null;
    rec?.stop();
    // Stopping the recorder is what STARTS the transcription: its `stop` event
    // is where the audio becomes a request.
    const rc = recorder.current;
    if (rc && rc.state !== "inactive") rc.stop();
    setListening(false);
  }, []);

  /**
   * The fallback: record, then have the server transcribe.
   *
   * Every track is stopped on the way out of each branch — a live microphone
   * left open because a request failed is the worst possible bug in a feature
   * about trust.
   */
  const record = useCallback(async () => {
    if (!canRecord()) {
      setProblem("unavailable");
      return;
    }
    setProblem(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setProblem(problemForRecording(e));
      return;
    }
    const release = () => stream.getTracks().forEach((t) => t.stop());
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream);
    } catch (e) {
      release();
      setProblem(problemForRecording(e));
      return;
    }
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    rec.onstop = async () => {
      release();
      recorder.current = null;
      setListening(false);
      const audio = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      if (audio.size === 0) {
        setProblem("silence");
        return;
      }
      setTranscribing(true);
      try {
        const body = new FormData();
        body.append("audio", audio);
        body.append("locale", lang.split("-")[0] ?? "de");
        const res = await fetch("/api/transcribe", { method: "POST", body });
        if (!res.ok) {
          setProblem("unavailable");
          return;
        }
        const said = ((await res.json()) as { text?: string }).text?.trim() ?? "";
        // Nothing heard is `silence`, the word the control already has for it.
        if (said) sink.current(said);
        else setProblem("silence");
      } catch {
        setProblem("unavailable");
      } finally {
        setTranscribing(false);
      }
    };
    recorder.current = rec;
    rec.start();
    setListening(true);
  }, [lang]);

  const start = useCallback(() => {
    const Ctor = recogniser();
    if (!Ctor) {
      void record();
      return;
    }
    setProblem(null);

    const rec = new Ctor();
    rec.lang = lang;
    // One utterance at a time. Continuous recognition left running on a phone
    // is a microphone nobody remembers they opened.
    rec.continuous = false;
    rec.interimResults = false;

    // A session that was stopped or replaced must not touch state: its late
    // `end` would otherwise switch off the session that followed it.
    const current = () => ref.current === rec;
    const finish = (next: DictationProblem | null) => {
      if (!current()) return;
      ref.current = null;
      setListening(false);
      setProblem(next);
    };

    let started = false;
    rec.onstart = () => {
      started = true;
    };
    // Not guarded: stopping mid-sentence should still deliver what was said.
    rec.onresult = (event) => {
      const said = Array.from({ length: event.results.length }, (_, i) => event.results[i]?.[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (said) sink.current(said);
    };
    rec.onerror = (event) => {
      const why = problemFor(event?.error);
      // "unavailable" means the RECOGNISER cannot do this — no speech service,
      // network refused, language unsupported. The fallback can, so try it
      // instead of telling the person their browser is incapable. "mic" and
      // "silence" are real answers about the person's microphone or their
      // voice, and recording again would not improve either.
      if (fallbackCanRescue(why) && canRecord()) {
        finish(null);
        void record();
        return;
      }
      finish(why);
    };
    rec.onend = () => finish(null);

    ref.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      // A fresh instance only throws when the engine refuses outright.
      finish("unavailable");
      return;
    }

    const giveUpWaitingAt = Date.now() + PERMISSION_WAIT_MS;
    const watch = () => {
      setTimeout(async () => {
        if (started || !current()) return;
        // Bounded. "prompt" means both "a dialog is open" and "no dialog will
        // ever appear", and only the clock can tell them apart.
        if (Date.now() < giveUpWaitingAt && (await awaitingPermission())) {
          watch();
          return;
        }
        if (started || !current()) return;
        // The recogniser took start() and said nothing. That is the exact case
        // the fallback exists for — record instead of telling the person their
        // browser cannot do it.
        finish(null);
        rec.abort();
        void record();
      }, START_TIMEOUT_MS);
    };
    watch();
  }, [lang, record]);

  const toggle = useCallback(() => {
    // Ignore a press while the server is answering: a second recording would
    // race the first one's text into the box.
    if (transcribing) return;
    if (listening) stop();
    else start();
  }, [listening, transcribing, start, stop]);

  // A live microphone must not survive the component that opened it.
  useEffect(() => stop, [stop]);

  return { supported, listening, transcribing, problem, toggle, start, stop };
}
