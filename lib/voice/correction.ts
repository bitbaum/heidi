import { SEVERITY_RANK, type Severity } from "../variety/pack.ts";
import type { Finding } from "../variety/check.ts";

/**
 * Whether, and how, to correct what the learner produced.
 *
 * Correction is the feature every language product ships and almost every one
 * gets wrong, in one of two directions. Correct nothing and the learner
 * repeats a mistake until it sets. Correct everything and they stop
 * volunteering anything, which removes the production the correction was for.
 * So it is a SETTING, defaulting to the middle.
 *
 * Three rules sit above the setting and cannot be turned on by it. Each one
 * is here because the alternative is not merely unhelpful, it is false.
 *
 * 1. SPELLING IS NEVER CORRECTED. §6 already binds this for the text gate and
 *    the reason is the language, not our politeness: Zurich German has no
 *    standard orthography. `nöd`, `nööd` and `nid` are choices a native writer
 *    makes. Telling somebody their spelling is wrong in a variety that has no
 *    right spelling is inventing an authority and then enforcing it.
 *
 * 2. PRONUNCIATION IS NEVER SCORED. §8 forbids "93% native pronunciation" as
 *    speech-score theatre, and the pipeline makes the ban structural rather
 *    than principled: what arrives here is TEXT, produced by a recogniser.
 *    Notice that this module takes no audio, no confidence values and no
 *    phoneme alignment — there is nothing to score with. Adding a number would
 *    mean inventing one.
 *
 * 3. A TRANSCRIPT'S FORMS BELONG TO THE MACHINE, NOT THE SPEAKER. This is the
 *    one that is easy to get wrong, and it silently ruins the feature. Swiss
 *    German speech recognition — §7, and the /technology page's numbers —
 *    transcribes dialect INTO Standard German, because that is what every
 *    corpus was built to do. So a learner who says a sentence in flawless
 *    Zurich German gets back a Standard German transcript containing `ist`
 *    and `nicht` and very possibly a `ß`, none of which they said. Running the
 *    variety gate over that flags the RECOGNISER and bills it to the learner:
 *    they would be corrected, confidently and in detail, for saying something
 *    correctly. Nothing in the transcript is evidence about which forms they
 *    used, so nothing in the transcript may be corrected for its variety.
 *
 * Rule 3 leaves a real gap and the honest thing is to name it rather than
 * paper over it: Heidi cannot tell a learner whether they SPOKE good Zurich
 * German. Nothing can, reliably, today. What she can do with speech is
 * understand it and answer — which is the thing the learner actually came for,
 * and is what §2 calls exposure that does not withdraw.
 */

export type CorrectionLevel =
  /** Say nothing. For somebody who wants to be understood, not taught. */
  | "off"
  /**
   * Only what is not a form of the language at all. The default: it catches
   * the things that would be wrong in any Swiss German, and stays silent on
   * every regional judgement, which is where confident correction is most
   * often simply provincial.
   */
  | "blocking"
  /**
   * Also forms belonging to another variety — Bernese in a Zurich sentence.
   * For somebody deliberately working on Zurich German specifically, and
   * still never spelling, and still never pronunciation.
   */
  | "all";

export const DEFAULT_CORRECTION: CorrectionLevel = "blocking";

export function isCorrectionLevel(value: unknown): value is CorrectionLevel {
  return value === "off" || value === "blocking" || value === "all";
}

/**
 * Where the text came from. The single most important input here — see rule 3.
 *
 * THE THIRD CASE IS NOT HERE, AND THAT IS DELIBERATE. A learner who speaks and
 * then WRITES DOWN what they said has produced text that is their own rendering
 * of their own speech: the words are theirs, so word choice is judgeable, and
 * `lib/domain/speaking/feedback.ts` is the module that does it. Routing that
 * case to `"spoken"` here would silence the one surface where a spoken take CAN
 * honestly be commented on. It is named in this comment rather than added as a
 * value so that the next person meets the distinction instead of guessing.
 *
 * The two modules also disagree about severity, correctly, and the reason is
 * worth keeping: `feedback.ts` keeps only `foreign` findings and drops
 * `unattested` ones, because an `unattested` finding is ORTHOGRAPHIC and there
 * is no way to SAY a `ß`. This module's `blocking` level does the opposite for
 * typed text, where orthography is exactly what the learner produced and where
 * `unattested` is the most certain judgement available. Same gate, two
 * surfaces, two defensible mappings — not a duplication to be collapsed.
 */
export type Origin =
  /** The learner typed it. Their forms, their choices, correctable. */
  | "typed"
  /** A recogniser produced it from their speech. The forms are its, not theirs. */
  | "spoken";

/**
 * Why nothing was corrected, when nothing was.
 *
 * A key, not a sentence: the seven wordings live in the dictionaries. Silence
 * with no explanation is how a learner concludes a feature is broken — or
 * worse, that they made no mistakes.
 */
export type Silence =
  /** The setting is off. They chose this. */
  | "off"
  /** It was spoken, so the forms are the recogniser's. Rule 3. */
  | "spoken"
  /** Nothing to say: the gate found nothing at this level. */
  | "clean";

export type CorrectionResult = {
  /** What to show, worst first. Empty when `silence` says why. */
  findings: Finding[];
  /** Present exactly when `findings` is empty. */
  silence?: Silence;
};

/** The lowest severity each level is willing to mention. */
const FLOOR: Record<Exclude<CorrectionLevel, "off">, Severity> = {
  blocking: "unattested",
  all: "foreign",
};

/**
 * What to say about the learner's own production.
 *
 * Takes findings rather than text and a pack, so the deterministic gate stays
 * the one implementation of "is this Zurich German" and this stays the one
 * implementation of "should we mention it". Two questions, two functions; the
 * version that did both grew a second copy of the severity ranking.
 */
export function corrections(
  findings: readonly Finding[],
  options: { origin: Origin; level: CorrectionLevel },
): CorrectionResult {
  if (options.level === "off") return { findings: [], silence: "off" };

  // Rule 3, and it is deliberately the FIRST thing checked rather than a
  // filter applied at the end: there is no level, present or future, at which
  // a transcript's forms become evidence about the speaker's.
  if (options.origin === "spoken") return { findings: [], silence: "spoken" };

  const floor = SEVERITY_RANK[FLOOR[options.level]];
  const kept = findings
    .filter((f) => SEVERITY_RANK[f.severity] >= floor)
    // Rules 1 and 2 as a shape rather than a promise: `dispreferred` is house
    // style and `variant` is legitimate spelling variation, and neither is
    // ever a mistake a learner made. The floor already excludes them at both
    // levels; this says so where somebody adding a third level will read it.
    .filter((f) => f.severity !== "dispreferred" && f.severity !== "variant")
    .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || a.index - b.index);

  return kept.length > 0 ? { findings: kept } : { findings: [], silence: "clean" };
}

/**
 * Whether speech can be corrected for its variety at all. It cannot.
 *
 * Exported as a function nobody has to remember, so the UI can ask instead of
 * re-deriving rule 3 from a comment — and so a test can hold the property
 * directly rather than by exercising `corrections` and hoping.
 */
export function canCorrectVariety(origin: Origin): boolean {
  return origin === "typed";
}
