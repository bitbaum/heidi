"use client";

import { useBrowserStore } from "@/lib/browser/store";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { plural } from "@/lib/i18n/plural";
import { streakStore } from "./streak-store";

/**
 * The moment a sitting ends, made to feel like one.
 *
 * Not a score — this product refuses those (`mastered.ts`) — but the two
 * things that ARE true and that the learner just earned: today counts, and
 * here is the week filling up toward the goal they set. The check draws
 * itself and the newest day's cell lands last; with reduced motion both are
 * simply there (globals.css, `.oc-draw` / `.oc-land`).
 */
export function SittingCelebration({ t, locale }: { t: Dictionary["streak"]; locale: Locale }) {
  const streak = useBrowserStore(streakStore);
  const goal = streak?.weekGoal ?? 3;
  const days = Math.min(streak?.weekDays ?? 1, goal);
  const reached = (streak?.weekDays ?? 0) >= goal;

  return (
    <div className="flex items-center gap-4">
      <svg aria-hidden="true" viewBox="0 0 48 48" className="size-14 shrink-0 text-accent">
        <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="3" className="oc-draw" pathLength={1} />
        <path d="M15 25 21.5 31.5 33.5 18" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="oc-draw oc-draw-late" pathLength={1} />
      </svg>
      <div className="min-w-0">
        {streak && streak.current > 0 && (
          <p className="mb-0 font-heading text-lg font-semibold tracking-display text-fg-primary">
            {plural(t.days, streak.current, locale)}
          </p>
        )}
        <ul aria-hidden="true" className="mt-2 flex gap-1">
          {Array.from({ length: goal }, (_, i) => (
            <li
              key={i}
              className={`h-2 w-7 rounded-sm ${i < days ? "bg-accent" : "bg-border-subtle"} ${i === days - 1 ? "oc-land" : ""}`}
            />
          ))}
        </ul>
        <p className="mb-0 mt-1.5 text-sm text-fg-secondary">
          {reached ? t.weekReached : plural(t.week, goal, locale, { n: String(days), goal: String(goal) })}
        </p>
      </div>
    </div>
  );
}
