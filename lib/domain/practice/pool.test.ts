import { test } from "node:test";
import assert from "node:assert/strict";
import { saysWord } from "../../text/words.ts";
import { SCENES } from "../../situations/display.ts";
import { itemsInScope } from "./scope.ts";
import { PRACTISABLE, sittingPool } from "./pool.ts";

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

test("every scene and every listed topic can be practised", () => {
  assert.equal(PRACTISABLE.scene.length, SCENES.length);
  for (const id of PRACTISABLE.topic) assert.ok(sittingPool({ kind: "topic", id }).length > 0, id);
});
