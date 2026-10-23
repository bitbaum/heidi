import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * THE HOUSE RULE, WITH A NUMBER BEHIND IT.
 *
 * HEIDI.md §4: nothing outside `lib/variety/packs/` may name a Zurich form, a
 * German word or a Swiss fact — if swapping the pack would not swap the
 * product, something has leaked. The rule was prose. This is the gate: every
 * string literal in `lib/` (comments stripped, tests excluded) is checked for
 * the names a second product would have to find and remove, and the count
 * per file is pinned to a BASELINE that may fall and may never rise.
 *
 * A ratchet rather than a zero, because the day it was written the count
 * was not zero (see below) and a gate that fails on day one is a gate that
 * gets muted. The baseline is the to-do list for standing up the French
 * product (§4): each row is a file that would have to be touched, and the
 * right fix for most of them is to move the literal into the pack.
 *
 * Exempt, by design: the packs themselves; the situation packs (content, by
 * construction); the register of where to hear it (Swiss media, the subject);
 * the dictionaries (UI copy, translated per product); research, essays,
 * config and geography (facts about THIS deployment, replaced wholesale).
 */
const ROOT = join(import.meta.dirname, "..");

const NAMES =
  /Züri|Zürich|Zurich|Schweiz|Swiss|Hochdeutsch|Schwiizer|Bärn|\bBern\b|\bBasel\b|\bStandard German\b|\bGerman\b|\bDeutsch\b|\bgsw\b|\bde-CH\b/i;

const EXEMPT = [
  "variety/packs/",
  "situations/packs/",
  "listening/sources.ts",
  "i18n/dictionaries/",
  // The locale list and its endonyms are the UI languages of THIS product.
  "i18n/index.ts",
  "i18n/locales.ts",
  "research/",
  "essays/",
  "config/",
  "geo/",
  // The seams: the one line each that says which pack this build teaches.
  "variety/active.ts",
  "situations/active.ts",
];

/** Files and how many offending literals each may hold. Lower it when you fix one. */
export const BASELINE: Record<string, number> = {
  "domain/chat/moves.ts": 1,
  "domain/practice/templates/authored/gist.ts": 5,
  "domain/practice/templates/authored/reply.ts": 1,
  "domain/practice/templates/authored/transform.ts": 9,
  "domain/speaking/schedule.ts": 1,
  "variety/prompt.ts": 6,
  "voice/variety.ts": 13,
};

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...sources(full));
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

function literals(code: string): string[] {
  const stripped = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  return stripped.match(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g) ?? [];
}

export function leaks(): Record<string, string[]> {
  const found: Record<string, string[]> = {};
  for (const file of sources(ROOT)) {
    const rel = relative(ROOT, file);
    if (EXEMPT.some((e) => rel.startsWith(e))) continue;
    const hits = literals(readFileSync(file, "utf8")).filter((l) => NAMES.test(l));
    if (hits.length > 0) found[rel] = hits;
  }
  return found;
}

describe("the variety stays in the packs", () => {
  test("no file outside the packs names it more than it did, and no new file names it at all", () => {
    const found = leaks();
    const risen = Object.entries(found)
      .filter(([file, hits]) => hits.length > (BASELINE[file] ?? 0))
      .map(([file, hits]) => `${file}: ${hits.length} (allowed ${BASELINE[file] ?? 0}) — ${hits.slice(0, 3).join(", ")}`);
    assert.deepEqual(risen, [], `names of the variety leaked outside the packs:\n  ${risen.join("\n  ")}`);
  });

  test("the baseline does not hold on to files that are already clean", () => {
    const found = leaks();
    const stale = Object.keys(BASELINE).filter((file) => (found[file]?.length ?? 0) < BASELINE[file]);
    assert.deepEqual(stale, [], `lower the baseline for: ${stale.join(", ")}`);
  });
});
