import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_MODEL, observe } from "./model.ts";
import type { PracticeItem } from "./types.ts";
import { MASTERY_ASKED, holds, masteredCount, masteredIn, steadyWords } from "./mastered.ts";

/**
 * Capability counted, gain framed — and the tests are mostly about the second.
 *
 * The arithmetic is three lines. What is worth defending is the property that
 * makes this module allowed to exist at all under §3: it may tell a learner
 * what they can do, and it may never tell them what they have lost.
 */
/** A minimal real item, because `observe` reads an item rather than a source. */
function about(topic: string): PracticeItem {
  return {
    id: `cloze:${topic}`,
    kind: "cloze",
    marking: "self",
    prompt: "Mir ____ hüt",
    answer: "gönd",
    bridge: "Wir gehen heute",
    source: { kind: "grammar", topic },
  };
}

describe("what you can do now", () => {
  test("one right answer out of one is not mastery", () => {
    // Luck. The bar is evidence, not a perfect record — see MASTERY_ASKED.
    assert.equal(holds({ asked: 1, missed: 0 }), false);
    assert.equal(holds({ asked: 3, missed: 0 }), false);
    assert.equal(holds({ asked: 4, missed: 0 }), true);
  });

  test("a single slip does not erase a month", () => {
    // Demanding zero misses is both statistically silly and precisely the
    // loss framing this module exists to keep out.
    assert.equal(holds({ asked: 10, missed: 2 }), true);
    assert.equal(holds({ asked: 10, missed: 3 }), false);
  });

  test("nothing is counted before there is evidence for it", () => {
    let model = EMPTY_MODEL;
    for (let i = 0; i < MASTERY_ASKED - 1; i++) {
      model = observe(model, about("articles"), "right");
    }
    assert.equal(masteredCount(masteredIn(model)), 0);

    model = observe(model, about("articles"), "right");
    assert.deepEqual(masteredIn(model).topics, ["articles"]);
  });

  test("a skipped question is not a wrong one, and not a right one either", () => {
    /**
     * `observe` counts a skip as asked-and-not-missed, which would let a
     * learner "master" a topic by skipping four questions about it. If that
     * ever becomes true this test is where it surfaces — the guarantee this
     * module makes is that the count means something.
     */
    let model = EMPTY_MODEL;
    for (let i = 0; i < 6; i++) {
      model = observe(model, about("wo-relative"), "skipped");
    }
    const mastered = masteredIn(model);
    assert.deepEqual(mastered.topics, [], "skipping is not knowing");
  });

  test("a word is steady only once it has survived a gap", () => {
    const words = [
      { target: "gsi", bridge: "gewesen", step: 0 },
      { target: "aalüte", bridge: "anrufen", step: 1 },
      { target: "nöd", bridge: "nicht", step: 2 },
      { target: "hüt", bridge: "heute", step: 5 },
    ] as never[];

    assert.deepEqual(
      steadyWords(words).map((w) => w.target),
      ["nöd", "hüt"],
      "once is recognition; twice across a gap is the spacing effect",
    );
  });

  test("the shape has no way to report a loss", () => {
    /**
     * THE PROPERTY THAT MATTERS, asserted structurally rather than by reading
     * the component. `Mastered` carries what holds NOW and nothing else — no
     * previous count, no delta, no "was". A panel cannot render "down from 14"
     * from this data without first being given the number, and giving it would
     * be a visible change here rather than a quiet one in a template.
     */
    const model = observe(EMPTY_MODEL, about("articles"), "right");
    const keys = Object.keys(masteredIn(model)).sort();
    assert.deepEqual(keys, ["groups", "scenes", "topics", "words"]);
  });
});
