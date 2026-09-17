import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * One control, one name.
 *
 * This is a source scan rather than a render, which is the honest trade: the
 * project has no jsdom and no testing-library, and buying both to assert one
 * accessible name would spend heidi's zero-UI-dependency position on a single
 * test. So it reads the two files that have to agree with each other.
 *
 * It exists because the bug it describes shipped TWICE. The composer renders
 * an `sr-only` label for `#chat-input`; the page above it renders a visible
 * one. Each was correct alone, and together a screen reader announced the
 * same sentence twice. The first fix moved the visible label and claimed the
 * duplicate was gone — it was not, because the hidden twin was never touched,
 * and nothing failed. `labelledOutside` is what reconciles them now, and this
 * is what keeps it reconciled.
 *
 * Both directions, the way the pack/dictionary join is guarded: a caller with
 * its own visible label MUST pass the prop, and a caller without one must NOT
 * — that second case is the opposite defect, a control with no name at all.
 */

// fileURLToPath, not `.pathname`: the route segment is a literal `[locale]`
// directory on disk, and a URL percent-encodes the brackets.
const COMPONENTS = fileURLToPath(new URL("../", import.meta.url));
const COMPOSER = join(COMPONENTS, "chat", "composer.tsx");

/** Every .tsx under _components, recursively. */
function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return sources(full);
    return e.name.endsWith(".tsx") ? [full] : [];
  });
}

const VISIBLE_LABEL = /<label\s+htmlFor="chat-input"(?![^>]*className="sr-only")/;
const SR_ONLY_LABEL = /<label\s+htmlFor=\{id\}\s+className="sr-only"/;

describe("the chat box has exactly one label", () => {
  test("the sr-only label stands down when the caller supplies its own", () => {
    // If this guard is ever dropped, every caller that renders a visible label
    // silently goes back to announcing the instruction twice.
    const src = readFileSync(COMPOSER, "utf8");
    assert.match(src, SR_ONLY_LABEL, "the composer should still carry a fallback label");
    assert.match(
      src,
      /\{!labelledOutside\s*&&\s*\(\s*<label\s+htmlFor=\{id\}/,
      "the composer's sr-only label must be guarded by `labelledOutside`",
    );
    // The label must point at the box's ACTUAL id rather than a constant: the
    // dock renders a second composer over pages that already have one, and a
    // hard-coded id would give both boxes the same name.
    assert.match(src, /<textarea\s+id=\{id\}/, "the box and its fallback label must share one id");
  });

  test("a caller renders its own label if and only if it says so", () => {
    const callers = sources(COMPONENTS).filter(
      (f) => f !== COMPOSER && readFileSync(f, "utf8").includes("<Composer"),
    );
    assert.ok(callers.length >= 2, "expected several places to render the composer");

    for (const file of callers) {
      const src = readFileSync(file, "utf8");
      const ownLabel = VISIBLE_LABEL.test(src);
      const declares = /labelledOutside(?!\?)/.test(src);
      assert.equal(
        ownLabel,
        declares,
        ownLabel
          ? `${file} renders its own <label htmlFor="chat-input"> but does not pass labelledOutside — the control gets two names`
          : `${file} passes labelledOutside but renders no visible label — the control gets none`,
      );
    }
  });

  test("the dock's box does not take the page's id", () => {
    /**
     * `htmlFor` and `getElementById` both resolve to the FIRST match in the
     * document. Two composers in ONE document would therefore share a label:
     * the reader tabs into one box and hears the name of the other.
     *
     * The invariant is narrower than "all ids are unique", and getting that
     * wrong is what the first version of this test did. The page-level
     * surfaces — the home fold, the full-screen chat, a group — are each on a
     * DIFFERENT page and never co-occur, so they may all use the default. The
     * dock is the one that floats over all of them, so it is the one that must
     * differ. Asserting global uniqueness would fail on three surfaces that
     * can never meet.
     */
    const composerIds = (file: string): string[] => {
      const src = readFileSync(file, "utf8");
      return [...src.matchAll(/<Composer[\s\S]*?\/>/g)].map((block) => {
        // A literal `id="…"`, a constant `id={NAME}` declared in the same file,
        // or nothing at all — which is the composer's own default.
        const literal = block[0].match(/\bid="([^"]+)"/);
        if (literal) return literal[1];
        const named = block[0].match(/\bid=\{(\w+)\}/);
        if (!named) return "chat-input";
        const declared = src.match(new RegExp(`const ${named[1]} = "([^"]+)"`));
        return declared ? declared[1] : `unresolved:${named[1]}`;
      });
    };

    const files = sources(COMPONENTS).filter((f) => f !== COMPOSER && !f.endsWith(".test.ts"));
    const dockFiles = files.filter((f) => f.endsWith("dock.tsx"));
    assert.equal(dockFiles.length, 1, "expected exactly one dock");

    const dockIds = dockFiles.flatMap(composerIds);
    const pageIds = files.filter((f) => !f.endsWith("dock.tsx")).flatMap(composerIds);

    assert.ok(dockIds.length >= 1, "the dock should render a composer");
    assert.ok(pageIds.length >= 1, "expected page-level composers too");

    for (const id of dockIds) {
      assert.ok(
        !pageIds.includes(id),
        `the dock's box claims "${id}", which a page-level composer also uses — the dock floats OVER those pages, so one would take the other's label`,
      );
    }
  });
});
