import type { DisplayCorrespondence } from "../../variety/display.ts";
import type { SavedWord } from "./types.ts";

/**
 * Which regularities are actually in the words this person kept.
 *
 * "What keeps catching you", derived rather than tracked. The obvious way to
 * build that panel is to count how many times someone looked a word up, which
 * needs new instrumentation, a new store, and a record of every lookup — and
 * the answer is already sitting in the data: six kept words that all turn `k`
 * into `ch` IS the thing catching them. Nothing extra is recorded about
 * anybody to produce it.
 *
 * It is also honest in a way a score is not. The panel says "this pattern is
 * in eleven of your words, here they are" — a fact about their own list, which
 * they can check by looking at it. Not a level, not a percentage, not a
 * weakness rating we cannot support (HEIDI.md §8).
 *
 * THE TEST, and why it is a substitution rather than a keyword match
 *
 * `bridge.includes("k")` would match *Kind* and also *Kuchen*, *Kanton* and
 * every other word with a k in it — most of which are not examples of anything.
 * Applying the rule and asking whether the result moved CLOSER to the target
 * only fires when the correspondence is what actually separates the two forms:
 * *Kind* → *chind* is *Chind* exactly, while *Kuchen* → *chuchen* is no nearer
 * *Chuchi* than it started on the k.
 */

/** `k → ch` becomes `{ from: "k", to: "ch" }`. */
export type Substitution = { from: string; to: string };

/**
 * Split a rule on its arrow.
 *
 * Returns null for anything that is not one — a rule may legitimately describe
 * something no substring swap can express, and the answer there is to skip it,
 * not to guess. `lib/variety/patterns.test.ts` asserts that every rule in the
 * pack which DOES parse actually describes its own example pair, so a rule
 * string that quietly stops matching its example fails the build.
 */
export function parseRule(rule: string): Substitution | null {
  const parts = rule.split("→");
  if (parts.length !== 2) return null;
  const from = parts[0].trim().toLocaleLowerCase();
  const to = parts[1].trim().toLocaleLowerCase();
  if (!from || !to || from === to) return null;
  return { from, to };
}

/** Levenshtein. Small strings only — these are single words. */
export function distance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/**
 * Does this correspondence explain part of the difference between the two forms?
 *
 * True when applying it to the bridge form moves it strictly closer to the
 * target. Strictly: a substitution that changes nothing, or that makes the word
 * less like the target, is not evidence of anything.
 */
export function explains(word: Pick<SavedWord, "target" | "bridge">, sub: Substitution): boolean {
  const target = word.target.trim().toLocaleLowerCase();
  const bridge = word.bridge.trim().toLocaleLowerCase();
  if (!target || !bridge || !bridge.includes(sub.from)) return false;

  const applied = bridge.replaceAll(sub.from, sub.to);
  if (applied === bridge) return false;

  return distance(applied, target) < distance(bridge, target);
}

export type Pattern = {
  correspondence: DisplayCorrespondence;
  /** The learner's own words this shows up in, in the order they were kept. */
  words: SavedWord[];
};

/**
 * The patterns in someone's kept words, commonest first.
 *
 * A pattern needs at least `atLeast` words before it is shown. One word is a
 * coincidence, and a panel headed "what keeps catching you" that lists a thing
 * which caught you exactly once is the kind of overstatement this product is
 * supposed to be better than.
 */
export function patternsIn(
  words: SavedWord[],
  correspondences: readonly DisplayCorrespondence[],
  atLeast = 2,
): Pattern[] {
  const found: Pattern[] = [];

  for (const correspondence of correspondences) {
    const sub = parseRule(correspondence.rule);
    if (!sub) continue;

    const matching = words.filter((w) => explains(w, sub));
    if (matching.length >= atLeast) found.push({ correspondence, words: matching });
  }

  // Commonest first, and ties broken by the rule text so the order is stable
  // between renders rather than depending on how the pack happens to be sorted.
  return found.sort(
    (a, b) => b.words.length - a.words.length || a.correspondence.rule.localeCompare(b.correspondence.rule),
  );
}
