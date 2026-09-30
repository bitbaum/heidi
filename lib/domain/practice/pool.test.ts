import { test } from "node:test";
import assert from "node:assert/strict";
import { saysWord } from "../../text/words.ts";
import { SCENES } from "../../situations/display.ts";
import { itemsInScope } from "./scope.ts";
import { PRACTISABLE, sittingPool } from "./pool.ts";
import { TEST_MIN, itemsFor, testable } from "./mode.ts";

const handover = SCENES.find((s) => s.id === "handover")!;

test("a scene's sitting asks its sentences AND the words said in it", () => {
  const pool = sittingPool({ kind: "scene", id: "handover" });
  const sentences = pool.filter((i) => i.source.kind === "situation");
  const words = pool.filter((i) => i.source.kind === "word");

  assert.deepEqual(sentences, itemsInScope(pool, { kind: "scene", id: "handover" }));
  assert.ok(sentences.length > 0);
  assert.ok(words.length > 0, "the handover's words are asked too");
  for (const item of words) {
    const word = (item.source as { word: string }).word;
    assert.ok(handover.phrases.some((p) => saysWord(p.target, word)), `${word} is said in the handover`);
  }
});

test("other scopes are exactly their scope", () => {
  const topic = { kind: "topic", id: "am-progressive" } as const;
  assert.equal(sittingPool(topic).length, itemsInScope(sittingPool({ kind: "all" }), topic).length);
  assert.deepEqual(sittingPool({ kind: "scene", id: "no-such-scene" }), []);
});

test("a topic's sitting includes the questions the pack says it explains", () => {
  // Every article question came from a word and every time from a scene; both
  // are what their topic looks like in use, so a topic session drills them.
  const articles = sittingPool({ kind: "topic", id: "articles" });
  assert.ok(articles.some((i) => i.kind === "article"), "articles drills the article questions");
  const clock = sittingPool({ kind: "topic", id: "clock-time" });
  assert.ok(clock.some((i) => i.kind === "clock"), "clock-time drills the clock questions");
  assert.equal(testable(clock), true);
  const words = sittingPool({ kind: "group", id: "everyday" });
  assert.ok(words.every((i) => i.source.kind === "word"), "a group is still only its words");
});

test("every scene and every listed topic can be practised", () => {
  assert.equal(PRACTISABLE.scene.length, SCENES.length);
  for (const id of PRACTISABLE.topic) assert.ok(sittingPool({ kind: "topic", id }).length > 0, id);
});

test("a scope offers a test only when it can fill half a run", () => {
  // The regression: «Bsitz andersume» offered a "test" of two questions. That
  // topic has its ten now; the particles are still the thin one.
  const thin = sittingPool({ kind: "topic", id: "modal-particles" });
  assert.ok(itemsFor(thin, "mixed", "test").length < TEST_MIN);
  assert.equal(testable(thin), false);

  assert.equal(testable(sittingPool({ kind: "all" })), true);
  for (const id of PRACTISABLE.scene) assert.equal(testable(sittingPool({ kind: "scene", id })), true, id);
});
