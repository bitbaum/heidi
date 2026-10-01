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
 * test.
 *
 * The bug it describes shipped TWICE: the composer rendered an `sr-only` label
 * for `#chat-input`, a page rendered a visible one, and a screen reader read
 * the sentence twice. Then the dock floated a second box over those pages and
 * an id lookup found whichever came first.
 *
 * Since 2026-10-01 the box is `@bitbaum/chatkit`'s, named by `aria-label`, and
 * reached by a ref. That ends both bugs only while nobody brings back what
 * caused them — a `<label>` aimed at the box by id, or an id lookup — and
 * that is what this guards.
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

describe("the chat box has exactly one name", () => {
  test("the composer names its box once, through chatkit", () => {
    const src = readFileSync(COMPOSER, "utf8");
    assert.match(src, /ariaLabel=\{/, "the box must be given its name");
    assert.doesNotMatch(src, /<label\b/, "a <label> as well would be a second name");
  });

  test("no surface aims a label or a lookup at the box by id", () => {
    const callers = sources(COMPONENTS).filter(
      (f) => f !== COMPOSER && readFileSync(f, "utf8").includes("<Composer"),
    );
    assert.ok(callers.length >= 2, "expected several places to render the composer");
    for (const file of callers) {
      const src = readFileSync(file, "utf8");
      assert.doesNotMatch(
        src,
        /<label\s+htmlFor="chat-input"/,
        `${file} labels the box by id: chatkit already names it, so this is a second name`,
      );
      assert.doesNotMatch(
        src,
        /getElementById\("(chat-input|heidi-dock-input)"\)/,
        `${file} finds the box by id — with the dock over a page that finds the first box, not this one. Use inputRef.`,
      );
    }
  });
});

test("a repeated control names the line it acts on", () => {
  // One answer carries up to seven speak controls — the explanation, the
  // dialect line, one per suggestion — and four copy controls beside them.
  // Measured on the live site: every speak button had the accessible name
  // "Vorlesen" and every copy button "Kopieren", so tabbing the page gave
  // eleven controls with two names between them and no way to tell which
  // acted on which line.
  //
  // The fix is the shape `keep-word.tsx` already used ("Wort merken: nöd"):
  // the label BEGINS with the visible word, so a voice-control user saying
  // "click Vorlesen" still matches and this is not the visible-label-plus-
  // hidden-twin that this file's other test exists to forbid.
  const here = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

  assert.match(
    here("./speak-button.tsx"),
    /aria-label=\{`\$\{speaking \? t\.stop : t\.speak\}: \$\{preview\}`\}/,
    "the speak control does not say which line it reads",
  );
  assert.match(
    here("./copy-button.tsx"),
    /aria-label=\{`\$\{done \? t\.copied : t\.copy\}: /,
    "the copy control does not say which line it copies",
  );
});
