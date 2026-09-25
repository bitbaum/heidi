/**
 * Where somebody hesitated — the one thing only word timings can say.
 *
 * `spoken.ts` measures HOW MUCH hesitation there was, from the signal, and
 * `delivery.ts` knows WHEN each silence happened. Neither knows WHAT CAME NEXT:
 * the signal has no words, and the text has no times. "You stopped for 1.8 s"
 * is a number; "you stopped for 1.8 s before *Termin*" is something a learner
 * can act on, because the word after a long pause is very often the word they
 * were reaching for. That is the whole reason the transcription asks for
 * per-word timings (ai-kit `transcribe({ words: true })`).
 *
 * WHY THIS DOES NOT RECOMPUTE THE PAUSE COUNT. The signal already counts
 * pauses and is the better source for time (see `spoken.ts`). A second count
 * from a recogniser's alignment would sooner or later disagree with the first,
 * and a page showing two different pause counts for one take is showing that
 * neither is trustworthy. This file only NAMES the longest gaps; it reports no
 * totals.
 *
 * NO JUDGEMENT. A pause before a hard word is what speaking a second language
 * sounds like, and native speakers do it too. The output is a list of places,
 * never a score, and it is empty when nothing stands out.
 *
 * Pure: no I/O, no model, same input -> same output.
 */

import { MIN_PAUSE_MS } from "./pause.ts";
import type { TimedWord } from "./fluency.ts";

/**
 * A gap has to be well past an ordinary breath to be worth pointing at.
 *
 * A DECISION in §3's sense. `MIN_PAUSE_MS` is where a gap starts to count as a
 * pause at all; pointing at every one of those would list half the sentence.
 * Three times that is roughly where a listener notices the speaker searching,
 * which is the moment this is meant to find.
 */
export const NOTABLE_PAUSE_MS = MIN_PAUSE_MS * 3;

/** As many places as anybody reads after one take. */
export const MAX_HESITATIONS = 3;

export type Hesitation = {
  /** The word that came after the gap — usually the one being reached for. */
  before: string;
  /** Index of that word in the timed list, so the page can mark it in the text. */
  index: number;
  /** The gap, in ms. */
  ms: number;
};

/**
 * The longest notable gaps between words, in sentence order.
 *
 * Silence before the first word is not included: that is somebody finding the
 * button, not searching for a word — the same rule the signal half applies.
 */
export function hesitations(timed: readonly TimedWord[], limit = MAX_HESITATIONS): Hesitation[] {
  const found: Hesitation[] = [];
  for (let i = 1; i < timed.length; i++) {
    const gapMs = Math.round((timed[i]!.start - timed[i - 1]!.end) * 1000);
    if (gapMs >= NOTABLE_PAUSE_MS) found.push({ before: timed[i]!.word, index: i, ms: gapMs });
  }
  // Longest first to choose, then back into sentence order to read.
  return found
    .sort((a, b) => b.ms - a.ms)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index);
}
