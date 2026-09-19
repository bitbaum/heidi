import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * A transcript wraps text nobody on this side wrote.
 *
 * THE DEFECT THIS PINS. A long link in an answer — an ordinary zuerich.ch URL,
 * pasted by a learner asking what it said — has no space in it, so the line
 * ran past the edge of the card. Blocks do not grow to fit their overflow, but
 * the DOCUMENT does: at 320, 360 and 390 the page became 710px wide and
 * scrolled sideways, and a reader on a phone had to drag it back and forth to
 * read one reply. Reported from a phone on the home page.
 *
 * The fix is one declaration on the transcript's root, because `overflow-wrap`
 * inherits. That only holds while the root is the one gate — an answer or a
 * bubble rendered somewhere else would be outside it and would take the defect
 * with it. So the second test is the load-bearing one: it keeps `AnswerView`
 * and the bubbles reachable through this component only.
 *
 * A SOURCE SCAN, for the reason `overlays.test.ts` gives: the project has no
 * jsdom, and buying one to assert a CSS property would spend heidi's zero-UI-
 * dependency position on a single test. What regressed is a class on an
 * element and an import in a file, and both can be checked exactly.
 */

// fileURLToPath, not `.pathname`: the route segment is a literal `[locale]`
// directory on disk, and a URL percent-encodes the brackets.
const HERE = fileURLToPath(new URL("./", import.meta.url));
const APP = fileURLToPath(new URL("../../../", import.meta.url));
const TRANSCRIPT = join(HERE, "transcript.tsx");

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return sources(full);
    return e.name.endsWith(".tsx") || e.name.endsWith(".ts") ? [full] : [];
  });
}

describe("the transcript is where chat text wraps", () => {
  test("its root carries wrap-anywhere", () => {
    const src = readFileSync(TRANSCRIPT, "utf8");
    // The root is the element that takes the caller's own chrome. Matching on
    // that interpolation rather than on the class alone means a `wrap-anywhere`
    // moved onto some inner element does not pass this.
    assert.match(
      src,
      /className=\{`[^`]*\bwrap-anywhere\b[^`]*\$\{className \?\? ""\}`\}/,
      "transcript.tsx must apply `wrap-anywhere` on the element that takes `className`",
    );
  });

  test("nothing renders an answer or a bubble outside it", () => {
    const renderers = ["AnswerView", "FromHeidi", "Mine", "Said"];
    const offenders = sources(APP)
      .filter((file) => file !== TRANSCRIPT && !file.endsWith(".test.ts"))
      .filter((file) => {
        // The modules that DEFINE them are not importers of them.
        if (file === join(HERE, "answer-view.tsx") || file === join(HERE, "bubble.tsx")) return false;
        const src = readFileSync(file, "utf8");
        // The JSX tag, not the bare word: `listen/page.tsx` has a prose
        // comment beginning "Said where it is useful", and a guard that fails
        // on English is a guard people delete.
        return renderers.some((name) => new RegExp(`<${name}[\\s/>]`).test(src));
      })
      .map((file) => relative(APP, file));

    assert.deepEqual(
      offenders,
      [],
      `these render chat text outside the transcript, so it will not wrap: ${offenders.join(", ")}`,
    );
  });
});
