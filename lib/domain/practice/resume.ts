import type { PracticeItem } from "./types.ts";

/**
 * A sitting that was left half way, and the way back into it.
 *
 * The session screen has a close button, and a phone has a back gesture, a
 * lock button and a tram stop. Before this, any of them threw the sitting
 * away: the next visit dealt eight new questions and the three answered ones
 * were simply gone. An app keeps your place. So the sitting is written down
 * after every answer and picked up again when the same sitting is opened.
 *
 * WHAT IS STORED IS IDS, NOT QUESTIONS. The questions come from the pack and
 * from the learner's own words, both of which are already on the page; storing
 * copies would be a second, stale source for the same thing. A restore that
 * cannot find every id — the pack changed, a kept word was deleted — is not a
 * restore, and a fresh sitting starts instead of a shorter one pretending to
 * be the same.
 *
 * "THE SAME SITTING" is the `key`: mode and scope, as the session page puts
 * them together. Half a sitting on the article system does not resume inside
 * a sitting on one scene.
 */

export type Outcome = "right" | "wrong" | "skipped";

export type SavedSession = {
  key: string;
  ids: string[];
  at: number;
  outcomes: { id: string; outcome: Outcome }[];
  savedAt: string;
};

/** A sitting older than this is yesterday's, and starts fresh. */
export const RESUME_WITHIN_MS = 12 * 60 * 60 * 1000;

/** Enough for a card run and its requeues; anything longer is not ours. */
const MAX_ITEMS = 80;

const OUTCOMES: readonly string[] = ["right", "wrong", "skipped"];

export function decodeSaved(raw: string): SavedSession | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const { key, ids, at, outcomes, savedAt } = value as Record<string, unknown>;
  if (typeof key !== "string" || typeof savedAt !== "string" || Number.isNaN(Date.parse(savedAt))) return null;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_ITEMS) return null;
  if (!ids.every((id) => typeof id === "string")) return null;
  if (typeof at !== "number" || !Number.isInteger(at) || at < 0 || at > ids.length) return null;
  if (!Array.isArray(outcomes) || outcomes.length > MAX_ITEMS) return null;
  const clean: SavedSession["outcomes"] = [];
  for (const o of outcomes) {
    if (!o || typeof o !== "object") return null;
    const { id, outcome } = o as Record<string, unknown>;
    if (typeof id !== "string" || typeof outcome !== "string" || !OUTCOMES.includes(outcome)) return null;
    clean.push({ id, outcome: outcome as Outcome });
  }
  return { key, ids: ids as string[], at, outcomes: clean, savedAt };
}

/**
 * The sitting to continue, or null for a fresh one.
 *
 * A finished sitting (`at` at the end) does not resume: reopening the screen
 * after the summary means "again", not "show me the summary once more".
 */
export function restore(
  saved: SavedSession | null,
  key: string,
  pool: readonly PracticeItem[],
  now: Date,
): { session: PracticeItem[]; at: number; outcomes: SavedSession["outcomes"] } | null {
  if (!saved || saved.key !== key) return null;
  if (now.getTime() - Date.parse(saved.savedAt) > RESUME_WITHIN_MS) return null;
  if (saved.at >= saved.ids.length) return null;
  const byId = new Map(pool.map((item) => [item.id, item]));
  const session: PracticeItem[] = [];
  for (const id of saved.ids) {
    const item = byId.get(id);
    if (!item) return null;
    session.push(item);
  }
  return { session, at: saved.at, outcomes: saved.outcomes };
}
