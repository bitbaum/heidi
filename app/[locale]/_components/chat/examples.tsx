"use client";

import type { Dictionary } from "@/lib/i18n";

/**
 * Something to press when there is nothing to read yet.
 *
 * MOVED HERE FROM `chat.tsx` so both empty states share one implementation.
 * The home page had these and the full-screen chat did not, which on a phone
 * was the difference between a page that offers you something and six hundred
 * pixels of white space above a text box. Copying the markup into the second
 * place would have made the two drift within a release; the first thing either
 * of them shows a new visitor is not a good candidate for two versions.
 *
 * It matters most on mobile and for the least confident reader, which are the
 * same person. Typing the first message is the highest-friction act in the
 * product — a blank box in a language you cannot write is an invitation to
 * leave — and a tappable line removes it entirely.
 */
export function Examples({
  t,
  dialect,
  onPick,
}: {
  t: Dictionary["chat"];
  dialect: { tag: string; showcase?: string };
  onPick: (s: string) => void;
}) {
  // Understand first, then say — the same order the product argues, and the
  // reason the compose example is last rather than third. Interleaved, the one
  // card without a dialect line read as a gap in the row instead of as the
  // other half of what Heidi does.
  const entries = [
    ...(dialect.showcase ? [{ kind: "dialect" as const, text: dialect.showcase }] : []),
    ...t.examples,
  ].sort((a, b) => Number(a.kind === "compose") - Number(b.kind === "compose"));

  return (
    <div className="mt-4">
      <h2 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.suggestionsTitle}</h2>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map((ex) => (
          <li key={ex.text}>
            <button
              type="button"
              onClick={() => onPick(ex.text)}
              className={`group flex h-full w-full flex-col justify-between gap-2 rounded-control border border-border-subtle p-3 text-left transition-colors hover:border-accent ${
                ex.kind === "compose" ? "bg-surface-raised" : "bg-surface-page"
              }`}
            >
              <span
                // A dialect line is quoted in the variety's own language so it
                // is read — by a person and by a screen reader — as Zurich
                // German rather than as German with odd spelling.
                {...(ex.kind === "dialect" ? { lang: dialect.tag } : {})}
                className={
                  ex.kind === "dialect"
                    ? "font-heading text-base font-semibold leading-snug tracking-display text-dialect"
                    : "text-sm leading-relaxed text-fg-secondary"
                }
              >
                {ex.kind === "dialect" ? `«${ex.text}»` : ex.text}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-caption uppercase tracking-caps text-fg-muted group-hover:text-accent">
                {ex.kind === "dialect" ? t.exampleUnderstand : t.exampleCompose}
                <span aria-hidden="true">&rarr;</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
