"use client";

import { useEffect } from "react";

/**
 * Keep a full-height chat inside what the on-screen keyboard leaves visible.
 *
 * `100dvh` tracks the browser toolbar, not the keyboard. iOS Safari (and
 * Android unless told `interactive-widget=resizes-content`, which the layout
 * does) shrinks only the VISUAL viewport when the keyboard opens and scrolls
 * the page up to reveal the focused box. In a chat that cannot scroll, that
 * pushed the header — and "new conversation" in it — off the top of the
 * screen until the keyboard was closed again.
 *
 * Publishes the visible height and offset as `--app-height` / `--app-top` on
 * `<html>`, which `globals.css` and the dock read. `pin` also scrolls the page
 * back to the top after each change: right for a page that is itself the chat,
 * wrong for the dock, which floats over a page the reader may be halfway down.
 */
export function useKeyboardViewport({ pin = false }: { pin?: boolean } = {}) {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;

    const sync = () => {
      // Pinch-zoom shrinks the visual viewport too; sizing the layout to a
      // zoomed-in rectangle would squash it under the reader's fingers.
      if (viewport.scale > 1.01) return;
      root.style.setProperty("--app-height", `${viewport.height}px`);
      root.style.setProperty("--app-top", `${viewport.offsetTop}px`);
      if (pin && window.scrollY !== 0) window.scrollTo(0, 0);
    };

    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      root.style.removeProperty("--app-height");
      root.style.removeProperty("--app-top");
    };
  }, [pin]);
}
