/**
 * Speaking rounds — the part of Heidi where the learner opens their mouth.
 *
 * Study groups were the first thing here with more than one human in it. This
 * is the same social object with the medium changed, and the change of medium
 * is the whole point: Zurich German is a SPOKEN variety, so a product that
 * only ever reads and writes it teaches the half that diglossia already gives
 * away for free.
 *
 * WHY THIS IS ITS OWN SURFACE AND NOT A SIDE EFFECT OF THE CHAT.
 *
 * Perception training transfers weakly to production — d ≈ 0.92 perception
 * against d ≈ 0.54 production, and uncorrelated across studies (Sakai &
 * Moorman 2018, already in the source register). Heidi's comprehension work
 * does not quietly make anybody a speaker. If speaking is wanted it has to be
 * trained by speaking, deliberately, as its own thing. That finding is also
 * why §8 forbids selling the listening product as a speaking fix: it forbids
 * conflating the two, not building the second one.
 *
 * HEIDI DOES NOT CARRY THE AUDIO OF THE MEETING.
 *
 * A round is scheduled here and MET somewhere — `meetingUrl` is a room the
 * host already has. Building an SFU is not this product, and pretending to
 * host video would be the largest thing in the repo doing the least for a
 * learner. What Heidi owns is the part nobody else does: the topic people
 * proposed, when it repeats, who is coming, and the take you record around it.
 */

/**
 * The two shapes a sitting can have, because they are socially different and
 * the difference is what decides the capacity.
 *
 * `webinar`  one voice, an audience. You come to listen to Zurich German.
 * `circle`   everyone speaks in turn. You come to be heard in it.
 *
 * Not one "event" type with a number on it: threadkit already taught this repo
 * that a participant count changes the social RULE rather than the scale, and
 * a circle of forty is not a big circle, it is a webinar nobody labelled.
 */
export type RoundFormat = "webinar" | "circle";

/**
 * "Regularly" is the requirement, so a repeat is a field rather than a second
 * row somebody remembers to create. A one-off is the degenerate case of the
 * same type, not a different object.
 */
export type Cadence = "once" | "weekly" | "fortnightly";

export const CADENCES: readonly Cadence[] = ["once", "weekly", "fortnightly"];
export const FORMATS: readonly RoundFormat[] = ["webinar", "circle"];

export function isFormat(value: unknown): value is RoundFormat {
  return typeof value === "string" && (FORMATS as readonly string[]).includes(value);
}

export function isCadence(value: unknown): value is Cadence {
  return typeof value === "string" && (CADENCES as readonly string[]).includes(value);
}

/**
 * Something a learner wants an hour spent on.
 *
 * Proposed, not programmed. The one thing a language school cannot buy is a
 * room of adults who actually want to talk about the thing on the board, and
 * the cheapest way to get it is to stop choosing the thing.
 */
export type Topic = {
  id: string;
  title: string;
  /** One line of why it is worth an hour. Not an essay, not a description. */
  pitch: string;
  /** OIDC `sub` of whoever proposed it. */
  proposedBy: string;
  /** Denormalised at write time — there is no users table. See db/schema.ts. */
  proposerName: string;
  createdAt: string;
  /** How many people said they would come, the proposer included. */
  interest: number;
  /** Whether the actor who asked is one of them. Absent when signed out. */
  mine?: boolean;
  /** Set once somebody put it in the calendar. */
  roundId?: string | null;
};

export type Round = {
  id: string;
  /** The proposal it came from, when it came from one. */
  topicId: string | null;
  title: string;
  format: RoundFormat;
  hostId: string;
  hostName: string;
  /**
   * The absolute instant of the next sitting, as an ISO string.
   *
   * Absolute, never a wall-clock string with a zone beside it: the round is
   * one moment and the people in it are in different places. The recurrence
   * that GENERATES this is wall-clock and zoned, which is a different problem
   * and lives in `schedule.ts`.
   */
  startsAt: string;
  durationMinutes: number;
  cadence: Cadence;
  /**
   * The wall-clock zone the repeat is anchored in.
   *
   * Kept even though `startsAt` is absolute, because "every Tuesday at 19:00"
   * means 19:00 in Zurich on both sides of a daylight-saving change, and an
   * absolute instant plus seven days does not. See `schedule.ts`.
   */
  timeZone: string;
  /** Where the talking happens. Heidi is not a video product. */
  meetingUrl: string | null;
  capacity: number;
  attending: number;
  /** Whether the asking actor said they are coming. Absent when signed out. */
  mine?: boolean;
  /**
   * Happening right now (or about to).
   *
   * Computed on the SERVER and carried, rather than worked out in the browser
   * from `startsAt` and the local clock. Two reasons, and the second is the
   * one that bites: a client-side comparison renders differently on the server
   * pass than on hydration, which React reports as a mismatch and fixes by
   * throwing away the server HTML — and the answer would then depend on
   * whether the visitor's device clock happens to be right.
   */
  live?: boolean;
};

/** Shown to strangers who follow a link, so short. */
export const MAX_TITLE_LENGTH = 80;
/** One line. A pitch that needs a paragraph is a topic nobody will join. */
export const MAX_PITCH_LENGTH = 200;

/**
 * A circle where everyone speaks. Eight is roughly where a sixty-minute
 * sitting stops giving anybody enough floor to be worth attending — below the
 * study group's twelve on purpose, because twelve people can read along and
 * eight cannot all talk.
 */
export const CIRCLE_CAPACITY = 8;

/**
 * A webinar is one voice and an audience, so the ceiling is about the room
 * rather than the conversation. Deliberately not "unlimited": a number that
 * exists is a number a host can watch filling up.
 */
export const WEBINAR_CAPACITY = 60;

export function capacityFor(format: RoundFormat): number {
  return format === "circle" ? CIRCLE_CAPACITY : WEBINAR_CAPACITY;
}

/** The lengths a sitting may be. A free-text minute field invites 7 and 480. */
export const DURATIONS = [30, 45, 60] as const;
export type Duration = (typeof DURATIONS)[number];

export function isDuration(value: unknown): value is Duration {
  return typeof value === "number" && (DURATIONS as readonly number[]).includes(value);
}

/**
 * How much interest makes a topic worth putting in the calendar.
 *
 * A SIGNAL, never a gate. A host may schedule anything, including their own
 * unsupported idea — refusing would mean a fresh instance with three users can
 * never hold its first round, which is the one moment this feature has to work
 * for the product to start at all.
 */
export const INTEREST_TO_SCHEDULE = 3;
