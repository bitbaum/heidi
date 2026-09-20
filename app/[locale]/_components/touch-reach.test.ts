import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Nothing may hide what it clipped behind a hover.
 *
 * THE DEFECT THIS PINS. Each saved word shows the sentence it was kept from,
 * and that line was `truncate` — one line, an ellipsis, and the rest of the
 * sentence in a `title`. A `title` is a tooltip, a tooltip needs a pointer to
 * hover, and a phone has no pointer. So on the device this list is actually
 * read on, the reason a word had been worth keeping was simply gone, and
 * nothing looked broken: the row was neat, the ellipsis deliberate.
 *
 * This is not the sideways-scrolling bug that `scripts/audit/responsive.mjs`
 * walks every page for. That one is a layout fact and needs a browser. This
 * one is legible in the source: `truncate` (which is `white-space: nowrap`
 * plus an ellipsis) on the same element as a `title` carrying the full text is
 * the shape of "readable with a mouse, lost on a phone".
 *
 * `line-clamp-*` is the repair, not a longer `title`: it shows several lines
 * and stays breakable, so the text is there to read rather than promised to a
 * gesture the device cannot make. A `title` that merely repeats a label the
 * element already carries — an icon button whose `aria-label` says the same
 * thing — is fine and is not what this looks for.
 */

// fileURLToPath, not `.pathname`: the route segment is a literal `[locale]`
// directory on disk, and a URL percent-encodes the brackets.
const COMPONENTS = fileURLToPath(new URL("./", import.meta.url));
const APP = join(COMPONENTS, "..", "..");

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return sources(full);
    return e.name.endsWith(".tsx") ? [full] : [];
  });
}

describe("what a phone cannot hover, it must still be able to read", () => {
  test("nothing truncates text and leaves the rest in a title", () => {
    const offenders: string[] = [];

    for (const file of sources(APP)) {
      const src = readFileSync(file, "utf8");
      // Opening tags only; the two attributes must be on the SAME element for
      // this to be the defect.
      for (const m of src.matchAll(/<[a-zA-Z][^>]*>/gs)) {
        const tag = m[0];
        if (!/\btruncate\b/.test(tag)) continue;
        if (!/\btitle=/.test(tag)) continue;
        offenders.push(`${file.slice(APP.length + 1)}:${src.slice(0, m.index).split("\n").length}`);
      }
    }

    assert.deepEqual(
      offenders,
      [],
      "these clip their text to one line and put the remainder in a `title`, which a touch device can never show — clamp with `line-clamp-*` instead",
    );
  });
});
