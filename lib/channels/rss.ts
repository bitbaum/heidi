import { createHash } from "node:crypto";
import { decodeEntities } from "./youtube.ts";

/**
 * A podcast is a feed too — RSS 2.0 with an audio enclosure per item — and
 * the register's podcasts are what most learners already listen to. So the
 * same follow loop reads them: the channel row is the feed, the "video" row
 * is the episode, and the player is an `<audio>` element rather than an
 * iframe. Nothing about a question or a transcript line knows which.
 *
 * NO API KEY, AGAIN. SRF's podcast pages, like most publishers', link their
 * RSS in a `<link rel="alternate" type="application/rss+xml">`; Apple's
 * lookup API returns a show's feed URL for a `podcasts.apple.com` link
 * without any credential. Spotify publishes no feed and cannot be followed
 * from its link — the page says so and asks for the publisher's page instead.
 *
 * IDS. A podcast has no platform id, so one is derived from the feed URL and
 * an episode's from its GUID: `f` or `e` plus 24 hex characters of SHA-1.
 * Stable across sweeps, URL-safe, and distinguishable from YouTube's ids by
 * shape alone (`isSourceId`, `isItemId`).
 */

export type PodcastItem = {
  id: string;
  guid: string;
  title: string;
  /** ISO 8601. */
  publishedAt: string;
  mediaUrl: string;
  mediaType: string | null;
  durationSeconds: number | null;
  imageUrl: string | null;
  description: string | null;
  /** `<podcast:transcript url type>` where the publisher provides one. */
  transcript: { url: string; type: string } | null;
};

export type Podcast = {
  id: string;
  feedUrl: string;
  title: string;
  /** The publisher's page for the show. */
  link: string | null;
  language: string | null;
  imageUrl: string | null;
  items: PodcastItem[];
};

const DESCRIPTION_CHARS = 400;

export function hashId(prefix: "f" | "e", value: string): string {
  return prefix + createHash("sha1").update(value).digest("hex").slice(0, 24);
}

/** A channel id of either kind: YouTube's `UC…` or a feed's `f…`. */
export function isSourceId(value: string): boolean {
  return /^UC[A-Za-z0-9_-]{22}$/.test(value) || /^f[0-9a-f]{24}$/.test(value);
}

/** An item id of either kind: a YouTube video id or an episode's `e…`. */
export function isItemId(value: string): boolean {
  return /^[A-Za-z0-9_-]{11}$/.test(value) || /^e[0-9a-f]{24}$/.test(value);
}

function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return null;
  const inner = m[1].trim();
  const cdata = inner.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return decodeEntities((cdata ? cdata[1] : inner).trim());
}

function attr(xml: string, element: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${element}\\b[^>]*\\s${name}="([^"]*)"`, "i"));
  return m ? decodeEntities(m[1]) : null;
}

/** `itunes:duration`: seconds, `MM:SS` or `HH:MM:SS`. */
export function parseDuration(value: string | null): number | null {
  if (!value) return null;
  const v = value.trim();
  if (/^\d+$/.test(v)) return Number(v);
  const parts = v.split(":").map(Number);
  if (parts.some((p) => !Number.isFinite(p))) return null;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

/** Tags stripped from a description that arrived as HTML. */
function plain(html: string): string {
  return decodeEntities(
    html
      .replace(/<\/?(?:br|p|div|li|h\d)\b[^>]*>/gi, " ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

/** The RSS document as a podcast, or null when it is not one. */
export function parseRss(xml: string, feedUrl: string): Podcast | null {
  if (!/<rss[\s>]/i.test(xml) || !/<channel[\s>]/i.test(xml)) return null;
  const [head, ...rawItems] = xml.split(/<item[\s>]/i);
  const title = tag(head, "title");
  if (!title) return null;
  const image = attr(head, "itunes:image", "href") ?? tag(head.match(/<image>[\s\S]*?<\/image>/i)?.[0] ?? "", "url");

  const items: PodcastItem[] = [];
  for (const raw of rawItems) {
    const body = raw.split(/<\/item>/i)[0];
    const mediaUrl = attr(body, "enclosure", "url");
    const name = tag(body, "title");
    const published = tag(body, "pubDate") ?? tag(body, "dc:date");
    if (!mediaUrl || !name || !published || Number.isNaN(Date.parse(published))) continue;
    const guid = tag(body, "guid") ?? mediaUrl;
    const transcriptUrl = attr(body, "podcast:transcript", "url");
    const transcriptType = attr(body, "podcast:transcript", "type");
    const description = tag(body, "itunes:summary") ?? tag(body, "description") ?? tag(body, "itunes:subtitle");
    items.push({
      id: hashId("e", guid),
      guid,
      title: name,
      publishedAt: new Date(published).toISOString(),
      mediaUrl,
      mediaType: attr(body, "enclosure", "type"),
      durationSeconds: parseDuration(tag(body, "itunes:duration")),
      imageUrl: attr(body, "itunes:image", "href"),
      description: description ? plain(description).slice(0, DESCRIPTION_CHARS) : null,
      transcript: transcriptUrl ? { url: transcriptUrl, type: transcriptType ?? "" } : null,
    });
  }
  return {
    id: hashId("f", feedUrl),
    feedUrl,
    title,
    link: tag(head, "link"),
    language: tag(head, "language"),
    imageUrl: image,
    items,
  };
}

/** Does this body look like a feed at all? Decides page-vs-feed on a pasted URL. */
export function looksLikeFeed(body: string): boolean {
  const head = body.slice(0, 2000);
  return /<rss[\s>]/i.test(head) || /<feed[\s>]/i.test(head);
}

/**
 * The feed a publisher's page points at.
 *
 * The standard autodiscovery link first; then SRF's own feed path, because
 * its pages carry the link in the body rather than the head on some days;
 * then any `.xml` under a path called `feed` or `rss`. Null means the page
 * names no feed, which the form reports as "not found" rather than guessing.
 */
export function feedFromPage(html: string, pageUrl: string): string | null {
  const alternate = html.match(/<link[^>]*type="application\/(?:rss|atom)\+xml"[^>]*>/i)?.[0];
  const href = alternate?.match(/href="([^"]+)"/)?.[1];
  const candidate = href ?? html.match(/https?:\/\/[^"'\s<>]+\/feed\/podcast\/[^"'\s<>]+\.xml/)?.[0] ?? html.match(/https?:\/\/[^"'\s<>]+\/(?:feed|rss)[^"'\s<>]*\.xml/)?.[0];
  if (!candidate) return null;
  try {
    return new URL(decodeEntities(candidate), pageUrl).toString();
  } catch {
    return null;
  }
}

/** `podcasts.apple.com/…/id123456` → the numeric id, for the lookup API. */
export function appleId(url: URL): string | null {
  if (!/(^|\.)podcasts\.apple\.com$/.test(url.hostname)) return null;
  return url.pathname.match(/\/id(\d{3,})/)?.[1] ?? null;
}

export function appleLookupUrl(id: string): string {
  return `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=podcast`;
}

/** The feed URL in Apple's lookup answer, if the show has one. */
export function feedFromAppleLookup(json: unknown): string | null {
  if (typeof json !== "object" || json === null) return null;
  const results = (json as { results?: unknown }).results;
  if (!Array.isArray(results)) return null;
  for (const r of results) {
    const feed = (r as { feedUrl?: unknown })?.feedUrl;
    if (typeof feed === "string" && /^https?:\/\//.test(feed)) return feed;
  }
  return null;
}

/** Spotify publishes no feed: the one popular link that cannot be followed. */
export function isSpotify(url: URL): boolean {
  return /(^|\.)spotify\.com$/.test(url.hostname);
}
