import { createBrowserStore } from "@/lib/browser/store";

/**
 * What this browser answered about each video. Device-local, like every
 * other measurement of the learner (HEIDI.md §5): the channels they follow
 * are a row on the server because a closed browser cannot poll YouTube, but
 * what they understood of a video is nobody's business but theirs.
 *
 * Per video: which option was chosen for each question (index 0 is the gist,
 * then the detail questions in order), and when. Declared on `/privacy` as
 * `videoAnswers`.
 */
export type VideoRecord = { chosen: (number | null)[]; done: boolean; at: string };
export type VideoProgress = Record<string, VideoRecord>;

export function decodeVideoProgress(raw: string): VideoProgress | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const out: VideoProgress = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value !== "object" || value === null) continue;
      const v = value as Record<string, unknown>;
      if (!Array.isArray(v.chosen)) continue;
      out[id] = {
        chosen: v.chosen.map((c) => (typeof c === "number" && Number.isInteger(c) ? c : null)),
        done: v.done === true,
        at: typeof v.at === "string" ? v.at : new Date(0).toISOString(),
      };
    }
    return out;
  } catch {
    return null;
  }
}

export const videoStore = createBrowserStore("heidi.videos.v1", decodeVideoProgress);

/** The record of one video, or a blank one. */
export function recordFor(videoId: string): VideoRecord {
  return videoStore.read()?.[videoId] ?? { chosen: [], done: false, at: new Date(0).toISOString() };
}

export function writeRecord(videoId: string, record: VideoRecord): void {
  if (typeof window === "undefined") return;
  const all = videoStore.read() ?? {};
  videoStore.write({ ...all, [videoId]: record });
}
