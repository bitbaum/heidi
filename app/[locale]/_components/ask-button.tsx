"use client";

import { askHeidi } from "@/lib/browser/ask";

/**
 * A button on a reference page that hands Heidi a question.
 *
 * The smallest possible client island: it exists because a server-rendered
 * page cannot dispatch a browser event, and it does nothing else. What it
 * sends is an ordinary sentence that appears in the transcript as the reader's
 * own message — the same rule the one-tap follow-ups already follow, and the
 * reason there is no hidden prompt channel anywhere in this product.
 *
 * The TEXT is decided by the caller, from the dictionary, so the question
 * arrives in the reader's language. A button that composed its own sentence
 * here would be English on a French page.
 */
export function AskButton({
  say,
  label,
  className,
}: {
  /** The complete message to send. Already localised and already filled in. */
  say: string;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => askHeidi(say)}
      className={
        className ??
        "inline-flex min-h-11 items-center gap-2 rounded-control border border-border-strong px-4 text-sm font-medium text-fg-primary transition-colors hover:border-accent hover:text-accent"
      }
    >
      {label}
      <span aria-hidden="true">&rarr;</span>
    </button>
  );
}
