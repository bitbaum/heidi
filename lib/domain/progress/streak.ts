/**
 * A streak of days, and a weekly goal — counted as gain, never as loss.
 *
 * HEIDI.md §3, revised 2026-09-25: "counts of capability, framed as gain,
 * never loss" stands, and a streak is allowed on exactly those terms. So this
 * module decides two things and keeps them apart:
 *
 *   WHAT IS STORED — only the current run. The last day practised, the run's
 *   length, the best run, freezes left, and this week's count. Never a list of
 *   dates: `history.ts` refuses to keep anything a study history could be
 *   reconstructed from, and a streak does not need one. From what is here you
 *   can learn that somebody practised yesterday and has done so for six days;
 *   you cannot learn which days in March.
 *
 *   WHAT IS SHOWN — `view()`. A run that has ended is shown as a fresh start
 *   beside the best run, never as something lost. There is no "streak lost",
 *   no countdown, no reminder: the product has no way to nag, and this module
 *   gives it nothing to nag with.
 *
 * A FREEZE IS FREE AND AUTOMATIC. One missed day is bridged if a freeze is
 * left — nobody has to remember to buy or equip one. You start with one and
 * earn another every seven days in a row, to a maximum of two. A week of
 * illness is not a failure.
 *
 * DAYS ARE THE LEARNER'S OWN CALENDAR DAYS, as `YYYY-MM-DD` in local time.
 * UTC would end somebody's evening session "tomorrow" in Zurich from 01:00
 * or 02:00 in summer.
 */

export type Streak = {
  current: number;
  best: number;
  /** Last local day with practice, `YYYY-MM-DD`, or null before the first. */
  lastDay: string | null;
  freezes: number;
  /** ISO week of `weekDays`, e.g. `2026-W39`. */
  week: string | null;
  weekDays: number;
  /** Days per week the learner aims for, 1–7. */
  weekGoal: number;
};

export const DEFAULT_WEEK_GOAL = 3;
export const MAX_FREEZES = 2;
const FREEZE_EVERY = 7;

export const EMPTY_STREAK: Streak = {
  current: 0,
  best: 0,
  lastDay: null,
  freezes: 1,
  week: null,
  weekDays: 0,
  weekGoal: DEFAULT_WEEK_GOAL,
};

/** A local calendar day as `YYYY-MM-DD`. */
export function localDay(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function toUtcNoon(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d, 12);
}

/** Whole days from `a` to `b`. Calendar days, immune to DST. */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUtcNoon(b) - toUtcNoon(a)) / 86_400_000);
}

/**
 * ISO 8601 week, `YYYY-Www`. Weeks start on Monday, as they do here.
 *
 * The standard rule: a week belongs to the year its THURSDAY falls in. That is
 * what makes 1 January 2027 (a Friday) part of 2026-W53, and 3 January 2021
 * (a Sunday) part of 2020-W53 — the boundary cases a hand-rolled week number
 * gets wrong, and which the tests pin.
 */
export function isoWeek(day: string): string {
  const DAY = 86_400_000;
  const t = new Date(toUtcNoon(day));
  const monday0 = (t.getUTCDay() + 6) % 7;
  const thursday = t.getTime() + (3 - monday0) * DAY;
  const year = new Date(thursday).getUTCFullYear();
  const jan4 = Date.UTC(year, 0, 4, 12);
  const jan4Monday0 = (new Date(jan4).getUTCDay() + 6) % 7;
  const firstThursday = jan4 + (3 - jan4Monday0) * DAY;
  const week = 1 + Math.round((thursday - firstThursday) / (7 * DAY));
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Record that the learner practised on `today`. Pure; returns the new state. */
export function touch(s: Streak, today: string): Streak {
  const next: Streak = { ...s };

  if (s.lastDay !== today) {
    const gap = s.lastDay === null ? Infinity : daysBetween(s.lastDay, today);
    if (gap === 1) {
      next.current = s.current + 1;
    } else if (gap === 2 && s.freezes > 0) {
      // One missed day, bridged — automatically, without being asked.
      next.freezes = s.freezes - 1;
      next.current = s.current + 1;
    } else if (gap > 0) {
      next.current = 1;
    }
    next.lastDay = today;
    if (next.current > 0 && next.current % FREEZE_EVERY === 0) {
      next.freezes = Math.min(MAX_FREEZES, next.freezes + 1);
    }
    next.best = Math.max(s.best, next.current);

    const week = isoWeek(today);
    next.weekDays = week === s.week ? s.weekDays + 1 : 1;
    next.week = week;
  }

  return next;
}

/** Set the weekly goal, kept within 1–7. */
export function withWeekGoal(s: Streak, goal: number): Streak {
  const g = Number.isFinite(goal) ? Math.round(goal) : DEFAULT_WEEK_GOAL;
  return { ...s, weekGoal: Math.min(7, Math.max(1, g)) };
}

export type StreakView = {
  /** The run as it stands today — 0 means "start today", never "lost". */
  current: number;
  best: number;
  practisedToday: boolean;
  freezes: number;
  weekDays: number;
  weekGoal: number;
  weekReached: boolean;
};

/**
 * What to show on `today`, without changing anything.
 *
 * A run is still alive if the last practice was today or yesterday, or the day
 * before with a freeze left to bridge it. Otherwise it shows as 0 — which the
 * interface renders as an invitation to start, beside the best run.
 */
export function view(s: Streak, today: string): StreakView {
  const gap = s.lastDay === null ? Infinity : daysBetween(s.lastDay, today);
  const alive = gap <= 1 || (gap === 2 && s.freezes > 0);
  const thisWeek = s.week === isoWeek(today);
  const weekDays = thisWeek ? s.weekDays : 0;
  return {
    current: alive ? s.current : 0,
    best: s.best,
    practisedToday: gap === 0,
    freezes: s.freezes,
    weekDays,
    weekGoal: s.weekGoal,
    weekReached: weekDays >= s.weekGoal,
  };
}

/** Parse what is in storage — the string `createBrowserStore` hands over. */
export function decodeStreak(raw: string): Streak | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  const n = (v: unknown, lo: number, hi: number, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.trunc(v))) : fallback;
  const day = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
  return {
    current: n(o.current, 0, 100_000, 0),
    best: n(o.best, 0, 100_000, 0),
    lastDay: day(o.lastDay),
    freezes: n(o.freezes, 0, MAX_FREEZES, 1),
    week: typeof o.week === "string" && /^\d{4}-W\d{2}$/.test(o.week) ? o.week : null,
    weekDays: n(o.weekDays, 0, 7, 0),
    weekGoal: n(o.weekGoal, 1, 7, DEFAULT_WEEK_GOAL),
  };
}
