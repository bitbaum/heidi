/**
 * WHEN HEIDI MAY WRITE TO SOMEBODY — and, mostly, when it may not.
 *
 * A reminder that is wrong once costs one unsubscribe; one that is right but
 * too often costs the whole channel, and a person who has stopped opening mail
 * from a product has stopped being reminded of it at all. So every rule here
 * errs toward silence, and each says why in the same place it is written:
 *
 *   OPTED IN            Off until somebody switches it on, themselves.
 *   VERIFIED ADDRESS    Anyone can type anyone's address into a sign-up form.
 *                       Account mail may go to an unverified one (they asked
 *                       for it); a reminder may not.
 *   A DAY OLD           Not on the first evening: the product has not earned it.
 *   THEIR EVENING       18:00 where they are — the tram home — never 03:00 UTC.
 *   EVERY OTHER DAY     At most. Daily reminders are the thing people resent.
 *   ENOUGH TO DO        Five or more due. «1 Frage wartet» is not worth a mail.
 *   NOT IF THEY CAME    Practised today: the reminder would be about something
 *                       they have just done.
 *   THREE, THEN STOP    A reminder followed by no practice counts as unheard;
 *                       after three in a row there are no more until they come
 *                       back on their own. Silence is the answer, taken as one.
 *
 * Pure: the clock and the facts come in, a verdict goes out.
 */

export const REMINDER_HOUR = 18;
export const MIN_DUE = 5;
/** Slightly under two days, so an hourly sweep does not slide the hour. */
export const MIN_GAP_MS = 44 * 3_600_000;
export const MAX_UNHEARD = 3;
const FIRST_DAY_MS = 24 * 3_600_000;
/** Only when a browser reports no usable zone, which it almost never does. */
const FALLBACK_TZ = "UTC";

export type ReminderFacts = {
  reminders: boolean;
  emailVerified: boolean;
  deliverable: boolean;
  tz: string | null;
  accountCreatedAt: Date;
  /** Questions due now, across every device that syncs. */
  due: number;
  /** The newest answer on any device; null if they have never answered. */
  lastActiveAt: Date | null;
  lastReminderAt: Date | null;
  /** Reminders in a row that were not followed by practice. */
  unheard: number;
  now: Date;
};

export type ReminderVerdict =
  | { send: true; unheard: number }
  | { send: false; why: "off" | "unverified" | "undeliverable" | "new" | "hour" | "recent" | "quiet" | "practised" | "few" };

export function validTimeZone(tz: string | null | undefined): string {
  if (!tz) return FALLBACK_TZ;
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return FALLBACK_TZ;
  }
}

function localParts(at: Date, tz: string): { day: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
}

export function decideReminder(f: ReminderFacts): ReminderVerdict {
  if (!f.reminders) return { send: false, why: "off" };
  if (!f.emailVerified) return { send: false, why: "unverified" };
  if (!f.deliverable) return { send: false, why: "undeliverable" };
  if (f.now.getTime() - f.accountCreatedAt.getTime() < FIRST_DAY_MS) return { send: false, why: "new" };

  const tz = validTimeZone(f.tz);
  const here = localParts(f.now, tz);
  if (here.hour !== REMINDER_HOUR) return { send: false, why: "hour" };
  if (f.lastReminderAt && f.now.getTime() - f.lastReminderAt.getTime() < MIN_GAP_MS) return { send: false, why: "recent" };

  // Was the last reminder answered? Only a practice AFTER it counts.
  const answered = f.lastReminderAt !== null && f.lastActiveAt !== null && f.lastActiveAt > f.lastReminderAt;
  const unheard = f.lastReminderAt === null ? 0 : answered ? 0 : f.unheard + 1;
  if (unheard >= MAX_UNHEARD) return { send: false, why: "quiet" };

  if (f.lastActiveAt && localParts(f.lastActiveAt, tz).day === here.day) return { send: false, why: "practised" };
  if (f.due < MIN_DUE) return { send: false, why: "few" };
  return { send: true, unheard };
}
