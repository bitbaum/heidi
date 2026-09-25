import { test } from "node:test";
import assert from "node:assert/strict";
import { ZURICH_GERMAN } from "./packs/gsw-zh.ts";
import { UKRAINIAN } from "./packs/uk.ts";
import type { VarietyPack } from "./pack.ts";
import { countSyllables, evidenceFrom, mayJudgeForm } from "@bitbaum/speechkit";

/**
 * The speech profile, checked over EVERY pack.
 *
 * The contract is the point of the whole variety layer: a half-finished second
 * language turns the build red rather than shipping. These run over both packs
 * for the same reason the rest of the pack tests do — an abstraction with one
 * instance is a guess.
 */
const PACKS: Array<[string, VarietyPack]> = [
  ["gsw-zh", ZURICH_GERMAN],
  ["uk", UKRAINIAN],
];

test("every pack supplies what the speech engine needs", () => {
  for (const [name, pack] of PACKS) {
    assert.ok(pack.speech.lang.length > 0, `${name} has no synthesiser tag`);
    assert.ok(pack.speech.vowels.length >= 5, `${name} declares too few vowels to count a syllable`);
    assert.ok(pack.speech.fillers.length > 0, `${name} names nothing this language hesitates with`);
    // `null` is a legitimate answer and an empty string is not — the first says
    // "there is no checker for this variety", the second says nothing.
    assert.ok(
      pack.speech.grammarCode === null || pack.speech.grammarCode.length > 0,
      `${name} has a grammar code that is neither a code nor an honest null`,
    );
  }
});

test("every pack declares what recognition DOES, not merely whether it exists", () => {
  for (const [name, pack] of PACKS) {
    const r = pack.capabilities.recognition;
    assert.equal(typeof r.available, "boolean", `${name} does not say whether recognition exists`);
    assert.equal(typeof r.returnsSpokenVariety, "boolean", `${name} does not say what it returns`);
    if (r.available) {
      assert.ok(
        r.wer === undefined || (r.wer >= 0 && r.wer <= 100),
        `${name} reports an impossible word error rate`,
      );
    }
  }
});

/**
 * The contrast the field exists for. If these two ever answer the same, either
 * a pack is wrong or the distinction has been collapsed back into a boolean.
 */
test("THE TWO PACKS DISAGREE, and that is the whole design", () => {
  assert.equal(
    evidenceFrom(ZURICH_GERMAN.capabilities.recognition),
    "meaning-only",
    "dialect recognition translates the variety away; the transcript is not the learner's forms",
  );
  assert.equal(
    evidenceFrom(UKRAINIAN.capabilities.recognition),
    "words",
    "Ukrainian recognition returns Ukrainian, so the transcript IS their words",
  );

  assert.equal(mayJudgeForm(ZURICH_GERMAN.capabilities.recognition), false);
  assert.equal(mayJudgeForm(UKRAINIAN.capabilities.recognition), true);
});

/**
 * Why a speaking surface can exist for Heidi at all today.
 */
test("Zurich German's BRIDGE can be judged even though the dialect cannot", () => {
  const bridge = ZURICH_GERMAN.capabilities.bridgeRecognition;
  assert.ok(bridge, "the diglossic half is the one that works, and it has to be declared");
  assert.equal(mayJudgeForm(bridge), true, "Standard German recognition returns Standard German");

  // And the pack names a checker for it, so the grammar half is reachable too.
  assert.equal(ZURICH_GERMAN.speech.grammarCode, null, "no checker exists for the dialect");
  assert.ok(ZURICH_GERMAN.speech.bridgeGrammarCode, "one exists for the bridge");
});

test("the vowels each pack declares actually count its own words", () => {
  // The rule is generic; the letters are not. A pack whose vowels do not match
  // its own script counts every word as one syllable and nothing fails.
  assert.equal(countSyllables("Chrüzlistrasse", { vowels: ZURICH_GERMAN.speech.vowels, adjacentVowelsMerge: ZURICH_GERMAN.speech.adjacentVowelsMerge }), 4);
  assert.equal(countSyllables("дякую", { vowels: UKRAINIAN.speech.vowels, adjacentVowelsMerge: UKRAINIAN.speech.adjacentVowelsMerge }), 3);

  // Cross-applied, each rule is blind to the other's script — which is exactly
  // what a hardcoded engine would have been for the second language it met.
  assert.equal(countSyllables("дякую", { vowels: ZURICH_GERMAN.speech.vowels, adjacentVowelsMerge: ZURICH_GERMAN.speech.adjacentVowelsMerge }), 1);
});

/**
 * §4's house rule, enforced on the one constant that was breaking it.
 */
test("no synthesiser tag is written into engine code", () => {
  // `SPEECH_LANG` was `"de-CH"` inside lib/voice, so a Lesya build would have
  // kept asking for Swiss German. It reads the pack now, and this asserts the
  // two packs genuinely differ rather than both happening to say de-CH.
  assert.notEqual(ZURICH_GERMAN.speech.lang, UKRAINIAN.speech.lang);
  assert.match(ZURICH_GERMAN.speech.lang, /^de-CH$/, "no platform ships a gsw voice; de-CH is the honest ask");
});
