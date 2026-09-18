"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

/**
 * Copy a line Heidi produced.
 *
 * The point of the whole product on the produce side: a learner who cannot yet
 * write the dialect gets a sentence they can paste into the chat they are
 * actually having. So the copy button sits on the dialect block and on every
 * suggestion, not in a menu.
 *
 * A failed clipboard write leaves the label alone rather than claiming success
 * — some browsers refuse without a user gesture they recognise, and a button
 * that says "Copied" over an empty clipboard is worse than one that says
 * nothing happened.
 */
export function Copy({ text, t }: { text: string; t: Dictionary["chat"] }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      /*
       * Named by what it copies, for the reason the speak control beside it
       * is: an answer carries several, and "Kopieren" four times over is four
       * controls a screen reader cannot tell apart. Same shape as
       * `keep-word.tsx`, and the visible word comes first so voice control
       * still matches it.
       */
      aria-label={`${done ? t.copied : t.copy}: ${text.length > 60 ? `${text.slice(0, 60).trimEnd()}…` : text}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          setDone(false);
        }
      }}
      className="min-h-9 shrink-0 text-sm text-link underline underline-offset-4 hover:text-accent"
    >
      {done ? t.copied : t.copy}
    </button>
  );
}
