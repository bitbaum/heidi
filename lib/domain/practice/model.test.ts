import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_MODEL, areasOf, decodeModel, observe, pressure, pressureOf, weakest } from "./model.ts";
import { orderSession } from "./session.ts";
import type { PracticeItem } from "./types.ts";

/** A cloze item from a grammar topic, which is the commonest shape. */
function topicItem(topic: string, id = topic): PracticeItem {
  return {
    id: `cloze:${id}`,
    kind: "cloze",
    marking: "self",
    prompt: "Ich bi geschter hei ____.",
    answer: "gange",
    bridge: "Ich ging gestern nach Hause.",
    source: { kind: "grammar", topic },
  };
}

describe("the learner model", () => {
  test("a skip is not a miss, and is not recorded at all", () => {
    const after = observe(EMPTY_MODEL, topicItem("no-preterite"), "skipped");
    assert.deepEqual(after, EMPTY_MODEL, "a skip says something about attention, not about knowledge");
  });

  test("a scene line counts towards both the scene and its topic", () => {
    // The whole reason `situation` sources carry a topic: a learner who keeps
    // missing `am-progressive` should be caught whether they met it in the
    // grammar examples or on a ward.
    const item: PracticeItem = {
      id: "cloze:handover:am",
      kind: "cloze",
      marking: "self",
      prompt: "Si isch ____ warte uf d Tochter.",
      answer: "am",
      bridge: "Sie wartet auf die Tochter.",
      source: { kind: "situation", scene: "handover", topic: "am-progressive" },
    };

    assert.deepEqual(areasOf(item), [
      { axis: "scenes", id: "handover" },
      { axis: "topics", id: "am-progressive" },
    ]);

    const after = observe(EMPTY_MODEL, item, "wrong");
    assert.equal(after.scenes.handover.missed, 1);
    assert.equal(after.topics["am-progressive"].missed, 1);
  });

  test("a kept word is left to its own schedule", () => {
    // Two mechanisms moving the same word would fight, and `review.ts` is the
    // one with the evidence behind it.
    const item: PracticeItem = {
      id: "recall:chunnsch",
      kind: "recall",
      marking: "self",
      prompt: "Chunnsch",
      answer: "kommst du",
      source: { kind: "saved" },
    };
    assert.deepEqual(areasOf(item), []);
    assert.deepEqual(observe(EMPTY_MODEL, item, "wrong"), EMPTY_MODEL);
  });

  test("one wrong answer does not outrank a long record of being wrong", () => {
    /**
     * THE REASON THE RATE IS SMOOTHED, as a test rather than as a comment.
     *
     * Raw, one miss out of one is 1.0 and beats nine out of twenty (0.45) —
     * so the first question somebody ever got wrong would own their next four
     * sessions. Adding a notional right answer pulls small samples down until
     * there is enough of them to mean something.
     */
    const fresh = pressure({ asked: 1, missed: 1 });
    const chronic = pressure({ asked: 20, missed: 9 });
    assert.ok(chronic > fresh, `chronic ${chronic} should outrank a single miss ${fresh}`);
  });

  test("never asked is not the same as weak", () => {
    assert.equal(pressure(undefined), 0);
    assert.equal(pressure({ asked: 0, missed: 0 }), 0);
  });

  test("weakest refuses to name anything on a single answer", () => {
    const model = observe(EMPTY_MODEL, topicItem("wo-relative"), "wrong");
    assert.deepEqual(weakest(model, "topics"), [], "one miss is not evidence of a weakness");

    const twice = observe(model, topicItem("wo-relative", "wo-relative-2"), "wrong");
    assert.deepEqual(
      weakest(twice, "topics").map((w) => w.id),
      ["wo-relative"],
    );
  });

  test("what was written comes back — the round trip the store actually does", () => {
    /**
     * THE TEST THAT WAS MISSING, AND THE ONE THAT WAS WRONG.
     *
     * The previous version of this case passed decodeModel OBJECTS. It never
     * touched the contract the store uses: `createBrowserStore` writes
     * `JSON.stringify(value)` and hands `localStorage.getItem(key)` — a STRING
     * — straight to the decoder. Fed a string, the old decoder's
     * `typeof raw !== "object"` was true of every value ever stored, so it
     * returned EMPTY_MODEL on every read and the learner model never survived
     * a reload. The test passed throughout, because it was asking a question
     * nothing in the product asks.
     *
     * So this one goes through `JSON.stringify` exactly as the store does.
     */
    let model = EMPTY_MODEL;
    model = observe(model, topicItem("wo-relative", "a"), "wrong");
    model = observe(model, topicItem("wo-relative", "b"), "right");

    const back = decodeModel(JSON.stringify(model));
    assert.deepEqual(back.topics["wo-relative"], { asked: 2, missed: 1 }, "the model did not survive storage");
    assert.deepEqual(back, model, "something was dropped in the round trip");
  });

  test("decoding survives anything that is in storage", () => {
    assert.deepEqual(decodeModel(""), EMPTY_MODEL);
    assert.deepEqual(decodeModel("nonsense"), EMPTY_MODEL);
    assert.deepEqual(decodeModel("null"), EMPTY_MODEL);
    assert.deepEqual(decodeModel("[1,2,3]"), EMPTY_MODEL);
    assert.deepEqual(decodeModel(JSON.stringify({ topics: { a: { asked: "x", missed: 1 } } })), EMPTY_MODEL);
    assert.deepEqual(decodeModel(JSON.stringify({ topics: { a: { asked: -3, missed: 1 } } })), EMPTY_MODEL);
    assert.deepEqual(decodeModel(JSON.stringify({ topics: { a: { asked: 4.7, missed: 2 } } })).topics.a, {
      asked: 4,
      missed: 2,
    });
  });

  test("a model stored before the `lines` axis existed still decodes", () => {
    // An existing learner must not have their topic history thrown away by
    // the arrival of a fifth axis.
    const old = JSON.stringify({ topics: { a: { asked: 3, missed: 1 } }, scenes: {}, groups: {}, words: {} });
    const back = decodeModel(old);
    assert.deepEqual(back.topics.a, { asked: 3, missed: 1 });
    assert.deepEqual(back.lines, {});
  });
});

describe("a session built from a model", () => {
  const items = [topicItem("no-preterite"), topicItem("wo-relative"), topicItem("articles")];

  test("puts what the learner keeps missing first", () => {
    let model = EMPTY_MODEL;
    // `wo-relative` missed repeatedly; the others answered correctly.
    for (let i = 0; i < 4; i++) model = observe(model, topicItem("wo-relative", `wo-${i}`), "wrong");
    for (let i = 0; i < 4; i++) model = observe(model, topicItem("no-preterite", `np-${i}`), "right");

    const session = orderSession({ items, saved: [], now: new Date("2026-09-21T09:00:00Z"), model });
    assert.equal(
      session[0].source.kind === "grammar" ? session[0].source.topic : "",
      "wo-relative",
      "the weakest area leads",
    );
  });

  test("with no model, the order is exactly what it was before", () => {
    // The safety property that lets this ship on by default: a learner who has
    // never answered anything sees the old recency ordering, unchanged.
    const withModel = orderSession({ items, saved: [], now: new Date("2026-09-21T09:00:00Z"), model: EMPTY_MODEL });
    const without = orderSession({ items, saved: [], now: new Date("2026-09-21T09:00:00Z") });
    assert.deepEqual(
      withModel.map((i) => i.id),
      without.map((i) => i.id),
    );
  });

  test("pressure reads the worst area an item touches", () => {
    let model = EMPTY_MODEL;
    for (let i = 0; i < 5; i++) model = observe(model, topicItem("wo-relative", `wo-${i}`), "wrong");
    assert.ok(pressureOf(model, topicItem("wo-relative")) > 0);
    assert.equal(pressureOf(model, topicItem("articles")), 0);
  });
});
