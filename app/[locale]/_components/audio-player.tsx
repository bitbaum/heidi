"use client";

import { useCallback, useRef, useState } from "react";

/**
 * The `<audio>` element as the same controls the YouTube hook offers, so the
 * lesson does not know which it is playing.
 *
 * The browser's own element: it buffers a remote MP3 from any point, seeks
 * by setting `currentTime`, and slows down without lowering the voice
 * (`preservesPitch` is the default in every current browser). That is the
 * whole of HEIDI.md's listening-lab player — play/pause, back five seconds,
 * 0.75× with pitch kept — for free.
 */
export function useAudioPlayer() {
  const element = useRef<HTMLAudioElement>(null);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  const onCanPlay = useCallback(() => setReady(true), []);

  const seekTo = useCallback((seconds: number) => {
    const a = element.current;
    if (!a) return;
    a.currentTime = Math.max(0, seconds - 0.5);
    void a.play().catch(() => undefined);
  }, []);

  const back = useCallback((seconds: number) => {
    const a = element.current;
    if (!a) return;
    a.currentTime = Math.max(0, a.currentTime - seconds);
  }, []);

  const toggleSlow = useCallback(() => {
    const a = element.current;
    if (!a) return;
    const next = !slow;
    a.playbackRate = next ? 0.75 : 1;
    setSlow(next);
  }, [slow]);

  return [element, { ready, seekTo, back, slow, toggleSlow, onCanPlay }] as const;
}
