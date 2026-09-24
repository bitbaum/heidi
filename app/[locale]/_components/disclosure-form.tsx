"use client";

/**
 * A form that stays folded until someone wants it.
 *
 * TWO COPIES, VERBATIM, INCLUDING THE COMMENT. `round-list.tsx` ("propose a
 * round") and `topic-board.tsx` ("propose a topic") each carried the same
 * seventeen lines: the `<details>` shell, the `<summary>` with its
 * `::-webkit-details-marker` reset, the rotating chevron, and the same two
 * class constants declared under the same two names.
 *
 * The comment below was copied along with the code, which is the part worth
 * noticing. It records a real defect someone found on the live site — a black
 * ▼ drawn by the browser — and having it in two files means the NEXT person
 * to find that defect fixes it in whichever file they happened to open. The
 * duplicate did not just risk drifting; it duplicated the institutional
 * memory of why the code looks like this.
 *
 * WHAT STAYS WITH THE CALLER: the fields. Those genuinely differ — a round has
 * a date, a cadence and a meeting URL; a topic has a title and a pitch — and
 * folding them in would produce a component configured by a schema, which is
 * the abstraction one size too large. What is shared is the SHELL and the two
 * class names, and that is all this takes.
 */

import type { FormEvent, ReactNode } from "react";

/**
 * The input styling both forms used, under the same name, twice.
 *
 * Exported as constants rather than wrapped in an `<Input>` component because
 * the callers use them on `<input>`, `<select>` and `<textarea>` alike, and a
 * component that renders all three by prop is worse than a shared string.
 */
export const FIELD =
  "mt-1 w-full rounded-control border border-border-subtle bg-surface-page p-3 text-base text-fg-primary";
export const LABEL = "block font-mono text-caption uppercase tracking-caps text-fg-muted";

export function DisclosureForm({
  title,
  hint,
  onSubmit,
  children,
}: {
  /** The summary line — what folding this open would let you do. */
  title: string;
  /** An optional sentence under the summary, shown only when open. */
  hint?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  return (
    <details className="group mt-6 rounded-control border border-border-subtle bg-surface-raised p-4">
      {/* `list-none` + the explicit `::-webkit-details-marker` reset: without
          both, the browser draws its own triangle, hard against the first
          letter, in whatever colour and size it likes. On the live site that
          was a black ▼ glued to the heading — the only glyph on the page
          drawn by the user agent rather than by us. The chevron below is ours:
          it is `aria-hidden` because `<summary>` already announces its own
          expanded state, and a second announcement would be a duplicate. */}
      <summary className="flex cursor-pointer list-none items-center gap-2 font-heading text-lg leading-tight text-fg-primary [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="text-fg-muted transition-transform group-open:rotate-90">
          &rsaquo;
        </span>
        {title}
      </summary>

      {hint && <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">{hint}</p>}

      <form onSubmit={onSubmit} className="mt-4 grid grid-cols-safe gap-4">
        {children}
      </form>
    </details>
  );
}
