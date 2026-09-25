import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { PACK_ITEMS } from "./published.ts";
import { explanationFor, isEmpty, topicOf } from "./explanation.ts";

describe("every answered question has something to explain it", () => {
  test("no published item leaves the learner with nothing", () => {
    /**
     * The complaint this exists for: after answering, there was nothing. The
     * explanation now draws on the grammar topic, the situation line in its
     * conversation, and the vocabulary entry — whichever the item has. This
     * pins that EVERY item has at least one, so a new item kind that forgets
     * to carry provenance fails here instead of silently explaining nothing.
     */
    const empty = PACK_ITEMS.filter((i) => isEmpty(explanationFor(i))).map((i) => `${i.kind}:${i.id}`);
    assert.deepEqual(empty, [], `these would show no explanation:\n  ${empty.slice(0, 10).join("\n  ")}`);
  });

  test("a situation line is shown in its conversation, not alone", () => {
    const item = PACK_ITEMS.find((i) => i.source.kind === "situation" && i.source.line !== undefined && i.source.line > 0);
    assert.ok(item);
    const e = explanationFor(item);
    assert.ok(e.scene?.phrase, "the line itself is missing");
    assert.ok(e.scene?.before, "the line before it is missing — the sentence has no context");
  });

  test("a cloze gives back the whole sentence, gap filled", () => {
    const item = PACK_ITEMS.find((i) => i.kind === "cloze");
    assert.ok(item && item.kind === "cloze");
    const e = explanationFor(item);
    assert.ok(e.sentence && !/_{2,}/.test(e.sentence), `still blanked: ${e.sentence}`);
    assert.ok(e.sentence.includes(item.answer), "the answer is not in the sentence it came from");
  });

  test("the topic precedence is the one the verdict has always used", () => {
    // Source first; an article question falls back to what its KIND explains.
    for (const i of PACK_ITEMS) {
      if (i.source.kind === "grammar") assert.equal(topicOf(i), i.source.topic);
      if (i.kind === "article" && i.source.kind !== "grammar" && i.source.kind !== "situation")
        assert.equal(topicOf(i), i.explains);
    }
  });

  test("where else a word is said never repeats the scene you are in", () => {
    for (const i of PACK_ITEMS) {
      const e = explanationFor(i);
      if (e.scene) assert.ok(!e.saidIn.includes(e.scene.id), `${i.id} lists its own scene as "elsewhere"`);
      assert.ok(e.saidIn.length <= 3);
    }
  });
});
