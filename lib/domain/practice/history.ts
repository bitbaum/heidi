/**
 * What this browser has already been asked.
 *
 * WHY IT HAS TO BE STORED, and why not storing it was a broken promise rather
 * than a missing nicety.
 *
 * `buildSession` orders by `seen` — items asked least recently come first —
 * and `session.ts` says in as many words that "the same person gets a
 * different session tomorrow". That was only true within one page load. The
 * list lived in a `useRef`, so a reload, a tab close, or simply coming back the
 * next day handed the learner the identical eight questions, in the identical
 * order, for ever. The mechanism for variety existed and was fed nothing.
 *
 * ONLY IDS, AND ONLY RECENT ONES. This is a queue of what to ask next, not a
 * record of how somebody performed: no answers, no scores, no timestamps.
 * There is nothing here to reconstruct a study history from, which keeps it
 * the same kind of thing as the words in `saved` — the learner's, in their
 * browser, and worthless to anybody else.
 *
 * `LIMIT` is a few sessions' worth. Unbounded, this grows for ever in storage
 * to push apart questions the learner has long forgotten; past a point, "not
 * asked recently" and "not asked in months" are the same fact and the older
 * half only costs bytes.
 */

/** How many item ids to remember. Roughly five sessions. */
export const LIMIT = 40;

/** Most recently asked LAST, which is the order `buildSession` expects. */
export type History = readonly string[];

export const NO_HISTORY: History = [];

/**
 * Record that these items were asked, newest last.
 *
 * An id already present MOVES to the end rather than appearing twice: the list
 * is "when did we last ask this", and a duplicate would make one item look
 * both stale and fresh depending which copy was read.
 */
export function remember(history: History, asked: readonly string[]): History {
  const fresh = asked.filter((id) => id.trim());
  if (fresh.length === 0) return history;

  const dropped = new Set(fresh);
  return [...history.filter((id) => !dropped.has(id)), ...fresh].slice(-LIMIT);
}

/**
 * Read a stored history back, refusing anything that is not a list of strings.
 *
 * Storage is a string typed by nobody — another tab, an older version of this
 * code, or a person with devtools open can put anything in it. A decode that
 * trusted it would hand `buildSession` a number or an object and fail deep
 * inside the ordering, where the cause is no longer visible.
 */
export function decodeHistory(raw: string): History | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const ids = parsed.filter((id): id is string => typeof id === "string" && id.trim().length > 0);
    return ids.slice(-LIMIT);
  } catch {
    return null;
  }
}
