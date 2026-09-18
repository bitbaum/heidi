/**
 * What a learner has actually done, counted from their own takes.
 *
 * THIS FILE EXISTS BECAUSE "NO STREAKS" WAS THE RIGHT RULE AND THE WRONG
 * AMOUNT OF IT.
 *
 * `saved/review.ts` refuses streaks, points and days-active, and states the
 * test it applied: the product's success is how much of an unfamiliar Zurich
 * speaker you understand, and a streak measures how much Heidi you CONSUMED
 * while looking like it measures learning. That reasoning is correct and is
 * not weakened here. It is applied.
 *
 * Speaking is the case the rule was not written about. Everything else in the
 * product is consumption — you read a card, you hear a clip, you are shown an
 * answer — and a counter over any of it is vanity. A take is PRODUCTION: the
 * learner made speech in a second language, which is not evidence of having
 * used Heidi, it is the skill itself being exercised. Counting the days on
 * which somebody did that is measurement, not gamification.
 *
 * WHAT MAKES IT HONEST IS THAT IT CANNOT BE LOST.
 *
 * A streak is not a count; it is a count plus a punishment. Its pressure comes
 * entirely from the reset — miss a day and the number you were proud of
 * becomes zero, which is why streak products send the notifications they send.
 * Nothing here resets. `daysSpoken` is the number of distinct days on which a
 * take exists, it rises or stays where it is, and a fortnight away costs
 * exactly nothing. Somebody returning after a month is told they have spoken
 * on eleven days, not that they have lost eleven.
 *
 * So there is no goal, no target, no chain to break, and nothing to defend.
 * The design test for anything added here: would a learner who stops for three
 * weeks be shown a WORSE number than before they stopped? If yes, it is a
 * streak wearing a different name and it does not belong.
 *
 * WHY TIME SPOKEN IS PHONATION AND NOT WALL CLOCK. `speechMs` is the time
 * there was actually sound; `totalMs` includes sitting with the recorder open
 * deciding what to say. Reporting the second as practice would inflate the one
 * number here a learner might quote to somebody else.
 *
 * Pure: no I/O, no clock of its own, same input -> same output.
 */

import type { Take } from "./take.ts";

export type Progress = {
  /**
   * Distinct local days with at least one take. Monotone — see the header.
   *
   * Days rather than takes, because five takes in one sitting is one occasion
   * of speaking and counting it as five would reward re-recording rather than
   * returning.
   */
  daysSpoken: number;
  /** Takes kept on this device. Capped by MAX_TAKES, and says so where shown. */
  takes: number;
  /** Time there was actually sound, summed. Not time with the recorder open. */
  spokenMs: number;
  /** The most recent local day with a take, as YYYY-MM-DD, or null. */
  lastDay: string | null;
};

export const EMPTY_PROGRESS: Progress = { daysSpoken: 0, takes: 0, spokenMs: 0, lastDay: null };

/**
 * The local day an instant falls on, in a named zone.
 *
 * The zone is a parameter rather than the runtime's own, because "which day
 * was that" is the one question here whose answer differs between the server
 * and the browser — and a component that let it differ would render a
 * different number on each pass. The caller passes the zone it means.
 *
 * `en-CA` is chosen for its format, not its language: it is the locale whose
 * short date is already YYYY-MM-DD, so the string sorts and compares directly
 * and no part assembly is needed.
 */
export function localDay(iso: string, zone: string): string | null {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return null;
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(at);
  } catch {
    // An unknown zone is the caller's bug, but a settings page that throws is
    // worse than one that counts in UTC and is off by an hour at midnight.
    return at.toISOString().slice(0, 10);
  }
}

export function progressFrom(takes: readonly Take[], zone: string): Progress {
  if (takes.length === 0) return EMPTY_PROGRESS;

  const days = new Set<string>();
  let spokenMs = 0;
  for (const take of takes) {
    const day = localDay(take.at, zone);
    if (day) days.add(day);
    // A take whose delivery is nonsense contributes no time rather than NaN,
    // which would make the whole total disappear.
    if (Number.isFinite(take.delivery.speechMs) && take.delivery.speechMs > 0) {
      spokenMs += take.delivery.speechMs;
    }
  }

  const sorted = [...days].sort();
  return {
    daysSpoken: days.size,
    takes: takes.length,
    spokenMs: Math.round(spokenMs),
    lastDay: sorted.length > 0 ? sorted[sorted.length - 1] : null,
  };
}

/**
 * Minutes, rounded, for display — and never rounded UP to a minute from less.
 *
 * "1 minute" under a learner's first thirty-second take is a small lie in the
 * one number they might repeat to somebody. Under a minute the caller is given
 * zero and shows seconds instead.
 */
export function spokenMinutes(progress: Progress): number {
  return Math.floor(progress.spokenMs / 60000);
}
