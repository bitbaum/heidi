import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { shouldAttempt } from "./use-speech.ts";

/**
 * Both properties here were found by USING the deployed site, not by reading
 * the code, and both had passed every existing test.
 */

test("a device with no German voice is not asked to speak", () => {
  // Measured on the live site with a browser that has a synthesiser and zero
  // installed voices: `speechSynthesis.speak()` fired `onerror` with
  // `synthesis-failed`, never fired `onstart`, and said nothing. The button
  // returned to its resting label and the learner was given no reason at all —
  // the dead control `use-dictation.ts` refuses to ship.
  assert.equal(shouldAttempt(null), false);
  assert.equal(shouldAttempt({ name: "Petra", lang: "de-CH" }), true);
});

/**
 * A source-level assertion, in the shape `display.test.ts` already uses for
 * "no component imports the full variety pack". The property is about which
 * parts of an answer can be heard, and there is no way to ask that of a pure
 * function — but there is no way to LOSE it silently either, which is what
 * happened the first time.
 */
test("the answer's own explanation can be spoken, not only the dialect line", () => {
  // The bug this pins: speaking was attached to `a.dialect` and to each
  // suggestion, both of which exist only on a PRODUCE turn. An UNDERSTAND turn
  // — somebody pasting a message they cannot read, which §9 calls the thing
  // the product leads with — carries neither, so the entire spoken feature was
  // absent from the commoner half of the product. Four controls on "how do I
  // say I'll be late"; none on "what does nöd mean".
  const source = readFileSync(new URL("./chat/answer-view.tsx", import.meta.url), "utf8");
  assert.match(
    source,
    /<Speak text=\{a\.text\}/,
    "the answer prose has no speak control — an understand turn would be silent",
  );
});

test("speaking a dialect line carries the caveat; speaking the explanation does not", () => {
  // The explanation is in the reader's own language and nobody mistakes it for
  // a model of Zurich phonology. The dialect line is exactly what somebody
  // WOULD try to imitate, so it keeps the warning that a Standard German voice
  // is reading dialect spelling.
  const source = readFileSync(new URL("./chat/answer-view.tsx", import.meta.url), "utf8");
  assert.match(source, /<Speak text=\{a\.dialect\} t=\{voiceT\} dialect \/>/, "the dialect line lost its caveat");
  assert.match(source, /<Speak text=\{a\.text\} t=\{voiceT\} \/>/, "the explanation should not claim to be dialect");
});
