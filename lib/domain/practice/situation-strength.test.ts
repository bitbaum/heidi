import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_MODEL, lineKey, observe, type LearnerModel } from "./model.ts";
import {
  askableLines,
  strengthOf,
  strengthAcross,
  weakestStarted,
  LINE_HOLDS_AT,
  LINE_STICKS_AT,
} from "./situation-strength.ts";
import { PACK_ITEMS } from "./published.ts";

function withLines(entries: Record<string, [number, number]>): LearnerModel {
  const lines: LearnerModel["lines"] = {};
  for (const [key, [asked, missed]] of Object.entries(entries)) lines[key] = { asked, missed };
  return { ...EMPTY_MODEL, lines };
}

const five = new Set([0, 1, 2, 3, 4]);

describe("how well a learner can follow one situation", () => {
  test("a situation nobody has touched is an invitation, not a judgement", () => {
    const s = strengthOf("cafe", EMPTY_MODEL, five);
    assert.equal(s.standing, "new");
    assert.equal(s.held, 0);
    assert.deepEqual(s.remaining, [0, 1, 2, 3, 4]);
  });

  test("one line right once is not yet knowing the line", () => {
    // LINE_HOLDS_AT is 2: once is luck or a lucky guess at a gap.
    const s = strengthOf("cafe", withLines({ "cafe:0": [1, 0] }), five);
    assert.equal(s.held, 0);
    assert.equal(s.standing, "new");
  });

  test("two clean askings and the line holds", () => {
    const s = strengthOf("cafe", withLines({ "cafe:0": [LINE_HOLDS_AT, 0] }), five);
    assert.equal(s.held, 1);
    assert.equal(s.standing, "met");
    assert.deepEqual(s.remaining, [1, 2, 3, 4]);
  });

  test("two thirds of the lines holding reads as steady", () => {
    const s = strengthOf(
      "cafe",
      withLines({ "cafe:0": [2, 0], "cafe:1": [2, 0], "cafe:2": [2, 0], "cafe:3": [2, 0] }),
      five,
    );
    assert.equal(s.held, 4);
    assert.equal(s.standing, "steady");
  });

  test("every line holding is still not `sure` until they have come back", () => {
    /**
     * The claim "I can follow this" should not be earnable in one sitting with
     * the answers fresh. Every line holds here at exactly two askings, and the
     * standing stops at steady because none has stuck.
     */
    const all = Object.fromEntries([0, 1, 2, 3, 4].map((i) => [`cafe:${i}`, [2, 0] as [number, number]]));
    const s = strengthOf("cafe", withLines(all), five);
    assert.equal(s.held, 5);
    assert.equal(s.stuck, 0);
    assert.equal(s.standing, "steady");
  });

  test("lines that came back and held again make it `sure`", () => {
    const all = Object.fromEntries(
      [0, 1, 2, 3, 4].map((i) => [`cafe:${i}`, [i < 4 ? LINE_STICKS_AT : 2, 0] as [number, number]]),
    );
    const s = strengthOf("cafe", withLines(all), five);
    assert.equal(s.held, 5);
    assert.equal(s.stuck, 4);
    assert.equal(s.standing, "sure");
  });

  test("a line missed more than a third of the time does not hold", () => {
    const s = strengthOf("cafe", withLines({ "cafe:0": [3, 2] }), five);
    assert.equal(s.held, 0);
    assert.ok(s.remaining.includes(0));
  });

  test("a scene with nothing askable is never claimed", () => {
    // Congratulating somebody for content that does not exist.
    const s = strengthOf("empty", EMPTY_MODEL, new Set());
    assert.equal(s.standing, "new");
    assert.equal(s.askable, 0);
  });

  test("being strong in one situation says nothing about another", () => {
    /** The whole point: hospital solid, restaurant shaky, both true at once. */
    const model = withLines({
      "handover:0": [3, 0], "handover:1": [3, 0], "handover:2": [3, 0],
      "cafe:0": [2, 1],
    });
    const askable = new Map([["handover", new Set([0, 1, 2])], ["cafe", new Set([0, 1, 2])]]);
    const [handover, cafe] = strengthAcross(["handover", "cafe"], model, askable);
    assert.equal(handover.standing, "sure");
    assert.equal(cafe.standing, "new");
  });

  test("the suggestion is the weakest STARTED situation, not the emptiest", () => {
    const model = withLines({
      "handover:0": [3, 0], "handover:1": [3, 0], "handover:2": [3, 0],
      "cafe:0": [2, 0],
    });
    const askable = new Map([
      ["handover", new Set([0, 1, 2])],
      ["cafe", new Set([0, 1, 2])],
      ["untouched", new Set([0, 1, 2])],
    ]);
    const all = strengthAcross(["handover", "cafe", "untouched"], model, askable);
    assert.equal(weakestStarted(all)?.scene, "cafe");
  });

  test("with nothing started at all, it suggests somewhere to begin", () => {
    const askable = new Map([["cafe", new Set([0, 1])]]);
    const all = strengthAcross(["cafe"], EMPTY_MODEL, askable);
    assert.equal(weakestStarted(all)?.scene, "cafe");
  });
});

describe("the denominator is what the site can actually ask", () => {
  test("real packs produce askable lines, and every one is a real index", () => {
    const askable = askableLines(PACK_ITEMS);
    assert.ok(askable.size > 0, "no situation lines are askable at all — the join is broken");
    for (const [scene, lines] of askable) {
      assert.ok(lines.size > 0, `${scene} is present with no lines`);
      for (const line of lines) {
        assert.ok(Number.isInteger(line) && line >= 0, `${scene} has a bad line index ${line}`);
      }
    }
  });

  test("answering a real item moves that line, and only that line", () => {
    /**
     * The wiring test. If `areasOf` ever stops emitting the `lines` axis, every
     * situation silently reads as `new` for ever and nothing else fails.
     */
    const item = PACK_ITEMS.find((i) => i.source.kind === "situation" && i.source.line !== undefined);
    assert.ok(item, "no situation item carries a line");
    const source = item.source as { kind: "situation"; scene: string; line: number };

    const after = observe(EMPTY_MODEL, item, "right");
    const key = lineKey(source.scene, source.line);
    assert.equal(after.lines[key]?.asked, 1, "the line was not recorded");
    assert.equal(after.scenes[source.scene]?.asked, 1, "the scene total was not recorded");
    assert.equal(Object.keys(after.lines).length, 1, "answering one item moved more than one line");
  });

  test("a passage item counts toward the scene but not toward any line", () => {
    // `gaptext` spans several lines and is about none of them.
    const passage = PACK_ITEMS.find((i) => i.kind === "gaptext" && i.source.kind === "situation");
    if (!passage) return; // a build with no passages is allowed
    const after = observe(EMPTY_MODEL, passage, "right");
    assert.equal(Object.keys(after.lines).length, 0, "a passage claimed a single line");
    assert.ok(Object.keys(after.scenes).length === 1, "a passage did not count toward its scene");
  });
});
