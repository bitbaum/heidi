import { transcribe } from "@bitbaum/ai-kit";
import { speechChain, speechConfigured } from "../domain/model/speech.ts";
import { linesFromWords, mergeFragments, parsePasted, parseTranscriptJson, type Transcript, type TranscriptLine } from "./transcript.ts";
import { appleId, appleLookupUrl, feedFromAppleLookup, feedFromPage, isSpotify, looksLikeFeed, parseRss, type Podcast } from "./rss.ts";
import type { Item, Source, SourceFeed } from "./source.ts";
import {
  captionTracksFromPage,
  channelIdFromPage,
  channelUrl,
  feedUrl as youtubeFeedUrl,
  oembedUrl,
  parseChannelRef,
  parseFeed,
  parseJson3,
  parseOembed,
  parseTimedTextXml,
  pickTrack,
  trackUrl,
  watchUrl,
  type ChannelRef,
  type Feed,
} from "./youtube.ts";

/**
 * The network half of `youtube.ts` and `rss.ts`: the same parsers, with
 * `fetch` in front, projected onto `source.ts`.
 *
 * `fetch` is a parameter everywhere so a test can hand in a function that
 * returns saved responses and a route can hand in the real one. Every call
 * carries a deadline: a page that waits on a publisher is a page that is
 * down when the publisher is slow, and nothing here is worth more than a
 * few seconds.
 */
export type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

const TIMEOUT_MS = 8_000;

/** What a browser sends, because YouTube answers a bare `fetch` differently. */
const BROWSER_HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  // English, whatever the product teaches: the header only decides which
  // interstitial YouTube serves, and the caption track is chosen by code.
  "accept-language": "en-US,en;q=0.9",
  // Skips the EU consent interstitial, which otherwise answers instead of the page.
  cookie: "CONSENT=YES+cb.20210328-17-p0.en+FX+417; SOCS=CAI",
};

async function get(fetch: Fetch, url: string, headers: Record<string, string> = {}, timeoutMs = TIMEOUT_MS): Promise<Response | null> {
  try {
    return await fetch(url, { headers, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    return null;
  }
}

export type Resolution =
  | { ok: true; feed: SourceFeed }
  | { ok: false; reason: "invalid" | "not-found" | "unreachable" | "spotify" };

type FeedRead = { ok: true; feed: SourceFeed } | { ok: false; reason: "not-found" | "unreachable" };

// ─── Projections ─────────────────────────────────────────────────────────

function fromYouTube(feed: Feed, handle: string | null): SourceFeed {
  const id = feed.channelId;
  return {
    source: { id, kind: "youtube", name: feed.title, handle, url: channelUrl({ id, handle }), feedUrl: youtubeFeedUrl(id), imageUrl: null },
    items: feed.videos.map((v) => ({
      id: v.id,
      title: v.title,
      publishedAt: v.publishedAt,
      thumbnailUrl: v.thumbnailUrl,
      description: v.description,
      mediaUrl: null,
      mediaType: null,
      durationSeconds: null,
      transcript: null,
    })),
  };
}

function fromPodcast(show: Podcast): SourceFeed {
  return {
    source: { id: show.id, kind: "podcast", name: show.title, handle: null, url: show.link ?? show.feedUrl, feedUrl: show.feedUrl, imageUrl: show.imageUrl },
    items: show.items.map((e) => ({
      id: e.id,
      title: e.title,
      publishedAt: e.publishedAt,
      thumbnailUrl: e.imageUrl,
      description: e.description,
      mediaUrl: e.mediaUrl,
      mediaType: e.mediaType,
      durationSeconds: e.durationSeconds,
      transcript: e.transcript,
    })),
  };
}

// ─── Feeds ───────────────────────────────────────────────────────────────

/** A YouTube channel's feed, which is also how a channel id is confirmed to exist. */
async function readYouTube(channelId: string, handle: string | null, fetch: Fetch): Promise<FeedRead> {
  const res = await get(fetch, youtubeFeedUrl(channelId));
  if (!res) return { ok: false, reason: "unreachable" };
  if (res.status === 404) return { ok: false, reason: "not-found" };
  if (!res.ok) return { ok: false, reason: "unreachable" };
  const feed = parseFeed(await res.text());
  return feed ? { ok: true, feed: fromYouTube(feed, handle) } : { ok: false, reason: "not-found" };
}

async function readPodcast(feedUrl: string, fetch: Fetch): Promise<FeedRead> {
  const res = await get(fetch, feedUrl, BROWSER_HEADERS);
  if (!res) return { ok: false, reason: "unreachable" };
  if (res.status === 404 || res.status === 410) return { ok: false, reason: "not-found" };
  if (!res.ok) return { ok: false, reason: "unreachable" };
  const show = parseRss(await res.text(), feedUrl);
  return show ? { ok: true, feed: fromPodcast(show) } : { ok: false, reason: "not-found" };
}

/** The sweep's read: by what the row says it is. */
export function readFeed(channel: { id: string; kind: string; feedUrl: string; handle?: string | null }, fetch: Fetch): Promise<FeedRead> {
  return channel.kind === "podcast" ? readPodcast(channel.feedUrl, fetch) : readYouTube(channel.id, channel.handle ?? null, fetch);
}

// ─── Resolving what a learner pasted ──────────────────────────────────────

/**
 * From whatever the learner pasted to a feed we can read.
 *
 * YouTube first, by shape. Anything else is a URL: a feed itself, an Apple
 * Podcasts link (the lookup API names the feed), or a publisher's page that
 * links its RSS. The feed is read in every case, so a source is only ever
 * followed once its feed has answered — the sweep then never meets one it
 * cannot read.
 */
export async function resolveChannel(input: string, fetch: Fetch): Promise<Resolution> {
  const ref = parseChannelRef(input);
  if (ref) return resolveYouTube(ref, fetch);

  let url: URL;
  try {
    url = new URL(input.includes("://") ? input : `https://${input}`);
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { ok: false, reason: "invalid" };
  if (!url.hostname.includes(".")) return { ok: false, reason: "invalid" };
  if (isSpotify(url)) return { ok: false, reason: "spotify" };

  const apple = appleId(url);
  if (apple) {
    const res = await get(fetch, appleLookupUrl(apple));
    if (!res) return { ok: false, reason: "unreachable" };
    const feed = res.ok ? feedFromAppleLookup(await res.json().catch(() => null)) : null;
    if (!feed) return { ok: false, reason: "not-found" };
    return readPodcast(feed, fetch);
  }

  const res = await get(fetch, url.toString(), BROWSER_HEADERS);
  if (!res) return { ok: false, reason: "unreachable" };
  if (res.status === 404 || res.status === 410) return { ok: false, reason: "not-found" };
  if (!res.ok) return { ok: false, reason: "unreachable" };
  const body = await res.text();
  if (looksLikeFeed(body)) {
    const show = parseRss(body, url.toString());
    return show ? { ok: true, feed: fromPodcast(show) } : { ok: false, reason: "not-found" };
  }
  const feed = feedFromPage(body, url.toString());
  if (!feed) return { ok: false, reason: "not-found" };
  return readPodcast(feed, fetch);
}

async function resolveYouTube(ref: ChannelRef, fetch: Fetch): Promise<Resolution> {
  if (ref.kind === "video") {
    const res = await get(fetch, oembedUrl(ref.videoId));
    if (!res) return { ok: false, reason: "unreachable" };
    if (!res.ok) return { ok: false, reason: "not-found" };
    const info = parseOembed(await res.json().catch(() => null));
    const author = info ? parseChannelRef(info.authorUrl) : null;
    if (!author || author.kind === "video") return { ok: false, reason: "not-found" };
    return resolveYouTube(author, fetch);
  }

  let id: string;
  let handle: string | null = null;
  if (ref.kind === "id") {
    id = ref.id;
  } else {
    const path = ref.kind === "handle" ? `/@${ref.handle}` : ref.path;
    const res = await get(fetch, `https://www.youtube.com${path}`, BROWSER_HEADERS);
    if (!res) return { ok: false, reason: "unreachable" };
    if (res.status === 404) return { ok: false, reason: "not-found" };
    if (!res.ok) return { ok: false, reason: "unreachable" };
    const found = channelIdFromPage(await res.text());
    if (!found) return { ok: false, reason: "not-found" };
    id = found;
    if (ref.kind === "handle") handle = ref.handle;
  }
  return readYouTube(id, handle, fetch);
}

// ─── Transcripts ─────────────────────────────────────────────────────────

export type CaptionResult =
  | { state: "ready"; transcript: Transcript }
  /** A real page, and the video has no captions we may use. */
  | { state: "none" }
  /** YouTube refused the server. The learner's browser can still paste one. */
  | { state: "blocked" };

/**
 * A YouTube video's captions, in a language the pack accepts, as a transcript.
 *
 * Reads the watch page for the track list, then the track. Each step that
 * fails for a reason of YouTube's is `blocked`, because the page that calls
 * this needs to know whether to offer the paste path or to say "no captions".
 */
export async function fetchCaptions(videoId: string, fetch: Fetch, options: { accepted: readonly string[]; allowAuto: boolean }): Promise<CaptionResult> {
  const page = await get(fetch, `${watchUrl(videoId)}&hl=en`, BROWSER_HEADERS);
  if (!page || !page.ok) return { state: "blocked" };
  const tracks = captionTracksFromPage(await page.text());
  if (tracks === "blocked") return { state: "blocked" };
  if (!tracks) return { state: "none" };

  const track = pickTrack(tracks, options.accepted, options.allowAuto);
  if (!track) return { state: "none" };

  const res = await get(fetch, trackUrl(track), BROWSER_HEADERS);
  if (!res || !res.ok) return { state: "blocked" };
  const body = await res.text();
  let lines: TranscriptLine[];
  if (body.trimStart().startsWith("{")) {
    try {
      lines = parseJson3(JSON.parse(body));
    } catch {
      lines = [];
    }
  } else {
    lines = parseTimedTextXml(body);
  }
  if (lines.length < 3) return { state: "blocked" };
  return {
    state: "ready",
    transcript: { lines: mergeFragments(lines), source: track.kind === "asr" ? "auto" : "publisher", lang: track.languageCode },
  };
}

/** A transcript the publisher linked from the feed: SRT, WebVTT or the podcast JSON. */
export async function fetchPublisherTranscript(link: { url: string; type: string }, fetch: Fetch): Promise<Transcript | null> {
  const res = await get(fetch, link.url, BROWSER_HEADERS);
  if (!res || !res.ok) return null;
  const body = await res.text();
  const type = `${link.type} ${res.headers.get("content-type") ?? ""}`.toLowerCase();
  let lines: TranscriptLine[] | null = null;
  if (type.includes("json") || body.trimStart().startsWith("{")) {
    try {
      lines = parseTranscriptJson(JSON.parse(body));
    } catch {
      lines = null;
    }
  } else if (type.includes("srt") || type.includes("vtt") || type.includes("subrip") || /^\s*(WEBVTT|1\s*\n)/.test(body)) {
    lines = parsePasted(body);
  }
  return lines ? { lines, source: "publisher", lang: "" } : null;
}

/** How much of an episode's audio Heidi listens to: enough for an opening, under every vendor's upload limit. */
export const OPENING_BYTES = 6 * 1024 * 1024;

export type OpeningResult = { state: "ready"; transcript: Transcript } | { state: "none" } | { state: "unconfigured" };

/**
 * Heidi's own transcription of a podcast's opening minutes, with the bridge
 * recogniser the speaking surface already uses (`lib/domain/model/speech`).
 *
 * The first `OPENING_BYTES` of the enclosure, by a Range request — an MP3 is
 * a stream of frames and plays from any cut — sent once, kept for everyone
 * who follows the show, and labelled as automatic with how far it reaches.
 * The caller decides whether this is allowed at all (the pack's capability,
 * and never for a source the register says is dialect: the recogniser
 * translates dialect away, which is §8's whole objection).
 */
export async function transcribeOpening(mediaUrl: string, fetch: Fetch, options: { language: string; signal?: AbortSignal }): Promise<OpeningResult> {
  if (!speechConfigured()) return { state: "unconfigured" };
  const res = await get(fetch, mediaUrl, { range: `bytes=0-${OPENING_BYTES - 1}`, "user-agent": BROWSER_HEADERS["user-agent"] }, 25_000);
  if (!res || !res.ok) return { state: "none" };
  const bytes = await res.arrayBuffer().catch(() => null);
  if (!bytes || bytes.byteLength < 16 * 1024) return { state: "none" };
  // A server that ignored the Range answers the whole file; keep the opening.
  const cut = bytes.byteLength > OPENING_BYTES ? bytes.slice(0, OPENING_BYTES) : bytes;
  const type = res.headers.get("content-type")?.split(";")[0] || "audio/mpeg";

  const result = await transcribe({
    chain: speechChain(),
    audio: new Blob([cut], { type }),
    filename: type.includes("mp4") || type.includes("m4a") ? "opening.m4a" : "opening.mp3",
    language: options.language,
    words: true,
    timeoutMs: 60_000,
    signal: options.signal,
  });
  const lines = result.words && result.words.length > 0 ? linesFromWords(result.words) : [];
  if (lines.length < 3) return { state: "none" };
  const coverageSeconds = Math.round(lines[lines.length - 1].end);
  return { state: "ready", transcript: { lines, source: "auto", lang: options.language, coverageSeconds } };
}

export type { Item, Source, SourceFeed };
