import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type { PracticeItem } from "./types.ts";
import { RESUME_WITHIN_MS, decodeSaved, restore, type SavedSession } from "./resume.ts";

function item(id: string): PracticeItem {
  return {
    id,
    kind: "cloze",
    marking: "self",
    prompt: "Mir ____ hüt",
    answer: "gönd",
    bridge: "Wir gehen heute",
    source: { kind: "grammar", topic: "verbs" },
  };
}

const NOW = new Date("2026-09-30T12:00:00Z");
const POOL = [item("a"), item("b"), item("c")];

function saved(over: Partial<SavedSession> = {}): SavedSession {
  return {
    key: "mixed|all",
    ids: ["a", "b", "c"],
    at: 1,
    outcomes: [{ id: "a", outcome: "right" }],
    savedAt: "2026-09-30T11:00:00Z",
    ...over,
  };
}

describe("picking a sitting up again", () => {
  test("the same sitting continues at the question it was left on", () => {
    const back = restore(saved(), "mixed|all", POOL, NOW);
    assert.deepEqual(back?.session.map((i) => i.id), ["a", "b", "c"]);
    assert.equal(back?.at, 1);
    assert.deepEqual(back?.outcomes, [{ id: "a", outcome: "right" }]);
  });

  test("another sitting starts fresh", () => {
    assert.equal(restore(saved(), "tap|topic:articles", POOL, NOW), null);
  });

  test("yesterday's sitting starts fresh", () => {
    const old = new Date(Date.parse("2026-09-30T11:00:00Z") + RESUME_WITHIN_MS + 1);
    assert.equal(restore(saved(), "mixed|all", POOL, old), null);
  });

  test("a finished sitting is not resumed into its summary", () => {
    assert.equal(restore(saved({ at: 3 }), "mixed|all", POOL, NOW), null);
  });

  test("a question that no longer exists means a fresh sitting, not a shorter one", () => {
    assert.equal(restore(saved(), "mixed|all", [item("a"), item("c")], NOW), null);
  });
});

describe("what storage may hand back", () => {
  test("a stored sitting round-trips", () => {
    assert.deepEqual(decodeSaved(JSON.stringify(saved())), saved());
  });

  test("anything malformed is nothing", () => {
    for (const raw of [
      "not json",
      "null",
      JSON.stringify({ ...saved(), at: 9 }),
      JSON.stringify({ ...saved(), at: -1 }),
      JSON.stringify({ ...saved(), ids: [] }),
      JSON.stringify({ ...saved(), ids: [1, 2] }),
      JSON.stringify({ ...saved(), savedAt: "soon" }),
      JSON.stringify({ ...saved(), outcomes: [{ id: "a", outcome: "perfect" }] }),
    ]) {
      assert.equal(decodeSaved(raw), null, raw);
    }
  });
});
