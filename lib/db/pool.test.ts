import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * A source-level assertion, because the defect is about BUNDLING: under
 * `node:test` there is one copy of every module and a module variable looks
 * like a singleton. In the built site each route bundle has its own copy.
 */
test("the pool lives on globalThis, so separately built routes share one", () => {
  const source = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
  assert.match(source, /Symbol\.for\("heidi\.db"\)/);
  assert.match(source, /shared\[SLOT\] = drizzle\(new Pool\(/, "the pool is kept somewhere a second bundle cannot see");
  assert.doesNotMatch(source, /^let instance/m, "a module variable is one pool per bundle");
  assert.match(source, /max: POOL_MAX/, "the pool has no stated ceiling");
});
