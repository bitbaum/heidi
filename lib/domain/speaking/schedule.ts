/**
 * When a round actually sits, and when it sits again.
 *
 * "Regularly" is the product requirement, which makes this a recurrence
 * problem, which makes it a time-zone problem. The trap is specific and it is
 * the reason this file exists at all rather than being four lines next to a
 * query:
 *
 *   A round is an ABSOLUTE instant — everybody joins the same moment.
 *   A repeat is a WALL CLOCK promise — "every Tuesday at 19:00".
 *
 * Those two disagree twice a year. Adding 7 × 86,400,000 ms to a Tuesday in
 * March lands on a Tuesday at 20:00, because Switzerland moved its clocks in
 * between. Nobody turns up at 20:00. So the repeat is computed in the zone's
 * calendar and converted back to an instant, rather than by adding a week of
 * milliseconds — and there is a test that crosses each changeover in both
 * directions, because this is the class of bug that ships green and is found
 * by an empty room.
 *
 * Pure: no I/O, no clock of its own — `after` is always passed in, so the
 * tests are not tests of whatever today happens to be.
 */

import type { Cadence } from "./types.ts";

/** A wall-clock reading, the way a person says it. Month is 1-12. */
export type WallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

/**
 * Zurich, because that is where the variety is spoken and the rounds are held.
 *
 * A DEFAULT, not a hardcode: the field lives on the round, so a Ukrainian
 * deployment schedules in Kyiv without touching this engine. Naming a Swiss
 * fact in engine code would break §4's house rule; naming it as the default
 * value of a parameter the caller may set does not.
 */
export const DEFAULT_TIME_ZONE = "Europe/Zurich";

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

const partsFormatter = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let found = partsFormatter.get(timeZone);
  if (!found) {
    // en-CA with hour12:false gives plain numerics in every runtime this ships
    // on. The locale is an implementation detail and never reaches a reader.
    found = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    partsFormatter.set(timeZone, found);
  }
  return found;
}

/** What the clock on the wall in `timeZone` reads at this instant. */
export function wallClockIn(instant: Date, timeZone: string): WallClock {
  const parts = formatterFor(timeZone).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    return part ? Number(part.value) : 0;
  };
  // Some runtimes render midnight as hour 24 rather than 0.
  const hour = get("hour") % 24;
  return { year: get("year"), month: get("month"), day: get("day"), hour, minute: get("minute") };
}

/** The same reading as a number, so two readings can be subtracted. */
function wallClockMs(instant: Date, timeZone: string): number {
  const parts = formatterFor(timeZone).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    return part ? Number(part.value) : 0;
  };
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
}

/** How far the zone is from UTC at a given instant, in ms. */
function offsetAt(instant: Date, timeZone: string): number {
  return wallClockMs(instant, timeZone) - instant.getTime();
}

/**
 * The instant at which the clocks in `timeZone` read this wall clock.
 *
 * Two passes, and the second is not belt-and-braces. The offset has to be
 * sampled at an instant, and the only instant available on the first pass is a
 * guess that may sit on the wrong side of a changeover; sampling again at the
 * corrected instant fixes exactly that case.
 *
 * The hour that does not exist (02:30 on the spring-forward Sunday) resolves
 * forward, to the same moment 03:30 names. There is no right answer, and
 * landing an hour later beats throwing at somebody scheduling a meeting.
 */
export function zonedToUtc(wall: WallClock, timeZone: string): Date {
  const target = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, 0);
  const first = target - offsetAt(new Date(target), timeZone);
  const second = target - offsetAt(new Date(first), timeZone);
  return new Date(second);
}

/** Days between sittings, or 0 for a round that happens once. */
function periodDays(cadence: Cadence): number {
  if (cadence === "weekly") return 7;
  if (cadence === "fortnightly") return 14;
  return 0;
}

export type Sitting = {
  /** The absolute instant it starts. */
  at: Date;
  /** Which repeat this is — 0 is the first sitting ever. */
  index: number;
};

/**
 * The next `count` sittings at or after `after`.
 *
 * Empty for a one-off that has already happened, which is the honest answer
 * and lets the caller show a finished round as finished instead of inventing a
 * next date for it.
 */
export function nextSittings(
  round: { startsAt: Date | string; cadence: Cadence; timeZone: string },
  after: Date,
  count = 1,
): Sitting[] {
  const first = round.startsAt instanceof Date ? round.startsAt : new Date(round.startsAt);
  if (Number.isNaN(first.getTime()) || count <= 0) return [];

  const step = periodDays(round.cadence);
  if (step === 0) {
    return first.getTime() >= after.getTime() ? [{ at: first, index: 0 }] : [];
  }

  const wall = wallClockIn(first, round.timeZone);

  // Jump most of the way in one move rather than stepping a week at a time: a
  // weekly round left running for three years is 156 iterations otherwise, on
  // every render of the list. The estimate can be off by one across a
  // changeover, which is what the loop below is for.
  const elapsed = after.getTime() - first.getTime();
  let index = elapsed > 0 ? Math.max(0, Math.floor(elapsed / (step * DAY_MS)) - 1) : 0;

  const occurrenceAt = (n: number): Date =>
    zonedToUtc({ ...wall, day: wall.day + n * step }, round.timeZone);

  // Walk forward to the first sitting that has not happened yet. Bounded so a
  // corrupt row cannot spin: ten years of fortnights is 260.
  let guard = 0;
  while (occurrenceAt(index).getTime() < after.getTime() && guard < 1_000) {
    index++;
    guard++;
  }

  const out: Sitting[] = [];
  for (let i = 0; i < count; i++) {
    out.push({ at: occurrenceAt(index + i), index: index + i });
  }
  return out;
}

/** The very next sitting, or null for a one-off that is over. */
export function nextSitting(
  round: { startsAt: Date | string; cadence: Cadence; timeZone: string },
  after: Date,
): Date | null {
  const [first] = nextSittings(round, after, 1);
  return first ? first.at : null;
}

/**
 * Is this sitting happening right now?
 *
 * Used to say "join now" rather than a date. A round is joinable a few minutes
 * early — people arrive before the hour, and a button that appears at exactly
 * 19:00:00 is a button that is missing when somebody checks at 18:58.
 */
export const JOINABLE_FROM_MS = 10 * 60_000;

export function isLive(
  round: { startsAt: Date | string; cadence: Cadence; timeZone: string; durationMinutes: number },
  now: Date,
): boolean {
  const next = nextSitting(round, new Date(now.getTime() - round.durationMinutes * 60_000));
  if (!next) return false;
  return now.getTime() >= next.getTime() - JOINABLE_FROM_MS && now.getTime() <= next.getTime() + round.durationMinutes * 60_000;
}
