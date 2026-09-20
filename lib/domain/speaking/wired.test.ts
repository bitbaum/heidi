import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spokenVarieties } from "./varieties.ts";
import { VARIETY } from "../../variety/active.ts";

/**
 * THE DEFECT THIS FILE EXISTS FOR, in two halves.
 *
 * FIRST: an engine nothing called. `speech/fluency.ts`, `speech/syllables.ts`
 * and `speech/grammar.ts` were written, documented and unit-tested, and a
 * `grep` for their importers found `capability.ts` naming their PATHS in
 * strings and nothing else in the whole app. Meanwhile `packs/gsw-zh.ts` had
 * declared a faithful bridge recogniser from the day it was written. Every
 * unit test passed, because each half worked; the product shipped one path for
 * everybody because the branch that would have used the other was never
 * written. That is the same failure `lib/voice/wired.test.ts` exists for — a
 * setting nothing read — and it is caught the same way.
 *
 * SECOND, and more serious: the sentence "the sound never leaves your device"
 * is printed under the practice screen, and a mode that uploads the recording
 * now exists a tap away from it. Two ways for that to become a lie, both
 * one careless edit wide: the recorder keeping the audio by default, or the
 * upload firing on a take that was not recorded in an uploading mode. Neither
 * would fail a unit test and neither is visible in the UI.
 *
 * Source-level assertions, in the shape `display.test.ts` uses for "no
 * component imports the full variety pack". What failed here is a JOIN, and a
 * join is exactly what a source check can see.
 */

const read = (rel: string) => readFileSync(new URL(rel, import.meta.url), "utf8");

const PRACTICE = "../../../app/[locale]/_components/speaking-practice.tsx";
const RECORDER = "../../../app/[locale]/_components/use-recorder.ts";

test("the pack's own capability declarations reach the practice screen", () => {
  // The projection is what a component may read, so the wiring has to run
  // through it rather than around it.
  const display = read("../../variety/display.ts");
  assert.match(display, /spokenVarieties\(VARIETY\)/, "DISPLAY does not project the practice varieties");

  const practice = read(PRACTICE);
  assert.match(practice, /DISPLAY\.practice/, "the practice screen does not read the projected varieties");
  // The IMPORT, not the word: this file's own prose names `variety/active` to
  // explain why it may not be imported, and a bare substring match would fail
  // on the sentence describing the rule.
  assert.doesNotMatch(
    practice,
    /from ["'][^"']*variety\/active["']/,
    "the practice screen must read DISPLAY, never the pack — see display.test.ts",
  );
});

test("the transcript measures are called by something a learner can reach", () => {
  const practice = read(PRACTICE);
  assert.match(practice, /measureSpoken\(/, "nothing computes the rate pair");
  assert.match(practice, /spokenNotes\(/, "nothing turns it into sentences");

  // And the sentences have to be joined to wording, or six locales render a
  // blank line. The map is the join; this asserts it is the one being used.
  assert.match(practice, /NOTE_WORDING\[/, "notes are not rendered through the wording map");
});

test("the transcript half is offered exactly where the pack says it is honest", () => {
  // Not a fact about German: a fact about what `evidence.ts` concluded from
  // what the pack declared. If a future pack turns the bridge off, this moves
  // with it rather than failing.
  const bridge = spokenVarieties(VARIETY).find((v) => v.id === "bridge");
  assert.ok(bridge, "Zurich German declares a faithful bridge recogniser; nothing offers it");
  assert.equal(bridge.transcribable, true);
  assert.equal(
    spokenVarieties(VARIETY)[0]!.transcribable,
    false,
    "the dialect must NOT be transcribed — §7, and the whole reason the learner types",
  );
});

/**
 * THE PRIVACY JOIN.
 *
 * `privacy` says the sound never leaves the device. `privacyTranscribed` says
 * it goes to a service. Rendering the first over a take that did the second is
 * the one false statement this product cannot afford, and it is one deleted
 * ternary away at all times.
 */
test("the recorder keeps no audio unless it was asked to, before the take", () => {
  const recorder = read(RECORDER);
  assert.match(
    recorder,
    /retainAudio\s*=\s*false/,
    "retaining the recording must be the OPT-IN, or the default silently uploads",
  );
  assert.match(
    recorder,
    /if \(keep\) setAudio\(blob\)/,
    "the recorder must hand the blob over only on the take's own retain flag",
  );
});

test("the upload is gated on the mode the take was recorded in", () => {
  const practice = read(PRACTICE);
  assert.match(
    practice,
    /if \(!audio \|\| !takeId \|\| !transcribes\) return;/,
    "the transcription effect must refuse a take recorded in a non-transcribing mode",
  );
  assert.match(
    practice,
    /useRecorder\(\{ retainAudio: transcribes \}\)/,
    "the recorder must be told which mode this is before the microphone opens",
  );
});

test("the privacy line describes the mode the learner is actually in", () => {
  const practice = read(PRACTICE);
  assert.match(
    practice,
    /transcribes \? t\.privacyTranscribed : t\.privacy/,
    "one of the two privacy sentences is being printed unconditionally, and one of them is then false",
  );
});
