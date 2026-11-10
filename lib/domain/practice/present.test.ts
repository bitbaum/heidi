import { test } from "node:test";
import assert from "node:assert/strict";
import { PACK_ITEMS } from "./published.ts";
import { presented } from "./present.ts";
import { seeded } from "./random.ts";
import type { PracticeItem } from "./types.ts";

/** The right answer, read the way each view reads it. */
function answerOf(item: PracticeItem): unknown {
  if ("options" in item && typeof (item as { answer?: unknown }).answer === "number") {
    const c = item as unknown as { options: readonly string[]; answer: number };
    return c.options[c.answer];
  }
  if (item.kind === "match") return item.targets.map((t, i) => `${t}=${item.bridges[item.answer[i]]}`).sort();
  if (item.kind === "gaptext") return item.answer.map((b) => item.bank[b]);
  return null;
}

test("every item, however it is laid out, still has the same right answer", () => {
  const random = seeded(3);
  for (const item of PACK_ITEMS) {
    for (let k = 0; k < 3; k++) assert.deepEqual(answerOf(presented(item, random)), answerOf(item), item.id);
  }
});

test("the layout really changes: the right option is not always in the same place", () => {
  const random = seeded(11);
  const four = PACK_ITEMS.find((i) => "options" in i && (i as unknown as { options: string[] }).options.length === 4)!;
  const places = new Set(Array.from({ length: 40 }, () => (presented(four, random) as unknown as { answer: number }).answer));
  assert.ok(places.size >= 3, `answer only ever at ${[...places]}`);
});

test("ids and sources are untouched, so the model records the same question", () => {
  const random = seeded(5);
  for (const item of PACK_ITEMS.slice(0, 200)) {
    const shown = presented(item, random);
    assert.equal(shown.id, item.id);
    assert.deepEqual(shown.source, item.source);
  }
});
