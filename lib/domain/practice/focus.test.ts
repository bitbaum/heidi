import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENES } from "../../situations/display.ts";
import { ALL } from "./scope.ts";
import { decodeFocus, focusOf, focusScope, pageOrFocus } from "./focus.ts";

const [a, b] = SCENES.map((s) => s.id);

test("a choice round-trips, deduplicated, and unknown scenes are dropped", () => {
  const focus = focusOf([a, b, a, "not-a-scene"], new Date("2026-11-09T10:00:00Z"));
  assert.deepEqual(focus, { scenes: [a, b], at: "2026-11-09T10:00:00.000Z" });
  assert.deepEqual(decodeFocus(JSON.stringify(focus)), focus);
  assert.deepEqual(decodeFocus(JSON.stringify({ scenes: [a, "gone"], at: "x" })), { scenes: [a], at: "x" });
});

test("anything malformed reads as no choice at all", () => {
  for (const raw of ["", "nope", "null", "[]", '{"scenes":"a","at":"x"}', '{"scenes":[]}']) {
    assert.equal(decodeFocus(raw), null, raw);
  }
});

test("practise means my situations once chosen, everything before", () => {
  assert.deepEqual(focusScope(null), ALL);
  assert.deepEqual(focusScope({ scenes: [], at: "x" }), ALL);
  assert.deepEqual(focusScope({ scenes: [a], at: "x" }), { kind: "scene", id: a });
  assert.deepEqual(focusScope({ scenes: [a, b], at: "x" }), { kind: "scenes", id: `${a},${b}` });
});

test("the quick button practises the page it is on, else my situations", () => {
  const mine = { scenes: [a, b], at: "x" };
  assert.deepEqual(pageOrFocus({ kind: "scene", id: b }, mine), { kind: "scene", id: b });
  assert.deepEqual(pageOrFocus(ALL, mine), { kind: "scenes", id: `${a},${b}` });
  assert.deepEqual(pageOrFocus(ALL, null), ALL);
});
