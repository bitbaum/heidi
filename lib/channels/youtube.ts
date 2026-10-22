import { cleanText, mergeFragments, MAX_LINES, type TranscriptLine } from "./transcript.ts";

/**
 * Reading YouTube without an API key, as pure functions over what it sends.
 *
 * WHY NO API KEY. The channel feed (`/feeds/videos.xml?channel_id=`) is a
 * public Atom document that needs nothing and has existed since 2015; the
 * page behind an `@handle` names its channel id in three places; the oEmbed
 * endpoint answers for any video. Those three cover everything following a
 * channel needs, and a key would be one more secret to provision for a
 * feature that needs none.
 *
 * CAPTIONS ARE THE EXCEPTION, AND THE PAGE HAS TO KNOW IT. The caption tracks
 * are listed inside the watch page's player response, and YouTube answers a
 * server in a data centre with a "sign in to confirm you are not a bot" page
 * often enough that this has to be a first-class outcome rather than an
 * error: `captionTracksFromPage` returns `"blocked"` for it, and the screen
 * then offers the learner the paste path (`transcript.ts`, `parsePasted`).
 * Checked 2026-10-22 from a cloud sandbox: feed 200, handle page 200, watch
 * page 429 via Google's "sorry" interstitial, every InnerTube client
 * LOGIN_REQUIRED. The box may fare better or worse; the code does not assume.
 *
 * Everything in this file is pure so it can be tested on saved responses.
 * The network is in `remote.ts`.
 */

export type ChannelRef =
  | { kind: "id"; id: string }
  | { kind: "handle"; handle: string }
  /** `/c/Name`, `/user/Name`: an older address that only the page can resolve. */
  | { kind: "path"; path: string }
  /** A video link — its channel is found through oEmbed. */
  | { kind: "video"; videoId: string };

const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const HANDLE = /^@?([A-Za-z0-9._-]{3,30})$/;

export function isChannelId(value: string): boolean {
  return CHANNEL_ID.test(value);
}

export function isVideoId(value: string): boolean {
  return VIDEO_ID.test(value);
}

/**
 * What the learner typed or pasted, read generously.
 *
 * A channel link, a handle with or without the `@`, a bare channel id, a
 * video link (the channel is whoever posted it), or `youtu.be/…`. Anything
 * else is null, and the form says "that is not a YouTube channel" rather than
 * sending an arbitrary string to YouTube.
 */
export function parseChannelRef(input: string): ChannelRef | null {
  const raw = input.trim();
  if (!raw) return null;
  if (CHANNEL_ID.test(raw)) return { kind: "id", id: raw };
  if (raw.startsWith("@")) {
    const m = raw.match(HANDLE);
    return m ? { kind: "handle", handle: m[1] } : null;
  }

  // A bare word with no dot and no slash is a handle typed without the @.
  if (!/[./]/.test(raw)) {
    const m = raw.match(HANDLE);
    return m ? { kind: "handle", handle: m[1] } : null;
  }

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www|m|music)\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return VIDEO_ID.test(id) ? { kind: "video", videoId: id } : null;
  }
  if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  if (parts[0] === "watch") {
    const v = url.searchParams.get("v") ?? "";
    return VIDEO_ID.test(v) ? { kind: "video", videoId: v } : null;
  }
  if ((parts[0] === "shorts" || parts[0] === "live" || parts[0] === "embed") && parts[1]) {
    return VIDEO_ID.test(parts[1]) ? { kind: "video", videoId: parts[1] } : null;
  }
  if (parts[0] === "channel" && parts[1]) {
    return CHANNEL_ID.test(parts[1]) ? { kind: "id", id: parts[1] } : null;
  }
  if (parts[0] === "feeds") {
    const id = url.searchParams.get("channel_id") ?? "";
    return CHANNEL_ID.test(id) ? { kind: "id", id } : null;
  }
  if (parts[0].startsWith("@")) {
    const m = parts[0].match(HANDLE);
    return m ? { kind: "handle", handle: m[1] } : null;
  }
  if ((parts[0] === "c" || parts[0] === "user") && parts[1]) {
    return { kind: "path", path: `/${parts[0]}/${parts[1]}` };
  }
  return null;
}

export function feedUrl(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
}

export function channelUrl(channel: { id: string; handle?: string | null }): string {
  return channel.handle ? `https://www.youtube.com/@${channel.handle}` : `https://www.youtube.com/channel/${channel.id}`;
}

export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function oembedUrl(videoId: string): string {
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl(videoId))}&format=json`;
}

export function thumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'" };

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === "#") {
      const n = code[1] === "x" || code[1] === "X" ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
    }
    return ENTITIES[code.toLowerCase()] ?? whole;
  });
}

function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return m ? decodeEntities(m[1].trim()) : null;
}

export type FeedVideo = {
  id: string;
  title: string;
  /** ISO 8601. */
  publishedAt: string;
  thumbnailUrl: string | null;
  /** The first few hundred characters of the description. */
  description: string | null;
};

export type Feed = { channelId: string; title: string; videos: FeedVideo[] };

/** The description, cut to what a row needs. */
const DESCRIPTION_CHARS = 400;

/**
 * The channel's Atom feed: its name and its newest fifteen videos.
 *
 * A regex walk rather than an XML parser, because the document is one of
 * YouTube's own and has had the same seven elements per entry for a decade,
 * and because the server bundle should not grow a DOM to read fifteen rows.
 * Null when the document is not this feed at all — the 404 body for an unknown
 * channel is HTML.
 */
export function parseFeed(xml: string): Feed | null {
  if (!xml.includes("<feed") || !xml.includes("yt:channelId")) return null;
  const [head, ...entries] = xml.split("<entry>");
  const title = tag(head, "title");
  let channelId = tag(head, "yt:channelId") ?? "";
  // The feed's own header omits the `UC` prefix; every entry carries it.
  if (!CHANNEL_ID.test(channelId)) {
    const fromEntry = entries.length > 0 ? tag(entries[0], "yt:channelId") : null;
    const fromLink = head.match(/channel_id=(UC[A-Za-z0-9_-]{22})/)?.[1];
    channelId = fromEntry && CHANNEL_ID.test(fromEntry) ? fromEntry : fromLink ?? (CHANNEL_ID.test(`UC${channelId}`) ? `UC${channelId}` : "");
  }
  if (!title || !CHANNEL_ID.test(channelId)) return null;

  const videos: FeedVideo[] = [];
  for (const entry of entries) {
    const id = tag(entry, "yt:videoId");
    const name = tag(entry, "title");
    const published = tag(entry, "published");
    if (!id || !VIDEO_ID.test(id) || !name || !published || Number.isNaN(Date.parse(published))) continue;
    const thumb = entry.match(/<media:thumbnail[^>]*\surl="([^"]+)"/)?.[1] ?? null;
    const description = tag(entry, "media:description");
    videos.push({
      id,
      title: name,
      publishedAt: new Date(published).toISOString(),
      thumbnailUrl: thumb,
      description: description ? description.slice(0, DESCRIPTION_CHARS) : null,
    });
  }
  return { channelId, title, videos };
}

/**
 * The channel id a handle's page names. Three places, any of which may be
 * absent on a given day: the canonical link, the schema.org identifier, and
 * the page's own data. The FIRST `channelId` string in the data is not used:
 * a channel page lists dozens of them (featured channels, recommendations),
 * and the first one is not reliably the page's own.
 */
export function channelIdFromPage(html: string): string | null {
  const canonical = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[A-Za-z0-9_-]{22})"/)?.[1];
  if (canonical) return canonical;
  const identifier = html.match(/<meta itemprop="identifier" content="(UC[A-Za-z0-9_-]{22})"/)?.[1];
  if (identifier) return identifier;
  const external = html.match(/"externalId":"(UC[A-Za-z0-9_-]{22})"/)?.[1];
  return external ?? null;
}

export type CaptionTrack = {
  languageCode: string;
  /** `asr` for automatic captions; absent for uploaded ones. */
  kind?: string;
  baseUrl: string;
};

/**
 * The caption tracks a watch page lists, or why it does not.
 *
 * `"blocked"` is Google's interstitial or a player response that demands a
 * sign-in — the server was refused, and the learner's own browser would not
 * be. `null` is a real page with no captions. Either is a normal answer.
 */
export function captionTracksFromPage(html: string): CaptionTrack[] | "blocked" | null {
  if (html.includes("google.com/sorry/") || /"status":"LOGIN_REQUIRED"/.test(html)) return "blocked";
  if (/consent\.youtube\.com/.test(html) && !html.includes("ytInitialPlayerResponse")) return "blocked";
  const m = html.match(/"captionTracks":(\[[\s\S]*?\])(?=,"(?:audioTracks|translationLanguages|defaultAudioTrackIndex)")/);
  if (!m) return html.includes("ytInitialPlayerResponse") ? null : "blocked";
  let parsed: unknown;
  try {
    parsed = JSON.parse(m[1]);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  const tracks: CaptionTrack[] = [];
  for (const t of parsed) {
    if (typeof t !== "object" || t === null) continue;
    const v = t as Record<string, unknown>;
    if (typeof v.baseUrl !== "string" || typeof v.languageCode !== "string") continue;
    tracks.push({
      languageCode: v.languageCode,
      baseUrl: v.baseUrl.replace(/\\u0026/g, "&"),
      ...(typeof v.kind === "string" ? { kind: v.kind } : {}),
    });
  }
  return tracks;
}

/** The language a track is in, without region: `de-CH` → `de`. */
function base(tag: string): string {
  return tag.toLowerCase().split(/[-_]/)[0];
}

/**
 * Which track to read, given the languages the pack accepts in order.
 *
 * Uploaded captions in the first accepted language beat uploaded captions in
 * the second, and ANY uploaded track beats an automatic one — the recogniser
 * is wrong often enough on this material that a publisher's text in the
 * second-choice language is the better transcript. Automatic tracks count
 * only when the caller allows them, and never in a language the pack does
 * not accept: a track auto-translated into the bridge is a translation of a
 * guess.
 */
export function pickTrack(tracks: readonly CaptionTrack[], accepted: readonly string[], allowAuto: boolean): CaptionTrack | null {
  const wanted = accepted.map(base);
  const rank = (t: CaptionTrack) => {
    const i = wanted.indexOf(base(t.languageCode));
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };
  const inLanguage = tracks.filter((t) => Number.isFinite(rank(t)));
  const uploaded = inLanguage.filter((t) => t.kind !== "asr").sort((a, b) => rank(a) - rank(b));
  if (uploaded.length > 0) return uploaded[0];
  if (!allowAuto) return null;
  const auto = inLanguage.filter((t) => t.kind === "asr").sort((a, b) => rank(a) - rank(b));
  return auto[0] ?? null;
}

/** The track's URL asking for the JSON shape. */
export function trackUrl(track: CaptionTrack): string {
  const url = new URL(track.baseUrl);
  url.searchParams.set("fmt", "json3");
  return url.toString();
}

/**
 * The `json3` caption document: events with a start, a duration and segments.
 * Automatic tracks interleave word-timing events (`aAppend`) that repeat the
 * text; only events that carry their own segments and are not appends count.
 */
export function parseJson3(json: unknown): TranscriptLine[] {
  if (typeof json !== "object" || json === null) return [];
  const events = (json as { events?: unknown }).events;
  if (!Array.isArray(events)) return [];
  const raw: TranscriptLine[] = [];
  for (const e of events) {
    if (typeof e !== "object" || e === null) continue;
    const v = e as Record<string, unknown>;
    if (v.aAppend === 1 || !Array.isArray(v.segs) || typeof v.tStartMs !== "number") continue;
    const text = cleanText(
      v.segs
        .map((s) => (typeof s === "object" && s !== null && typeof (s as { utf8?: unknown }).utf8 === "string" ? (s as { utf8: string }).utf8 : ""))
        .join(""),
    );
    if (!text) continue;
    const start = v.tStartMs / 1000;
    const dur = typeof v.dDurationMs === "number" ? v.dDurationMs / 1000 : 0;
    raw.push({ start, end: start + dur, text });
  }
  return mergeFragments(raw).slice(0, MAX_LINES);
}

/** The older XML shape, should a track URL ignore `fmt`. */
export function parseTimedTextXml(xml: string): TranscriptLine[] {
  const raw: TranscriptLine[] = [];
  const re = /<text start="([\d.]+)"(?: dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const start = Number(m[1]);
    const dur = m[2] ? Number(m[2]) : 0;
    const text = cleanText(decodeEntities(decodeEntities(m[3])));
    if (!Number.isFinite(start) || !text) continue;
    raw.push({ start, end: start + (Number.isFinite(dur) ? dur : 0), text });
  }
  return mergeFragments(raw).slice(0, MAX_LINES);
}

export type Oembed = { title: string; authorName: string; authorUrl: string };

/** oEmbed's answer for a video: who posted it, as a handle link. */
export function parseOembed(json: unknown): Oembed | null {
  if (typeof json !== "object" || json === null) return null;
  const v = json as Record<string, unknown>;
  if (typeof v.title !== "string" || typeof v.author_name !== "string" || typeof v.author_url !== "string") return null;
  return { title: v.title, authorName: v.author_name, authorUrl: v.author_url };
}
