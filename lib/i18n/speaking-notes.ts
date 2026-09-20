import type { NoteId } from "../domain/speaking/feedback.ts";
import type { Dictionary } from "./dictionaries/de.ts";

/**
 * Which sentence a note id is rendered as.
 *
 * SEPARATE FROM THE COMPONENT so it can be tested. The domain produces ids and
 * the dictionaries hold wording in seven languages; this is the join between
 * them, and a join nobody can assert on is how a feature ends up rendering a
 * blank line in six languages and nobody notices for a month.
 *
 * Two ids are deliberately absent. `foreign-form` interpolates a form, an
 * origin and a suggestion into one of two templates depending on whether the
 * pack offers a replacement, and `nothing-flagged` is a single key with no
 * variables — neither is a plain id-to-sentence lookup, and pretending they
 * were would make this map lie about its own shape.
 */
export type PlainNoteId = Exclude<NoteId, "foreign-form" | "nothing-flagged">;

export const NOTE_WORDING: Record<PlainNoteId, keyof Dictionary["speaking"]["notes"]> = {
  "recording-too-short": "recordingTooShort",
  "recording-too-quiet": "recordingTooQuiet",
  "recording-clipped": "recordingClipped",
  "longest-pause": "longestPause",
  "no-long-pauses": "noLongPauses",
  "fewer-pauses-than-before": "fewerPausesThanBefore",
  "more-pauses-than-before": "morePausesThanBefore",
  "longer-runs-than-before": "longerRunsThanBefore",
  "share-of-recording": "shareOfRecording",
  "hunting-for-words": "huntingForWords",
  "came-straight-through": "cameStraightThrough",
  "filled-pauses": "filledPauses",
  "spoke-target-in-bridge": "spokeTargetInBridge",
};

/** The ids whose wording carries a number to interpolate. */
export const NUMERIC_NOTES: readonly PlainNoteId[] = [
  "longest-pause",
  "fewer-pauses-than-before",
  "more-pauses-than-before",
  "longer-runs-than-before",
  "share-of-recording",
  "filled-pauses",
];
