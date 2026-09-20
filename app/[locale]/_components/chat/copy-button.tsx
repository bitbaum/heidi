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
      /*
       * `min-h-11` and the centring, to match `Speak` EXACTLY.
       *
       * These two sit side by side on every dialect block and every
       * suggestion, and they did not line up: Speak was a 44px control with
       * its label centred, Copy a 36px one, so "Kopieren" rode eight pixels
       * above "Vorlesen" — two halves of different components bolted together,
       * which is what it looked like. The heights are the same number now
       * because the alignment IS the two numbers being equal; `items-start` on
       * the row cannot fix a disagreement about how tall a control is.
       */
      className="inline-flex min-h-11 shrink-0 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
    >
      {done ? t.copied : t.copy}
    </button>
  );
}
