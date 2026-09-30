import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ALL } from "./scope.ts";
import { closeTarget, sittingKey, sittingQuery } from "./sitting.ts";

describe("a sitting as a URL", () => {
  test("the default sitting has no query at all", () => {
    assert.equal(sittingQuery({ scope: ALL, mode: "mixed", flow: "practice" }), "");
  });

  test("scope, mode and flow all travel", () => {
    assert.equal(
      sittingQuery({ scope: { kind: "topic", id: "am-progressive" }, mode: "tap", flow: "practice" }),
      "topic=am-progressive&mode=tap",
    );
  });

  test("a test carries no mode, because a writing test would ask nothing", () => {
    assert.equal(sittingQuery({ scope: ALL, mode: "write", flow: "test" }), "flow=test");
  });

  test("two sittings on different things never share a saved place", () => {
    assert.notEqual(
      sittingKey({ scope: { kind: "scene", id: "baeckerei" }, mode: "mixed" }),
      sittingKey({ scope: ALL, mode: "mixed" }),
    );
    assert.notEqual(sittingKey({ scope: ALL, mode: "tap" }), sittingKey({ scope: ALL, mode: "card" }));
  });
});

describe("where the close button goes", () => {
  test("back to the page it was opened from", () => {
    assert.equal(closeTarget("/de/grammar/am-progressive", "/de/practice"), "/de/grammar/am-progressive");
  });

  test("never off the site", () => {
    for (const raw of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", undefined, ""]) {
      assert.equal(closeTarget(raw, "/de/practice"), "/de/practice", String(raw));
    }
  });
});
