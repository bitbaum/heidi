import { test } from "node:test";
import assert from "node:assert/strict";
import { PACK_ITEMS } from "./published.ts";
import { orderSession } from "./session.ts";
import { NO_MEMORY, scheduleAnswer } from "./memory.ts";
import { permutation, seeded, shuffled } from "./random.ts";

const now = new Date("2026-11-09T10:00:00Z");
const sitting = (seed?: number, memory = NO_MEMORY) =>
  orderSession({ items: PACK_ITEMS, saved: [], now, memory, ...(seed === undefined ? {} : { random: seeded(seed) }) }).map((i) => i.id);

test("a seed is a fixed sitting; no seed is the old fixed sitting", () => {
  assert.deepEqual(sitting(42), sitting(42));
  assert.deepEqual(sitting(), sitting());
});

test("different seeds give a new learner different sittings — questions and kinds", () => {
  const sittings = [1, 2, 3, 4, 5, 6].map((seed) => sitting(seed));
  const distinct = new Set(sittings.map((ids) => ids.join("|")));
  assert.ok(distinct.size >= 5, `only ${distinct.size} distinct sittings of 6`);
  const kinds = new Set(sittings.flatMap((ids) => ids.map((id) => id.split(":")[0])));
  assert.ok(kinds.size >= 10, `only ${kinds.size} kinds across six sittings`);
});

test("chance never overrules the schedule: a question that is due comes first whatever the seed", () => {
  const item = PACK_ITEMS.find((i) => i.kind === "form")!;
  let memory = scheduleAnswer(NO_MEMORY, item, "right", new Date("2026-11-01T10:00:00Z"));
  memory = scheduleAnswer(memory, item, "wrong", new Date("2026-11-07T10:00:00Z"));
  for (const seed of [1, 2, 3, 99]) assert.ok(sitting(seed, memory).includes(item.id), `seed ${seed}`);
});

test("shuffles are permutations, and do move things", () => {
  const random = seeded(7);
  const order = permutation(4, random);
  assert.deepEqual([...order].sort(), [0, 1, 2, 3]);
  const many = new Set(Array.from({ length: 30 }, () => shuffled([1, 2, 3, 4], random).join("")));
  assert.ok(many.size > 6);
});

test("levels: a new learner starts near German; once level 1 holds, the sitting moves up", async () => {
  const { EMPTY_MODEL, frontierOf } = await import("./model.ts");
  const avg = (model: typeof EMPTY_MODEL) => {
    const ids = new Set(orderSession({ items: PACK_ITEMS, saved: [], now, model, random: seeded(9), size: 8 }).map((i) => i.id));
    const levels = PACK_ITEMS.filter((i) => ids.has(i.id)).map((i) => i.source.level ?? 2);
    return levels.reduce((a, b) => a + b, 0) / levels.length;
  };
  assert.equal(frontierOf(EMPTY_MODEL), 1);
  const held = { ...EMPTY_MODEL, levels: { "1": { asked: 20, missed: 1 }, "2": { asked: 20, missed: 2 } } };
  assert.equal(frontierOf(held), 3);
  assert.ok(avg(held) > avg(EMPTY_MODEL), `level 3 learner ${avg(held)} vs new ${avg(EMPTY_MODEL)}`);
  const shaky = { ...EMPTY_MODEL, levels: { "1": { asked: 20, missed: 9 } } };
  assert.equal(frontierOf(shaky), 1, "missing almost half is not holding");
});
