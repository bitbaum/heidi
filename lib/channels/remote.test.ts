import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fetchPublisherTranscript, readFeed, resolveChannel, type Fetch } from "./remote.ts";

const RSS = readFileSync(new URL("./rss.fixture.xml", import.meta.url), "utf8");
const ATOM = readFileSync(new URL("./feed.fixture.xml", import.meta.url), "utf8");
const FEED_URL = "https://www.srf.ch/feed/podcast/sd/4d5cd1f9-2222-4fba-8671-2e3c6284ba3d.xml";

/** A fake network: a map of URL prefixes to answers. Anything else is a 404. */
function network(routes: Record<string, { status?: number; body: string; type?: string }>): Fetch & { calls: string[] } {
  const calls: string[] = [];
  const fetch = (async (input: string) => {
    calls.push(input);
    const hit = Object.entries(routes).find(([prefix]) => input.startsWith(prefix));
    if (!hit) return new Response("not found", { status: 404 });
    const { status = 200, body, type = "text/html" } = hit[1];
    return new Response(body, { status, headers: { "content-type": type } });
  }) as Fetch & { calls: string[] };
  fetch.calls = calls;
  return fetch;
}

const PAGE = `<html><head><link rel="alternate" type="application/rss+xml" title="Dini Mundart" href="${FEED_URL}"></head><body>…</body></html>`;

describe("what a pasted link resolves to", () => {
  test("a publisher's page → its feed → a podcast with episodes", async () => {
    const fetch = network({ "https://www.srf.ch/audio/dini-mundart": { body: PAGE }, [FEED_URL]: { body: RSS, type: "application/rss+xml" } });
    const r = await resolveChannel("https://www.srf.ch/audio/dini-mundart", fetch);
    assert.ok(r.ok);
    assert.equal(r.feed.source.kind, "podcast");
    assert.equal(r.feed.source.name, "Dini Mundart");
    assert.equal(r.feed.source.feedUrl, FEED_URL);
    assert.equal(r.feed.source.url, "https://www.srf.ch/audio/dini-mundart", "the page a person opens is the show's own link");
    assert.equal(r.feed.items.length, 2);
    assert.ok(r.feed.items[0].mediaUrl?.endsWith("assetId=d1b30d6b-5482-32ce-9356-72e7c4fcf3cb"));
    assert.equal(r.feed.items[0].durationSeconds, 2399);
  });

  test("the feed URL itself", async () => {
    const fetch = network({ [FEED_URL]: { body: RSS, type: "application/rss+xml" } });
    const r = await resolveChannel(FEED_URL, fetch);
    assert.ok(r.ok && r.feed.source.kind === "podcast");
    assert.deepEqual(fetch.calls, [FEED_URL], "one request: the body was a feed, so nothing else was fetched");
  });

  test("an Apple Podcasts link, through the lookup", async () => {
    const fetch = network({
      "https://itunes.apple.com/lookup?id=81345425": { body: JSON.stringify({ results: [{ feedUrl: FEED_URL }] }), type: "application/json" },
      [FEED_URL]: { body: RSS, type: "application/rss+xml" },
    });
    const r = await resolveChannel("https://podcasts.apple.com/ch/podcast/dini-mundart/id81345425", fetch);
    assert.ok(r.ok && r.feed.source.kind === "podcast");
  });

  test("Spotify is named as the one link that cannot be followed", async () => {
    const r = await resolveChannel("https://open.spotify.com/show/1Pj3ym35gjfGPJFEqk1IFp", network({}));
    assert.deepEqual(r, { ok: false, reason: "spotify" });
  });

  test("a page with no feed is not found; a dead host is unreachable; nonsense is invalid", async () => {
    assert.deepEqual(await resolveChannel("https://example.org/show", network({ "https://example.org/show": { body: "<html>no feed</html>" } })), { ok: false, reason: "not-found" });
    const dead = (async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as Fetch;
    assert.deepEqual(await resolveChannel("https://example.org/show", dead), { ok: false, reason: "unreachable" });
    assert.deepEqual(await resolveChannel("just words", network({})), { ok: false, reason: "invalid" });
  });

  test("a YouTube handle still resolves through the channel page and the Atom feed", async () => {
    const fetch = network({
      "https://www.youtube.com/@srfnews": { body: '<link rel="canonical" href="https://www.youtube.com/channel/UCqdXpIZSamBceDmH8uOoTHA">' },
      "https://www.youtube.com/feeds/videos.xml?channel_id=UCqdXpIZSamBceDmH8uOoTHA": { body: ATOM, type: "application/atom+xml" },
    });
    const r = await resolveChannel("youtube.com/@srfnews", fetch);
    assert.ok(r.ok);
    assert.equal(r.feed.source.kind, "youtube");
    assert.equal(r.feed.source.id, "UCqdXpIZSamBceDmH8uOoTHA");
    assert.equal(r.feed.source.handle, "srfnews");
    assert.equal(r.feed.items[0].mediaUrl, null, "a video has no enclosure; the iframe plays it");
  });
});

describe("the sweep's read", () => {
  test("goes by the row's kind", async () => {
    const fetch = network({
      [FEED_URL]: { body: RSS, type: "application/rss+xml" },
      "https://www.youtube.com/feeds/videos.xml?channel_id=UCqdXpIZSamBceDmH8uOoTHA": { body: ATOM },
    });
    const pod = await readFeed({ id: "f0", kind: "podcast", feedUrl: FEED_URL }, fetch);
    assert.ok(pod.ok && pod.feed.items.length === 2);
    const yt = await readFeed({ id: "UCqdXpIZSamBceDmH8uOoTHA", kind: "youtube", feedUrl: "" }, fetch);
    assert.ok(yt.ok && yt.feed.source.kind === "youtube");
    const gone = await readFeed({ id: "f1", kind: "podcast", feedUrl: "https://gone.example/feed.xml" }, fetch);
    assert.deepEqual(gone, { ok: false, reason: "not-found" });
  });
});

describe("a publisher's transcript", () => {
  test("SRT, WebVTT and the podcast JSON are all read; HTML is not", async () => {
    const srt = ["1", "00:00:01,000 --> 00:00:03,000", "Eins.", "", "2", "00:00:04,000 --> 00:00:05,000", "Zwei.", "", "3", "00:00:06,000 --> 00:00:07,000", "Drei."].join("\n");
    const json = JSON.stringify({ segments: [{ startTime: 0, endTime: 1, body: "A." }, { startTime: 1, endTime: 2, body: "B." }, { startTime: 2, endTime: 3, body: "C." }] });
    const fetch = network({
      "https://x/e.srt": { body: srt, type: "application/srt" },
      "https://x/e.json": { body: json, type: "application/json" },
      "https://x/e.html": { body: "<html>a page</html>" },
    });
    const a = await fetchPublisherTranscript({ url: "https://x/e.srt", type: "application/srt" }, fetch);
    assert.equal(a?.source, "publisher");
    assert.equal(a?.lines.length, 3);
    const b = await fetchPublisherTranscript({ url: "https://x/e.json", type: "application/json" }, fetch);
    assert.equal(b?.lines.length, 3);
    assert.equal(await fetchPublisherTranscript({ url: "https://x/e.html", type: "text/html" }, fetch), null);
  });
});
