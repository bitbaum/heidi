/**
 * What Heidi says back about a take.
 *
 * Three sources, and keeping them apart is the design:
 *
 *  1. THE RECORDING. Problems with the capture — too short, too quiet, the
 *     microphone clipping. Facts about equipment, never about the speaker.
 *  2. THE DELIVERY. Durations and counts from `delivery.ts`, and the
 *     comparison with this learner's own previous take. A fact about two
 *     recordings, not a placement on a scale nobody validated.
 *  3. THE WORDS. The deterministic variety gate (§6) over the text the LEARNER
 *     CONFIRMED they said. Sourced in the pack, model-free, and the only part
 *     that can say "this is a Bernese form, here it is in Zurich" — which is
 *     the thing an adult actually wants to be told.
 *
 * THE VOCABULARY IS CLOSED, for the reason §9 already gives about the chat's
 * suggestion chips. A note is an id; the wording lives in the dictionaries in
 * seven languages. A sentence the model wrote itself would arrive in whatever
 * language it felt like, could promise a precision this file refuses to claim,
 * and could not be tested — there is no assertion to write about a string that
 * differs every time. A test asserts every id has wording in every locale.
 *
 * WHY SPOKEN TAKES ARE JUDGED ON WORDS AND NOT ON SPELLING.
 *
 * The learner types out what they said, so the text is their own rendering of
 * their own speech. §6 is absolute that telling somebody their spelling is
 * wrong in a variety with no standard spelling is the one thing this product
 * must never do — so only `foreign` findings survive here: a real form that
 * belongs to another variety, which is a word-choice fact and has a spoken
 * correlate. `unattested` findings are orthographic (a `ß` is not something
 * you can say) and are dropped for speech. A pack whose orthography IS
 * standardised would want the other answer; that is a stated limit rather than
 * a solved problem, because no such pack has a speaking surface yet.
 *
 * Pure: no I/O, no model, same input -> same output.
 */

import { check, type Finding } from "../../variety/check.ts";
import type { VarietyPack } from "../../variety/pack.ts";
import { interpretation, STUCK_PAUSE_MS, usable, type Delivery, type Spoken } from "@bitbaum/speechkit";

/**
 * Every note Heidi can make about a take.
 *
 * Closed on purpose — see the header. Adding one without its seven
 * translations fails the build rather than rendering a blank line in six
 * languages.
 */
export const NOTE_IDS = [
  // The recording, not the speaker.
  "recording-too-short",
  "recording-too-quiet",
  "recording-clipped",
  // The delivery, described.
  //
  // `pause-count` and `mean-run` USED TO LIVE HERE and were removed, which is
  // an information-hierarchy fix rather than a loss of information: both are
  // printed as figures directly above the notes, and a sentence that says "3
  // pauses between the stretches of speech" under a tile reading PAUSES 3 is
  // the same fact twice in two typefaces. What survives is what a tile cannot
  // carry — an interpretation, a comparison, or something to do next.
  "longest-pause",
  "no-long-pauses",
  // The delivery, compared with this learner's own last take.
  "fewer-pauses-than-before",
  "more-pauses-than-before",
  "longer-runs-than-before",
  // The words.
  "foreign-form",
  "nothing-flagged",
  // What the recording was made of, which is the denominator the screen never
  // printed. "You spoke for 16 seconds" is two different findings depending on
  // whether the recording was 18 seconds long or 52, and the learner is the
  // only one who knows which — until this says so.
  "share-of-recording",
  // The transcript half. Available only where `evidence.ts` says the words are
  // the learner's own; see `spokenNotes`.
  "hunting-for-words",
  "came-straight-through",
  "filled-pauses",
  "spoke-target-in-bridge",
] as const;

export type NoteId = (typeof NOTE_IDS)[number];

export type Note = {
  id: NoteId;
  /**
   * The number the wording interpolates — seconds for a duration, a count for
   * a count. Rounded here so seven dictionaries do not each decide how.
   */
  value?: number;
  /** For a word note: what was said, what to say instead, and whose form it is. */
  form?: string;
  suggest?: string;
  origin?: string;
};

/** A silence this long is a stall. Defined beside its two siblings — see `speech/pause.ts`. */
const LONG_PAUSE_MS = STUCK_PAUSE_MS;

/**
 * How different two takes must be before the difference is reported.
 *
 * Measurement noise is real: the same person saying the same thing twice will
 * not produce the same pause count. Reporting a delta of one would be telling
 * somebody they improved when nothing happened, which is the flattering lie
 * that makes every other number here untrustworthy.
 */
const PAUSE_DELTA = 2;
const RUN_DELTA_RATIO = 0.2;

/**
 * Below this share of the recording spent speaking, the share is worth saying.
 *
 * Three quarters, so an ordinary answer with ordinary thinking in it passes
 * without comment and a recording that is mostly silence does not. A DECISION,
 * not a finding — it decides when a sentence appears, never what it says.
 */
const QUIET_SHARE = 0.75;

/**
 * Filled pauses worth mentioning at all.
 *
 * `fluency.ts` is explicit that `äh` and `ähm` are NORMAL and that a product
 * treating them as errors teaches somebody to talk like a document. So the
 * count is reported, never corrected, and only once there are enough of them
 * that a learner would recognise the habit in themselves.
 */
const FILLED_PAUSE_FLOOR = 3;

/**
 * Two takes are only comparable if they are roughly the same size.
 *
 * Comparing a ten-second answer with a ninety-second one says nothing about
 * the speaker and everything about the length. Beyond this ratio the
 * comparison is simply not made.
 */
const COMPARABLE_RATIO = 2;

const seconds = (ms: number): number => Math.round(ms / 100) / 10;

/** Problems with the capture. Always first — the rest may be meaningless. */
export function recordingNotes(delivery: Delivery): Note[] {
  const notes: Note[] = [];
  if (delivery.problems.includes("too-short")) notes.push({ id: "recording-too-short" });
  if (delivery.problems.includes("too-quiet")) notes.push({ id: "recording-too-quiet" });
  if (delivery.problems.includes("clipped")) notes.push({ id: "recording-clipped" });
  return notes;
}

/**
 * What the delivery did, and how it compares with last time.
 *
 * Descriptive first, comparative second, and nothing normative in between.
 * There is no "good" number of pauses — that would need a norm for adult
 * learners of Zurich German speaking on a topic they chose, which does not
 * exist and which this product is not going to invent for a progress bar.
 */
export function deliveryNotes(current: Delivery, previous?: Delivery): Note[] {
  if (!usable(current)) return [];

  const notes: Note[] = [];

  if (current.longestPauseMs >= LONG_PAUSE_MS) {
    notes.push({ id: "longest-pause", value: seconds(current.longestPauseMs) });
  } else if (current.runCount > 0) {
    notes.push({ id: "no-long-pauses" });
  }

  /**
   * How much of the recording had speech in it.
   *
   * Reported only when a real share of the file was NOT speech, because on a
   * tight take it is noise — and reported as a share rather than as a verdict,
   * since the same number is a long thoughtful answer or a recorder somebody
   * forgot to stop. Naming it lets the learner tell those apart; naming it for
   * them would be guessing at which.
   *
   * This is the number whose absence made the rest unreadable: the screen
   * printed sixteen seconds of speech with no denominator anywhere on it.
   */
  if (current.totalMs > 0 && current.speechMs / current.totalMs <= QUIET_SHARE) {
    notes.push({ id: "share-of-recording", value: Math.round((current.speechMs / current.totalMs) * 100) });
  }

  if (previous && usable(previous) && comparable(current, previous)) {
    const pauseDelta = previous.pauseCount - current.pauseCount;
    if (pauseDelta >= PAUSE_DELTA) notes.push({ id: "fewer-pauses-than-before", value: pauseDelta });
    else if (pauseDelta <= -PAUSE_DELTA) notes.push({ id: "more-pauses-than-before", value: -pauseDelta });

    if (previous.meanRunMs > 0 && current.meanRunMs > previous.meanRunMs * (1 + RUN_DELTA_RATIO)) {
      notes.push({ id: "longer-runs-than-before", value: seconds(current.meanRunMs - previous.meanRunMs) });
    }
  }

  return notes;
}

/** Same ballpark of length, or the comparison is about the length. */
function comparable(a: Delivery, b: Delivery): boolean {
  const longer = Math.max(a.speechMs, b.speechMs);
  const shorter = Math.min(a.speechMs, b.speechMs);
  return shorter > 0 && longer / shorter <= COMPARABLE_RATIO;
}

/**
 * The words, through the gate the rest of the product already trusts.
 *
 * `text` is what the learner CONFIRMED they said — never a machine transcript
 * they have not seen. For a pack with no dialect ASR there is no machine
 * transcript at all; see `capabilities` and the take route.
 */
export function languageNotes(text: string, pack: VarietyPack): Note[] {
  const { findings } = check(text, pack, "foreign");
  const words = findings.filter(spokenRelevant);
  if (words.length === 0) return [{ id: "nothing-flagged" }];
  return words.map((f) => ({
    id: "foreign-form" as const,
    form: f.form,
    ...(f.suggest ? { suggest: f.suggest } : {}),
    ...(f.origin ? { origin: f.origin } : {}),
  }));
}

/**
 * What the WORDS say about the delivery — the half that needs a transcript.
 *
 * ONLY EVER CALLED WITH THE LEARNER'S OWN WORDS. Either what they typed, or a
 * transcript from a recogniser `evidence.ts` says returns the variety that was
 * spoken. The caller owns that gate — `lib/domain/speaking/varieties.ts` is
 * where it is decided — because this file has no pack and no recogniser and
 * would have to be told the answer anyway.
 *
 * WHAT MAKES THESE ACTIONABLE, which the delivery notes above are not. "You
 * paused four times" is a fact a learner can read and do nothing with: they
 * know they paused. The rate PAIR is different, because the two numbers
 * separate two problems that feel identical from inside and have opposite
 * fixes:
 *
 *   articulation fast, speech slow   the words are there; retrieval is not.
 *                                    Say the same thing again — the same
 *                                    topic, immediately. That is the one
 *                                    intervention this product can hand over,
 *                                    and `speech/repetition.ts` is the ladder
 *                                    for it.
 *   the two together                 no hunting. Whatever is hard here is not
 *                                    word-finding, so being told to practise
 *                                    word-finding would waste the session.
 *
 * `interpretation` answers `unclear` for most first takes and that answer is
 * rendered as nothing at all. A product that always has a verdict is a product
 * whose verdicts mean nothing.
 */
export function spokenNotes(
  delivery: Delivery,
  spoken: Spoken,
  /**
   * Did the learner use TARGET forms while practising the bridge?
   *
   * From `dialect-marker.ts`, run on the transcript by the route. In a
   * diglossic place this is the commonest thing to do by accident and a
   * genuinely useful thing to be told — it is not an error, and the wording
   * says so.
   */
  spoke?: "target" | "bridge" | "unclear",
): Note[] {
  if (!usable(delivery)) return [];

  const notes: Note[] = [];

  const shape = interpretation(delivery, spoken);
  if (shape === "hunting") notes.push({ id: "hunting-for-words" });
  else if (shape === "even") notes.push({ id: "came-straight-through" });

  if (spoken.filledPauseCount >= FILLED_PAUSE_FLOOR) {
    notes.push({ id: "filled-pauses", value: spoken.filledPauseCount });
  }

  if (spoke === "target") notes.push({ id: "spoke-target-in-bridge" });

  return notes;
}

/**
 * A finding about a WORD, not about how it was written.
 *
 * `foreign` means a real form of another variety — something you can hear,
 * which is what a spoken take is made of. Everything else at this threshold is
 * orthography, and §6 forbids telling a learner their Swiss German spelling is
 * wrong. See the header.
 */
function spokenRelevant(finding: Finding): boolean {
  return finding.severity === "foreign";
}

export type Feedback = {
  /** Problems with the capture, when there are any. */
  recording: Note[];
  /** What the delivery did. Empty when the recording was not usable. */
  delivery: Note[];
  /** What the gate found in the words. Empty until the learner confirms text. */
  language: Note[];
};

/**
 * Everything Heidi has to say about one take, in the order it should be read.
 *
 * `said` is optional because the take exists before the learner has written
 * out what they said — the recording is measured immediately and the words are
 * judged when, and only when, the learner has confirmed them.
 */
export function feedbackFor(args: {
  delivery: Delivery;
  previous?: Delivery;
  said?: string;
  pack: VarietyPack;
}): Feedback {
  const said = args.said?.trim() ?? "";
  return {
    recording: recordingNotes(args.delivery),
    delivery: deliveryNotes(args.delivery, args.previous),
    language: said ? languageNotes(said, args.pack) : [],
  };
}
