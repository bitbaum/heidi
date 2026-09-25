"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { plural } from "@/lib/i18n/plural";
import { fill } from "@/lib/i18n/fill";
import { useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { EMPTY_STREAK, localDay, view } from "@/lib/domain/progress/streak";
import { setWeekGoal, streakStore } from "./streak-store";

/**
 * The streak, shown as what the learner has built.
 *
 * HEIDI.md §3: gain, never loss. So there is no "streak lost", no countdown
 * and no warning colour anywhere in this component. An ended run renders as an
 * invitation to start, beside the best run — the same fact, the other
 * framing. A day already practised says so, and nothing asks for more.
 *
 * It WAITS FOR STORAGE before saying anything. The server cannot see this
 * browser, and the first pass would otherwise tell somebody on a nine-day run
 * to "start today" — the false flash the situation panel was fixed for.
 */
export function StreakCard({
  t,
  locale,
  compact = false,
}: {
  t: Dictionary["streak"];
  locale: Locale;
  compact?: boolean;
}) {
  const stored = useBrowserStore(streakStore) ?? EMPTY_STREAK;
  const ready = useStorageReady();
  if (!ready) return compact ? null : <div className="min-h-24" aria-hidden="true" />;

  const v = view(stored, localDay(new Date()));
  const run = v.current > 0 ? plural(t.days, v.current, locale) : t.start;
  const week = plural(t.week, v.weekGoal, locale, { n: String(v.weekDays), goal: String(v.weekGoal) });

  if (compact) {
    // One line above a practice session: the run and the week, nothing else.
    return (
      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
        {run} · {v.weekReached ? t.weekReached : week}
      </p>
    );
  }

  return (
    <section aria-labelledby="streak-heading" className="rounded-control border border-border-subtle bg-surface-raised p-5">
      <h2 id="streak-heading" className="font-mono text-caption uppercase tracking-caps text-fg-muted">
        {t.title}
      </h2>
      <p className="mt-2 font-heading text-2xl font-semibold tracking-display text-fg-primary">{run}</p>
      {v.best > 0 && <p className="mt-1 text-sm text-fg-secondary">{plural(t.best, v.best, locale)}</p>}

      {/* The week, as cells: filled for days practised, up to the goal. */}
      <div className="mt-4 flex items-center gap-3">
        <ul aria-hidden="true" className="flex gap-1">
          {Array.from({ length: v.weekGoal }, (_, i) => (
            <li key={i} className={`h-2 w-6 rounded-sm ${i < v.weekDays ? "bg-fg-primary" : "bg-border-subtle"}`} />
          ))}
        </ul>
        <p className="text-sm text-fg-secondary">{v.weekReached ? t.weekReached : week}</p>
      </div>

      {v.current > 0 && v.freezes > 0 && (
        <p className="mt-2 text-sm text-fg-muted">{fill(t.freezes, { n: String(v.freezes) })}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {v.practisedToday ? (
          <p className="text-sm text-fg-secondary">{t.doneToday}</p>
        ) : (
          <Link
            href={href(locale, "practice")}
            className="inline-flex min-h-11 items-center rounded-control bg-action px-4 text-sm font-medium text-on-action hover:opacity-90"
          >
            {t.practise}
          </Link>
        )}
        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-fg-secondary">
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
    </section>
  );
}
