import { test } from "node:test";
import assert from "node:assert/strict";
import { evidenceFor, qualifies } from "./certificate.ts";
import { EMPTY_MODEL, lineKey } from "../practice/model.ts";

const lines = new Set([0, 1, 2]);
const model = (traces: Record<number, [number, number]>) => ({
  ...EMPTY_MODEL,
  lines: Object.fromEntries(Object.entries(traces).map(([i, [asked, missed]]) => [lineKey("tram", Number(i)), { asked, missed }])),
});

test("every line held and come back: a certificate", () => {
  const s = evidenceFor("tram", [model({ 0: [3, 0], 1: [3, 0], 2: [3, 0] })], lines);
  assert.equal(s.standing, "sure");
  assert.equal(qualifies(s), true);
});

test("progress on two devices adds up to the same certificate", () => {
  const phone = model({ 0: [2, 0], 1: [3, 0] });
  const laptop = model({ 0: [1, 0], 2: [3, 0], 1: [0, 0] });
  assert.equal(qualifies(evidenceFor("tram", [phone, laptop], lines)), true);
  assert.equal(qualifies(evidenceFor("tram", [phone], lines)), false, "one device alone has not earned it");
});

test("steady is progress, not a certificate", () => {
  const s = evidenceFor("tram", [model({ 0: [3, 0], 1: [3, 0] })], lines);
  assert.notEqual(s.standing, "sure");
  assert.equal(qualifies(s), false);
});

test("a situation with nothing askable certifies nothing", () => {
  assert.equal(qualifies(evidenceFor("tram", [model({})], new Set())), false);
});
