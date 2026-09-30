import type { SavedWord } from "./types.ts";

/**
 * Which sentence a kept word is shown in — and the rule that it must contain it.
 *
 * THE DEFECT. A word kept from the chat carried "the learner's line" as its
 * context. When the learner had pasted Zurich German that was right; when they
 * had asked Heidi to SAY something, their line was the request — often
 * English. So «däm» came back on a practice card over «after this set i will
 * go home sleep»: a sentence in another language, without the word in it.
 *
 * So a context is only ever a sentence the word actually occurs in, chosen at
 * keep time from the candidates in order, and checked again at display time,
 * which is what repairs the words already kept with the wrong one.
 */

const WORD = /\p{L}+/gu;

function tokens(text: string): string[] {
  return (text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase().match(WORD) ?? []);
}

/** Whether `word` (one or more words) occurs in `sentence`, ignoring case, accents and punctuation. */
export function containsWord(sentence: string, word: string): boolean {
  const needle = tokens(word);
  if (needle.length === 0) return false;
  const hay = tokens(sentence);
  for (let i = 0; i + needle.length <= hay.length; i++) {
    if (needle.every((w, j) => hay[i + j] === w)) return true;
  }
  return false;
}

/** The first candidate the word occurs in, or nothing — never a sentence without it. */
export function sentenceWith(word: string, candidates: readonly (string | undefined)[]): string | undefined {
  return candidates.find((c): c is string => typeof c === "string" && containsWord(c, word));
}

/**
 * The sentence to show under a kept word: a generated example first, rotating
 * by how many times it has come back so the second review is not a re-run of
 * the first; then where it was found, if the word is in it.
 *
 * `step` rather than a random pick, because a card that changes on every
 * re-render changes while you are reading it.
 */
export function sentenceFor(word: SavedWord): string | undefined {
  const examples = word.examples ?? [];
  if (examples.length > 0) {
    const seen = typeof word.step === "number" && Number.isFinite(word.step) ? Math.max(0, Math.trunc(word.step)) : 0;
    return examples[seen % examples.length];
  }
  return word.context && containsWord(word.context, word.target) ? word.context : undefined;
}
