/**
 * The text operations every gapped exercise needs, in one place.
 *
 * WHY THIS FILE EXISTS. `giveaway`, `words` and `blank` were private helpers
 * of the one module that generated every kind of item. The moment a second
 * gapped kind was written they would have been copied — and a second copy of
 * `giveaway` is the worst possible copy to have, because the two would drift
 * silently and one of them would start shipping questions with the answer
 * printed underneath.
 *
 * Everything here is pure and has no idea what a practice item is.
 */

/**
 * Words, Unicode-aware, with punctuation dropped.
 *
 * `\p{L}` rather than `\w`: `\w` is ASCII, and half the words in this language
 * carry an umlaut. Apostrophes are kept inside a word so `z'spöt` stays one
 * token rather than becoming two, one of which is a letter.
 */
export function words(sentence: string): string[] {
  return sentence.match(/[\p{L}’']+/gu) ?? [];
}

/**
 * Whether the clue already hands the learner this word.
 *
 * Not just "does the bridge sentence contain it" — `ha` is absent from "Die
 * Frau, die ich gesehen habe" as a WORD and completely given away by `habe`. A
 * learner reading the clue produces it from the cognate without knowing the
 * structure the topic is about, which makes the item look answered and teach
 * nothing.
 *
 * AND THE TEST IS ASYMMETRIC, which took seeing the output to get right. The
 * first version refused a prefix match in either direction and killed the best
 * item in the pack: for `diminutive-li` it blanked the ARTICLE in "Machsch es
 * Bierli?" because `Bierli` extends the clue's `Bier` — which is not a
 * giveaway, it is the entire lesson.
 *
 *   the clue CONTAINS the answer   `habe` ⊃ `ha`      → refuse, it is readable
 *   the answer EXTENDS the clue    `Bierli` ⊃ `Bier`  → keep, that is the point
 *
 * It over-refuses on very short words — a two-letter candidate will hide
 * inside some unrelated German word sooner or later — and that is the right
 * direction to fail in. Over-refusing costs one item out of a pack with
 * plenty; under-refusing ships a question whose answer is printed underneath.
 */
export function giveaway(word: string, bridgeWords: readonly string[]): boolean {
  const w = word.toLowerCase();
  return bridgeWords.some((b) => b.includes(w));
}

/**
 * The word worth removing from a sentence, given its translation.
 *
 * THE LAST one that the bridge does not give away, rather than the first,
 * because in a verb-final structure — which is what most of these topics are
 * about — the word a German reader waits for and never gets is at the end.
 * `gange`, not `bi`.
 *
 * Undefined when nothing survives: the sentence teaches nothing by contrast,
 * and no item is better than a bad one. A one-letter answer is refused for the
 * same reason — that is a spelling variant, not a contrast.
 */
export function blankable(target: string, bridge: string): string | undefined {
  const clue = words(bridge).map((w) => w.toLowerCase());
  const unique = words(target).filter((w) => !giveaway(w, clue));
  const answer = unique[unique.length - 1];
  return answer && answer.length >= 2 ? answer : undefined;
}

/**
 * Replace a word with a blank, leaving the punctuation around it.
 *
 * EVERY occurrence, not the first. Without the `g` this cut one blank into
 * «Mir händ, ihr händ, si händ.» and left the answer standing twice in the
 * same line — an exercise that shows its own answer, which is worse than no
 * exercise because it reads as one.
 *
 * Blanking all of them is also the better question where a word repeats: the
 * unified plural is exactly the topic whose point is that one form serves
 * three persons, and «Mir ____, ihr ____, si ____» against «Wir haben, ihr
 * habt, sie haben» is that point in a single line.
 */
export function blank(sentence: string, word: string): string {
  return sentence.replace(new RegExp(`(?<![\\p{L}])${escape(word)}(?![\\p{L}])`, "gu"), "____");
}

export function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
