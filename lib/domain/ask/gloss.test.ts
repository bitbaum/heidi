import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAnswer } from "./parse.ts";
import { ZURICH_GERMAN } from "../../variety/packs/gsw-zh.ts";

/**
 * Guards against the model inventing linguistics. Split from parse.test.ts
 * because these are claims about the *pack's* authority, not about parsing.
 */

function glossesFrom(glosses: unknown) {
  return parseAnswer(JSON.stringify({ meaning: "x", glosses }), ZURICH_GERMAN, "understand", "m").glosses;
}

test("a correspondence the pack vouches for survives", () => {
  const [g] = glossesFrom([{ form: "Chind", standard: "Kind", english: "child", rule: "k → ch" }]);
  assert.equal(g.rule, "k → ch");
});

test("an invented correspondence is dropped, the gloss is kept", () => {
  // The real observed failure: "Kauz" is a Zurich bar, not a typo for Huus,
  // and "k → h" is not a sound law of anything.
  const [g] = glossesFrom([{ form: "Kauz", standard: "Huus", english: "house", rule: "k → h, au → uu" }]);
  assert.equal(g.rule, "", "the fabricated rule must not reach the learner");
  assert.equal(g.form, "Kauz", "but the word is still glossed");
});

test("arrow and spacing variants still match the pack", () => {
  assert.equal(glossesFrom([{ form: "isch", standard: "ist", english: "is", rule: "st -> sch" }])[0].rule, "st -> sch");
  assert.equal(glossesFrom([{ form: "isch", standard: "ist", english: "is", rule: "ST  →  SCH" }])[0].rule, "ST  →  SCH");
});

test("a word glossed against itself is dropped entirely", () => {
  assert.deepEqual(glossesFrom([{ form: "freundlich", standard: "freundlich", english: "friendly", rule: "" }]), []);
  assert.deepEqual(glossesFrom([{ form: "Ich", standard: "ich", english: "I", rule: "" }]), []);
});

test("a gloss with no bridge word is still useful and kept", () => {
  const [g] = glossesFrom([{ form: "gsi", standard: "", english: "been", rule: "" }]);
  assert.equal(g.form, "gsi");
});
