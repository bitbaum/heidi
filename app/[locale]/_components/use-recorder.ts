"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { measure, type Delivery } from "@/lib/domain/speaking/delivery";

/**
 * Record a take, measure it on the device, and hand the audio back ONLY if the
 * caller asked for it before recording started.
 *
 * THE DEFAULT IS STILL THAT THE AUDIO NEVER LEAVES THIS FUNCTION. The blob is
 * decoded with the Web Audio API in the page that recorded it, `measure()`
 * reduces it to a handful of numbers, and the blob is dropped. That is what
 * `retainAudio: false` — the default, and the whole dialect half of the
 * speaking screen — does, and the privacy line under it stays a description
 * rather than a promise.
 *
 * `retainAudio: true` EXISTS BECAUSE OF THE BRIDGE, and it is a real change
 * rather than a flag. Standard German recognition returns Standard German, so
 * `evidence.ts` says a transcript of it is the learner's own words and
 * `varieties.ts` offers it as a second thing to practise — which needs the
 * recording sent to a recogniser. Three things keep that honest:
 *
 *  1. It is a PARAMETER of the hook, fixed for the take before the microphone
 *     opens. There is no path from "recorded without it" to "uploaded anyway".
 *  2. The screen says which mode it is in, in the learner's language, next to
 *     the button — not in a policy page.
 *  3. The blob is still dropped the moment the caller is done with it, and
 *     `release()` still stops every track.
 *
 * A single flag inside this file with a default of "upload" would have been
 * one line shorter and would have made the sentence on the dialect screen
 * false. It is not a sentence this product may get wrong.
 *
 * Separate from `use-dictation`, which does a different job: dictation turns
 * whatever somebody says into text for a field. This measures the SIGNAL —
 * always, on the device, before anything else — and the measurement has no
 * server half in either mode, because there is nothing a server could add to
 * arithmetic over samples except a copy of somebody's voice.
 *
 * A live level is exposed while recording, for the one honest reason a
 * waveform exists: somebody speaking into a dead microphone needs to find out
 * now rather than after thirty seconds.
 */

export type RecorderState = "idle" | "asking" | "recording" | "measuring" | "done" | "error";

export type RecorderError = "denied" | "unsupported" | "failed";

export function recordingSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof (window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) !==
      "undefined"
  );
}

export function useRecorder({ retainAudio = false }: { retainAudio?: boolean } = {}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<RecorderError | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  /**
   * The recording itself, present only under `retainAudio`.
   *
   * Held in state rather than a ref because the caller RENDERS off it — a
   * bridge take shows "transcribing" the moment there is something to
   * transcribe — and a ref would not re-render to say so.
   */
  const [audio, setAudio] = useState<Blob | null>(null);
  const [level, setLevel] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  /**
   * The take's id, minted when recording STARTS rather than when the
   * measurement lands.
   *
   * Minting it here means the caller can tell "this measurement has not been
   * kept yet" by looking at its own stored list, instead of tracking that in
   * React state and setting it from an effect — which is a cascading render
   * and is what the lint rule about it is for.
   */
  const [takeId, setTakeId] = useState<string | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const frame = useRef<number | null>(null);
  const startedAt = useRef(0);

  /**
   * Everything the browser gave us, given back.
   *
   * A live MediaStream is a lit microphone indicator on the device. Leaving
   * one running after the take is finished is the kind of thing that costs a
   * product all of its credibility at once, and it costs nothing to avoid.
   */
  const release = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    void audioContext.current?.close().catch(() => {});
    audioContext.current = null;
    setLevel(0);
  }, []);

  useEffect(() => release, [release]);

  /**
   * Whether THIS take was started in a mode that keeps the audio.
   *
   * Read at the moment the take stops, so a learner who flips the mode switch
   * mid-recording still gets the behaviour they chose when they pressed
   * record. A prop read inside `onstop` would give the same answer by accident
   * of closure; a ref makes it deliberate.
   */
  const retain = useRef(retainAudio);

  /**
   * Decode the blob, reduce it to numbers, and drop the blob unless the take
   * was started in a mode that asked to keep it.
   *
   * Declared before `start`, which is the only caller, because `start` closes
   * over it in `rec.onstop` — and a `useCallback` referenced above its own
   * declaration is a temporal dead zone at module evaluation, not merely
   * untidy.
   */
  const analyse = useCallback(async (blob: Blob, keep: boolean) => {
    setState("measuring");
    try {
      const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const context = new Ctor!();
      const decoded = await context.decodeAudioData(await blob.arrayBuffer());
      // Channel 0 is enough: a microphone take is mono in substance whatever
      // the container says, and averaging channels would only blur it.
      const result = measure(decoded.getChannelData(0), decoded.sampleRate);
      void context.close().catch(() => {});
      setDelivery(result);
      // Handed over only when the take was started in a mode that asked for
      // it. Otherwise the blob goes out of scope here and is never referenced
      // again, which is the default and the dialect half's whole position.
      if (keep) setAudio(blob);
      setState("done");
    } catch {
      setError("failed");
      setState("error");
    }
  }, []);

  const start = useCallback(async () => {
    if (!recordingSupported()) {
      setError("unsupported");
      setState("error");
      return;
    }

    setError(null);
    setDelivery(null);
    setAudio(null);
    retain.current = retainAudio;
    // A new id per attempt, in a user event handler where setting state is
    // ordinary. See the note on `takeId`.
    setTakeId(`${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    setState("asking");

    let media: MediaStream;
    try {
      media = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Denied, dismissed, or no device — indistinguishable from here and all
      // fixed the same way, so they get the same sentence.
      setError("denied");
      setState("error");
      return;
    }

    stream.current = media;
    chunks.current = [];

    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(media);
    } catch {
      release();
      setError("unsupported");
      setState("error");
      return;
    }
    recorder.current = rec;

    rec.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.current.push(event.data);
    };

    rec.onstop = () => {
      const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
      chunks.current = [];
      release();
      void analyse(blob, retain.current);
    };

    // A level meter, so a dead microphone is visible in the first second
    // rather than after the take.
    try {
      const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const context = new Ctor!();
      audioContext.current = context;
      const source = context.createMediaStreamSource(media);
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);

      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
        const rms = Math.sqrt(sum / buffer.length);
        // Compressed for display: a linear meter spends its whole range on
        // the loudest tenth and looks dead for ordinary speech.
        setLevel(Math.min(1, Math.sqrt(rms) * 3));
        setElapsedMs(Date.now() - startedAt.current);
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    } catch {
      // No meter. The recording itself is unaffected, so this is not an error
      // the person needs to hear about.
    }

    startedAt.current = Date.now();
    setElapsedMs(0);
    rec.start();
    setState("recording");
  }, [release, analyse, retainAudio]);

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  /** Drop the recording as soon as the caller is done with it. */
  const dropAudio = useCallback(() => setAudio(null), []);

  const reset = useCallback(() => {
    release();
    setDelivery(null);
    setAudio(null);
    setError(null);
    setElapsedMs(0);
    setTakeId(null);
    setState("idle");
  }, [release]);

  return { state, error, delivery, audio, takeId, level, elapsedMs, start, stop, reset, dropAudio };
}
