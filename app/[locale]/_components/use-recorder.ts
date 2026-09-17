"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { measure, type Delivery } from "@/lib/domain/speaking/delivery";

/**
 * Record a take, and measure it without the audio going anywhere.
 *
 * THE AUDIO NEVER LEAVES THIS FUNCTION. The blob is decoded with the Web Audio
 * API in the page that recorded it, `measure()` reduces it to a handful of
 * numbers, and the blob is dropped. Nothing is uploaded, nothing is written to
 * storage, and there is no code path here that could do either — which is why
 * the privacy line on the page is a description rather than a promise.
 *
 * Separate from `use-dictation`, which does the opposite job: dictation turns
 * speech into TEXT and may fall back to a server to do it. This measures the
 * SIGNAL and has no server half at all, because there is nothing a server
 * could add to arithmetic over samples except a copy of somebody's voice.
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

export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<RecorderError | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
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
   * Decode the blob, reduce it to numbers, drop the blob.
   *
   * Declared before `start`, which is the only caller, because `start` closes
   * over it in `rec.onstop` — and a `useCallback` referenced above its own
   * declaration is a temporal dead zone at module evaluation, not merely
   * untidy.
   */
  const analyse = useCallback(async (blob: Blob) => {
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
      setState("done");
    } catch {
      setError("failed");
      setState("error");
    }
    // The blob goes out of scope here and is never referenced again.
  }, []);

  const start = useCallback(async () => {
    if (!recordingSupported()) {
      setError("unsupported");
      setState("error");
      return;
    }

    setError(null);
    setDelivery(null);
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
      void analyse(blob);
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
  }, [release, analyse]);

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  const reset = useCallback(() => {
    release();
    setDelivery(null);
    setError(null);
    setElapsedMs(0);
    setTakeId(null);
    setState("idle");
  }, [release]);

  return { state, error, delivery, takeId, level, elapsedMs, start, stop, reset };
}
