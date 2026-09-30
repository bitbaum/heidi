import { distance, parseRule } from "../saved/patterns.ts";
import { holds, STEADY_STEP } from "../practice/mastered.ts";
import type { LearnerModel } from "../practice/model.ts";
import type { SavedWord } from "../saved/types.ts";

/**
 * Which words are worth learning first, and where a learner stands on each.
 *
 * THE QUESTION THE PAGE ANSWERS is "what should I learn next", and it has a
 * measurable answer rather than an editorial one. A word earns its place by two
 * facts the repo already holds:
 *
 *   HEARD OFTEN. How many lines of the situation scenes say it. The scenes are
 *   the everyday Zurich German this product teaches — the shop, the tram, the
 *   handover — so a word in seventeen of their lines is a word a learner will
 *   meet in the first week, and a word in none is one they may never need.
 *
 *   NOT GUESSABLE. A German reader who hears `schlafe` gets `schlafen`, and
 *   one who hears `Chind` gets `Kind` once they know `k → ch`. Learning those
 *   is effort spent on words that were already free. `nöd` for «nicht» and
 *   `mir` for «wir» are not free, and they are what stops a sentence.
 *
 * A TRAP IS NEVER GUESSABLE, however close it looks: `Estrich` is one letter
 * from nothing and means the attic, which is exactly why it is dangerous.
 */

/** Distance per letter at or below which the German gives the word away. */
export const GUESSABLE_AT = 0.25;

export interface RankableWord {
  target: string;
  bridge: string;
  group: string;
  mistakenFor?: string;
}

function fold(text: string): string {
  return text.normalize("NFC").trim().toLocaleLowerCase();
}

/**
 * Whether a German reader understands the word without being taught it.
 *
 * Each German gloss is tried (`gerade, sofort` is two), with and without the
 * variety's sound correspondences applied, and the closest spelling decides.
 * Relative distance, because one letter in `tue`/`tun` is a third of the word
 * and one letter in `Schwöschter`/`Schwester` is nothing.
 */
export function guessable(word: RankableWord, correspondences: readonly { rule: string }[]): boolean {
  if (word.mistakenFor) return false;
  const target = fold(word.target);
  const subs = correspondences.map((c) => parseRule(c.rule)).filter((s) => s !== null);

  for (const gloss of word.bridge.split(/[,(]/).map(fold).filter(Boolean)) {
    let spellings = [gloss];
    for (const sub of subs) {
      spellings = spellings.flatMap((s) => (s.includes(sub.from) ? [s, s.replaceAll(sub.from, sub.to)] : [s]));
    }
    for (const spelling of spellings) {
      if (distance(target, spelling) / Math.max(target.length, spelling.length) <= GUESSABLE_AT) return true;
    }
  }
  return false;
}

export interface Ranked<W extends RankableWord> {
  word: W;
  /** Lines of the scenes that say it. */
  heard: number;
  guessable: boolean;
}

/**
 * The words in the order they are worth learning.
 *
 * Guessable words last, as a block. Then by how often they are heard. Ties —
 * and most words are heard in no scene at all — go to traps first, then to the
 * pack's group order (the short constant words before nouns before greetings),
 * then to the order the pack lists them in, so the result never depends on a
 * sort's stability.
 */
export function rankWords<W extends RankableWord>(
  words: readonly W[],
  options: {
    heard: (target: string) => number;
    correspondences: readonly { rule: string }[];
    groupOrder: readonly string[];
  },
): Ranked<W>[] {
  const group = (id: string) => {
    const i = options.groupOrder.indexOf(id);
    return i === -1 ? options.groupOrder.length : i;
  };
  return words
    .map((word, index) => ({
      word,
      index,
      heard: options.heard(word.target),
      guessable: guessable(word, options.correspondences),
    }))
    .sort(
      (a, b) =>
        Number(a.guessable) - Number(b.guessable) ||
        b.heard - a.heard ||
        Number(Boolean(b.word.mistakenFor)) - Number(Boolean(a.word.mistakenFor)) ||
        group(a.word.group) - group(b.word.group) ||
        a.index - b.index,
    )
    .map(({ word, heard, guessable }) => ({ word, heard, guessable }));
}

export type WordStatus = "new" | "learning" | "known";

/**
 * Where the learner stands on one word, from evidence already recorded.
 *
 * KNOWN is the mastery bar the rest of the product uses — asked enough and
 * rarely missed (`holds`) — or a kept word that has come back across a gap and
 * been remembered. LEARNING is anything short of that with some evidence: it
 * has been asked, or it was kept. Everything else is new. Nothing is stored for
 * this; it is read off the model and the kept words every time.
 */
export function wordStatus(
  target: string,
  model: Pick<LearnerModel, "words">,
  saved: readonly Pick<SavedWord, "target" | "step">[],
): WordStatus {
  const trace = model.words[target];
  const kept = saved.find((w) => fold(w.target) === fold(target));
  if ((trace && holds(trace)) || (kept && (kept.step ?? 0) >= STEADY_STEP)) return "known";
  if ((trace && trace.asked > 0) || kept) return "learning";
  return "new";
}

/** How many words a "learn the next ones" sitting takes. */
export const NEXT_BATCH = 10;

/**
 * The next words to learn: the first not yet known, in rank order, among those
 * the practice pool can actually ask about.
 */
export function nextWords(
  ranked: readonly { word: { target: string }; practisable: boolean }[],
  status: (target: string) => WordStatus,
  count = NEXT_BATCH,
): string[] {
  return ranked
    .filter((r) => r.practisable && status(r.word.target) !== "known")
    .slice(0, count)
    .map((r) => r.word.target);
}
