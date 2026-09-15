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
