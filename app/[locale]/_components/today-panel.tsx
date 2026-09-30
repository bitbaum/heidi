"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { ALL } from "@/lib/domain/practice/scope";
import { dueCount } from "@/lib/domain/practice/memory";
import { plural } from "@/lib/i18n/plural";
import { fill } from "@/lib/i18n/fill";
import { useStorageReady } from "@/lib/browser/store";
import { localDay, view } from "@/lib/domain/progress/streak";
import { SessionLink } from "./session/links";
import { setWeekGoal } from "./streak-store";
import { useMemoryView, useStreakView } from "./sync-stores";
import { useReview } from "./use-review";

/**
 * The top of the personal page: what today asks of you, and the two doors.
 *
 * It replaced three things that each answered part of the question in a
 * different place — a streak card, a "due" count inside the word review
 * further down, and a chat button at the very bottom — so the page opened with
 * a number and made you scroll for the thing to do with it.
 *
 * HEIDI.md §3 still holds: gain, never loss. An ended run is an invitation to
 * start, nothing counts down, and a day already practised says so.
 *
 * It WAITS FOR STORAGE, because the server cannot see this browser and the
 * first pass would otherwise tell somebody on a nine-day run to start today.
 */
export function TodayPanel({
  t,
  locale,
  askLabel,
  dueQuestions,
}: {
  t: Dictionary["streak"];
  locale: Locale;
  askLabel: string;
  dueQuestions: Dictionary["practice"]["dueToday"];
}) {
  const stored = useStreakView();
  const memory = useMemoryView();
  const review = useReview();
  const ready = useStorageReady();
  const [now] = useState(Date.now);
  if (!ready || !review.ready) return <div className="min-h-48" aria-hidden="true" />;

  const v = view(stored, localDay(new Date(now)));
  const questions = dueCount(memory, new Date(now));
  const words = review.queue.length;
  const week = plural(t.week, v.weekGoal, locale, { n: String(v.weekDays), goal: String(v.weekGoal) });

  return (
    <section aria-labelledby="today-heading" className="rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.today}</p>
      <h2 id="today-heading" className="mt-2 font-heading text-2xl font-semibold tracking-display text-fg-primary">
        {v.current > 0 ? plural(t.days, v.current, locale) : t.start}
      </h2>
      {v.best > v.current && <p className="mt-1 text-sm text-fg-secondary">{plural(t.best, v.best, locale)}</p>}

      <ul className="mt-4 space-y-1 text-base text-fg-primary">
        {questions > 0 && <li>{plural(dueQuestions, questions, locale)}</li>}
        {words > 0 && (
          <li>
            <a href="#words" className="text-link underline underline-offset-4 hover:text-accent">
              {plural(t.dueWords, words, locale)}
            </a>
          </li>
        )}
        {questions === 0 && words === 0 && <li className="text-fg-secondary">{t.nothingDue}</li>}
        {v.practisedToday && <li className="text-fg-secondary">{t.doneToday}</li>}
      </ul>

      <div className="mt-5 flex flex-wrap gap-3">
        <SessionLink
          locale={locale}
          scope={ALL}
          className="inline-flex min-h-11 items-center rounded-control bg-action px-5 font-medium text-on-action hover:opacity-90"
        >
          {t.practise}
        </SessionLink>
        <Link
          href={href(locale, "chat")}
          className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-5 font-medium text-fg-primary hover:bg-surface-page"
        >
          {askLabel}
        </Link>
      </div>

      {/* The week, as cells: filled for days practised, up to the goal. */}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle pt-4">
        <ul aria-hidden="true" className="flex gap-1">
          {Array.from({ length: v.weekGoal }, (_, i) => (
            <li key={i} className={`h-2 w-6 rounded-sm ${i < v.weekDays ? "bg-fg-primary" : "bg-border-subtle"}`} />
          ))}
        </ul>
        <p className="text-sm text-fg-secondary">{v.weekReached ? t.weekReached : week}</p>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-fg-secondary sm:ml-auto">
          {t.goalLabel}
          <select
            value={v.weekGoal}
            onChange={(e) => setWeekGoal(Number(e.target.value))}
            className="min-h-11 rounded-control border border-border-strong bg-surface-page px-2 text-base text-fg-primary"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {plural(t.goalDays, n, locale)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {v.current > 0 && v.freezes > 0 && (
        <p className="mt-2 text-sm text-fg-muted">{fill(t.freezes, { n: String(v.freezes) })}</p>
      )}
    </section>
  );
}
