import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROADMAP } from "./roadmap.ts";
import { CHANGELOG } from "./changelog.ts";

/**
 * The repo-root `ROADMAP.md` and `CHANGELOG.md` are what the fleet map
 * (loki.orangecat.ch/api/fleet/map) ingests; the bilingual documents in
 * `roadmap.ts` and `changelog.ts` are what the site renders. Two copies drift
 * unless something fails when they do — this does.
 */
describe("the root records match the English documents", () => {
  test("ROADMAP.md lists exactly the EN roadmap items, in order", () => {
    const md = readFileSync("ROADMAP.md", "utf8");
    const inFile = md
      .split("\n")
      .filter((l) => l.startsWith("### "))
      .map((l) => l.slice(4).trim());
    const inDoc = ROADMAP.en.buckets.flatMap((b) => b.items.map((i) => i.title));
    assert.deepEqual(inFile, inDoc);
  });

  test("ROADMAP.md has one bucket per EN bucket", () => {
    const md = readFileSync("ROADMAP.md", "utf8");
    const buckets = md.split("\n").filter((l) => l.startsWith("## ")).length;
    assert.equal(buckets, ROADMAP.en.buckets.length);
  });

  test("every EN changelog date has a heading in CHANGELOG.md", () => {
    const md = readFileSync("CHANGELOG.md", "utf8");
    const headings = new Set(
      md
        .split("\n")
        .filter((l) => l.startsWith("## "))
        .map((l) => l.slice(3).trim()),
    );
    for (const entry of CHANGELOG.en) {
      assert.ok(headings.has(entry.date), `CHANGELOG.md has no "## ${entry.date}" heading`);
    }
  });
});
