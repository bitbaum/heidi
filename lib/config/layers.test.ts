import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Which layer is on top — one scale for the whole site.
 *
 *   ≤ 40   the page: sticky bars, drawers, popovers inside a page
 *     45   the site header, and every panel it opens
 *     50   overlays that cover the header on purpose: dialogs, sheets, the
 *          open chat, a full-screen task
 *
 * The defect that made this a test: on /chat the header's menus did not show.
 * Two causes, each plausible in its own file. A stylesheet rule set the header
 * to `position: static` there, which switches its z-index off and makes the
 * menus (`absolute top-full`) hang off the page instead of the header — below
 * the bottom of the screen. And the header was z-30, the same as the chat's
 * conversation list, which comes later in the document and so wins a tie.
 * Nothing compared the numbers, and nothing read the stylesheet.
 */

const ROOT = join(import.meta.dirname, "..", "..");
const HEADER = 45;

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".claude") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...sources(path));
    else if (entry.endsWith(".tsx")) out.push(path);
  }
  return out;
}

/** Files allowed at 50, each because it is meant to cover the header. */
const OVERLAYS: Record<string, string> = {
  "app/[locale]/_components/model-sheet.tsx": "a dialog",
  "app/[locale]/_components/session/settings.tsx": "a bottom sheet",
  "app/[locale]/_components/focus-surface.tsx": "a full-screen task on a phone",
  "app/[locale]/_components/chat/dock.tsx": "the open chat panel",
  "app/[locale]/layout.tsx": "the skip link, while focused",
  // Inside the header's own layer (the phone menu sheet), so 50 there is
  // relative to the header and cannot rise above a real overlay.
  "app/[locale]/_components/site-header.tsx": "the phone menu, inside the header",
};

const layers = sources(join(ROOT, "app")).flatMap((file) => {
  const text = readFileSync(file, "utf8");
  return [...text.matchAll(/(?:^|[\s"'`])(?:[a-z-]+:)*z-(\d+)\b/g)].map((m) => ({
    file: relative(ROOT, file),
    z: Number(m[1]),
  }));
});

test("the header sits above every layer a page uses", () => {
  const header = layers.filter((l) => l.file.endsWith("site-header.tsx"));
  assert.ok(header.some((l) => l.z === HEADER), `the header is no longer z-${HEADER}`);

  const tooHigh = layers.filter((l) => l.z >= HEADER && !(l.file in OVERLAYS));
  assert.deepEqual(
    tooHigh.map((l) => `${l.file}: z-${l.z}`),
    [],
    "a page layer at or above the header covers its menus; overlays are listed in OVERLAYS with a reason",
  );
});

test("no stylesheet rule unpositions the header", () => {
  const css = readFileSync(join(ROOT, "app", "globals.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [...css.matchAll(/([^{}]*\bheader\b[^{}]*)\{([^}]*)\}/g)];
  const offenders = rules
    .filter(([, , body]) => /position:\s*static/.test(body))
    .map(([, selector]) => selector.trim());
  assert.deepEqual(offenders, [], "a static header has no layer and its menus hang off the page");
});

test("nothing uses a layer above the overlays", () => {
  assert.deepEqual(
    layers.filter((l) => l.z > 50).map((l) => `${l.file}: z-${l.z}`),
    [],
  );
});
