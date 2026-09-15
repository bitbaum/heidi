import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { MAX_EXAMPLES, MAX_EXAMPLE_LENGTH, demonstrates, usableExamples } from "./example.ts";
import { ZURICH_GERMAN as PACK } from "../../variety/packs/gsw-zh.ts";

describe("meeting a kept word somewhere new", () => {
  test("a good pair survives", () => {
    const { examples, rejected } = usableExamples(
      { examples: ["Chunnsch au, gäll?", "Das isch doch schön, gäll."] },
      "gäll",
      PACK,
    );
    assert.equal(examples.length, 2);
    assert.deepEqual(rejected, []);
  });

  test("a bare array works as well as the wrapped shape", () => {
    // The model is asked for `{ examples: [...] }` and sometimes returns the
    // array alone. That is not worth failing a turn over.
    assert.equal(usableExamples(["Chunnsch au, gäll?"], "gäll", PACK).examples.length, 1);
  });

  test("a sentence that does not contain the word is thrown away", () => {
    // The specific, common failure: asked for a sentence using "Chind", the
    // model writes one using "Chinder". A fine sentence and a useless example,
    // because the learner is reviewing the form they saved.
    const { examples, rejected } = usableExamples(
      { examples: ["Mir händ drü Chinder.", "S Chind schlaft scho."] },
      "Chind",
      PACK,
    );
    assert.deepEqual(examples, ["S Chind schlaft scho."]);
    assert.equal(rejected[0].reason, "does not contain the word");
  });

  test("a sentence in the wrong variety is thrown away", () => {
    // The same gate every other generated line faces. A learner cannot audit
    // this, which is the entire reason it exists — and a wrong form shown as
    // an example is worse than no example.
    const { examples, rejected } = usableExamples(
      { examples: ["Das isch nid güet, gäll.", "Chunnsch au, gäll?"] },
      "gäll",
      PACK,
    );
    assert.deepEqual(examples, ["Chunnsch au, gäll?"]);
    assert.ok(rejected.length === 1 && rejected[0].reason.length > 0, "and it says which form failed");
  });

  test("empty is a normal outcome, not an error", () => {
    // Everything failing the gate means no example. Showing a bad one instead
    // would be lowering the bar to avoid a blank space.
    const { examples } = usableExamples({ examples: ["Das isch nid güet."] }, "gäll", PACK);
    assert.deepEqual(examples, []);
  });

  test("nonsense in, nothing out", () => {
    for (const rubbish of [null, undefined, 42, "a sentence", {}, { examples: "x" }, [1, 2]]) {
      assert.deepEqual(usableExamples(rubbish, "gäll", PACK).examples, [], JSON.stringify(rubbish));
    }
  });

  test("a paragraph is refused", () => {
    const long = `Gäll ${"und so wiiter ".repeat(20)}`;
    assert.ok(long.length > MAX_EXAMPLE_LENGTH);
    const { examples, rejected } = usableExamples({ examples: [long] }, "gäll", PACK);
    assert.deepEqual(examples, []);
    assert.equal(rejected[0].reason, "too long");
  });

  test("two of the same situation is one example", () => {
    const { examples } = usableExamples(
      { examples: ["Chunnsch au, gäll?", "chunnsch au, GÄLL?", "Schön, gäll."] },
      "gäll",
      PACK,
    );
    assert.deepEqual(examples, ["Chunnsch au, gäll?", "Schön, gäll."]);
  });

  test("never more than two, however many come back", () => {
    const many = Array.from({ length: 9 }, (_, i) => `Nummere ${i}, gäll.`);
    assert.equal(usableExamples({ examples: many }, "gäll", PACK).examples.length, MAX_EXAMPLES);
  });

  test("whitespace is tidied, because it reaches a card", () => {
    const { examples } = usableExamples({ examples: ["  Chunnsch   au,\n gäll?  "] }, "gäll", PACK);
    assert.deepEqual(examples, ["Chunnsch au, gäll?"]);
  });
});

describe("does the sentence demonstrate the word", () => {
  test("case does not matter, the way the saved list folds it", () => {
    assert.equal(demonstrates("Gäll, du chunnsch?", "gäll"), true);
    assert.equal(demonstrates("Chunnsch au, gäll?", "Gäll"), true);
  });

  test("a word is matched whole, not inside a longer one", () => {
    // Otherwise "gäll" is "found" in "gället" and the example demonstrates a
    // form the learner never saved.
    assert.equal(demonstrates("Si gälled als zuverlässig.", "gäll"), false);
    assert.equal(demonstrates("Mir händ drü Chinder.", "Chind"), false);
  });

  test("an empty target demonstrates nothing", () => {
    assert.equal(demonstrates("Irgendöppis.", "   "), false);
  });

  test("a target with regex characters is matched literally", () => {
    assert.equal(demonstrates("Das chostet 5.- gäll", "5.-"), true);
    assert.equal(demonstrates("Das chostet 5X- gäll", "5.-"), false, "the dot is not a wildcard");
  });
});
