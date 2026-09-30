import { test } from "node:test";
import assert from "node:assert/strict";
import { REVIEW_STEPS } from "../saved/review.ts";
import {
  NO_MEMORY,
  combineMemories,
  comingBack,
  decodeMemory,
  dueCount,
  scheduleAnswer,
  urgency,
  type Memory,
} from "./memory.ts";

const DAY = 86_400_000;
const now = new Date("2026-10-01T08:00:00Z");
const later = (days: number) => new Date(now.getTime() + days * DAY);
const q = { id: "transform:annas-sister", kind: "transform" } as const;

test("a right answer walks up the steps, a miss starts again", () => {
  let memory: Memory = scheduleAnswer(NO_MEMORY, q, "right", now);
  assert.equal(memory[q.id]!.step, 0);
  assert.equal(memory[q.id]!.due, now.getTime() + REVIEW_STEPS[0] * DAY);

  memory = scheduleAnswer(memory, q, "right", later(1));
  memory = scheduleAnswer(memory, q, "right", later(4));
  assert.equal(memory[q.id]!.step, 2);

  memory = scheduleAnswer(memory, q, "wrong", later(11));
  assert.equal(memory[q.id]!.step, 0);
  assert.equal(memory[q.id]!.lapses, 1);
  assert.equal(memory[q.id]!.due, later(12).getTime());
});

test("at the last step it keeps coming back instead of vanishing", () => {
  let memory: Memory = NO_MEMORY;
  for (let i = 0; i < REVIEW_STEPS.length + 3; i++) memory = scheduleAnswer(memory, q, "right", later(i * 40));
  assert.equal(memory[q.id]!.step, REVIEW_STEPS.length - 1);
  assert.ok(Number.isFinite(memory[q.id]!.due));
});

test("a skip and a kept word change nothing", () => {
  assert.equal(scheduleAnswer(NO_MEMORY, q, "skipped", now), NO_MEMORY);
  assert.equal(scheduleAnswer(NO_MEMORY, { id: "recall:gäll", kind: "recall" }, "right", now), NO_MEMORY);
});

test("due, new and resting", () => {
  const memory = scheduleAnswer(NO_MEMORY, q, "right", now);
  assert.equal(urgency(memory, "never:asked", now), 1);
  assert.equal(urgency(memory, q.id, now), 2);
  assert.equal(urgency(memory, q.id, later(1)), 0);
  assert.equal(dueCount(memory, now), 0);
  assert.equal(dueCount(memory, later(1)), 1);
  assert.equal(dueCount(memory, later(1), ["other"]), 0);
  assert.equal(comingBack(memory, now, 1), 1);
});

test("across devices, the newest answer of each question wins", () => {
  const phone = scheduleAnswer(NO_MEMORY, q, "right", now);
  const laptop = scheduleAnswer(scheduleAnswer(NO_MEMORY, q, "right", later(-2)), q, "wrong", later(1));
  const both = combineMemories([phone, laptop]);
  assert.equal(both[q.id]!.lapses, 1);
  assert.deepEqual(combineMemories([laptop, phone]), both);
});

test("the decoder keeps good cards and refuses what is not a memory", () => {
  assert.equal(decodeMemory("[]"), null);
  assert.equal(decodeMemory("nope"), null);
  const decoded = decodeMemory(
    JSON.stringify({ ok: { step: 99, due: 5, seen: 4, lapses: 0 }, bad: { step: "1" }, neg: { step: 0, due: -1, seen: 0, lapses: 0 } }),
  );
  assert.deepEqual(Object.keys(decoded!), ["ok"]);
  assert.equal(decoded!.ok!.step, REVIEW_STEPS.length - 1);
});

test("a sitting asks what is due first, then new, and resting last", async () => {
  const { PACK_ITEMS } = await import("./published.ts");
  const { orderSession } = await import("./session.ts");
  const translate = PACK_ITEMS.filter((i) => i.kind === "translate").slice(0, 10);
  const resting = PACK_ITEMS.filter((i) => i.kind === "cloze").slice(0, 30);

  let memory: Memory = NO_MEMORY;
  for (const item of translate) memory = scheduleAnswer(memory, item, "right", later(-2));
  for (const item of resting) memory = scheduleAnswer(memory, item, "right", now);

  const session = orderSession({ items: PACK_ITEMS, saved: [], now, memory, size: 8 });
  // Ten due questions of ONE kind take all eight seats, not one of them.
  assert.equal(session.filter((i) => translate.some((t) => t.id === i.id)).length, 8);

  // A day and a half earlier nothing is due yet: every answered question is
  // resting, and new ones fill the sitting.
  const noDue = orderSession({ items: PACK_ITEMS, saved: [], now: later(-1.5), memory, size: 8 });
  const answered = new Set(Object.keys(memory));
  assert.ok(!noDue.some((i) => answered.has(i.id)), "a resting question waits while new ones remain");
});
