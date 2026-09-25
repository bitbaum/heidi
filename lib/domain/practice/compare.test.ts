import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { missingWords } from "./compare.ts";

describe("what the learner left out — never how they spelled it", () => {
  test("the reported case: a missing word is shown, a respelled one is not", () => {
    assert.deepEqual(missingWords("Ebe, das han ich gmeint.", "Äbe, gnau das han ich gmeint."), ["gnau"]);
  });

  test("a different spelling of every word reports nothing", () => {
    // §6: no fixed orthography. «nöd»/«nod», «gsi»/«gsii», «isch»/«ish».
    assert.deepEqual(missingWords("Das ish nod gsii.", "Das isch nöd gsi."), []);
  });

  test("case and diacritics are never differences", () => {
    assert.deepEqual(missingWords("SCHOGUET", "schöguet"), []);
  });

  test("nothing typed is not the same as everything missing", () => {
    assert.deepEqual(missingWords("", "Äbe, gnau."), []);
    assert.deepEqual(missingWords("   ", "Äbe, gnau."), []);
  });

  test("a word repeated in the line is reported once", () => {
    assert.deepEqual(missingWords("ja", "gnau, gnau"), ["gnau"]);
  });
});
