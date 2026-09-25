import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { usable, type Delivery } from "@bitbaum/speechkit";
import { deliveryNotes, recordingNotes, spokenNotes } from "./feedback.ts";

/**
 * A recording this product will not describe, it will not transcribe either.
 *
 * FOUND BY MEASUREMENT, NOT BY READING. `scripts/audit/speaking.mjs` drives
 * the speaking page in a real Chrome with a fake microphone — which emits a
 * tone, not speech. The tone came back from the transcriber as «Bis zum
 * nächsten Mal.»: four words nobody said, printed under "this is what we
 * heard", counted into the word total, and stored on the take.
 *
 * That is not a broken service. It is what a Whisper-family model does with
 * audio containing no speech — it returns something plausible rather than
 * nothing. And on a phone held in a corridor, which is the setting this
 * product is built for, a take that caught only room noise is ordinary.
 *
 * THE RULE NEEDS NO NEW JUDGEMENT, which is why it is worth having. The page
 * already asks `usable()` — "is there enough here to say anything at all" —
 * and every one of its three feedback functions returns nothing when the
 * answer is no. The transcript was the single thing that ignored it, so the
 * product would withhold its own honest measurements of a two-second false
 * start and then print an invented sentence about the same audio.
 *
 * WHY A UNIT TEST WHEN A BROWSER FOUND IT. Because the browser harness needs a
 * browser, a network and four seconds per take, and this is the invariant
 * underneath it: whatever `usable()` comes to mean, the transcript and the
 * notes must agree about it. The harness proves the wiring; this proves the
 * rule, on every commit, in milliseconds.
 */

/** A delivery with nothing wrong with it, as a starting point. */
function ok(): Delivery {
  return {
    totalMs: 12_000,
    speechMs: 8_000,
    pauseMs: 4_000,
    pauseCount: 3,
    longestPauseMs: 900,
    runCount: 4,
    meanRunMs: 2_000,
    phonationRatio: 0.66,
    clippedRatio: 0,
    problems: [],
  };
}

describe("a take too poor to describe is too poor to transcribe", () => {
  test("`usable` is false for exactly the problems that silence the notes", () => {
    for (const problem of ["too-short", "too-quiet"] as const) {
      const delivery: Delivery = { ...ok(), problems: [problem] };

      assert.equal(usable(delivery), false, `${problem} should be unusable`);

      /**
       * THE TWO THAT MEASURE GO SILENT; THE ONE THAT EXPLAINS SPEAKS.
       *
       * This test asserted all three were silent and was wrong, which is the
       * useful thing it did. `recordingNotes` is not a measurement of the
       * speech — it is the note that says WHY there is nothing to measure
       * ("record a bit more"), and suppressing it would leave somebody with a
       * blank panel and no idea what went wrong.
       *
       * So the shape the transcript has to match is `deliveryNotes` and
       * `spokenNotes`: say nothing about audio there is nothing to say about.
       * The transcript is a claim about what was said, which is the same kind
       * of claim as the pace and the pauses, and not the same kind as "that
       * was too short".
       */
      assert.notDeepEqual(recordingNotes(delivery), [], `${problem}: should be EXPLAINED, not hidden`);
      assert.deepEqual(deliveryNotes(delivery), [], `${problem}: delivery notes should stay silent`);
      assert.deepEqual(
        spokenNotes(delivery, { filledPauseCount: 0, wordCount: 0, speechRate: 0, repeated: [] } as never),
        [],
        `${problem}: spoken notes should stay silent`,
      );
    }
  });

  test("`clipped` alone is still usable — loud is not unreadable", () => {
    // The guard must not be "any problem at all". A clipped recording is too
    // loud, which is a thing worth telling somebody and no reason to refuse to
    // read it; widening the rule to every problem would throw away good takes.
    const delivery: Delivery = { ...ok(), problems: ["clipped"], clippedRatio: 0.2 };
    assert.equal(usable(delivery), true);
  });

  test("a clean delivery is usable", () => {
    assert.equal(usable(ok()), true);
  });
});
