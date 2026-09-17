import { and, asc, desc, eq, isNull, or, sql, gt } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { roundAttendance, speakingRounds, speakingTopics, topicInterest } from "../../db/schema.ts";
import { nextSitting } from "./schedule.ts";
import type { Cadence, Round, RoundFormat, Topic } from "./types.ts";
import type { RoundDraft } from "./rules.ts";

/**
 * Every query a topic or a round needs, and nothing else.
 *
 * Same split as `groups/store.ts`: the decisions are in `rules.ts` and are
 * tested with no database at all, and this file is plumbing. Nothing here
 * decides who may do what — callers ask the rules first.
 *
 * NOTHING HERE STORES A RECORDING, a measurement or a transcript. Takes are
 * device-local; see the schema note and `use-takes.ts`.
 */

const iso = (d: Date | string): string => (d instanceof Date ? d.toISOString() : d);

/**
 * Propose a topic, and count the proposer as interested in their own idea.
 *
 * One transaction, because a topic that shows "0 people would come" the
 * instant its author posted it is a topic nobody else will back either.
 */
export async function createTopic(args: {
  title: string;
  pitch: string;
  actorId: string;
  displayName: string;
}): Promise<Topic> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(speakingTopics)
      .values({
        title: args.title,
        pitch: args.pitch,
        proposedBy: args.actorId,
        proposerName: args.displayName,
      })
      .returning();

    await tx.insert(topicInterest).values({ topicId: row.id, actorId: args.actorId });

    return {
      id: row.id,
      title: row.title,
      pitch: row.pitch,
      proposedBy: row.proposedBy,
      proposerName: row.proposerName,
      createdAt: iso(row.createdAt),
      interest: 1,
      mine: true,
      roundId: null,
    };
  });
}

/**
 * Topics, most recently proposed first, with the two things the page needs
 * that a plain select cannot give it: how many people would come, and whether
 * YOU are one of them.
 *
 * `actorId` is optional because the list is readable signed out — the point of
 * a proposals board is that somebody browsing can see there is something worth
 * making an account for.
 */
export async function listTopics(actorId?: string | null): Promise<Topic[]> {
  const rows = await db
    .select({
      id: speakingTopics.id,
      title: speakingTopics.title,
      pitch: speakingTopics.pitch,
      proposedBy: speakingTopics.proposedBy,
      proposerName: speakingTopics.proposerName,
      createdAt: speakingTopics.createdAt,
      interest: sql<number>`(
        select count(*)::int from ${topicInterest} i where i.topic_id = ${speakingTopics.id}
      )`,
      mine: sql<boolean>`(
        select exists(
          select 1 from ${topicInterest} i
           where i.topic_id = ${speakingTopics.id} and i.actor_id = ${actorId ?? ""}
        )
      )`,
      roundId: sql<string | null>`(
        select r.id from ${speakingRounds} r
         where r.topic_id = ${speakingTopics.id} and r.cancelled_at is null
         order by r.starts_at asc limit 1
      )`,
    })
    .from(speakingTopics)
    .orderBy(desc(speakingTopics.createdAt))
    .limit(100);

  return rows.map((row) => ({
    ...row,
    createdAt: iso(row.createdAt),
    mine: actorId ? row.mine : undefined,
  }));
}

/** Idempotent: pressing "I would come" twice is not an error, it is a double tap. */
export async function addInterest(topicId: string, actorId: string): Promise<void> {
  await db.insert(topicInterest).values({ topicId, actorId }).onConflictDoNothing();
}

export async function removeInterest(topicId: string, actorId: string): Promise<void> {
  await db
    .delete(topicInterest)
    .where(and(eq(topicInterest.topicId, topicId), eq(topicInterest.actorId, actorId)));
}

export async function topicExists(topicId: string): Promise<boolean> {
  const rows = await db.select({ id: speakingTopics.id }).from(speakingTopics).where(eq(speakingTopics.id, topicId));
  return rows.length > 0;
}

/** Open a round, and put its host in it — somebody has to be there. */
export async function createRound(args: {
  draft: RoundDraft;
  topicId: string | null;
  hostId: string;
  hostName: string;
}): Promise<Round> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(speakingRounds)
      .values({
        topicId: args.topicId,
        title: args.draft.title,
        format: args.draft.format,
        hostId: args.hostId,
        hostName: args.hostName,
        startsAt: args.draft.startsAt,
        durationMinutes: args.draft.durationMinutes,
        cadence: args.draft.cadence,
        timeZone: args.draft.timeZone,
        meetingUrl: args.draft.meetingUrl,
        capacity: args.draft.capacity,
      })
      .returning();

    await tx
      .insert(roundAttendance)
      .values({ roundId: row.id, actorId: args.hostId, displayName: args.hostName });

    return { ...toRound(row), attending: 1, mine: true };
  });
}

type RoundRow = {
  id: string;
  topicId: string | null;
  title: string;
  format: string;
  hostId: string;
  hostName: string;
  startsAt: Date;
  durationMinutes: number;
  cadence: string;
  timeZone: string;
  meetingUrl: string | null;
  capacity: number;
};

function toRound(row: RoundRow): Round {
  return {
    id: row.id,
    topicId: row.topicId,
    title: row.title,
    // The column is text, so the row is widened back to the union here rather
    // than trusted: a value written by an older build must not become a
    // `RoundFormat` by assertion alone.
    format: row.format === "webinar" ? "webinar" : ("circle" as RoundFormat),
    hostId: row.hostId,
    hostName: row.hostName,
    startsAt: iso(row.startsAt),
    durationMinutes: row.durationMinutes,
    cadence: asCadence(row.cadence),
    timeZone: row.timeZone,
    meetingUrl: row.meetingUrl,
    capacity: row.capacity,
    attending: 0,
  };
}

function asCadence(value: string): Cadence {
  return value === "weekly" || value === "fortnightly" ? value : "once";
}

const roundColumns = {
  id: speakingRounds.id,
  topicId: speakingRounds.topicId,
  title: speakingRounds.title,
  format: speakingRounds.format,
  hostId: speakingRounds.hostId,
  hostName: speakingRounds.hostName,
  startsAt: speakingRounds.startsAt,
  durationMinutes: speakingRounds.durationMinutes,
  cadence: speakingRounds.cadence,
  timeZone: speakingRounds.timeZone,
  meetingUrl: speakingRounds.meetingUrl,
  capacity: speakingRounds.capacity,
};

/**
 * The rounds still to come, soonest first.
 *
 * "Still to come" CANNOT be `starts_at > now`, and that is the whole reason
 * this is not a one-line select. A weekly round opened in January has a
 * `starts_at` in January forever; it is the recurrence that makes it upcoming.
 * So the SQL keeps anything that repeats, plus one-offs that have not finished
 * yet, and the ordering is done in JS against the computed next sitting.
 *
 * At this scale that is the right trade. If the board ever holds thousands of
 * rounds the answer is a materialised next_sitting column maintained on write,
 * not a cleverer query — and the shape here would not change.
 */
export async function listUpcomingRounds(args: { actorId?: string | null; now: Date }): Promise<Round[]> {
  const finished = new Date(args.now.getTime() - 24 * 3_600_000);
  const rows = await db
    .select({
      ...roundColumns,
      attending: sql<number>`(
        select count(*)::int from ${roundAttendance} a where a.round_id = ${speakingRounds.id}
      )`,
      mine: sql<boolean>`(
        select exists(
          select 1 from ${roundAttendance} a
           where a.round_id = ${speakingRounds.id} and a.actor_id = ${args.actorId ?? ""}
        )
      )`,
    })
    .from(speakingRounds)
    .where(
      and(
        isNull(speakingRounds.cancelledAt),
        // A one-off from last year is over. A repeat never is until cancelled.
        or(sql`${speakingRounds.cadence} <> 'once'`, gt(speakingRounds.startsAt, finished)),
      ),
    )
    .orderBy(asc(speakingRounds.startsAt))
    .limit(200);

  return rows
    .map((row) => ({
      round: { ...toRound(row), attending: row.attending, mine: args.actorId ? row.mine : undefined },
      next: nextSittingFor(row, args.now),
    }))
    .filter((entry) => entry.next !== null)
    .sort((a, b) => (a.next as Date).getTime() - (b.next as Date).getTime())
    .map((entry) => ({
      ...entry.round,
      startsAt: (entry.next as Date).toISOString(),
      live: isLiveAt(entry.next as Date, entry.round.durationMinutes, args.now),
    }));
}

/**
 * The next sitting, counting one IN PROGRESS as still to come.
 *
 * Asking for the next sitting at `now` drops a round that started five minutes
 * ago — which is exactly when somebody running late opens this page looking
 * for the link, and finds the meeting has vanished. For a weekly round it is
 * worse than vanishing: the list would quietly advertise NEXT week while the
 * thing is happening.
 *
 * So the question is asked from one duration ago, which makes a sitting count
 * as current until it has actually finished.
 */
function nextSittingFor(
  row: { startsAt: Date; cadence: string; timeZone: string; durationMinutes: number },
  now: Date,
): Date | null {
  return nextSitting(
    { startsAt: row.startsAt, cadence: asCadence(row.cadence), timeZone: row.timeZone },
    new Date(now.getTime() - row.durationMinutes * 60_000),
  );
}

/** Joinable a little early, because people arrive before the hour. */
const JOINABLE_EARLY_MS = 10 * 60_000;

function isLiveAt(startsAt: Date, durationMinutes: number, now: Date): boolean {
  return (
    now.getTime() >= startsAt.getTime() - JOINABLE_EARLY_MS &&
    now.getTime() <= startsAt.getTime() + durationMinutes * 60_000
  );
}

/**
 * One round, with the next sitting already resolved.
 *
 * `startsAt` on the returned object is the NEXT sitting rather than the first
 * one ever, because every caller wants the former and none of them wants a
 * date in January. The stored first sitting is an implementation detail of the
 * recurrence and stays in this file.
 */
export async function roundById(id: string, args: { actorId?: string | null; now: Date }): Promise<Round | null> {
  const rows = await db
    .select({
      ...roundColumns,
      cancelledAt: speakingRounds.cancelledAt,
      attending: sql<number>`(
        select count(*)::int from ${roundAttendance} a where a.round_id = ${speakingRounds.id}
      )`,
      mine: sql<boolean>`(
        select exists(
          select 1 from ${roundAttendance} a
           where a.round_id = ${speakingRounds.id} and a.actor_id = ${args.actorId ?? ""}
        )
      )`,
    })
    .from(speakingRounds)
    .where(eq(speakingRounds.id, id));

  const row = rows[0];
  if (!row || row.cancelledAt) return null;

  const next = nextSittingFor(row, args.now);
  return {
    ...toRound(row),
    attending: row.attending,
    mine: args.actorId ? row.mine : undefined,
    // A one-off that is over keeps its own date rather than being given a
    // fictional next one.
    startsAt: next ? next.toISOString() : iso(row.startsAt),
    live: next ? isLiveAt(next, row.durationMinutes, args.now) : false,
  };
}

export async function attendees(roundId: string): Promise<Array<{ actorId: string; displayName: string }>> {
  return db
    .select({ actorId: roundAttendance.actorId, displayName: roundAttendance.displayName })
    .from(roundAttendance)
    .where(eq(roundAttendance.roundId, roundId))
    .orderBy(asc(roundAttendance.createdAt));
}

export async function attend(args: { roundId: string; actorId: string; displayName: string }): Promise<void> {
  await db
    .insert(roundAttendance)
    .values({ roundId: args.roundId, actorId: args.actorId, displayName: args.displayName })
    .onConflictDoNothing();
}

export async function unattend(roundId: string, actorId: string): Promise<void> {
  await db
    .delete(roundAttendance)
    .where(and(eq(roundAttendance.roundId, roundId), eq(roundAttendance.actorId, actorId)));
}

/** Called off, not deleted — people have it in their calendar. */
export async function cancelRound(id: string): Promise<void> {
  await db.update(speakingRounds).set({ cancelledAt: new Date() }).where(eq(speakingRounds.id, id));
}

/** Just the host, for an authorisation check that does not need the whole row. */
export async function hostOf(id: string): Promise<string | null> {
  const rows = await db.select({ hostId: speakingRounds.hostId }).from(speakingRounds).where(eq(speakingRounds.id, id));
  return rows[0]?.hostId ?? null;
}
