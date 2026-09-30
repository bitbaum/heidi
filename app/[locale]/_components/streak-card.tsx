"use client";

import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { plural } from "@/lib/i18n/plural";
import { useStorageReady } from "@/lib/browser/store";
import { localDay, view } from "@/lib/domain/progress/streak";
import { useStreakView } from "./sync-stores";

/**
 * The streak as one line above a practice session: the run and the week.
 *
 * HEIDI.md §3: gain, never loss — no "streak lost", no countdown, no warning
 * colour. The full view, with the week's cells and the goal, is the top of the
 * personal page (`today-panel.tsx`).
 *
 * It WAITS FOR STORAGE before saying anything: the server cannot see this
 * browser, and the first pass would otherwise tell somebody on a nine-day run
 * to "start today".
 */
export function StreakLine({ t, locale }: { t: Dictionary["streak"]; locale: Locale }) {
  const stored = useStreakView();
  const ready = useStorageReady();
  if (!ready) return null;

  const v = view(stored, localDay(new Date()));
  const run = v.current > 0 ? plural(t.days, v.current, locale) : t.start;
  const week = plural(t.week, v.weekGoal, locale, { n: String(v.weekDays), goal: String(v.weekGoal) });
  return (
    <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
      {run} · {v.weekReached ? t.weekReached : week}
    </p>
  );
}
