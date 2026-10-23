import type { Item, SourceFeed, SourceKind } from "./source.ts";

/**
 * Read every channel that is due, write down what is new, and tell the
 * people who asked.
 *
 * PURE OVER ITS DEPENDENCIES. The database, YouTube and the push service are
 * all passed in, so the rules below — who is told about which video, and
 * when a channel counts as due — are tested without any of them. The real
 * wiring is `lib/channels/service.ts`.
 *
 * NO MODEL IS CALLED HERE, and that is a rule rather than an omission: the
 * fleet's standing instruction (2026-09-25) is that no background job spends
 * the shared free AI pool. Feeds are XML and a push is an HTTP call. The
 * questions for a video are written when a learner opens it, on their
 * request, like every other model call in this product.
 */

export type DueChannel = { id: string; kind: SourceKind; name: string; feedUrl: string; handle: string | null };

export type Follower = { actorId: string; followedAt: string };

export type Subscription = { endpoint: string; p256dh: string; auth: string; locale: string; actorId: string };

export type PushPayload = { title: string; body: string; url: string; tag: string };

export type SweepDeps = {
  /** Sources whose feed has not been read for `staleMs`, oldest first. */
  due: (olderThan: Date, limit: number) => Promise<DueChannel[]>;
  readFeed: (channel: DueChannel) => Promise<{ ok: true; feed: SourceFeed } | { ok: false; reason: string }>;
  /** Store the feed's items; answer with the ids that were not there before. */
  record: (channelId: string, items: readonly Item[], checkedAt: Date, error: string | null) => Promise<string[]>;
  followersOf: (channelId: string) => Promise<Follower[]>;
  subscriptionsFor: (actorIds: readonly string[]) => Promise<Subscription[]>;
  send: (subscription: Subscription, payload: PushPayload) => Promise<{ ok: boolean; dead: boolean }>;
  /** Forget browsers whose push service said they are gone. */
  dropSubscriptions: (endpoints: readonly string[]) => Promise<void>;
  markNotified: (videoIds: readonly string[], at: Date) => Promise<void>;
  /** The words of the notification, in the browser's language. */
  payload: (item: Item, channel: DueChannel, locale: string) => PushPayload;
};

export type SweepOptions = {
  now?: Date;
  /** How old a reading may be before the channel is due. */
  staleMs?: number;
  /** How many channels one sweep reads. */
  limit?: number;
  /** A video older than this is recorded but nobody is woken for it. */
  notifyWithinMs?: number;
};

export type SweepReport = { checked: number; failed: number; newVideos: number; notified: number; dropped: number };

/** An hour: the feed updates within minutes of an upload, and nobody needs it faster. */
export const STALE_MS = 60 * 60_000;
/** Three days. Longer, and a channel followed on Monday pings about last week on Thursday. */
export const NOTIFY_WITHIN_MS = 3 * 24 * 60 * 60_000;

/**
 * Who is told about a video: followers who followed BEFORE it was published.
 * Following a channel must not ring for its back catalogue — the person can
 * see those on the page, and a phone that buzzes fifteen times for pressing
 * one button is a phone whose owner turns notifications off.
 */
export function recipients(item: Item, followers: readonly Follower[]): Follower[] {
  const published = Date.parse(item.publishedAt);
  return followers.filter((f) => Date.parse(f.followedAt) <= published);
}

export async function sweep(deps: SweepDeps, options: SweepOptions = {}): Promise<SweepReport> {
  const now = options.now ?? new Date();
  const staleMs = options.staleMs ?? STALE_MS;
  const notifyWithin = options.notifyWithinMs ?? NOTIFY_WITHIN_MS;
  const report: SweepReport = { checked: 0, failed: 0, newVideos: 0, notified: 0, dropped: 0 };

  const channels = await deps.due(new Date(now.getTime() - staleMs), options.limit ?? 50);
  for (const channel of channels) {
    report.checked += 1;
    const read = await deps.readFeed(channel);
    if (!read.ok) {
      report.failed += 1;
      await deps.record(channel.id, [], now, read.reason);
      continue;
    }
    const fresh = await deps.record(channel.id, read.feed.items, now, null);
    report.newVideos += fresh.length;

    const recent = read.feed.items.filter((v) => fresh.includes(v.id) && now.getTime() - Date.parse(v.publishedAt) <= notifyWithin);
    if (recent.length === 0) continue;

    const followers = await deps.followersOf(channel.id);
    const dead = new Set<string>();
    for (const video of recent) {
      const who = recipients(video, followers);
      if (who.length === 0) continue;
      const subscriptions = await deps.subscriptionsFor(who.map((f) => f.actorId));
      for (const sub of subscriptions) {
        if (dead.has(sub.endpoint)) continue;
        const result = await deps.send(sub, deps.payload(video, channel, sub.locale));
        if (result.ok) report.notified += 1;
        else if (result.dead) dead.add(sub.endpoint);
      }
    }
    if (dead.size > 0) {
      await deps.dropSubscriptions([...dead]);
      report.dropped += dead.size;
    }
    // Every fresh video is marked, whether or not anyone was woken for it:
    // "notified" means the sweep has dealt with it, not that a phone rang.
    await deps.markNotified(fresh, now);
  }
  return report;
}
