/**
 * The words a learner kept.
 *
 * Heidi already produces exactly the right object every time it answers: the
 * gloss — "Chunnsch" means "Kommst du". Until now it was drawn once and thrown
 * away on reload, so a learner who looked up the same word on Tuesday and
 * Friday got the same answer twice and accumulated nothing. That is the
 * "personalized learning" gap, and it does not need an account to close.
 *
 * WHY THIS LIVES IN THE BROWSER AND NOT IN A DATABASE
 *
 * Heidi keeps no users table — identity is federated to OrangeCat and the
 * `sub` claim is the only thing we hold. Adding a database to store vocabulary
 * would mean Heidi starts holding personal data about what someone does not
 * understand, which is a genuinely sensitive thing to hold, and it would buy
 * sync across devices and nothing else. On-device costs nothing, works signed
 * out, and cannot leak. When groups arrive they need a server for a real
 * reason — two people must see one thread — and that is the moment to pay for
 * it, not before.
 *
 * Nothing here names German or Zurich: an entry is a pair of forms in the
 * taught variety and the bridge variety, whatever those are for the pack.
 */

/** One kept word: what they read, and what it means in the language they have. */
export type SavedWord = {
  /** The form in the variety being learned, e.g. "Chunnsch". Identity. */
  target: string;
  /** The same thing in the bridge variety, e.g. "Kommst du". */
  bridge: string;
  /**
   * The sentence it was found in, when there was one.
   *
   * Kept because a word remembered with its context is remembered; a word on a
   * flashcard is a word you can recognise on a flashcard. Optional because a
   * single-word lookup has no sentence, and inventing one would be worse.
   */
  context?: string;
  /** ISO 8601. When it was first kept — re-saving does not reset it. */
  savedAt: string;
};

/**
 * The stored shape, versioned.
 *
 * `version` is not decoration. The first time this schema changes, every
 * existing visitor has the old shape in their browser and no migration can be
 * run server-side because there is no server holding it. The choice is made
 * once, here: an unrecognised version is treated as ABSENT rather than
 * coerced, so a future change can never render someone's list as garbage — the
 * worst case is that it looks empty, which is recoverable, instead of
 * corrupted, which is not.
 */
export type SavedCollection = {
  version: 1;
  words: SavedWord[];
};

export const SAVED_VERSION = 1 as const;

/**
 * A cap, so one pathological session cannot fill a visitor's storage quota and
 * break the key they brought. Oldest go first: someone with 500 saved words is
 * not reviewing the ones from six months ago, and silently failing to save the
 * 501st would be the worse behaviour.
 */
export const MAX_WORDS = 500;

export const EMPTY: SavedCollection = { version: SAVED_VERSION, words: [] };
