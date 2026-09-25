import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { MEASURES } from "./capability.ts";

/**
 * A CLAIM MAY NOT OUTRUN THE PRODUCT.
 *
 * `capability.ts` computes whether a measure is POSSIBLE for a variety — what
 * recognition exists, what evidence it yields. It did not ask whether the
 * product actually DOES it, and that gap shipped: `/technology` said grammar
 * was checked on Swiss Standard German while no code in the app called the
 * grammar module. The page was derived from the engine, and the engine was
 * never plugged in.
 *
 * So this walks the import graph from every file under `app/` and requires,
 * for each offered measure, that some REACHABLE file imports its `entry` — the
 * function that makes the measure real. Reachable, not directly under `app/`:
 * the word check is called from `domain/speaking/feedback.ts`, which the page
 * imports. And by the imported NAME rather than a file path, because most of
 * the engine now lives in `@bitbaum/speechkit`, and a product imports a
 * package's name for a thing, never its internal file.
 *
 * A module that is only reached from tests is exactly the failure this exists
 * for, so `*.test.ts` files are never walked.
 */

const ROOT = resolve(import.meta.dirname, "../..");

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(path);
  }
  return out;
}

const SPECIFIER = /(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g;

function resolveImport(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(ROOT, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null; // a package, not ours
  const candidates = [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

/** Every file of ours reachable from the app, as repo-relative paths. */
function reachableFromApp(): Set<string> {
  const seen = new Set<string>();
  const queue = sourceFiles(join(ROOT, "app"));
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file) || /\.test\.tsx?$/.test(file)) continue;
    seen.add(file);
    for (const match of readFileSync(file, "utf8").matchAll(SPECIFIER)) {
      const target = resolveImport(file, match[1]!);
      if (target && !seen.has(target)) queue.push(target);
    }
  }
  return new Set([...seen].map((f) => relative(ROOT, f)));
}

const REACHABLE = reachableFromApp();

/** Every name imported by a reachable file, from anywhere. */
function importedNames(): Set<string> {
  const names = new Set<string>();
  const block = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["'][^"']+["']/g;
  for (const file of REACHABLE) {
    for (const match of readFileSync(join(ROOT, file), "utf8").matchAll(block)) {
      for (const part of match[1]!.split(",")) {
        // `type X`, `X as Y` — the name imported is the first identifier.
        const name = part.replace(/^\s*type\s+/, "").trim().split(/\s+as\s+/)[0]!.trim();
        if (name) names.add(name);
      }
    }
  }
  return names;
}

const IMPORTED = importedNames();

test("every measure the technology page may claim is actually called by the product", () => {
  for (const measure of MEASURES) {
    if (measure.refused) continue;
    assert.ok(
      IMPORTED.has(measure.entry),
      `${measure.id} depends on ${measure.entry}(), which nothing reachable from app/ imports. ` +
        "Either wire it in or stop offering it — the technology page is rendering a claim the product does not keep.",
    );
  }
});

test("the walk itself works: known positives are found, and tests are never walked", () => {
  // Rung 4 for a detector: a resolver that reaches nothing fails the test
  // above loudly, but one that reaches EVERYTHING (e.g. walking tests, where
  // every entry is imported) would pass silently.
  assert.ok(REACHABLE.has("lib/variety/display.ts"), "the app imports display.ts everywhere");
  assert.ok(![...REACHABLE].some((f) => /\.test\.tsx?$/.test(f)), "tests are never part of the product");
  assert.ok(IMPORTED.has("DISPLAY"), "a name every page imports must be seen");
  assert.ok(!IMPORTED.has("definitelyNotImportedAnywhere"), "and an invented one must not");
});
