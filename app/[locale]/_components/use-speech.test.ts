import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Both properties here were found by USING the deployed site, not by reading
 * the code, and both had passed every existing test.
 */

test("the reading is the fleet's hook, and the voice is Heidi's speaker", () => {
  // The hook used to carry its own synthesiser lifecycle. The property now is
  // a JOIN, which is what a source check can see: chatkit's `useSpeech` does
  // the reading, through the speaker that refuses a non-German voice
  // (`lib/voice/speaker.test.ts` holds the refusal itself).
  const hook = readFileSync(new URL("./use-speech.ts", import.meta.url), "utf8");
  assert.match(hook, /import \{ useSpeech as useFleetSpeech \} from "@bitbaum\/chatkit\/react"/);
  assert.match(hook, /useFleetSpeech\(speaker\)/, "the fleet hook is not reading through Heidi's speaker");
  assert.match(hook, /createHeidiSpeaker\(/);
  assert.doesNotMatch(hook, /\.speak\(utterance\)/, "the hook is driving the synthesiser itself again");
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
  //
  // Since chatkit 0.14 the explanation is read by the fleet's row under every
  // answer — `AnswerActions` in the transcript, whose Listen takes the
  // answer's `text` — rather than by a second control of Heidi's own beside
  // it. The property is the same: an understand turn is never silent.
  const transcript = readFileSync(new URL("./chat/transcript.tsx", import.meta.url), "utf8");
  assert.match(
    transcript,
    /<AnswerActions\s[^>]*text=\{m\.answer\.text\}/,
    "the answer prose has no listen control — an understand turn would be silent",
  );
});

test("speaking a dialect line carries the caveat; speaking the explanation does not", () => {
  // The explanation is in the reader's own language and nobody mistakes it for
  // a model of Zurich phonology. The dialect line is exactly what somebody
  // WOULD try to imitate, so it keeps Heidi's own Speak and its warning that a
  // Standard German voice is reading dialect spelling — and the explanation
  // keeps exactly ONE listen control, the row's, not a second of Heidi's.
  const source = readFileSync(new URL("./chat/answer-view.tsx", import.meta.url), "utf8");
  assert.match(source, /<Speak text=\{a\.dialect\} t=\{voiceT\} dialect \/>/, "the dialect line lost its caveat");
  assert.doesNotMatch(source, /<Speak text=\{a\.text\}/, "the explanation would be offered twice — once as dialect");
});
