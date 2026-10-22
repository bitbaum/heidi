import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  captionTracksFromPage,
  channelIdFromPage,
  decodeEntities,
  parseChannelRef,
  parseFeed,
  parseJson3,
  parseOembed,
  parseTimedTextXml,
  pickTrack,
  trackUrl,
} from "./youtube.ts";

const FEED = readFileSync(new URL("./feed.fixture.xml", import.meta.url), "utf8");

describe("what a learner pastes", () => {
  test("every spelling of a channel resolves to one reference", () => {
    assert.deepEqual(parseChannelRef("https://www.youtube.com/@srfnews"), { kind: "handle", handle: "srfnews" });
    assert.deepEqual(parseChannelRef("youtube.com/@srfnews/videos"), { kind: "handle", handle: "srfnews" });
    assert.deepEqual(parseChannelRef("@srfnews"), { kind: "handle", handle: "srfnews" });
    assert.deepEqual(parseChannelRef("srfnews"), { kind: "handle", handle: "srfnews" });
    assert.deepEqual(parseChannelRef("https://www.youtube.com/channel/UCqdXpIZSamBceDmH8uOoTHA"), {
      kind: "id",
      id: "UCqdXpIZSamBceDmH8uOoTHA",
    });
    assert.deepEqual(parseChannelRef("UCqdXpIZSamBceDmH8uOoTHA"), { kind: "id", id: "UCqdXpIZSamBceDmH8uOoTHA" });
    assert.deepEqual(parseChannelRef("https://m.youtube.com/watch?v=aUvUmnzEpyU&t=12"), { kind: "video", videoId: "aUvUmnzEpyU" });
    assert.deepEqual(parseChannelRef("https://youtu.be/aUvUmnzEpyU"), { kind: "video", videoId: "aUvUmnzEpyU" });
    assert.deepEqual(parseChannelRef("https://www.youtube.com/shorts/aUvUmnzEpyU"), { kind: "video", videoId: "aUvUmnzEpyU" });
    assert.deepEqual(parseChannelRef("https://www.youtube.com/user/SRFNews"), { kind: "path", path: "/user/SRFNews" });
  });

  test("anything that is not YouTube is refused rather than fetched", () => {
    assert.equal(parseChannelRef(""), null);
    assert.equal(parseChannelRef("https://example.com/@srfnews"), null);
    assert.equal(parseChannelRef("https://www.youtube.com/"), null);
    assert.equal(parseChannelRef("https://www.youtube.com/watch?v=short"), null);
    assert.equal(parseChannelRef("not a channel at all"), null);
  });
});

describe("the channel feed", () => {
  test("reads the name, the id and every video with its date", () => {
    const feed = parseFeed(FEED);
    assert.ok(feed);
    assert.equal(feed.channelId, "UCqdXpIZSamBceDmH8uOoTHA");
    assert.equal(feed.title, "SRF News & Hintergründe", "entities are decoded");
    assert.equal(feed.videos.length, 2);
    const [first] = feed.videos;
    assert.equal(first.id, "aUvUmnzEpyU");
    assert.equal(first.title, "Epsteins Netz 4/4: Survivor Sister");
    assert.equal(first.publishedAt, "2026-10-21T23:17:04.000Z");
    assert.equal(first.thumbnailUrl, "https://i2.ytimg.com/vi/aUvUmnzEpyU/hqdefault.jpg");
    assert.ok(first.description?.startsWith("Sie nennen sich"));
  });

  test("an HTML error page is not a feed", () => {
    assert.equal(parseFeed("<!doctype html><html><body>Not found</body></html>"), null);
    assert.equal(parseFeed(""), null);
  });
});

describe("the channel page", () => {
  test("the page's own id is read from the canonical link, not the first id in the data", () => {
    const html = [
      '"channelId":"UC0ia0Bh33OgZ8p4emfeGG6g"',
      '<link rel="canonical" href="https://www.youtube.com/channel/UCqdXpIZSamBceDmH8uOoTHA">',
      '"externalId":"UCqdXpIZSamBceDmH8uOoTHA"',
    ].join("\n");
    assert.equal(channelIdFromPage(html), "UCqdXpIZSamBceDmH8uOoTHA");
    assert.equal(channelIdFromPage('"externalId":"UCqdXpIZSamBceDmH8uOoTHA"'), "UCqdXpIZSamBceDmH8uOoTHA");
    assert.equal(channelIdFromPage("<html>nothing</html>"), null);
  });

  test("oEmbed names who posted a video", () => {
    const info = parseOembed({ title: "T", author_name: "SRF News", author_url: "https://www.youtube.com/@srfnews" });
    assert.deepEqual(info, { title: "T", authorName: "SRF News", authorUrl: "https://www.youtube.com/@srfnews" });
    assert.equal(parseOembed({ title: "T" }), null);
  });
});

describe("captions", () => {
  const PAGE = (tracks: string) =>
    `<html><script>var ytInitialPlayerResponse = {"captions":{"playerCaptionsTracklistRenderer":{"captionTracks":${tracks},"audioTracks":[]}}};</script></html>`;

  test("the track list is read out of the watch page", () => {
    const tracks = captionTracksFromPage(
      PAGE(
        '[{"baseUrl":"https://www.youtube.com/api/timedtext?v=x\\u0026lang=de","languageCode":"de","kind":"asr","name":{"runs":[{"text":"Deutsch"}]}},{"baseUrl":"https://www.youtube.com/api/timedtext?v=x\\u0026lang=de-CH","languageCode":"de-CH","name":{"runs":[{"text":"Deutsch (Schweiz)"}]}}]',
      ),
    );
    assert.ok(Array.isArray(tracks));
    assert.equal(tracks.length, 2);
    assert.equal(tracks[0].kind, "asr");
    assert.ok(tracks[0].baseUrl.includes("&lang=de"), "the escaped ampersand is unescaped");
    assert.equal(tracks[1].kind, undefined);
  });

  test("being refused is told apart from a video with no captions", () => {
    assert.equal(captionTracksFromPage('<html><a href="https://www.google.com/sorry/index?continue=…">'), "blocked");
    assert.equal(captionTracksFromPage('{"playabilityStatus":{"status":"LOGIN_REQUIRED"}}'), "blocked");
    assert.equal(captionTracksFromPage("<html><script>var ytInitialPlayerResponse = {\"videoDetails\":{}};</script></html>"), null);
    assert.equal(captionTracksFromPage("<html>a page that is not a watch page</html>"), "blocked");
  });

  test("an uploaded track beats an automatic one, and the pack's order decides between uploaded ones", () => {
    const de = { languageCode: "de", baseUrl: "u1" };
    const deCh = { languageCode: "de-CH", baseUrl: "u2" };
    const auto = { languageCode: "de", baseUrl: "u3", kind: "asr" };
    const en = { languageCode: "en", baseUrl: "u4" };
    const gsw = { languageCode: "gsw", baseUrl: "u5" };
    const accepted = ["gsw-u-sd-chzh", "de-CH", "de"];
    assert.equal(pickTrack([auto, de, en], accepted, true), de);
    assert.equal(pickTrack([auto, deCh, de], accepted, true), deCh, "regions collapse; order of the accepted list wins");
    assert.equal(pickTrack([auto, gsw, de], accepted, true), gsw, "the target variety itself comes first");
    assert.equal(pickTrack([auto, en], accepted, true), auto);
    assert.equal(pickTrack([auto, en], accepted, false), null, "automatic captions are refused when the pack says so");
    assert.equal(pickTrack([en], accepted, true), null, "a gloss language is not a transcript of what was said");
    assert.equal(pickTrack([{ languageCode: "en", baseUrl: "u", kind: "asr" }], accepted, true), null);
  });

  test("the track is asked for as json3", () => {
    assert.equal(trackUrl({ languageCode: "de", baseUrl: "https://www.youtube.com/api/timedtext?v=x&lang=de" }), "https://www.youtube.com/api/timedtext?v=x&lang=de&fmt=json3");
  });

  test("json3 events become lines, appends and empties dropped, fragments joined", () => {
    const lines = parseJson3({
      events: [
        { tStartMs: 0, dDurationMs: 1500, segs: [{ utf8: "Guten Morgen" }] },
        { tStartMs: 1500, dDurationMs: 1200, segs: [{ utf8: "und herzlich willkommen." }] },
        { tStartMs: 1500, aAppend: 1, segs: [{ utf8: "\n" }] },
        { tStartMs: 2800, dDurationMs: 100, segs: [{ utf8: "\n" }] },
        { tStartMs: 9000, dDurationMs: 2000, segs: [{ utf8: "Heute geht es um Saft." }] },
      ],
    });
    assert.deepEqual(lines, [
      { start: 0, end: 2.7, text: "Guten Morgen und herzlich willkommen." },
      { start: 9, end: 11, text: "Heute geht es um Saft." },
    ]);
  });

  test("the older XML shape is read too", () => {
    const lines = parseTimedTextXml('<transcript><text start="0" dur="2">Grüezi &amp;amp; hallo.</text><text start="2.5" dur="1">Wie geht&amp;#39;s?</text></transcript>');
    assert.deepEqual(lines, [
      { start: 0, end: 2, text: "Grüezi & hallo." },
      { start: 2.5, end: 3.5, text: "Wie geht's?" },
    ]);
  });

  test("entities, numeric and named", () => {
    assert.equal(decodeEntities("A &amp; B &#x2014; C &#39;D&#39; &quot;E&quot;"), "A & B — C 'D' \"E\"");
  });
});
