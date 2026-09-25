import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Every id on the personal page is declared once.
 *
 * FOUND IN AN AUDIT, NOT BY A READER. `recent`, `words`, `groups`, `mastered`
 * and `patterns` were each the id of a section AND of the heading inside it;
 * `review` was the target of its own `aria-labelledby`. The jump strip at the
 * top links by id, so its anchors landed on whichever element won, and a
 * screen reader was told a section was labelled by itself.
 *
 * Nobody could have seen it: the page only renders for a signed-in reader,
 * the affected panels mount after hydration, and every duplicate still LOOKED
 * right. Server HTML for a signed-out request contains none of them — which
 * is why a scan of the SOURCE is the check, across the page and every panel it
 * places, because that is where two files can agree on a string without ever
 * seeing each other.
 */
const FILES = [
  "dashboard.tsx",
  "focus-panel.tsx",
  "review-panel.tsx",
  "mastered-panel.tsx",
  "patterns-panel.tsx",
  "saved-words.tsx",
  "situation-board.tsx",
  "recent-conversations.tsx",
  "group-list.tsx",
];

describe("the personal page", () => {
  test("declares every id exactly once, across the page and its panels", () => {
    const seen = new Map<string, string[]>();
    for (const file of FILES) {
      let text: string;
      try {
        text = readFileSync(join("app", "[locale]", "_components", file), "utf8");
      } catch {
        continue; // a panel that moved is not this test's business
      }
      // Once per FILE: a panel legitimately repeats an id across its empty and
      // full branches, of which only one ever renders. Two FILES agreeing on
      // an id is the defect — they never see each other.
      for (const id of new Set([...text.matchAll(/\bid="([a-z0-9-]+)"/g)].map((m) => m[1]))) {
        seen.set(id, [...(seen.get(id) ?? []), file]);
      }
    }
    const twice = [...seen].filter(([, where]) => where.length > 1).map(([id, where]) => `${id}: ${where.join(", ")}`);
    assert.deepEqual(twice, [], `ids declared more than once:\n  ${twice.join("\n  ")}`);
  });

  test("no section is labelled by itself", () => {
    const text = readFileSync(join("app", "[locale]", "_components", "dashboard.tsx"), "utf8");
    for (const m of text.matchAll(/aria-labelledby="([a-z0-9-]+)"[^>]*\bid="([a-z0-9-]+)"/g)) {
      assert.notEqual(m[1], m[2], `a section is labelled by its own id "${m[1]}"`);
    }
  });
});
