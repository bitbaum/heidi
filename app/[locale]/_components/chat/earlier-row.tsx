"use client";

import type { Dictionary } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n/dates";
import type { Locale } from "@/lib/i18n/locales";

/**
 * The conversation you had before, as ONE row.
 *
 * Opening Heidi shows a blank page with the box ready, because nearly everyone
 * arrives with a new sentence. The thread from last time is not thrown away
 * and not forced on you either: it sits here, quoted by the first thing you
 * wrote, one tap from where you left it.
 *
 * One anatomy, the same as every other list row on the site: what it is and
 * when, the line itself, and the single action at the right. It is a button
 * rather than a link because on the signed-out surfaces it restores a thread
 * in place, and on the signed-in one it opens a saved conversation — the
 * caller decides which, the row does not care.
 */
export function EarlierRow({
  t,
  locale,
  line,
  when,
  onResume,
}: {
  t: Dictionary["chat"]["earlier"];
  locale: Locale;
  /** The learner's own first line, or a saved conversation's title. */
  line: string;
  /** ISO. Empty for a thread that predates the timestamp — then no date is printed. */
  when: string;
  onResume: () => void;
}) {
  // The date in the reader's own format — and nothing when it will not parse,
  // rather than "Invalid Date" printed at somebody.
  const day = when ? formatDate(when, locale, "short") : "";

  return (
    <button
      type="button"
      onClick={onResume}
      className="group flex min-h-14 w-full flex-col gap-1 rounded-control border border-border-subtle bg-surface-page px-3 py-2 text-left transition-colors hover:border-accent"
    >
      {/* What it is and when, on a line of its own: a date beside the action
          wrapped into a second line on a phone and left the action floating at
          the middle of the row. */}
      <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">
        {t.title}
        {day && ` · ${day}`}
      </span>
      <span className="flex items-center justify-between gap-3">
        {/* Two lines, not one: the learner's own sentence is the whole point of
            the row, and a one-line ellipsis would cut it where it gets
            interesting. */}
        <span className="min-w-0 line-clamp-2 wrap-anywhere text-sm leading-snug text-fg-primary">
          «{line}»
        </span>
        <span className="shrink-0 font-mono text-caption uppercase tracking-caps text-fg-secondary group-hover:text-accent">
          {t.resume} <span aria-hidden="true">&rarr;</span>
        </span>
      </span>
    </button>
  );
}
