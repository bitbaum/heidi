import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { decodeHistory, remember, NO_HISTORY } from "../domain/practice/history.ts";
import { decodeModel, observe, EMPTY_MODEL } from "../domain/practice/model.ts";
import { decodeTakes } from "../domain/speaking/take.ts";
import { decode as decodeSaved } from "../domain/saved/collection.ts";
import { add } from "../domain/saved/collection.ts";
import { EMPTY as EMPTY_SAVED } from "../domain/saved/types.ts";
import { decodeStreak, touch, EMPTY_STREAK } from "../domain/progress/streak.ts";
import { decodeOthers, decodeSyncSetting } from "../domain/progress/sync.ts";

/**
 * Every browser store round-trips. All of them, in one place.
 *
 * WHAT THIS EXISTS TO STOP HAPPENING AGAIN. `Decode<T>` is
 * `(raw: string) => T | null`, and `createBrowserStore` hands it
 * `localStorage.getItem(key)` — the JSON string, unparsed. `decodeModel`
 * declared its parameter as `unknown` instead of `string`, which satisfies
 * that type structurally, and then tested `typeof raw !== "object"` before
 * parsing anything. That is true of every string ever stored, so it returned
 * an empty model on every single read and the learner model never once
 * survived a page load.
 *
 * Nothing caught it. The type checker could not: a function accepting
 * `unknown` legally stands in for one accepting `string`. The unit test could
 * not, because it passed decodeModel OBJECTS — testing a contract the product
 * does not use. And the symptom was invisible: the other store on the same
 * page decoded correctly, so sessions still varied and the only evidence was a
 * dashboard that never had anything to show.
 *
 * So the check is per STORE and it goes through `JSON.stringify`, which is
 * exactly what `createBrowserStore.write` does. A decoder that cannot read
 * what its own writer produces fails here, whatever its parameter is declared
 * as.
 */

describe("every decoder can read what its store writes", () => {
  test("the practice history", () => {
    const value = remember(NO_HISTORY, ["a", "b"]);
    assert.deepEqual(decodeHistory(JSON.stringify(value)), value);
  });

  test("the learner model", () => {
    const value = observe(EMPTY_MODEL, {
      id: "i",
      kind: "cloze",
      marking: "self",
      prompt: "p",
      answer: "a",
      bridge: "b",
      source: { kind: "situation", scene: "restaurant", line: 0 },
    } as never, "right");
    const back = decodeModel(JSON.stringify(value));
    assert.deepEqual(back, value, "the learner model did not survive its own store");
    assert.ok(Object.keys(back.scenes).length > 0, "scene evidence was dropped");
    assert.ok(Object.keys(back.lines).length > 0, "line evidence was dropped");
  });

  test("the kept words", () => {
    const value = add(EMPTY_SAVED, { target: "nöd", bridge: "nicht", savedAt: "2026-09-24T10:00:00Z" } as never);
    const back = decodeSaved(JSON.stringify(value));
    assert.ok(back, "the saved collection did not survive its own store");
    assert.equal(back.words.length, 1);
  });

  test("the speaking takes", () => {
    // An empty list is a legitimate stored value and must decode as one.
    assert.deepEqual(decodeTakes(JSON.stringify([])), []);
  });

  test("the streak", () => {
    const value = touch(EMPTY_STREAK, "2026-09-25");
    assert.deepEqual(decodeStreak(JSON.stringify(value)), value);
  });

  test("the sync switch", () => {
    const value = { on: true, device: "0f5c6d2e-1a2b-4c3d-8e9f-001122334455", savedChangedAt: "2026-09-25T10:00:00.000Z" };
    assert.deepEqual(decodeSyncSetting(JSON.stringify(value)), value);
  });

  test("the other devices' records", () => {
    const model = observe(EMPTY_MODEL, {
      id: "i",
      kind: "cloze",
      marking: "self",
      prompt: "p",
      answer: "a",
      bridge: "b",
      source: { kind: "situation", scene: "restaurant", line: 0 },
    } as never, "right");
    const value = { model: [model], history: [["a"]], streak: [touch(EMPTY_STREAK, "2026-09-25")] };
    const decoders = { model: decodeModel, history: decodeHistory, streak: decodeStreak };
    assert.deepEqual(decodeOthers(JSON.stringify(value), decoders), value);
  });

  test("garbage in storage is absent, never a crash", () => {
    for (const raw of ["", "nonsense", "null", "[1,2,3]", "{"]) {
      assert.doesNotThrow(() => decodeHistory(raw));
      assert.doesNotThrow(() => decodeModel(raw));
      assert.doesNotThrow(() => decodeTakes(raw));
      assert.doesNotThrow(() => decodeSaved(raw));
      assert.doesNotThrow(() => decodeSyncSetting(raw));
      assert.doesNotThrow(() => decodeOthers(raw, { model: decodeModel, history: decodeHistory, streak: decodeStreak }));
    }
  });
});
