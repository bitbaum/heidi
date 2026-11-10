import { test } from "node:test";
import assert from "node:assert/strict";
import { declaresTooLarge } from "./body-size.ts";

const req = (length?: string) => new Request("http://x/", { method: "POST", headers: length ? { "content-length": length } : {} });

test("a declared length past the limit is refused before the body is read", () => {
  assert.equal(declaresTooLarge(req(String(60 * 1024 * 1024)), 8 * 1024 * 1024), true);
});

test("within the limit, or with no length at all, it is left to the route", () => {
  assert.equal(declaresTooLarge(req(String(8 * 1024 * 1024)), 8 * 1024 * 1024), false);
  assert.equal(declaresTooLarge(req(), 8 * 1024 * 1024), false);
  assert.equal(declaresTooLarge(req("nonsense"), 8 * 1024 * 1024), false);
});
