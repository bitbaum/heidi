"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";

/**
 * Ask about a word Heidi did not think was hard.
 *
 * Heidi glosses the words it judges worth explaining, and a learner reading
 * the answer hits a different one — and there is nothing to press. The word
 * they are stuck on is by definition the one nobody predicted, so the feature
 * that only works on predicted words misses the case it exists for.
 *
 * SELECTION, NOT A BUTTON PER WORD. Wrapping every word in a `<button>` would
 * triple the DOM of every answer, and it would wreck copy-paste — which is the
 * single most common thing people do with these messages, since the whole
 * point is to send them on. Selecting a word is also already the gesture
 * people use when they do not understand something.
 *
 * WHAT PRESSING IT DOES, and why it is not "save this word". A saved word
 * needs a meaning: without one the review card asks "what does this mean?",
 * reveals a blank, and is worse than not saving at all. So this ASKS, in the
 * ordinary way, and the answer comes back with a gloss carrying the existing
 * keep button. Two taps instead of one, and the second tap is the one that
 * actually knows what it is saving.
 */

/** A phrase, not a paragraph. Beyond this they have selected the answer. */
const MAX_WORDS = 4;
const MAX_CHARS = 60;

export function WordPick({
  containerRef,
  t,
  onAsk,
}: {
  /** The transcript. Selections outside it are none of our business. */
  containerRef: React.RefObject<HTMLElement | null>;
  t: Dictionary["chat"];
  onAsk: (say: string) => void;
}) {
  const [picked, setPicked] = useState<{ word: string; x: number; y: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const clear = useCallback(() => setPicked(null), []);

  useEffect(() => {
    function read() {
      const selection = document.getSelection();
      const text = selection?.toString().trim() ?? "";

      if (!selection || selection.isCollapsed || !text) return setPicked(null);
      if (text.length > MAX_CHARS || text.split(/\s+/).length > MAX_WORDS) return setPicked(null);

      // Only inside the transcript, and only inside HEIDI's half of it: the
      // learner's own words are words they already have, and offering to
      // explain them reads as a correction nobody asked for.
      const node = selection.anchorNode;
      const host = containerRef.current;
      if (!node || !host || !host.contains(node)) return setPicked(null);

      const range = selection.getRangeAt(0);
      const box = range.getBoundingClientRect();
      if (!box.width && !box.height) return setPicked(null);

      setPicked({ word: text, x: box.left + box.width / 2, y: box.bottom });
    }

    // `selectionchange` rather than mouseup: it is the one event that fires
    // for a keyboard selection, a double-click and a touch drag alike, and a
    // keyboard user selecting a word is exactly who this must not exclude.
    document.addEventListener("selectionchange", read);
    return () => document.removeEventListener("selectionchange", read);
  }, [containerRef]);

  // Scrolling moves the text out from under a box positioned in viewport
  // coordinates, so the offer goes with it rather than pointing at nothing.
  useEffect(() => {
    if (!picked) return;
    window.addEventListener("scroll", clear, true);
    return () => window.removeEventListener("scroll", clear, true);
  }, [picked, clear]);

  if (!picked) return null;

  return (
    <div
      ref={boxRef}
      // Fixed, because the coordinates come from `getBoundingClientRect`,
      // which is viewport-relative. Positioning it absolutely inside a
      // scrolled transcript would put it a scroll-height away from the word.
      style={{ left: picked.x, top: picked.y + 8 }}
      className="fixed z-40 -translate-x-1/2"
    >
      <button
        type="button"
        // `onMouseDown` with preventDefault: a plain click clears the
        // selection before the handler runs, and then there is no word.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onAsk(`${t.exampleUnderstand} «${picked.word}»`);
          document.getSelection()?.removeAllRanges();
          setPicked(null);
        }}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-control border border-border-strong bg-surface-page px-3 text-sm font-medium text-fg-primary shadow-sm hover:border-accent"
      >
        {t.exampleUnderstand}
      </button>
    </div>
  );
}
