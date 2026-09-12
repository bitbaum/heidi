/**
 * Everything that can happen to a list of saved words, as pure functions.
 *
 * Pure on purpose: this is the only part of the feature that can be wrong in a
 * way the visitor would notice and could not undo — a bad merge loses words
 * they chose to keep. Storage and React are elsewhere; this is unit-testable
 * with no browser at all.
 */

import { EMPTY, MAX_WORDS, SAVED_VERSION, type SavedCollection, type SavedWord } from "./types.ts";

/**
 * The identity of a saved word.
 *
 * Case-folded, because a learner who saves "Chunnsch" from the start of a
 * sentence and "chunnsch" from the middle has saved one word, not two. Not
 * accent-folded: in a variety where the whole lesson is that `ö` became `au`,
 * treating them as the same word would collapse the distinction being taught.
 */
export function identity(word: Pick<SavedWord, "target">): string {
  return word.target.trim().toLocaleLowerCase();
}

/** A word worth keeping: both halves present, neither absurd. */
export function isKeepable(word: Partial<SavedWord>): boolean {
  const target = word.target?.trim() ?? "";
  const bridge = word.bridge?.trim() ?? "";
  if (!target || !bridge) return false;
  // A whole pasted paragraph is not a vocabulary item; it is someone pressing
  // the wrong button, and storing it would push out real words.
  if (target.length > 80 || bridge.length > 160) return false;
  return true;
}

/**
 * Add a word, newest first, without duplicating one already kept.
 *
 * Re-saving a word already in the list is a no-op rather than a move to the
 * top or a second copy. The learner pressed save because they were not sure it
 * was saved; the honest answer is that it is, unchanged — including its
 * original `savedAt`, which is the only record of how long they have been
 * carrying it.
 */
export function add(collection: SavedCollection, word: SavedWord): SavedCollection {
  if (!isKeepable(word)) return collection;

  const key = identity(word);
  if (collection.words.some((w) => identity(w) === key)) return collection;

  const clean: SavedWord = {
    target: word.target.trim(),
    bridge: word.bridge.trim(),
    savedAt: word.savedAt,
    ...(word.context?.trim() ? { context: word.context.trim() } : {}),
  };

  // Newest first, and the oldest fall off the end at the cap.
  return { version: SAVED_VERSION, words: [clean, ...collection.words].slice(0, MAX_WORDS) };
}

export function remove(collection: SavedCollection, target: string): SavedCollection {
  const key = identity({ target });
  return { version: SAVED_VERSION, words: collection.words.filter((w) => identity(w) !== key) };
}

export function has(collection: SavedCollection | null, target: string): boolean {
  if (!collection) return false;
  const key = identity({ target });
  return collection.words.some((w) => identity(w) === key);
}

/**
 * Read what is in storage, refusing anything we do not recognise.
 *
 * An unknown `version` is treated as ABSENT, not coerced. A future schema
 * change meets old data in a browser we cannot reach, and the two failure
 * modes are not equally bad: showing an empty list is recoverable by saving
 * again, while showing a corrupted one — half-parsed objects, missing
 * bridges — teaches the learner the feature is broken and cannot be undone.
 *
 * Every field is checked rather than trusted. This string came from a place
 * anyone can edit with a dev console, so it is input, not data.
 */
export function decode(raw: string): SavedCollection | null {
  try {
    const parsed = JSON.parse(raw) as Partial<SavedCollection>;
    if (!parsed || parsed.version !== SAVED_VERSION || !Array.isArray(parsed.words)) return null;

    const words: SavedWord[] = [];
    const seen = new Set<string>();
    for (const candidate of parsed.words) {
      const w = candidate as Partial<SavedWord>;
      if (typeof w?.target !== "string" || typeof w?.bridge !== "string") continue;
      if (typeof w?.savedAt !== "string") continue;
      if (!isKeepable(w)) continue;
      const key = identity({ target: w.target });
      // Storage edited by hand can contain duplicates the writer never made.
      if (seen.has(key)) continue;
      seen.add(key);
      words.push({
        target: w.target.trim(),
        bridge: w.bridge.trim(),
        savedAt: w.savedAt,
        ...(typeof w.context === "string" && w.context.trim() ? { context: w.context.trim() } : {}),
      });
    }
    return { version: SAVED_VERSION, words: words.slice(0, MAX_WORDS) };
  } catch {
    return null;
  }
}

/** Newest first is the storage order; oldest first is how you revise. */
export function oldestFirst(collection: SavedCollection): SavedWord[] {
  return [...collection.words].sort((a, b) => a.savedAt.localeCompare(b.savedAt));
}

export { EMPTY };
