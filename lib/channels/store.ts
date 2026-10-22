import { and, asc, desc, eq, gt, inArray, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { channelFollows, channelVideos, channels, pushSubscriptions } from "../db/schema.ts";
import { decodeQuestionSet, type QuestionSet } from "./questions.ts";
import { isSpoken, type Item, type Source, type SourceKind, type Spoken } from "./source.ts";
import { decodeTranscript, type Transcript } from "./transcript.ts";
import type { DueChannel, Follower, Subscription } from "./sweep.ts";

/**
 * Every query following a source needs, and nothing else. Decisions live
 * in `sweep.ts`; this file is plumbing and is tested by using it.
 *
 * The tables are still called `channels` and `channel_videos` from the day
 * only YouTube was followed; a row is any source with a feed (`source.ts`),
 * and an item is a video or an episode.
 */

const iso = (d: Date | string): string => (d instanceof Date ? d.toISOString() : d);

export type Channel = Source & { spoken: Spoken | null; checkedAt: string | null; lastError: string | null };

export type FollowedChannel = Channel & { followedAt: string; seenAt: string | null; newCount: number; videoCount: number };

export type TranscriptState = "unknown" | "ready" | "none" | "blocked";

export type Video = {
  id: string;
  kind: SourceKind;
  channelId: string;
  channelName: string;
  channelUrl: string;
  channelImageUrl: string | null;
  channelSpoken: Spoken | null;
  title: string;
  publishedAt: string;
  thumbnailUrl: string | null;
  description: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  durationSeconds: number | null;
  transcriptState: TranscriptState;
};

export type VideoDetail = Video & {
  transcript: Transcript | null;
  transcriptLink: { url: string; type: string } | null;
  questions: QuestionSet | null;
};

/** The follow, creating the source row if nobody followed it before. */
export async function follow(actorId: string, source: Source, items: readonly Item[], spoken: Spoken | null): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .insert(channels)
      .values({ id: source.id, kind: source.kind, name: source.name, handle: source.handle, url: source.url, feedUrl: source.feedUrl, imageUrl: source.imageUrl, spoken, checkedAt: new Date() })
      .onConflictDoUpdate({
        target: channels.id,
        set: {
          name: source.name,
          handle: source.handle,
          url: source.url,
          feedUrl: source.feedUrl,
          imageUrl: source.imageUrl,
          // The register's word wins over nothing; never over an earlier answer.
          spoken: sql`coalesce(${channels.spoken}, ${spoken})`,
        },
      });
    if (items.length > 0) {
      await tx
        .insert(channelVideos)
        .values(items.map((v) => ({ ...rowOf(source.id, v), notifiedAt: new Date() })))
        .onConflictDoNothing();
    }
    await tx.insert(channelFollows).values({ actorId, channelId: source.id }).onConflictDoNothing();
  });
}

export async function unfollow(actorId: string, channelId: string): Promise<void> {
  await db.delete(channelFollows).where(and(eq(channelFollows.actorId, actorId), eq(channelFollows.channelId, channelId)));
}

export async function isFollowing(actorId: string, channelId: string): Promise<boolean> {
  const [row] = await db
    .select({ one: sql<number>`1` })
    .from(channelFollows)
    .where(and(eq(channelFollows.actorId, actorId), eq(channelFollows.channelId, channelId)))
    .limit(1);
  return Boolean(row);
}

/** This learner's sources, with how many items arrived since they last looked. */
export async function followsFor(actorId: string): Promise<FollowedChannel[]> {
  const rows = await db
    .select({
      id: channels.id,
      kind: channels.kind,
      name: channels.name,
      handle: channels.handle,
      url: channels.url,
      feedUrl: channels.feedUrl,
      imageUrl: channels.imageUrl,
      spoken: channels.spoken,
      checkedAt: channels.checkedAt,
      lastError: channels.lastError,
      followedAt: channelFollows.followedAt,
      seenAt: channelFollows.seenAt,
      newCount: sql<number>`(
        select count(*)::int from ${channelVideos} v
         where v.channel_id = ${channels.id}
           and v.published_at > coalesce(${channelFollows.seenAt}, ${channelFollows.followedAt})
      )`,
      videoCount: sql<number>`(select count(*)::int from ${channelVideos} v where v.channel_id = ${channels.id})`,
    })
    .from(channelFollows)
    .innerJoin(channels, eq(channels.id, channelFollows.channelId))
    .where(eq(channelFollows.actorId, actorId))
    .orderBy(asc(channelFollows.followedAt));
  return rows.map((r) => ({
    ...sourceOf(r),
    spoken: isSpoken(r.spoken) ? r.spoken : null,
    checkedAt: r.checkedAt ? iso(r.checkedAt) : null,
    lastError: r.lastError,
    followedAt: iso(r.followedAt),
    seenAt: r.seenAt ? iso(r.seenAt) : null,
    newCount: Number(r.newCount),
    videoCount: Number(r.videoCount),
  }));
}

const VIDEO_COLUMNS = {
  id: channelVideos.id,
  kind: channels.kind,
  channelId: channelVideos.channelId,
  channelName: channels.name,
  channelUrl: channels.url,
  channelImageUrl: channels.imageUrl,
  channelSpoken: channels.spoken,
  title: channelVideos.title,
  publishedAt: channelVideos.publishedAt,
  thumbnailUrl: channelVideos.thumbnailUrl,
  description: channelVideos.description,
  mediaUrl: channelVideos.mediaUrl,
  mediaType: channelVideos.mediaType,
  durationSeconds: channelVideos.durationSeconds,
  transcriptState: channelVideos.transcriptState,
};

/** The newest items across everything this learner follows, newest first, each saying whether it is new to them. */
export async function recentVideosFor(actorId: string, limit = 30): Promise<Array<Video & { isNew: boolean }>> {
  const rows = await db
    .select({
      ...VIDEO_COLUMNS,
      isNew: sql<boolean>`${channelVideos.publishedAt} > coalesce(${channelFollows.seenAt}, ${channelFollows.followedAt})`,
    })
    .from(channelFollows)
    .innerJoin(channels, eq(channels.id, channelFollows.channelId))
    .innerJoin(channelVideos, eq(channelVideos.channelId, channelFollows.channelId))
    .where(eq(channelFollows.actorId, actorId))
    .orderBy(desc(channelVideos.publishedAt))
    .limit(limit);
  return rows.map((r) => ({ ...videoOf(r), isNew: Boolean(r.isNew) }));
}

/** This learner has looked at everything there is right now. */
export async function markSeen(actorId: string, at: Date = new Date()): Promise<void> {
  await db.update(channelFollows).set({ seenAt: at }).where(eq(channelFollows.actorId, actorId));
}

export async function videoById(videoId: string): Promise<VideoDetail | null> {
  const [r] = await db
    .select({
      ...VIDEO_COLUMNS,
      transcript: channelVideos.transcript,
      transcriptUrl: channelVideos.transcriptUrl,
      transcriptType: channelVideos.transcriptType,
      questions: channelVideos.questions,
    })
    .from(channelVideos)
    .innerJoin(channels, eq(channels.id, channelVideos.channelId))
    .where(eq(channelVideos.id, videoId))
    .limit(1);
  if (!r) return null;
  const transcript = decodeTranscript(r.transcript);
  return {
    ...videoOf(r),
    transcript,
    transcriptLink: r.transcriptUrl ? { url: r.transcriptUrl, type: r.transcriptType ?? "" } : null,
    questions: transcript ? decodeQuestionSet(r.questions, transcript.lines.length) : null,
  };
}

export async function saveTranscript(videoId: string, transcript: Transcript | null, state: TranscriptState): Promise<void> {
  await db
    .update(channelVideos)
    .set({ transcript: transcript ?? null, transcriptState: state, ...(transcript ? {} : { questions: null }) })
    .where(eq(channelVideos.id, videoId));
}

export async function saveQuestions(videoId: string, questions: QuestionSet): Promise<void> {
  await db.update(channelVideos).set({ questions }).where(eq(channelVideos.id, videoId));
}

/** Sources not read since `olderThan`, never-read first, then the stalest. Optionally only one learner's. */
export async function dueChannels(olderThan: Date, limit: number, actorId?: string): Promise<DueChannel[]> {
  const stale = or(isNull(channels.checkedAt), lt(channels.checkedAt, olderThan));
  const columns = { id: channels.id, kind: channels.kind, name: channels.name, feedUrl: channels.feedUrl, handle: channels.handle };
  const query = actorId
    ? db
        .select(columns)
        .from(channels)
        .innerJoin(channelFollows, and(eq(channelFollows.channelId, channels.id), eq(channelFollows.actorId, actorId)))
        .where(stale)
    : db.select(columns).from(channels).where(stale);
  const rows = await query.orderBy(sql`${channels.checkedAt} asc nulls first`).limit(limit);
  return rows.map((r) => ({ id: r.id, kind: r.kind === "podcast" ? "podcast" : "youtube", name: r.name, feedUrl: r.feedUrl, handle: r.handle }));
}

/** The feed's items, written down; the ids that were not there before come back. */
export async function recordVideos(channelId: string, items: readonly Item[], checkedAt: Date, error: string | null): Promise<string[]> {
  return db.transaction(async (tx) => {
    await tx.update(channels).set({ checkedAt, lastError: error }).where(eq(channels.id, channelId));
    if (items.length === 0) return [];
    const inserted = await tx
      .insert(channelVideos)
      .values(items.map((v) => rowOf(channelId, v)))
      .onConflictDoNothing()
      .returning({ id: channelVideos.id });
    return inserted.map((r) => r.id);
  });
}

export async function followersOf(channelId: string): Promise<Follower[]> {
  const rows = await db
    .select({ actorId: channelFollows.actorId, followedAt: channelFollows.followedAt })
    .from(channelFollows)
    .where(eq(channelFollows.channelId, channelId));
  return rows.map((r) => ({ actorId: r.actorId, followedAt: iso(r.followedAt) }));
}

export async function markNotified(videoIds: readonly string[], at: Date): Promise<void> {
  if (videoIds.length === 0) return;
  await db.update(channelVideos).set({ notifiedAt: at }).where(and(inArray(channelVideos.id, [...videoIds]), isNull(channelVideos.notifiedAt)));
}

/** Items newer than `since`, for the page's "new since you were here" line. */
export async function countNewSince(actorId: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(channelFollows)
    .innerJoin(channelVideos, eq(channelVideos.channelId, channelFollows.channelId))
    .where(and(eq(channelFollows.actorId, actorId), gt(channelVideos.publishedAt, since)));
  return Number(row?.n ?? 0);
}

// ─── Push subscriptions ──────────────────────────────────────────────────

export async function subscribe(actorId: string, sub: { endpoint: string; p256dh: string; auth: string }, locale: string): Promise<void> {
  await db
    .insert(pushSubscriptions)
    .values({ actorId, endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth, locale })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { actorId, p256dh: sub.p256dh, auth: sub.auth, locale, lastSeenAt: new Date() },
    });
}

/** Scoped to the actor, so one person cannot drop another's browser. */
export async function unsubscribe(actorId: string, endpoint: string): Promise<void> {
  await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.actorId, actorId), eq(pushSubscriptions.endpoint, endpoint)));
}

export async function subscriptionCount(actorId: string): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(pushSubscriptions).where(eq(pushSubscriptions.actorId, actorId));
  return Number(row?.n ?? 0);
}

export async function subscriptionsFor(actorIds: readonly string[]): Promise<Subscription[]> {
  if (actorIds.length === 0) return [];
  const rows = await db.select().from(pushSubscriptions).where(inArray(pushSubscriptions.actorId, [...actorIds]));
  return rows.map((r) => ({ endpoint: r.endpoint, p256dh: r.p256dh, auth: r.auth, locale: r.locale, actorId: r.actorId }));
}

export async function dropSubscriptions(endpoints: readonly string[]): Promise<void> {
  if (endpoints.length === 0) return;
  await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.endpoint, [...endpoints]));
}

// ─── Shapes ──────────────────────────────────────────────────────────────

function rowOf(channelId: string, v: Item) {
  return {
    id: v.id,
    channelId,
    title: v.title,
    publishedAt: new Date(v.publishedAt),
    thumbnailUrl: v.thumbnailUrl,
    description: v.description,
    mediaUrl: v.mediaUrl,
    mediaType: v.mediaType,
    durationSeconds: v.durationSeconds,
    transcriptUrl: v.transcript?.url ?? null,
    transcriptType: v.transcript?.type ?? null,
  };
}

function kindOf(value: string): SourceKind {
  return value === "podcast" ? "podcast" : "youtube";
}

function sourceOf(r: { id: string; kind: string; name: string; handle: string | null; url: string; feedUrl: string; imageUrl: string | null }): Source {
  return { id: r.id, kind: kindOf(r.kind), name: r.name, handle: r.handle, url: r.url, feedUrl: r.feedUrl, imageUrl: r.imageUrl };
}

function videoOf(r: {
  id: string;
  kind: string;
  channelId: string;
  channelName: string;
  channelUrl: string;
  channelImageUrl: string | null;
  channelSpoken: string | null;
  title: string;
  publishedAt: Date | string;
  thumbnailUrl: string | null;
  description: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  durationSeconds: number | null;
  transcriptState: string;
}): Video {
  const state = r.transcriptState;
  return {
    id: r.id,
    kind: kindOf(r.kind),
    channelId: r.channelId,
    channelName: r.channelName,
    channelUrl: r.channelUrl,
    channelImageUrl: r.channelImageUrl,
    channelSpoken: isSpoken(r.channelSpoken) ? r.channelSpoken : null,
    title: r.title,
    publishedAt: iso(r.publishedAt),
    thumbnailUrl: r.thumbnailUrl,
    description: r.description,
    mediaUrl: r.mediaUrl,
    mediaType: r.mediaType,
    durationSeconds: r.durationSeconds,
    transcriptState: state === "ready" || state === "none" || state === "blocked" ? state : "unknown",
  };
}
