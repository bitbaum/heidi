import { createBrowserStore } from "@/lib/browser/store";
import { decodeStreak, EMPTY_STREAK, localDay, touch, withWeekGoal } from "@/lib/domain/progress/streak";

/**
 * The streak, in this browser — the same arrangement as the learner model.
 *
 * Created ONCE at module level, for the reason `practice-stores.ts` gives: two
 * `createBrowserStore` calls for one key are two subscriber lists over one
 * piece of storage, and a write through one would notify nobody watching the
 * other. Declared on the privacy page; holds no list of dates (see
 * `lib/domain/progress/streak.ts`).
 */
export const streakStore = createBrowserStore("heidi.progress.streak.v1", decodeStreak);

/**
 * Record that practice happened today.
 *
 * Called from every place learning happens — a practice answer, a review
 * grade, a test answer — and idempotent within a day, so calling it on every
 * answer costs one small write and changes the count once.
 */
export function recordPractice(now: Date = new Date()): void {
  if (typeof window === "undefined") return;
  streakStore.write(touch(streakStore.read() ?? EMPTY_STREAK, localDay(now)));
}

/** Change the weekly goal (1–7 days). */
export function setWeekGoal(goal: number): void {
  if (typeof window === "undefined") return;
  streakStore.write(withWeekGoal(streakStore.read() ?? EMPTY_STREAK, goal));
}
