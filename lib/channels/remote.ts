import { mergeFragments, type Transcript, type TranscriptLine } from "./transcript.ts";
import {
  captionTracksFromPage,
  channelIdFromPage,
  channelUrl,
  feedUrl,
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
 * The network half of `youtube.ts`: the same parsers, with `fetch` in front.
 *
 * `fetch` is a parameter everywhere so a test can hand in a function that
 * returns saved responses and a route can hand in the real one. Every call
 * carries a deadline: a page that waits on YouTube is a page that is down
 * when YouTube is slow, and nothing here is worth more than a few seconds.
 */
export type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

const TIMEOUT_MS = 8_000;

/** What a browser sends, because YouTube answers a bare `fetch` differently. */
const BROWSER_HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "accept-language": "de-CH,de;q=0.9,en;q=0.5",
  // Skips the EU consent interstitial, which otherwise answers instead of the page.
  cookie: "CONSENT=YES+cb.20210328-17-p0.en+FX+417; SOCS=CAI",
};

async function get(fetch: Fetch, url: string, headers: Record<string, string> = {}): Promise<Response | null> {
  try {
    return await fetch(url, { headers, redirect: "follow", signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    return null;
  }
}

export type ResolvedChannel = { id: string; name: string; handle: string | null; url: string };

export type Resolution =
  | { ok: true; channel: ResolvedChannel; feed: Feed }
  | { ok: false; reason: "invalid" | "not-found" | "unreachable" };

/** The channel's feed, which is also how a channel id is confirmed to exist. */
export async function readFeed(channelId: string, fetch: Fetch): Promise<{ ok: true; feed: Feed } | { ok: false; reason: "not-found" | "unreachable" }> {
  const res = await get(fetch, feedUrl(channelId));
  if (!res) return { ok: false, reason: "unreachable" };
  if (res.status === 404) return { ok: false, reason: "not-found" };
  if (!res.ok) return { ok: false, reason: "unreachable" };
  const feed = parseFeed(await res.text());
  return feed ? { ok: true, feed } : { ok: false, reason: "not-found" };
}

/**
 * From whatever the learner pasted to a channel we can read.
 *
 * A handle or an old-style path costs one page fetch to find the id; a video
 * link costs an oEmbed call to find the handle, then the page. The feed is
 * read in every case, so a channel is only ever followed once its feed has
 * answered — the sweep then never meets a channel it cannot read.
 */
export async function resolveChannel(input: string, fetch: Fetch): Promise<Resolution> {
  const ref = parseChannelRef(input);
  if (!ref) return { ok: false, reason: "invalid" };
  return resolveRef(ref, fetch);
}

async function resolveRef(ref: ChannelRef, fetch: Fetch): Promise<Resolution> {
  if (ref.kind === "video") {
    const res = await get(fetch, oembedUrl(ref.videoId));
    if (!res) return { ok: false, reason: "unreachable" };
    if (!res.ok) return { ok: false, reason: "not-found" };
    const info = parseOembed(await res.json().catch(() => null));
    const author = info ? parseChannelRef(info.authorUrl) : null;
    if (!author || author.kind === "video") return { ok: false, reason: "not-found" };
    return resolveRef(author, fetch);
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

  const feed = await readFeed(id, fetch);
  if (!feed.ok) return feed;
  return { ok: true, channel: { id, name: feed.feed.title, handle, url: channelUrl({ id, handle }) }, feed: feed.feed };
}

export type CaptionResult =
  | { state: "ready"; transcript: Transcript }
  /** A real page, and the video has no captions we may use. */
  | { state: "none" }
  /** YouTube refused the server. The learner's browser can still paste one. */
  | { state: "blocked" };

/**
 * The video's captions, in a language the pack accepts, as a transcript.
 *
 * Reads the watch page for the track list, then the track. Each step that
 * fails for a reason of YouTube's is `blocked`, because the page that calls
 * this needs to know whether to offer the paste path or to say "no captions".
 */
export async function fetchCaptions(
  videoId: string,
  fetch: Fetch,
  options: { accepted: readonly string[]; allowAuto: boolean },
): Promise<CaptionResult> {
  const page = await get(fetch, `${watchUrl(videoId)}&hl=en`, BROWSER_HEADERS);
  if (!page) return { state: "blocked" };
  if (!page.ok) return { state: "blocked" };
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
