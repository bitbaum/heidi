import type { SavedWord } from "./types.ts";

/**
 * When a kept word comes back.
 *
 * Keeping a word was, until now, the end of the story: the list grew and
 * nothing ever asked you about any of it. This is the part that makes saving
 * worth doing — and it is the first feature in the product whose whole claim
 * is about WHEN something is shown rather than what.
 *
 * Two findings carry it, and both are cited on the page that renders this so a
 * reader can check them rather than take our word:
 *
 *   - Spacing. Kim & Webb (2022), a meta-analysis of spaced practice in L2,
 *     find g ≈ 0.76 on immediate tests and ≈ 1.15 on delayed ones — the effect
 *     is LARGER later, which is the opposite of how cramming feels.
 *     https://doi.org/10.1111/lang.12479
 *   - Retrieval, not review. Yang et al. (2021), g ≈ 0.50 for quizzing over
 *     restudying. Being asked beats being shown, which is why this schedule
 *     drives a prompt-then-reveal and never a list of words with their
 *     meanings printed beside them.
 *     https://doi.org/10.1037/bul0000309
 *
 * WHAT THIS DELIBERATELY IS NOT
 *
 * Not SM-2, not FSRS, no ease factors and no half-life estimation. Those model
 * a learner doing hundreds of reviews a day across thousands of cards; someone
 * here has kept eleven words from their WhatsApp messages. Fitting a curve to
 * eleven points produces confident nonsense, and HEIDI.md §8 forbids exactly
 * that kind of false precision. Expanding fixed intervals capture the finding
 * the evidence actually supports — later is better than sooner — and nothing
 * beyond it.
 *
 * And no streaks, no points, no "days active". §8 again: measured, not
 * gamified. The product's own success metric is how much of an unfamiliar
 * Zurich speaker you understand, not how much Heidi you have consumed, and a
 * streak measures consumption while pretending to measure learning.
 *
 * Pure, and stored in the browser with the word it belongs to — review history
 * is a record of what a specific person cannot understand, which is a
 * genuinely sensitive thing to hold, and there is no reason for it to leave
 * their device.
 */

/**
 * Days until a word returns, by how many times it has been recalled in a row.
 *
 * Expanding, and ending rather than growing without limit: past about five
 * weeks a "word you kept from a chat message" is either part of your German or
 * gone, and a schedule that promises to ask again in eight months is promising
 * something nobody will be here to collect.
 */
export const REVIEW_STEPS = [1, 3, 7, 16, 35] as const;

/**
 * The schedule fields live on `SavedWord` itself, not in a second type here.
 *
 * They are one thing stored in one place, and a parallel `ReviewState` would
 * be a second definition of the same fields that could drift from the one the
 * decoder actually reads.
 */
export type ReviewWord = SavedWord;

const DAY_MS = 86_400_000;

/** Clamp into REVIEW_STEPS, so hand-edited storage cannot index off the end. */
function clampStep(step: number | undefined): number {
  if (typeof step !== "number" || !Number.isFinite(step)) return 0;
  return Math.min(Math.max(Math.trunc(step), 0), REVIEW_STEPS.length - 1);
}

/** When a word at `step` should next be asked, counting from `from`. */
export function nextDue(step: number, from: Date): string {
  return new Date(from.getTime() + REVIEW_STEPS[clampStep(step)] * DAY_MS).toISOString();
}

/**
 * Is this word due?
 *
 * A word with no `dueAt` is due. That is not a fallback, it is the correct
 * answer: you kept it because you did not know it, and nothing has asked you
 * since. It also means this feature arrives with everyone's existing list
 * already populated rather than empty for the first day.
 */
export function isDue(word: ReviewWord, now: Date): boolean {
  if (!word.dueAt) return true;
  const due = Date.parse(word.dueAt);
  return Number.isNaN(due) ? true : due <= now.getTime();
}

/**
 * The words to ask about, most overdue first.
 *
 * Oldest-due first rather than newest, so a word that has been waiting three
 * weeks is not permanently buried under words saved this morning.
 */
export function due(words: ReviewWord[], now: Date): ReviewWord[] {
  return words
    .filter((w) => isDue(w, now))
    .sort((a, b) => dueTime(a) - dueTime(b));
}

function dueTime(word: ReviewWord): number {
  if (!word.dueAt) return 0;
  const t = Date.parse(word.dueAt);
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Record an answer.
 *
 * Getting it wrong returns the word to the START of the schedule, not back one
 * step. A word you could not produce today is a word you do not know, whatever
 * you managed a fortnight ago, and the gentler version keeps handing people
 * long intervals on words they are actually failing.
 *
 * Getting it right advances one step and no further. Two correct answers in a
 * row is evidence of two correct answers, not of a word that can safely
 * disappear for a month.
 */
export function grade(word: ReviewWord, knew: boolean, now: Date): ReviewWord {
  const step = knew ? Math.min(clampStep(word.step) + 1, REVIEW_STEPS.length - 1) : 0;
  return { ...word, step, dueAt: nextDue(step, now), reviewedAt: now.toISOString() };
}

/**
 * How many words come back within the next `days`, excluding those due now.
 *
 * For a line like "4 more tomorrow" — a reason to come back that is a fact
 * about their own words rather than a streak they will lose.
 */
export function comingUp(words: ReviewWord[], now: Date, days = 1): number {
  const horizon = now.getTime() + days * DAY_MS;
  return words.filter((w) => !isDue(w, now) && dueTime(w) <= horizon).length;
}

/**
 * How settled the list is: words that have reached the last step.
 *
 * Reported as a count of words, never as a percentage or a level. "6 of your
 * 20 words have come back five times and you still had them" is a fact about
 * what they did; "30% fluent" is a number we cannot support.
 */
export function settled(words: ReviewWord[]): number {
  return words.filter((w) => clampStep(w.step) >= REVIEW_STEPS.length - 1 && w.reviewedAt).length;
}
