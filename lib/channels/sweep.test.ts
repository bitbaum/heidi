import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { recipients, sweep, type SweepDeps } from "./sweep.ts";
import type { FeedVideo } from "./youtube.ts";

const NOW = new Date("2026-10-22T12:00:00Z");

const video = (id: string, publishedAt: string): FeedVideo => ({ id, title: `Video ${id}`, publishedAt, thumbnailUrl: null, description: null });

/** A fake world: two channels, one of them already read this hour. */
function world(overrides: Partial<SweepDeps> = {}) {
  const sent: Array<{ endpoint: string; title: string; body: string; url: string }> = [];
  const recorded: Array<{ channelId: string; ids: string[]; error: string | null }> = [];
  const notified: string[] = [];
  const dropped: string[] = [];
  const known = new Set(["old1"]);
  const deps: SweepDeps = {
    due: async () => [
      { id: "UC_a", name: "Channel A" },
      { id: "UC_b", name: "Channel B" },
    ],
    readFeed: async (channelId) =>
      channelId === "UC_b"
        ? { ok: false, reason: "unreachable" }
        : {
            ok: true,
            feed: {
              channelId,
              title: "Channel A",
              videos: [
                video("new1", "2026-10-22T10:00:00Z"),
                video("old1", "2026-10-20T10:00:00Z"),
                video("stale1", "2026-09-01T10:00:00Z"),
                video("early1", "2026-10-21T08:00:00Z"),
              ],
            },
          },
    record: async (channelId, videos, _at, error) => {
      const fresh = videos.map((v) => v.id).filter((id) => !known.has(id));
      for (const id of fresh) known.add(id);
      recorded.push({ channelId, ids: fresh, error });
      return fresh;
    },
    followersOf: async () => [
      // Followed long ago: hears about everything recent.
      { actorId: "alice", followedAt: "2026-10-01T00:00:00Z" },
      // Followed this morning: hears about new1 (10:00) but not early1 (yesterday).
      { actorId: "bob", followedAt: "2026-10-22T09:00:00Z" },
    ],
    subscriptionsFor: async (actorIds) =>
      actorIds.flatMap((actorId) =>
        actorId === "alice"
          ? [
              { endpoint: "alice-phone", p256dh: "k", auth: "a", locale: "de", actorId },
              { endpoint: "alice-dead", p256dh: "k", auth: "a", locale: "fr", actorId },
            ]
          : [{ endpoint: "bob-phone", p256dh: "k", auth: "a", locale: "en", actorId }],
      ),
    send: async (sub, payload) => {
      if (sub.endpoint === "alice-dead") return { ok: false, dead: true };
      sent.push({ endpoint: sub.endpoint, ...payload });
      return { ok: true, dead: false };
    },
    dropSubscriptions: async (endpoints) => {
      dropped.push(...endpoints);
    },
    markNotified: async (ids) => {
      notified.push(...ids);
    },
    payload: (v, channel, locale) => ({ title: `${channel.name} (${locale})`, body: v.title, url: `/${locale}/channels/${v.id}`, tag: channel.id }),
    ...overrides,
  };
  return { deps, sent, recorded, notified, dropped };
}

describe("the sweep", () => {
  test("records what is new, wakes the right people, and forgets a dead browser", async () => {
    const w = world();
    const report = await sweep(w.deps, { now: NOW });

    assert.deepEqual(report, { checked: 2, failed: 1, newVideos: 3, notified: 3, dropped: 1 });
    assert.deepEqual(w.recorded[0], { channelId: "UC_a", ids: ["new1", "stale1", "early1"], error: null });
    assert.deepEqual(w.recorded[1], { channelId: "UC_b", ids: [], error: "unreachable" }, "a failed read is written down, not thrown");

    // new1 (this morning) → alice and bob; early1 (yesterday) → alice only; stale1 (September) → nobody.
    assert.deepEqual(
      w.sent.map((s) => `${s.endpoint}:${s.body}`).sort(),
      ["alice-phone:Video early1", "alice-phone:Video new1", "bob-phone:Video new1"],
    );
    assert.equal(w.sent.find((s) => s.endpoint === "bob-phone")?.title, "Channel A (en)", "in the browser's language");
    assert.deepEqual(w.dropped, ["alice-dead"]);
    assert.deepEqual(w.notified.sort(), ["early1", "new1", "stale1"], "every fresh video is dealt with, rung or not");
  });

  test("a dead browser is tried once per sweep, not once per video", async () => {
    let deadAttempts = 0;
    const w = world({
      send: async (sub) => {
        if (sub.endpoint === "alice-dead") {
          deadAttempts += 1;
          return { ok: false, dead: true };
        }
        return { ok: true, dead: false };
      },
    });
    await sweep(w.deps, { now: NOW });
    assert.equal(deadAttempts, 1);
  });

  test("a feed with nothing new wakes nobody and touches no subscription", async () => {
    let asked = 0;
    const w = world({
      record: async () => [],
      subscriptionsFor: async () => {
        asked += 1;
        return [];
      },
    });
    const report = await sweep(w.deps, { now: NOW });
    assert.equal(report.notified, 0);
    assert.equal(asked, 0);
    assert.deepEqual(w.notified, []);
  });

  test("following a channel does not ring for its back catalogue", () => {
    const followers = [
      { actorId: "early", followedAt: "2026-10-01T00:00:00Z" },
      { actorId: "late", followedAt: "2026-10-22T11:00:00Z" },
    ];
    assert.deepEqual(
      recipients(video("v", "2026-10-22T10:00:00Z"), followers).map((f) => f.actorId),
      ["early"],
    );
    assert.deepEqual(
      recipients(video("v", "2026-10-22T11:00:00Z"), followers).map((f) => f.actorId),
      ["early", "late"],
      "published at the same instant counts",
    );
  });
});
