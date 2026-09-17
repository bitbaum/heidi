import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { MAX_MOVES, MOVE_IDS, REPHRASE_AXES, decodeMoves, moveKey, withReply } from "./moves.ts";
import { LOCALES } from "../../i18n/locales.ts";
import { getDictionary } from "../../i18n/index.ts";

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
    // Pinned so that growing the vocabulary is a deliberate act with a diff,
    // rather than something that happens on the way to somewhere else.
    assert.deepEqual([...MOVE_IDS], ["reply", "rephrase", "grammar"]);
    assert.deepEqual(
      [...REPHRASE_AXES],
      [
        // six tone dials …
        "shorter",
        "warmer",
        "firmer",
        "formal",
        "casual",
        "simpler",
        // … four speech acts …
        "decline",
        "apologise",
        "thank",
        "ask",
        // … and the one that is a variety rather than either.
        "swiss",
      ],
    );
  });

  test("every move has wording in every language", () => {
    /**
     * The claim the pin above USED to make and did not check.
     *
     * It asserted the list and stopped, with a comment saying this made a
     * missing translation a failing test. It did not: nothing here read a
     * dictionary, so adding an axis and forgetting six languages would have
     * passed, and the chip would have rendered blank for every reader who is
     * not German. Checked properly now, in all seven.
     */
    for (const locale of LOCALES) {
      const moves = getDictionary(locale).chat.moves;
      for (const axis of REPHRASE_AXES) {
        const entry = moves[axis as keyof typeof moves];
        assert.ok(entry, `${locale}: no wording for the "${axis}" move`);
        const { label, say } = entry as { label?: string; say?: string };
        assert.ok(label && label.trim().length > 0, `${locale}: the "${axis}" chip has no label`);
        // `say` is what lands in the transcript as the reader's own message.
        // An empty one would send nothing and look like a broken button.
        assert.ok(say && say.trim().length > 0, `${locale}: the "${axis}" move sends no message`);
      }
      for (const id of MOVE_IDS) {
        if (id === "rephrase") continue; // its wording is per axis, checked above
        assert.ok(moves[id], `${locale}: no wording for the "${id}" move`);
      }
    }
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

describe("the reply offer does not depend on the model remembering", () => {
  test("it is added when absent", () => {
    assert.deepEqual(withReply([]), [{ id: "reply" }]);
    assert.deepEqual(withReply([{ id: "rephrase", axis: "shorter" }]), [
      { id: "reply" },
      { id: "rephrase", axis: "shorter" },
    ]);
  });

  test("it is not duplicated when the model already offered it", () => {
    const already = [{ id: "reply" } as const, { id: "rephrase", axis: "formal" } as const];
    assert.deepEqual(withReply([...already]), already);
  });

  test("it goes FIRST, so the cap drops a guess rather than the sure thing", () => {
    const full = [
      { id: "rephrase", axis: "shorter" } as const,
      { id: "rephrase", axis: "warmer" } as const,
      { id: "grammar", topic: "no-preterite" } as const,
    ];
    const result = withReply([...full]);
    assert.equal(result.length, MAX_MOVES, "still within the cap");
    assert.deepEqual(result[0], { id: "reply" });
    // The third guess fell off the end, not the reply.
    assert.equal(result.length, 3);
    assert.ok(!result.some((m) => m.id === "grammar"));
  });
});
