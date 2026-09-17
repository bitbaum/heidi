/**
 * What may happen to a topic or a round, decided without a database.
 *
 * Same split as `groups/rules.ts`, for the same reason: every rule here is one
 * an API route would otherwise express as an `if` next to a query, where it
 * cannot be tested and tends to get written twice with a difference. Pure
 * functions instead — the route reads rows, asks these, and does what it is
 * told.
 */

import {
  MAX_PITCH_LENGTH,
  MAX_TITLE_LENGTH,
  capacityFor,
  isCadence,
  isDuration,
  isFormat,
  type Cadence,
  type Duration,
  type RoundFormat,
} from "./types.ts";

export type TextProblem = "empty" | "too-long";

function checkText(raw: unknown, max: number): { ok: true; text: string } | { ok: false; problem: TextProblem } {
  const text = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
  if (!text) return { ok: false, problem: "empty" };
  if (text.length > max) return { ok: false, problem: "too-long" };
  return { ok: true, text };
}

export const checkTitle = (raw: unknown) => checkText(raw, MAX_TITLE_LENGTH);
export const checkPitch = (raw: unknown) => checkText(raw, MAX_PITCH_LENGTH);

export type UrlProblem = "not-a-url" | "not-https";

/**
 * The meeting link, which is the one field here a stranger supplies and
 * everybody else clicks.
 *
 * HTTPS ONLY, and the reason is not tidiness. This string is rendered as an
 * anchor for every attendee, so accepting the scheme as given would accept
 * `javascript:` — stored XSS, contributed by whoever opened the round, fired
 * in the browser of everyone who came to practise. An allowlist of one scheme
 * is the whole defence and it costs a host nothing: no video product has
 * issued a plain-http room link in years.
 *
 * An empty link is legitimate and stays legitimate: a round can be scheduled
 * before anybody has made the room.
 */
export function checkMeetingUrl(
  raw: unknown,
): { ok: true; url: string | null } | { ok: false; problem: UrlProblem } {
  const text = typeof raw === "string" ? raw.trim() : "";
  if (!text) return { ok: true, url: null };

  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    return { ok: false, problem: "not-a-url" };
  }
  if (parsed.protocol !== "https:") return { ok: false, problem: "not-https" };
  return { ok: true, url: parsed.toString() };
}

export type StartProblem = "not-a-date" | "in-the-past" | "too-far-ahead";

/**
 * A round cannot start in the past, and cannot be parked in 2049.
 *
 * The far limit is not pedantry: a repeat with no end is a row that generates
 * sittings forever, and a typo in a year field is how one ends up advertising
 * a weekly meeting nobody will ever hold. One year is longer than anybody
 * plans a conversation group.
 */
export const MAX_AHEAD_MS = 365 * 24 * 3_600_000;

/** A few minutes of slack, so a form filled in at 18:59 for 19:00 still posts. */
const PAST_GRACE_MS = 5 * 60_000;

export function checkStart(raw: unknown, now: Date): { ok: true; at: Date } | { ok: false; problem: StartProblem } {
  const at = typeof raw === "string" || typeof raw === "number" ? new Date(raw) : new Date(Number.NaN);
  if (Number.isNaN(at.getTime())) return { ok: false, problem: "not-a-date" };
  if (at.getTime() < now.getTime() - PAST_GRACE_MS) return { ok: false, problem: "in-the-past" };
  if (at.getTime() > now.getTime() + MAX_AHEAD_MS) return { ok: false, problem: "too-far-ahead" };
  return { ok: true, at };
}

/**
 * A time zone the runtime actually knows.
 *
 * Validated rather than trusted, because it is stored and then used to
 * generate every future sitting: a junk value would not fail here, it would
 * fail months later when the recurrence was computed, on somebody else's
 * screen.
 */
export function checkTimeZone(raw: unknown, fallback: string): string {
  if (typeof raw !== "string" || !raw) return fallback;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: raw });
    return raw;
  } catch {
    return fallback;
  }
}

export type RoundDraft = {
  title: string;
  format: RoundFormat;
  cadence: Cadence;
  durationMinutes: Duration;
  startsAt: Date;
  timeZone: string;
  meetingUrl: string | null;
  capacity: number;
};

export type DraftProblem =
  | { field: "title"; problem: TextProblem }
  | { field: "format"; problem: "unknown" }
  | { field: "cadence"; problem: "unknown" }
  | { field: "duration"; problem: "unknown" }
  | { field: "startsAt"; problem: StartProblem }
  | { field: "meetingUrl"; problem: UrlProblem };

/**
 * Everything a round needs, checked in one place.
 *
 * One function rather than six calls at the route, so that a new field cannot
 * be added to the form and quietly skipped on the server — which is the usual
 * shape of "the client validates it".
 */
export function checkRound(
  input: {
    title?: unknown;
    format?: unknown;
    cadence?: unknown;
    durationMinutes?: unknown;
    startsAt?: unknown;
    timeZone?: unknown;
    meetingUrl?: unknown;
  },
  now: Date,
  defaultTimeZone: string,
): { ok: true; draft: RoundDraft } | { ok: false; problem: DraftProblem } {
  const title = checkTitle(input.title);
  if (!title.ok) return { ok: false, problem: { field: "title", problem: title.problem } };

  if (!isFormat(input.format)) return { ok: false, problem: { field: "format", problem: "unknown" } };
  if (!isCadence(input.cadence)) return { ok: false, problem: { field: "cadence", problem: "unknown" } };
  if (!isDuration(input.durationMinutes)) return { ok: false, problem: { field: "duration", problem: "unknown" } };

  const start = checkStart(input.startsAt, now);
  if (!start.ok) return { ok: false, problem: { field: "startsAt", problem: start.problem } };

  const url = checkMeetingUrl(input.meetingUrl);
  if (!url.ok) return { ok: false, problem: { field: "meetingUrl", problem: url.problem } };

  return {
    ok: true,
    draft: {
      title: title.text,
      format: input.format,
      cadence: input.cadence,
      durationMinutes: input.durationMinutes,
      startsAt: start.at,
      timeZone: checkTimeZone(input.timeZone, defaultTimeZone),
      meetingUrl: url.url,
      // Read from the format rather than accepted from the client: a capacity
      // field on the request is a capacity field somebody sets to 9999.
      capacity: capacityFor(input.format),
    },
  };
}

export type AttendRefusal = "full" | "already-attending";

export function mayAttend(args: {
  attending: number;
  capacity: number;
  alreadyAttending: boolean;
}): { ok: true } | { ok: false; reason: AttendRefusal } {
  if (args.alreadyAttending) return { ok: false, reason: "already-attending" };
  if (args.attending >= args.capacity) return { ok: false, reason: "full" };
  return { ok: true };
}

/**
 * Only the host may change or call off a round.
 *
 * Narrow on purpose, exactly as `mayInvite` is for groups: a round is a room
 * somebody opened, and a meeting other attendees can move is a meeting nobody
 * can be told the time of.
 */
export function mayEditRound(hostId: string, actorId: string): boolean {
  return hostId === actorId;
}

/**
 * Anyone signed in may host, including on somebody else's topic.
 *
 * "Self-organised" is the study-group rule and it carries over: a proposal
 * that only its author may schedule is a proposal that dies when its author
 * gets busy, which is most of them.
 */
export function mayHost(actorId: string | null): boolean {
  return typeof actorId === "string" && actorId.length > 0;
}
