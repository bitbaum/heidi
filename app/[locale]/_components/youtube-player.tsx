"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The YouTube IFrame player, as a hook: embed once, seek on demand.
 *
 * The IFrame API is the one embed whose player can be told to jump to a
 * second — which is what "replay the line that answers this" needs, and why
 * HEIDI.md's listening-lab design named it. Loaded from YouTube's script,
 * never bundled; the privacy page names the embed as a flow.
 *
 * `youtube-nocookie.com` is the privacy-enhanced host: no advertising
 * cookie until the person presses play.
 */
type YTPlayer = {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
};

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      host?: string;
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: { onReady?: () => void };
    },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

function loadApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise<YTNamespace>((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return apiPromise;
}

export function useYouTubePlayer(videoId: string, locale: string) {
  const mount = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let instance: YTPlayer | null = null;
    const host = mount.current;
    if (!host) return;
    // The API replaces the element it is given, so give it a child of ours
    // rather than the node React owns.
    const target = document.createElement("div");
    host.appendChild(target);
    loadApi()
      .then((YT) => {
        if (cancelled) return;
        instance = new YT.Player(target, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1, hl: locale, cc_load_policy: 0 },
          events: {
            onReady: () => {
              if (cancelled) return;
              player.current = instance;
              setReady(true);
            },
          },
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      setReady(false);
      player.current = null;
      try {
        instance?.destroy();
      } catch {
        /* already gone */
      }
      host.replaceChildren();
    };
  }, [videoId, locale]);

  const seekTo = useCallback((seconds: number) => {
    const p = player.current;
    if (!p) return;
    p.seekTo(Math.max(0, seconds - 0.5), true);
    p.playVideo();
  }, []);

  const back = useCallback((seconds: number) => {
    const p = player.current;
    if (!p) return;
    p.seekTo(Math.max(0, p.getCurrentTime() - seconds), true);
  }, []);

  const toggleSlow = useCallback(() => {
    const p = player.current;
    if (!p) return;
    const next = !slow;
    p.setPlaybackRate(next ? 0.75 : 1);
    setSlow(next);
  }, [slow]);

  // A tuple, not one object: the ref travels on its own so the component can
  // hand it to `ref=` directly, and the controls are plain values the React
  // Compiler's lint can see are not a ref being read during render.
  return [mount, { ready, seekTo, back, slow, toggleSlow }] as const;
}
