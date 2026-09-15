"use client";

import type { Dictionary } from "@/lib/i18n";
import { CowMark } from "../cow-mark";

/**
 * Who said it, and the shell their words sit in.
 *
 * Three senders, because a group has three: you, Heidi, and another person.
 * The solo chat only ever had the first two, which is why `Said` did not exist
 * and the group chat grew its own bubble markup instead of reusing this.
 */

/** The learner's own message: right-aligned, sunk, no name but their own. */
export function Mine({ body, label }: { body: string; label: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="mb-1 font-mono text-[10px] uppercase tracking-caps text-fg-muted">{label}</span>
      <p className="max-w-[85%] whitespace-pre-wrap rounded-control bg-surface-sunk px-3 py-2 text-base leading-relaxed text-fg-primary">
        {body}
      </p>
    </div>
  );
}

/**
 * Another human in the group.
 *
 * Named, because in a group "who said this" is load-bearing — and plainly
 * styled, so the eye can tell a person from Heidi without reading the label.
 */
export function Said({ body, name }: { body: string; name: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="mb-1 font-mono text-[10px] uppercase tracking-caps text-fg-muted">{name}</span>
      <p className="max-w-[85%] whitespace-pre-wrap rounded-control bg-surface-page px-3 py-2 text-base leading-relaxed text-fg-primary">
        {body}
      </p>
    </div>
  );
}

/**
 * Heidi's shell, shared by an answer and by a failed turn.
 *
 * She is answering, so she is present: a name in 10px type is a label; a name
 * with a face is someone talking.
 */
export function FromHeidi({ children }: { children: React.ReactNode }) {
  return (
    <article className="flex flex-col items-start">
      <span className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-caps text-accent">
        <CowMark size={14} className="text-fg-primary" />
        Heidi
      </span>
      <div className="w-full max-w-[92%] rounded-control border border-border-subtle bg-surface-page p-3">
        {children}
      </div>
    </article>
  );
}

/**
 * A turn that failed, with the only thing that helps: try again.
 *
 * The message is always one of ours in the reader's language — never the
 * server's own string, which is written once, in English, for a log.
 */
export function Failed({ error, t, onRetry }: { error: string; t: Dictionary["chat"]; onRetry?: () => void }) {
  return (
    <div className="rounded-control border border-accent bg-accent-tint px-3 py-2">
      <p role="alert" className="text-base text-fg-primary">
        {error}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 min-h-9 text-sm text-link underline underline-offset-4 hover:text-accent"
        >
          {t.retry}
        </button>
      )}
    </div>
  );
}
