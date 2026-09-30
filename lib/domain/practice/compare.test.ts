import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { compareWords, missingWords } from "./compare.ts";

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

describe("a different form is shown, a different spelling is not", () => {
  test("the reported case: «D'Chatz schlof» against «D Chatz schlaft»", () => {
    // «Chatz» was reported missing because «D'Chatz» was read as one word,
    // and «schlof» passed as a respelling of «schlaft».
    assert.deepEqual(compareWords("D'Chatz schlof uf em Sofa", "D Chatz schlaft uf em Sofa."), {
      missing: [],
      differs: [["schlof", "schlaft"]],
    });
  });

  test("respellings stay silent", () => {
    for (const [typed, pack] of [
      ["Das ish nod gsii.", "Das isch nöd gsi."],
      ["Ebe, gnau.", "Äbe, gnau."],
      ["Mier gönd hei.", "Mir gönd hei."],
    ]) {
      assert.deepEqual(compareWords(typed, pack), { missing: [], differs: [] }, `${typed} / ${pack}`);
    }
  });
});
