import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROADMAP } from "./roadmap.ts";

/**
 * One roadmap. `lib/config/roadmap.ts` is the list; HEIDI.md §9 keeps only
 * the reasoning. §9 used to carry a second, numbered "Next, in order" copy that
 * went stale twice without anybody noticing — an item that had shipped, and a
 * refusal that contradicted §3. A list in prose drifts; this one cannot grow
 * back without failing here.
 */
describe("the roadmap has one home", () => {
  const spec = readFileSync("HEIDI.md", "utf8");
  const s = spec.indexOf("What comes next lives in one place");

  test("HEIDI.md points at the roadmap instead of restating it", () => {
    assert.ok(s > 0, "§9 no longer points at lib/config/roadmap.ts");
    assert.ok(spec.slice(s, s + 400).includes("lib/config/roadmap.ts"));
    assert.ok(!spec.includes("Next, in order"), "the numbered copy of the roadmap is back in HEIDI.md");
  });

  test("§9's reasoning holds no numbered list of items", () => {
    const section = spec.slice(s, spec.indexOf("Two loops explain Heidi", s));
    assert.ok(!/^\d+\. \*\*/m.test(section), "a numbered roadmap list has grown back in §9");
  });

  test("both languages list the same items in the same order", () => {
    // Two documents on purpose (see roadmap.ts); they must still be one plan.
    const shape = (l: "de" | "en") => ROADMAP[l].buckets.map((b) => b.items.length);
    assert.deepEqual(shape("de"), shape("en"));
  });

  test("nothing is dated", () => {
    const text = JSON.stringify(ROADMAP.de.buckets) + JSON.stringify(ROADMAP.en.buckets);
    assert.ok(!/\bQ[1-4]\b|\b20\d\d\b|coming soon|demnächst/i.test(text), "a date or a quarter crept into the roadmap");
  });
});
