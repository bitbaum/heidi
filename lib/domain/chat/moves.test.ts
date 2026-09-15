import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { MAX_MOVES, MOVE_IDS, REPHRASE_AXES, decodeMoves, moveKey } from "./moves.ts";

describe("what Heidi offers to do next", () => {
  test("a reply move survives", () => {
    assert.deepEqual(decodeMoves([{ id: "reply" }]), [{ id: "reply" }]);
  });

  test("a rephrase move needs a known axis", () => {
    assert.deepEqual(decodeMoves([{ id: "rephrase", axis: "firmer" }]), [{ id: "rephrase", axis: "firmer" }]);

    // An axis we do not have a translation for is a chip with no label, which
    // renders as a blank button that does nothing when pressed.
    assert.deepEqual(decodeMoves([{ id: "rephrase", axis: "sarcastic" }]), []);
    assert.deepEqual(decodeMoves([{ id: "rephrase" }]), [], "an axis is not optional");
  });

  test("an id we do not recognise is dropped, never rendered", () => {
    // The model will invent moves — that is what models do. A chip whose press
    // we cannot honour is worse than no chip: it promises something.
    assert.deepEqual(decodeMoves([{ id: "translate" }, { id: "call-my-landlord" }]), []);
    assert.deepEqual(
      decodeMoves([{ id: "translate" }, { id: "reply" }]),
      [{ id: "reply" }],
      "and the good ones beside it still survive",
    );
  });

  test("nonsense in, nothing out", () => {
    for (const rubbish of [null, undefined, "reply", 42, {}, [null], [42], ["reply"], [{ id: 7 }]]) {
      assert.deepEqual(decodeMoves(rubbish), [], `${JSON.stringify(rubbish)} should produce no moves`);
    }
  });

  test("the same suggestion twice is one suggestion and one wasted slot", () => {
    assert.deepEqual(
      decodeMoves([
        { id: "rephrase", axis: "shorter" },
        { id: "rephrase", axis: "shorter" },
        { id: "reply" },
      ]),
      [{ id: "rephrase", axis: "shorter" }, { id: "reply" }],
    );

    assert.deepEqual(decodeMoves([{ id: "reply" }, { id: "reply" }]), [{ id: "reply" }]);
  });

  test("two rephrases on DIFFERENT axes are two suggestions", () => {
    assert.equal(
      decodeMoves([
        { id: "rephrase", axis: "shorter" },
        { id: "rephrase", axis: "warmer" },
      ]).length,
      2,
    );
  });

  test("more than three is cut to three", () => {
    // Three chips is a suggestion; six is a menu, and a menu asks the person
    // to choose all over again — which is what the mode switch did.
    const many = REPHRASE_AXES.map((axis) => ({ id: "rephrase", axis }));
    assert.equal(decodeMoves(many).length, MAX_MOVES);
    assert.equal(MAX_MOVES, 3);
  });

  test("the key a move looks its wording up under is stable", () => {
    assert.equal(moveKey({ id: "reply" }), "reply");
    assert.equal(moveKey({ id: "rephrase", axis: "formal" }), "formal");
  });

  test("the vocabulary is closed, and these are its members", () => {
    // Pinned so that adding a move without adding its seven translations is a
    // failing test rather than a blank chip in six languages.
    assert.deepEqual([...MOVE_IDS], ["reply", "rephrase", "grammar"]);
    assert.deepEqual(
      [...REPHRASE_AXES],
      ["shorter", "warmer", "firmer", "formal", "casual", "simpler", "swiss"],
    );
  });
});

test("a grammar move carries a topic, and the topic must look like an id", () => {
  assert.deepEqual(decodeMoves([{ id: "grammar", topic: "no-preterite" }]), [
    { id: "grammar", topic: "no-preterite" },
  ]);

  // It becomes a URL fragment, so the shape is checked here even though
  // whether the topic EXISTS is the renderer's question.
  assert.deepEqual(decodeMoves([{ id: "grammar", topic: "../../etc/passwd" }]), []);
  assert.deepEqual(decodeMoves([{ id: "grammar", topic: "Not An Id" }]), []);
  assert.deepEqual(decodeMoves([{ id: "grammar" }]), [], "a topic is not optional");
});

test("two grammar moves on different topics are two suggestions", () => {
  assert.equal(
    decodeMoves([
      { id: "grammar", topic: "no-preterite" },
      { id: "grammar", topic: "wo-relative" },
    ]).length,
    2,
  );
  assert.equal(
    decodeMoves([
      { id: "grammar", topic: "no-preterite" },
      { id: "grammar", topic: "no-preterite" },
    ]).length,
    1,
    "and the same topic twice is one",
  );
});
