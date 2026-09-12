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
 * Support is genuinely partial (Chrome, Edge, Safari; not Firefox), so the
 * control hides itself where the API is missing. Where the API exists but does
 * not work, it has to say so instead — see START_TIMEOUT_MS.
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

/** A permission prompt still waiting on the learner is not a dead recogniser. */
async function awaitingPermission(): Promise<boolean> {
  try {
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
    return status.state === "prompt";
  } catch {
    return false;
  }
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
    () => Boolean(recogniser()),
    () => false,
  );

  const [listening, setListening] = useState(false);
  const [problem, setProblem] = useState<DictationProblem | null>(null);
  const ref = useRef<RecognitionLike | null>(null);

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
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = recogniser();
    if (!Ctor) return;
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
    rec.onerror = (event) => finish(problemFor(event?.error));
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

    const watch = () => {
      setTimeout(async () => {
        if (started || !current()) return;
        if (await awaitingPermission()) {
          watch();
          return;
        }
        if (started || !current()) return;
        finish("unavailable");
        rec.abort();
      }, START_TIMEOUT_MS);
    };
    watch();
  }, [lang]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  // A live microphone must not survive the component that opened it.
  useEffect(() => stop, [stop]);

  return { supported, listening, problem, toggle, start, stop };
}
