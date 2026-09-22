import type { SavedWord } from "../saved/types.ts";
import type { LearnerModel, Trace } from "./model.ts";

/**
 * What you can do now that you could not before.
 *
 * WHY THIS EXISTS, AND WHY IT DID NOT. The specification refused streaks,
 * points, levels and percentages, and the refusal was challenged fairly:
 * "why are we so hateful towards streaks, percentages, gamification?"
 *
 * The honest answer is that the old rule was two rules in one coat. §3 now
 * separates them: what is COUNTED (consumption, or capability) and how it is
 * FRAMED (gain, or loss). What this product refuses is the dishonest quadrant
 * — consumption counted, loss framed, a flame icon that measures how much
 * Heidi somebody opened. It never had any business refusing to tell a learner
 * something true about themselves.
 *
 * So this counts capability and frames it as gain. Nothing here can go DOWN in
 * front of the reader: an area that slips below the bar simply stops being
 * listed, and is never reported as lost. "You have dropped from 14 to 11" is
 * the loss framing the whole distinction exists to keep out, and it would be
 * the easiest thing in the world to add from this same data.
 *
 * AND IT IS STILL NOT A SCORE. There is no percentage, because there is no
 * denominator that means anything — the pack is not the language. There is no
 * level, because a level is a claim about a person. What there is: a number of
 * specific things, and the things themselves, so the learner can check the
 * claim the way they can check everything else here.
 */

/**
 * How much evidence before "you have this" is a fair thing to say.
 *
 * FOUR, and the number is doing real work. The learner model already smooths
 * with a confidence constant of 3 for the opposite purpose — deciding what to
 * bring back — and the asymmetry between the two is deliberate: being brought
 * back early on thin evidence costs a learner one extra question, while being
 * TOLD they have mastered something on thin evidence is the product lying to
 * them. One right answer out of one is luck. Four is a pattern.
 */
export const MASTERY_ASKED = 4;

/**
 * How often you may still miss it and still be said to have it.
 *
 * A fifth. Not zero: demanding a perfect record would mean one slip erases a
 * month, which is both statistically silly and exactly the loss framing this
 * module exists to avoid.
 */
export const MASTERY_MISS_RATE = 0.2;

/**
 * How many times a kept word must come back before it counts as steady.
 *
 * TWO, which given the schedule means it survived a day and then three days.
 * Once is recognition; twice across a gap is the spacing effect having
 * actually happened, which is the thing the review schedule exists to produce
 * and therefore the honest thing to count.
 */
export const STEADY_STEP = 2;

export function holds(trace: Trace): boolean {
  return trace.asked >= MASTERY_ASKED && trace.missed / trace.asked <= MASTERY_MISS_RATE;
}

export type Mastered = {
  /** Grammar topic ids that now hold. */
  topics: string[];
  /** Vocabulary group ids that now hold. */
  groups: string[];
  /** Situation scene ids that now hold. */
  scenes: string[];
  /** Individual words from the pack that now hold. */
  words: string[];
};

/**
 * Everything in the learner model that has crossed the bar.
 *
 * Ids rather than counts, because the page prints the things. A bare number is
 * a score; the same number beside the eleven words it is about is a claim the
 * reader can disagree with, which is the only kind this product publishes.
 */
export function masteredIn(model: LearnerModel): Mastered {
  const crossed = (traces: Record<string, Trace>) =>
    Object.entries(traces)
      .filter(([, trace]) => holds(trace))
      .map(([id]) => id)
      .sort();

  return {
    topics: crossed(model.topics),
    groups: crossed(model.groups),
    scenes: crossed(model.scenes),
    words: crossed(model.words),
  };
}

/** How many things in total, for the one number the panel prints. */
export function masteredCount(mastered: Mastered): number {
  return mastered.topics.length + mastered.groups.length + mastered.scenes.length + mastered.words.length;
}

/**
 * Kept words that have come back across a gap and survived.
 *
 * The learner's OWN words, which is a different and better claim than anything
 * about the pack: these are words they met in a real message, chose to keep,
 * and still had days later. Nothing new is recorded to produce this — the
 * review step is already on the word because the schedule needs it.
 */
export function steadyWords(saved: readonly SavedWord[]): SavedWord[] {
  return saved.filter((word) => (word.step ?? 0) >= STEADY_STEP);
}
