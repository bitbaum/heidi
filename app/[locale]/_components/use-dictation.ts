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
 * control hides itself rather than appearing and doing nothing.
 */

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
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
  const [denied, setDenied] = useState(false);
  const ref = useRef<RecognitionLike | null>(null);

  // Kept in a ref so restarting recognition never resurrects a stale closure
  // over an old input value. Assigned in an effect, not during render — a ref
  // written while rendering is not safe under concurrent rendering.
  const sink = useRef(onText);
  useEffect(() => {
    sink.current = onText;
  }, [onText]);

  const stop = useCallback(() => {
    ref.current?.stop();
    ref.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = recogniser();
    if (!Ctor) return;
    setDenied(false);

    const rec = new Ctor();
    rec.lang = lang;
    // One utterance at a time. Continuous recognition left running on a phone
    // is a microphone nobody remembers they opened.
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (event) => {
      const said = Array.from({ length: event.results.length }, (_, i) => event.results[i]?.[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (said) sink.current(said);
    };
    rec.onerror = (event) => {
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") setDenied(true);
      setListening(false);
    };
    rec.onend = () => setListening(false);

    ref.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      // Starting twice throws; treat it as already listening rather than an error.
      setListening(false);
    }
  }, [lang]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  // A live microphone must not survive the component that opened it.
  useEffect(() => () => ref.current?.stop(), []);

  return { supported, listening, denied, toggle, start, stop };
}
