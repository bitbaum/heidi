import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ALL } from "./scope.ts";
import { closeTarget, quickScope, sessionPath, sittingKey, sittingQuery } from "./sitting.ts";

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

describe("one tap into a sitting", () => {
  const practisable = { scene: ["handover", "doctor"], topic: ["am-progressive"] };

  test("the session address carries the sitting and the page to close back to", () => {
    assert.equal(
      sessionPath("de", { scope: { kind: "scene", id: "handover" } }, "/de/situations/handover"),
      "/de/practice/session?scene=handover&back=%2Fde%2Fsituations%2Fhandover",
    );
    assert.equal(sessionPath("gsw", { scope: ALL }), "/gsw/practice/session");
    assert.equal(sessionPath("de", { scope: ALL, mode: "card" }), "/de/practice/session?mode=card");
  });

  test("the page decides what Üben means", () => {
    assert.deepEqual(quickScope("/de/situations/handover", practisable), { kind: "scene", id: "handover" });
    assert.deepEqual(quickScope("/en/grammar/am-progressive", practisable), { kind: "topic", id: "am-progressive" });
  });

  test("anywhere else, and on a page with no questions, it is the general drill", () => {
    for (const path of ["/de", "/de/situations", "/de/situations/nowhere", "/de/grammar/no-items", "/de/vocabulary", "/de/situations/handover/x"]) {
      assert.deepEqual(quickScope(path, practisable), ALL, path);
    }
  });
});
