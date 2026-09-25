import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { DISPLAY } from "./display.ts";
import { VARIETY } from "./active.ts";
import { PACK_ITEMS } from "../domain/practice/published.ts";

/**
 * A variety pack is authored in ONE language — ours — because it is data about
 * a language, read by whoever maintains it and by the model. Some of its
 * fields are English prose, and they must never reach a reader.
 *
 * They reached readers three times: a paragraph of English at the foot of the
 * dialect checker in all seven locales, another on the About page, and a
 * finding that explained a Bernese form in English to a French reader. Each
 * was fixed where it was found, which is exactly why there was a third.
 *
 * So the rule is structural rather than remembered: components render
 * `DISPLAY`, which does not carry those fields, and this test fails the build
 * if a component reaches for the full pack instead.
 */

const SOURCE_ONLY = ["reason", "cue", "note", "who", "because"] as const;

function tsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...tsxFiles(path));
    else if (entry.endsWith(".tsx")) out.push(path);
  }
  return out;
}

test("no component imports the full variety pack", () => {
  // API routes may: they build the model's prompt, and the prompt is English
  // on purpose. `.tsx` is pages and components — everything a reader sees.
  //
  // A page that needs more of the pack than `DISPLAY` carries gets its own
  // projection rather than an exception: see `PACK_ITEMS`, and the walk below
  // that holds it to the same rule.
  const offenders = tsxFiles("app").filter((f) => /from ["'][^"']*variety\/active["']/.test(readFileSync(f, "utf8")));

  assert.deepEqual(
    offenders,
    [],
    `These render to a reader and must import lib/variety/display instead:\n${offenders.join("\n")}`,
  );
});

test("the display projection drops every English-prose field", () => {
  // Walk the projection and assert none of the source-only keys survived,
  // so adding one to the pack cannot quietly add it here.
  const seen: string[] = [];
  const walk = (value: unknown, path: string) => {
    if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`));
    if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        if ((SOURCE_ONLY as readonly string[]).includes(k)) seen.push(`${path}.${k}`);
        walk(v, `${path}.${k}`);
      }
    }
  };
  walk(DISPLAY, "DISPLAY");

  assert.deepEqual(seen, [], `source-language fields leaked into DISPLAY: ${seen.join(", ")}`);
});

test("the practice items are a projection too, and carry no prose either", () => {
  /**
   * The second thing a page is allowed to see of the pack.
   *
   * `/practice` genuinely needs the rules, the grammar examples and the
   * vocabulary — so it would have been the fourth place English reached a
   * reader, had it imported the pack. It imports `PACK_ITEMS` instead, and
   * this is the check that makes that worth anything: the same walk, over the
   * same forbidden keys, on the artefact that actually reaches the browser.
   *
   * Without it, adding an `explanation` to an item type would ship English to
   * a French learner and no test would notice.
   */
  const seen: string[] = [];
  const walk = (value: unknown, path: string) => {
    if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`));
    if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        if ((SOURCE_ONLY as readonly string[]).includes(k)) seen.push(`${path}.${k}`);
        walk(v, `${path}.${k}`);
      }
    }
  };
  walk(PACK_ITEMS, "PACK_ITEMS");

  assert.deepEqual(seen, [], `source-language fields leaked into the practice items: ${seen.join(", ")}`);
  // And it must not be empty, or the walk above proves nothing.
  assert.ok(PACK_ITEMS.length > 0, "the pack generates no practice items at all");
});

test("the projection still carries what a page actually needs", () => {
  // The other half of the guarantee: dropping too much would send someone
  // straight back to importing the pack.
  assert.equal(DISPLAY.endonym, VARIETY.endonym);
  assert.equal(DISPLAY.rules.length, VARIETY.rules.length);
  assert.equal(DISPLAY.correspondences.length, VARIETY.correspondences.length);
  assert.ok(DISPLAY.rules.every((r) => r.label.length > 0), "every rule must be printable");
  assert.ok(DISPLAY.family?.atlas, "the map still needs the atlas");
});

test("the projection carries no English name for anything", () => {
  /**
   * THE FOURTH ESCAPE OF THIS KIND, and the first two that did not look like
   * prose. `name` was "Zurich German" and `region` was "Canton of Zürich,
   * Switzerland"; `family.name` was "Swiss German". All three were ENGLISH,
   * all three survived the projection, and all three rendered in the footer of
   * every page in every language — reported by a reader looking at the German
   * site and finding a canton described in English.
   *
   * They got through because a name and a region read as DATA until you try to
   * say them in another language. An endonym really is data — «Züridütsch» is
   * what it is called in Russian too, because it is what the speakers call it.
   * An exonym is a translation that happens to be in English.
   *
   * So this asserts the shape exhaustively rather than banning the two field
   * names: an allow-list fails when somebody adds a field, and a deny-list
   * passes until somebody adds the wrong one — which is exactly how these
   * three survived three previous rounds of this same lesson.
   */
  assert.deepEqual(
    Object.keys(DISPLAY).sort(),
    [
      "areas",
      "capabilities",
      "correspondences",
      "dialectGroups",
      "endonym",
      "family",
      "fillers",
      "grammar",
      "orthography",
      "practice",
      "rules",
      "showcase",
      "speech",
      "speechRule",
      "tag",
      "vocabulary",
      "vocabularySources",
    ],
    "a field reached the projection that has not been checked for English",
  );

  assert.deepEqual(
    Object.keys(DISPLAY.family ?? {}).sort(),
    ["atlas", "endonym", "planned"],
    "the family carries its endonym, never its English name",
  );
});

test("what survives is names, places and letters — not sentences", () => {
  // The reason the projection is safe in every locale: a place name and a
  // dialect form read the same in Russian as in German. A sentence does not.
  for (const rule of DISPLAY.rules) {
    if (rule.origin) {
      assert.ok(!rule.origin.includes(" —"), `origin "${rule.origin}" looks like prose`);
      assert.ok(rule.origin.split(/\s+/).length <= 2, `origin "${rule.origin}" should be a place name`);
    }
    if (rule.suggest) {
      assert.ok(rule.suggest.split(/\s+/).length <= 2, `suggest "${rule.suggest}" should be a form`);
    }
  }
});
