import { check } from "../../variety/check.ts";
import type { VarietyPack } from "../../variety/pack.ts";
import { identity } from "./collection.ts";

/**
 * Meeting a kept word somewhere new.
 *
 * A learner who met *gäll* once has met it once. The sentence it came from is
 * already stored, and it is the same sentence every time they review — so the
 * word gets learned attached to that one context rather than as a word. One or
 * two further sentences, in different situations, is the cheapest version of
 * the varied input that actually builds recognition.
 *
 * WHY THIS IS FREE FOR EVERYONE. It was very nearly gated behind a paid tier on
 * the grounds that it costs a model call. Measured, the call is about 174
 * tokens in and 60 out — roughly five hundredths of a rappen, ONCE, for the
 * lifetime of that word. A learner who fills the entire 500-word cap costs
 * about a quarter of a franc. Charging for that would be arbitrary, and people
 * can feel arbitrary.
 *
 * Everything below is pure: the route does the model call, this decides what
 * survives it.
 */

/** Two. A third is not more varied input, it is a wall of text on a card. */
export const MAX_EXAMPLES = 2;

/**
 * Long enough for a real sentence, short enough to read on a review card
 * without scrolling. A model asked for "short" and given no number will
 * occasionally write a paragraph.
 */
export const MAX_EXAMPLE_LENGTH = 120;

/**
 * Does this sentence actually contain the word it is supposed to demonstrate?
 *
 * The failure this catches is specific and common: asked for a sentence using
 * *Chind*, a model writes a sentence using *Chinder*. It is a perfectly good
 * sentence and a useless example, because the learner is reviewing the form
 * they saved and will not see it.
 *
 * Matched on a word boundary so *gäll* is not "found" inside a longer word,
 * and case-folded the same way the saved list folds its own identity — a
 * sentence-initial *Gäll* is the same word.
 */
export function demonstrates(sentence: string, target: string): boolean {
  const word = identity({ target }).trim();
  if (!word) return false;

  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, "iu").test(sentence);
}

export type ExampleResult = {
  /** What survived. Possibly empty, which is a normal outcome and not an error. */
  examples: string[];
  /**
   * What was generated and thrown away, and why. Not shown to the learner —
   * this is for the operator, because a gate that silently drops everything
   * looks identical to a model that returned nothing.
   */
  rejected: { sentence: string; reason: string }[];
};

/**
 * Keep the sentences that are actually usable.
 *
 * Every rejection here is a thing the learner must never be shown: a sentence
 * in the wrong variety teaches them a wrong form, and a sentence missing the
 * word teaches them nothing at all. Both are worse than showing no example,
 * which is why this returns an empty list rather than lowering the bar.
 */
export function usableExamples(raw: unknown, target: string, pack: VarietyPack): ExampleResult {
  const rejected: { sentence: string; reason: string }[] = [];
  const examples: string[] = [];

  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { examples?: unknown })?.examples)
      ? ((raw as { examples: unknown[] }).examples)
      : [];

  for (const candidate of list) {
    if (typeof candidate !== "string") continue;
    const sentence = candidate.trim().replace(/\s+/g, " ");
    if (!sentence) continue;

    if (sentence.length > MAX_EXAMPLE_LENGTH) {
      rejected.push({ sentence, reason: "too long" });
      continue;
    }
    if (!demonstrates(sentence, target)) {
      rejected.push({ sentence, reason: "does not contain the word" });
      continue;
    }
    // The same gate every other generated line faces. A learner cannot audit
    // this — that is the entire reason the gate exists.
    const verdict = check(sentence, pack);
    if (!verdict.ok) {
      rejected.push({ sentence, reason: verdict.findings.map((f) => f.form).join(", ") });
      continue;
    }
    // Two identical situations are one example.
    if (examples.some((kept) => kept.toLocaleLowerCase() === sentence.toLocaleLowerCase())) continue;

    examples.push(sentence);
    if (examples.length === MAX_EXAMPLES) break;
  }

  return { examples, rejected };
}
