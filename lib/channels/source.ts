/**
 * The one shape every followable thing has, whichever platform it is on.
 *
 * A YouTube channel and a podcast feed both publish items with a date, a
 * title and something to play; the sweep, the store, the lists and the
 * lesson read THIS and never the platform's own shape. `youtube.ts` and
 * `rss.ts` each project their document onto it (`remote.ts`), which is the
 * whole seam: adding a third platform is a parser and a projection.
 */
export type SourceKind = "youtube" | "podcast";

export type Source = {
  /** `UC…` for YouTube, `f…` for a feed — `rss.ts`. */
  id: string;
  kind: SourceKind;
  name: string;
  /** YouTube's `@handle`, when the channel was added by one. */
  handle: string | null;
  /** The page a person opens: the channel, or the publisher's show page. */
  url: string;
  /** What the sweep reads. */
  feedUrl: string;
  /** The show's artwork; null for a YouTube channel. */
  imageUrl: string | null;
};

export type Item = {
  /** A YouTube video id, or `e…` for an episode. */
  id: string;
  title: string;
  /** ISO 8601. */
  publishedAt: string;
  thumbnailUrl: string | null;
  description: string | null;
  /** The episode's audio; null for a YouTube video, which the iframe plays. */
  mediaUrl: string | null;
  mediaType: string | null;
  durationSeconds: number | null;
  /** A transcript the publisher linked, and its MIME type. */
  transcript: { url: string; type: string } | null;
};

export type SourceFeed = { source: Source; items: Item[] };

/** What the register says is spoken on a source, when it lists it. */
export type Spoken = "dialect" | "standard" | "mixed";

export function isSpoken(value: unknown): value is Spoken {
  return value === "dialect" || value === "standard" || value === "mixed";
}
