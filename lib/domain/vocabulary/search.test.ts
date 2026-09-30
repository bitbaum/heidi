import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesQuery } from "./search.ts";

const rüebli = { target: "Rüebli", bridge: "Karotte" };

test("either side, any case, any accent", () => {
  assert.equal(matchesQuery(rüebli, "karo"), true);
  assert.equal(matchesQuery(rüebli, "RÜEB"), true);
  assert.equal(matchesQuery(rüebli, "ruebli"), true, "typed without the umlaut");
  assert.equal(matchesQuery({ target: "nöd", bridge: "nicht" }, "nod"), true);
});

test("spellings writers mix for one sound match each other", () => {
  assert.equal(matchesQuery({ target: "villicht", bridge: "vielleicht" }, "vilicht"), true);
  assert.equal(matchesQuery({ target: "spööter", bridge: "später" }, "spoter"), true);
});

test("a blank query matches everything, a wrong one nothing", () => {
  assert.equal(matchesQuery(rüebli, "  "), true);
  assert.equal(matchesQuery(rüebli, "velo"), false);
});
