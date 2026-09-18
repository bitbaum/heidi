import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Nothing on a page may decide how wide the phone is.
 *
 * THE DEFECT THIS PINS. The portal rendered 481 CSS pixels wide on a 360px
 * phone. The whole page scrolled sideways, and because a mobile browser
 * anchors fixed elements to the widened layout viewport, the remove button on
 * every saved word and the "ask Heidi" launcher sat off the right edge of the
 * screen — present, focusable, and unreachable. Nothing was reported as
 * broken; it just could not be used.
 *
 * The cause was one line of CSS three components deep. The saved sentence a
 * word was found in was clipped with `truncate`, which is `white-space:
 * nowrap`, and a line that may not break reports the WHOLE sentence as its
 * minimum width. `overflow: hidden` hides the text; it does not reduce that
 * minimum. The minimum then travelled:
 *
 *   <p class="truncate">    383px minimum, because it cannot wrap
 *     └ <li>               a grid item, so its minimum is its content's
 *       └ <ul class="grid">  no base `grid-cols`, so the implicit track is
 *         │                  `auto` — sized from content, not from the screen
 *         └ <div class="grid">  same again, for the whole page column
 *           └ the document is now wider than the phone
 *
 * A grid track only refuses to grow past the screen when it is told to:
 * `grid-cols-1` is `repeat(1, minmax(0, 1fr))`, and the `0` is the entire
 * point. An implicit `auto` track has no such floor. So every one of those
 * containers was equally responsible, and fixing only the innermost would have
 * left the next long word to find the next one.
 *
 * TWO RULES, because the bug needed two ingredients and either one alone is
 * harmless: something that refuses to get narrower, and a container willing to
 * grow to fit it.
 *
 * A SOURCE SCAN, for the reason given at length in `overlays.test.ts`: this
 * project has no jsdom and no testing-library, and a layout assertion is not
 * worth buying either. What is checked here is what actually regressed — the
 * class names — and it is checked exactly.
 */

// fileURLToPath, not `.pathname`: the route segment is a literal `[locale]`
// directory on disk, and a URL percent-encodes the brackets.
const COMPONENTS = fileURLToPath(new URL("./", import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return sources(full);
    return e.name.endsWith(".tsx") ? [full] : [];
  });
}

/** Every `className="..."` and ``className={`...`}`` in a file, as class lists. */
function classLists(src: string): string[] {
  const out: string[] = [];
  for (const m of src.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/gs)) {
    out.push(m[1] ?? m[2] ?? "");
  }
  return out;
}

/** `truncate` and `line-clamp-*` are the two ways text is cut to fit a box. */
const CLIPS = /\b(truncate|line-clamp-\d+)\b/;

describe("a phone screen is the widest thing on the page", () => {
  test("a component that clips text declares the base columns of its grids", () => {
    // Why only these components: clipping text to a box is the admission that
    // the box has a width the content must live inside. A grid that sizes
    // itself from that same content hands the width back to it, and the two
    // together are the bug above. Elsewhere — the marketing pages, whose grids
    // hold copy that simply wraps — an implicit track is merely untidy, and a
    // test that failed on it would be enforcing taste rather than a defect.
    const offenders: string[] = [];

    for (const file of sources(COMPONENTS)) {
      const src = readFileSync(file, "utf8");
      if (!CLIPS.test(src)) continue;

      for (const list of classLists(src)) {
        const classes = list.split(/\s+/);
        if (!classes.includes("grid")) continue;
        // A bare `grid-cols-*` with no breakpoint prefix. `sm:grid-cols-2`
        // does not count: the phone is the unprefixed case, and the phone is
        // where this broke.
        if (classes.some((c) => c.startsWith("grid-cols-"))) continue;
        offenders.push(`${file.slice(COMPONENTS.length)}: ${list}`);
      }
    }

    assert.deepEqual(
      offenders,
      [],
      "these grids size their single column from their content, so one unbreakable line makes the whole page wider than the screen — add `grid-cols-1`",
    );
  });

  test("a learner's own words can always break", () => {
    // The other half. A saved word is whatever the learner picked out of a
    // chat: `isKeepable` accepts a target of up to 80 characters and a bridge
    // of up to 160, and neither is required to contain a space. Rendered
    // without `break-words` such a word cannot wrap at all, which is the same
    // "will not get narrower" that started this — and it arrives from the
    // learner rather than from us, so it cannot be fixed by writing shorter
    // copy.
    const RENDERS_A_SAVED_WORD = [
      ["saved-words.tsx", /\{w\.(target|bridge|context)\}/],
      ["review-panel.tsx", /\{current\.(target|bridge)\}|\{sentenceFor\(current\)\}/],
    ] as const;

    for (const [name, marker] of RENDERS_A_SAVED_WORD) {
      const src = readFileSync(join(COMPONENTS, name), "utf8");
      const lines = src.split("\n");

      // A word is RENDERED, not merely referenced. `key={w.target}` and
      // `aria-label={...w.target}` name the same value and style nothing.
      const rendering = lines
        .map((line, i) => (marker.test(line) && !/\b(key|aria-label|title)=/.test(line) ? i : -1))
        .filter((i) => i >= 0);

      assert.ok(rendering.length > 0, `${name}: expected to find where a saved word is rendered`);

      for (const i of rendering) {
        // The class list is on the element, which may be the line above when
        // the JSX is wrapped across several lines.
        const nearby = lines.slice(Math.max(0, i - 6), i + 2).join("\n");
        assert.match(
          nearby,
          /\bbreak-words\b/,
          `${name}:${i + 1} renders a word the learner chose, which may be one long unbreakable string — it needs \`break-words\``,
        );
      }
    }
  });

  test("the sentence under a saved word is clamped, not truncated", () => {
    // `truncate` is one line plus a `title` tooltip, and a tooltip needs a
    // pointer. On the phone this list is built for, the clipped half of the
    // sentence was simply gone. `line-clamp-2` keeps the text breakable — so
    // the row can be as narrow as the screen — and shows two lines of the
    // reason the word was worth keeping.
    const src = readFileSync(join(COMPONENTS, "saved-words.tsx"), "utf8");
    // Class lists only. The prose above says the word `truncate` a dozen times,
    // and a test that could not tell a comment from a class name would be
    // fixed by deleting the explanation — which is the wrong repair.
    const used = classLists(src).flatMap((l) => l.split(/\s+/));
    assert.ok(!used.includes("truncate"), "saved-words.tsx should clamp with `line-clamp-*`, never `truncate`");
    assert.ok(used.includes("line-clamp-2"));
  });
});
