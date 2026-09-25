import { test } from "node:test";
import assert from "node:assert/strict";
import { combineStreaks, newestSaved, sumModels, unionHistory } from "./sync.ts";
import { EMPTY_MODEL } from "../practice/model.ts";
import { EMPTY_STREAK } from "./streak.ts";

const model = (lines: Record<string, [number, number]>) => ({
  ...EMPTY_MODEL,
  lines: Object.fromEntries(Object.entries(lines).map(([k, [asked, missed]]) => [k, { asked, missed }])),
});

test("two devices' counts add, and syncing again does not add them twice", () => {
  const phone = model({ "shopping:0": [2, 1] });
  const laptop = model({ "shopping:0": [1, 0], "tram:3": [3, 0] });
  const view = sumModels([phone, laptop]);
  assert.deepEqual(view.lines, { "shopping:0": { asked: 3, missed: 1 }, "tram:3": { asked: 3, missed: 0 } });
  // The phone's OWN record is unchanged by viewing — the next view is the same.
  assert.deepEqual(sumModels([phone, laptop]), view);
});

test("no other devices is just this one", () => {
  const phone = model({ "shopping:0": [2, 1] });
  assert.deepEqual(sumModels([phone]), phone);
  assert.deepEqual(sumModels([]), EMPTY_MODEL);
});

test("seen questions are the union", () => {
  assert.deepEqual(unionHistory([["a", "b"], ["b", "c"]]), ["a", "b", "c"]);
});

test("the streak is the newest record, with the best of all", () => {
  const phone = { ...EMPTY_STREAK, current: 4, best: 4, lastDay: "2026-09-24" };
  const laptop = { ...EMPTY_STREAK, current: 2, best: 9, lastDay: "2026-09-25" };
  const s = combineStreaks([phone, laptop]);
  assert.equal(s.current, 2);
  assert.equal(s.lastDay, "2026-09-25");
  assert.equal(s.best, 9);
  assert.deepEqual(combineStreaks([]), EMPTY_STREAK);
});

test("the saved list: another device's wins only if it changed later", () => {
  const theirs = [{ value: "B", updatedAt: "2026-09-25T10:00:00Z" }];
  assert.equal(newestSaved("2026-09-25T09:00:00Z", theirs), "B");
  assert.equal(newestSaved("2026-09-25T11:00:00Z", theirs), null, "mine is newer: keep mine, removals included");
  assert.equal(newestSaved(null, theirs), "B", "a fresh device takes the list");
  assert.equal(newestSaved("2026-09-25T09:00:00Z", []), null);
});
