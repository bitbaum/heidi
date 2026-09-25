import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { focusWord, learnMoves, MAX_LEARN } from "./learn.ts";
import type { Answer } from "./types.ts";

const base: Answer = { mode: "understand", text: "…", glosses: [], suggestions: [], model: "m" } as Answer;

describe("what to learn next, from the answer's structure alone", () => {
  test("a Zurich line is offered word by word", () => {
    const m = learnMoves({ ...base, dialect: "Mir gaht's guet." });
    assert.deepEqual(m[0], { id: "breakdown", text: "Mir gaht's guet." });
  });

  test("a genuinely different word gets similar, story — within the cap", () => {
    const m = learnMoves({ ...base, dialect: "Mir gaht's guet.", glosses: [{ form: "gaht's", standard: "geht es", english: "", rule: "" }] });
    assert.deepEqual(m.map((x) => x.id), ["breakdown", "similar", "story"]);
    assert.ok(m.length <= MAX_LEARN);
  });

  test("with no line, the word moves fill the row", () => {
    const m = learnMoves({ ...base, glosses: [{ form: "Eschtrich", standard: "Dachboden", english: "", rule: "" }] });
    assert.deepEqual(m.map((x) => x.id), ["similar", "story", "examples"]);
  });

  test("a word that is only the German one respelled is not the focus", () => {
    const a = { ...base, glosses: [{ form: "Gäld", standard: "Geld", english: "", rule: "" }, { form: "öppis", standard: "etwas", english: "", rule: "" }] };
    // Gäld/Geld fold to the same letters except one vowel — they differ, so
    // the first one IS a different word; the respelling case is exact folding.
    assert.equal(focusWord({ ...base, glosses: [{ form: "Hand", standard: "Hand", english: "", rule: "" }] }), undefined);
    assert.equal(focusWord(a), "Gäld");
  });

  test("a plain explanation gets nothing — no generic toolbar", () => {
    assert.deepEqual(learnMoves(base), []);
    assert.deepEqual(learnMoves({ ...base, dialect: "   " }), []);
  });
});
