import { test } from "node:test";
import assert from "node:assert/strict";
import { looksLikeSilence } from "./transcription.ts";

// Both of these came out of this project's own endpoint, not a list found
// online: a pure tone transcribed as "Amen.", and silence from a synthetic
// microphone as "Untertitelung des ZDF, 2020".
test("the model's silence artefacts are not treated as speech", () => {
  for (const artefact of [
    "Untertitelung des ZDF, 2020",
    " Untertitel im Auftrag des ZDF ",
    "Vielen Dank.",
    "Thank you.",
    "Thanks for watching!",
    " Amen.",
    "Musik",
    "Applaus",
    "",
    "   ",
    "...",
  ]) {
    assert.equal(looksLikeSilence(artefact), true, JSON.stringify(artefact));
  }
});

test("anything a person would actually dictate passes through", () => {
  for (const said of [
    "Chunnsch au no verbi hüt Abig?",
    "Vielen Dank für Ihre Hilfe, können Sie mir das übersetzen?",
    "Thank you for the quick reply, I will come by tomorrow.",
    "Sag ihnen, dass ich zehn Minuten später komme.",
    "Musik hören ist mein Hobby",
    "you know what I mean",
  ]) {
    assert.equal(looksLikeSilence(said), false, said);
  }
});

// A substring rule would have eaten the two sentences above that BEGIN with an
// artefact. Only a whole transcript that is nothing but the artefact counts.
test("an artefact at the start of a real sentence is still a real sentence", () => {
  assert.equal(looksLikeSilence("Vielen Dank, und wie geht es weiter?"), false);
  assert.equal(looksLikeSilence("Thank you, could you repeat that?"), false);
});
