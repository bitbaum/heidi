import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Two labels on one line need a real space between them, not only a margin.
 *
 * Reported on /vocabulary as "full of frankenstein words". The page read, to
 * anything that reads TEXT — a copy, a search, a screen reader —
 * "DachbodenNicht: Fussbodenbelag", "HausschuheNicht: Finken, die Vögel":
 * a meaning and a note rendered as sibling inline spans separated by CSS
 * `ml-2` alone. Pixels were fine; words were stitched. The same fault came
 * back within a day on the register tag ("FrankenUMGANGSSPRACHLICH").
 *
 * So in the word list, an inline `<span>` that follows the bridge text inside
 * the same line must be preceded by a literal space in the JSX. This is a
 * narrow source check on the one file where it recurred, not a style rule for
 * the site.
 */
describe("the word list never stitches two words together", () => {
  test("every inline tag after the meaning is separated by a real space", () => {
    const text = readFileSync(join("app", "[locale]", "_components", "word-list.tsx"), "utf8");
    const i = text.indexOf("{word.bridge}");
    assert.ok(i > 0, "the meaning is no longer rendered where this test looks");
    const line = text.slice(i, text.indexOf("</span>", text.indexOf("{word.bridge}") + 400) + 7);
    // any `<span className="ml-…` inline tag in the meaning's line must have a
    // `" "` expression immediately before its conditional
    const tags = [...line.matchAll(/\{word\.(\w+) && \(\s*<span className="(ml-[^"]*)"/g)];
    for (const [, field] of tags) {
      assert.match(line, new RegExp(`\\{word\\.${field} && " "\\}`), `word.${field} is glued to the meaning — add {word.${field} && " "}`);
    }
  });
});
