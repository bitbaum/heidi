import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { appleId, feedFromAppleLookup, feedFromPage, hashId, isItemId, isSourceId, looksLikeFeed, parseDuration, parseRss } from "./rss.ts";
import { linesFromWords, parseTranscriptJson } from "./transcript.ts";

const FEED_URL = "https://www.srf.ch/feed/podcast/sd/4d5cd1f9-2222-4fba-8671-2e3c6284ba3d.xml";
const RSS = readFileSync(new URL("./rss.fixture.xml", import.meta.url), "utf8");

describe("a podcast feed", () => {
  test("reads the show, its artwork and every episode with its audio", () => {
    const show = parseRss(RSS, FEED_URL);
    assert.ok(show);
    assert.equal(show.title, "Dini Mundart");
    assert.equal(show.link, "https://www.srf.ch/audio/dini-mundart");
    assert.equal(show.language, "de");
    assert.ok(show.imageUrl?.startsWith("https://download-media.srf.ch/"));
    assert.equal(show.id, hashId("f", FEED_URL));
    assert.equal(show.items.length, 2);
    const [first] = show.items;
    assert.equal(first.title, "«Für mii blibt Mundart syschtemrelevant»");
    assert.equal(first.publishedAt, "2025-12-12T05:00:00.000Z");
    assert.ok(first.mediaUrl.startsWith("https://download-media.srf.ch/world/audio/"));
    assert.ok(first.mediaUrl.includes("&assetId="), "the enclosure URL's entities are decoded");
    assert.equal(first.mediaType, "audio/mpeg");
    assert.equal(first.durationSeconds, 2399);
    assert.equal(first.transcript, null);
    assert.ok(first.description?.startsWith("Zum Abschluss dieses Podcasts"));
    assert.equal(first.id, hashId("e", first.guid));
  });

  test("a page or an Atom feed is not a podcast", () => {
    assert.equal(parseRss("<!doctype html><html></html>", FEED_URL), null);
    assert.equal(parseRss('<feed xmlns="http://www.w3.org/2005/Atom"><title>x</title></feed>', FEED_URL), null);
    assert.equal(looksLikeFeed(RSS), true);
    assert.equal(looksLikeFeed("<!doctype html>"), false);
  });

  test("a publisher's transcript tag and an HTML description are read", () => {
    const xml = `<rss><channel><title>T</title><item><title>E</title><pubDate>Mon, 20 Oct 2025 06:00:00 +0200</pubDate><enclosure url="https://x/e.mp3" type="audio/mpeg"/><itunes:duration>1:02:03</itunes:duration><podcast:transcript url="https://x/e.srt" type="application/srt"/><description><![CDATA[<p>Erster <b>Satz</b>.<br>Zweiter.</p>]]></description></item></channel></rss>`;
    const show = parseRss(xml, "https://x/feed.xml");
    assert.deepEqual(show?.items[0].transcript, { url: "https://x/e.srt", type: "application/srt" });
    assert.equal(show?.items[0].durationSeconds, 3723);
    assert.equal(show?.items[0].description, "Erster Satz. Zweiter.");
  });

  test("durations in every spelling", () => {
    assert.equal(parseDuration("2399"), 2399);
    assert.equal(parseDuration("39:59"), 2399);
    assert.equal(parseDuration("01:02:03"), 3723);
    assert.equal(parseDuration("soon"), null);
    assert.equal(parseDuration(null), null);
  });

  test("ids tell a feed from a YouTube channel by shape", () => {
    assert.ok(isSourceId("UCqdXpIZSamBceDmH8uOoTHA"));
    assert.ok(isSourceId(hashId("f", FEED_URL)));
    assert.ok(!isSourceId("f123"));
    assert.ok(isItemId("aUvUmnzEpyU"));
    assert.ok(isItemId(hashId("e", "guid")));
    assert.ok(!isItemId("../etc"));
  });
});

describe("finding the feed", () => {
  test("the autodiscovery link, SRF's feed path, or nothing", () => {
    assert.equal(
      feedFromPage('<html><head><link rel="alternate" type="application/rss+xml" title="x" href="/feed/podcast/sd/abc.xml"></head></html>', "https://www.srf.ch/audio/x"),
      "https://www.srf.ch/feed/podcast/sd/abc.xml",
    );
    assert.equal(
      feedFromPage('<a href="https://www.srf.ch/feed/podcast/sd/4d5cd1f9.xml">RSS</a>', "https://www.srf.ch/audio/x"),
      "https://www.srf.ch/feed/podcast/sd/4d5cd1f9.xml",
    );
    assert.equal(feedFromPage("<html>no feed here</html>", "https://example.org/show"), null);
  });

  test("Apple's lookup names the feed", () => {
    assert.equal(appleId(new URL("https://podcasts.apple.com/ch/podcast/echo-der-zeit/id81345425")), "81345425");
    assert.equal(appleId(new URL("https://example.com/id123")), null);
    assert.equal(feedFromAppleLookup({ results: [{ feedUrl: "https://www.srf.ch/feed/podcast/sd/x.xml" }] }), "https://www.srf.ch/feed/podcast/sd/x.xml");
    assert.equal(feedFromAppleLookup({ results: [] }), null);
  });
});

describe("a transcript Heidi wrote herself", () => {
  test("timed words become lines at sentence ends and pauses", () => {
    const words = [
      ["Guten", 0, 0.3],
      ["Morgen.", 0.3, 0.8],
      ["Heute", 0.9, 1.2],
      ["Saft.", 1.2, 1.6],
      ["Später", 5, 5.4],
      ["mehr", 5.4, 5.7],
    ].map(([word, start, end]) => ({ word: String(word), start: Number(start), end: Number(end) }));
    assert.deepEqual(linesFromWords(words), [
      { start: 0, end: 0.8, text: "Guten Morgen." },
      { start: 0.9, end: 1.6, text: "Heute Saft." },
      { start: 5, end: 5.7, text: "Später mehr" },
    ]);
  });

  test("the podcast namespace's JSON transcript", () => {
    const lines = parseTranscriptJson({
      segments: [
        { startTime: 0, endTime: 2, body: "Eins." },
        { startTime: 2, endTime: 4, body: "Zwei." },
        { startTime: 4, endTime: 6, body: "Drei." },
      ],
    });
    assert.equal(lines?.length, 3);
    assert.equal(parseTranscriptJson({ segments: [{ startTime: 0, body: "nur eine" }] }), null);
    assert.equal(parseTranscriptJson("x"), null);
  });
});
