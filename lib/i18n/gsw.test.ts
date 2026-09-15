import { test } from "node:test";
import assert from "node:assert/strict";
import { getDictionary } from "./index.ts";
import { LOCALES, LOCALE_NAMES, LOCALE_TAGS, localesInGroup, negotiate } from "./locales.ts";
import { check } from "../variety/check.ts";
import { ZURICH_GERMAN } from "../variety/packs/gsw-zh.ts";

/**
 * The site now speaks the language it teaches — which means our own copy is
 * subject to our own rule. If Heidi's Züritüütsch cannot pass Heidi's dialect
 * gate, then either the gate is wrong or the copy is, and either way we would
 * rather find out here than have a Zurich reader find it on the home page.
 */

/** Every string in the dictionary, flattened, with a path to point at. */
function strings(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  }
  return [];
}

test("Heidi's own Swiss German passes Heidi's own dialect gate", () => {
  const dict = getDictionary("gsw");
  const failures: string[] = [];

  for (const [path, text] of strings(dict)) {
    // The dialect EXAMPLES are deliberately exempt: `check.placeholder` is
    // "Das isch nid güet, gäu" — a sentence chosen precisely because it fails,
    // so a reader can watch the checker catch something.
    if (path.startsWith("check.placeholder")) continue;

    const verdict = check(text, ZURICH_GERMAN);
    if (!verdict.ok) {
      failures.push(`${path}: ${verdict.findings.map((f) => f.form).join(", ")} — ${text.slice(0, 70)}`);
    }
  }

  assert.deepEqual(failures, [], `Swiss German copy failed the gate:\n${failures.join("\n")}`);
});

test("Swiss German is offered, and is NOT claimed to be a national language", () => {
  assert.ok(LOCALES.includes("gsw"));
  assert.equal(LOCALE_TAGS.gsw, "gsw-CH");

  // It sat in the "national" group next to Rumantsch, which states something
  // false about Switzerland — there are four national languages and this is
  // not one of them; it is a group of dialects OF one of them. On a site whose
  // credibility rests on Swiss language facts, that is the worst place to be
  // loose, so it has its own line.
  assert.equal(localesInGroup("national").includes("gsw"), false);
  assert.deepEqual(localesInGroup("dialect"), ["gsw"]);

  // Named with the FAMILY endonym, not the Zurich one. The locale code is gsw
  // (Swiss German) and every other surface says Swiss German; labelling the
  // site language "Züritüütsch" claimed something narrower than the product.
  assert.equal(LOCALE_NAMES.gsw, "Schwiizerdütsch");
});

test("a browser asking for Swiss German gets it rather than falling back to German", () => {
  assert.equal(negotiate("gsw-CH,gsw;q=0.9,de;q=0.8"), "gsw");
  // And plain German still gets German — gsw must not capture de.
  assert.equal(negotiate("de-CH,de;q=0.9"), "de");
});

test("Swiss German is a distinct translation, not a copy of the German", () => {
  const de = getDictionary("de");
  const gsw = getDictionary("gsw");
  assert.notEqual(gsw.home.headline, de.home.headline);
  // "Methode" is spelled the same in both, which is why this asserts on a
  // word that actually differs rather than one that happens not to.
  assert.notEqual(gsw.nav.home, de.nav.home);
  assert.notEqual(gsw.settings.title, de.settings.title);
});

test("the Swiss German copy uses no ß, like the German copy", () => {
  // ß is not used anywhere in Switzerland, and the gate rejects it in dialect.
  assert.equal(JSON.stringify(getDictionary("gsw")).includes("ß"), false);
});

test("the assistant answers Swiss German readers in Swiss German", () => {
  // The one locale where the UI language and the taught variety are the same.
  // The explanation language is named so a model recognises it, and whatever
  // comes back faces the same gate as any other generated line.
  const dict = getDictionary("gsw");
  assert.match(dict.chat.explanationsIn, /Züritüütsch/);
});
