import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * `globals.css` is the only source for type and colour, and this is what makes
 * that sentence true rather than aspirational.
 *
 * WHY IT EXISTS. A responsive audit of every page found caption text at ten and
 * eleven pixels — below what anybody reads on a phone — written as an
 * arbitrary Tailwind size in 43 files and 121 places. Every one of them was somebody
 * making a reasonable local decision, and together they were a type scale
 * nobody owned and nobody could change. Fixing the 121 without this test would
 * buy a clean tree and the same problem in six weeks.
 *
 * So the rule is structural: a size or a colour that is not a token fails the
 * build, with the token to use named in the message.
 */

const ROOT = join(import.meta.dirname, "..", "..");

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".claude") continue;
    // This file quotes the patterns it forbids, so scanning itself reports
    // its own documentation as a violation — a check that cannot pass while
    // explaining what it checks.
    if (entry === "tokens.design.test.ts") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...sources(path));
    else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) out.push(path);
  }
  return out;
}

const FILES = [...sources(join(ROOT, "app")), ...sources(join(ROOT, "lib"))];

/** The file's path as a reader would cite it. */
const shown = (path: string) => path.slice(ROOT.length + 1);

test("no component sets a font size outside the type scale", () => {
  // An arbitrary pixel or rem size in a className, rather than a token.
  const arbitrary = /\btext-\[[0-9.]+(px|rem|em|pt)\]/g;
  const offenders: string[] = [];

  for (const file of FILES) {
    const body = readFileSync(file, "utf8");
    for (const hit of body.match(arbitrary) ?? []) offenders.push(`${shown(file)}: ${hit}`);
  }

  assert.deepEqual(
    offenders,
    [],
    `Type belongs in app/globals.css. Use text-caption for a label, or add a token:\n${offenders.join("\n")}`,
  );
});

test("no component paints a colour outside the palette", () => {
  // `bg-[#ff5c00]`, `text-[#333]` — a hex value in a className. Retheming the
  // product is meant to be an edit to one file, and every one of these is a
  // place that edit would miss.
  const arbitraryColour = /\b(?:bg|text|border|fill|stroke|ring|shadow|from|via|to)-\[#[0-9a-fA-F]{3,8}\]/g;
  const offenders: string[] = [];

  for (const file of FILES) {
    const body = readFileSync(file, "utf8");
    for (const hit of body.match(arbitraryColour) ?? []) offenders.push(`${shown(file)}: ${hit}`);
  }

  assert.deepEqual(
    offenders,
    [],
    `Colour belongs in app/globals.css as a semantic token:\n${offenders.join("\n")}`,
  );
});

/**
 * The token the sweep moved everything onto has to actually exist, or this
 * whole file passes while the site renders at the browser default.
 */
test("the caption token is declared, and is big enough to read on a phone", () => {
  const css = readFileSync(join(ROOT, "app", "globals.css"), "utf8");
  const match = css.match(/--text-caption:\s*([0-9.]+)rem/);
  assert.ok(match, "--text-caption is missing from globals.css");

  const px = Number(match[1]) * 16;
  assert.ok(px >= 12, `--text-caption is ${px}px; below 12px is what the audit flagged in the first place`);
});
