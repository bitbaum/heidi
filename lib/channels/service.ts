import { getDictionary } from "../i18n/index.ts";
import { DEFAULT_LOCALE, isLocale } from "../i18n/locales.ts";
import { fill } from "../i18n/fill.ts";
import { href } from "../i18n/routes.ts";
import { sendPush } from "../push/send.ts";
import { readFeed } from "./remote.ts";
import { sweep, type DueChannel, type PushPayload, type SweepOptions, type SweepReport } from "./sweep.ts";
import * as store from "./store.ts";
import type { Item } from "./source.ts";

/**
 * The sweep, wired to the real database, the real YouTube and the real push
 * service. `sweep.ts` holds the rules; this file only says which concrete
 * thing each dependency is.
 *
 * Two callers, one function: the hourly timer on the box
 * (`/api/cron/channels`) sweeps everything that is due; a learner opening
 * their channels page sweeps THEIR stale channels inline, so the page is
 * right even on a box where nobody has installed the timer yet.
 */

/** The notification's words, in the browser's own language. */
export function notificationFor(video: Item, channel: DueChannel, rawLocale: string): PushPayload {
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = getDictionary(locale).channels.push;
  return {
    title: fill(t.title, { channel: channel.name }),
    body: video.title,
    url: href(locale, `channels/${video.id}`),
    // One tag per channel: a second upload replaces the first notification
    // on the lock screen instead of stacking under it.
    tag: `heidi-channel-${channel.id}`,
  };
}

export function sweepAll(options: SweepOptions = {}): Promise<SweepReport> {
  return sweep(deps(), options);
}

/** Only this learner's channels, with a short list, for an inline refresh. */
export function sweepFor(actorId: string, options: SweepOptions = {}): Promise<SweepReport> {
  return sweep({ ...deps(), due: (olderThan, limit) => store.dueChannels(olderThan, limit, actorId) }, { limit: 8, ...options });
}

function deps() {
  return {
    due: (olderThan: Date, limit: number) => store.dueChannels(olderThan, limit),
    readFeed: (channel: DueChannel) => readFeed(channel, fetch),
    record: store.recordVideos,
    followersOf: store.followersOf,
    subscriptionsFor: store.subscriptionsFor,
    send: sendPush,
    dropSubscriptions: store.dropSubscriptions,
    markNotified: store.markNotified,
    payload: notificationFor,
  };
}
