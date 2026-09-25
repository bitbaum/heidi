import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAgainst } from "./check.ts";
import { ZURICH_GERMAN } from "./packs/gsw-zh.ts";
import { DISPLAY } from "./display.ts";
import { getDictionary } from "../i18n/index.ts";
import { LOCALES } from "../i18n/locales.ts";
import { ROADMAP } from "../config/roadmap.ts";
import { CHANGELOG } from "../config/changelog.ts";
import { SCENES } from "../situations/display.ts";

/**
 * The name of what Heidi teaches, spelled right in every language.
 *
 * The site called Zurich German «Züritüütsch» ninety times — in German,
 * English, Russian, on the dialect map and in its own URL — while its own gate
 * rejected bare «tüütsch» as an eastern form. Only the Swiss German dictionary
 * was gated, and the rule exempted the compound. So the one rule about the
 * name runs here over EVERY string a reader can see, whatever the language.
 */
const nameRule = ZURICH_GERMAN.rules.filter((r) => r.display?.includes("tüütsch"));

function strings(value: unknown, path: string, out: [string, string][]) {
  if (typeof value === "string") out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => strings(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) strings(v, path ? `${path}.${k}` : k, out);
  return out;
}

test("the rule exists — this test cannot pass by finding nothing to apply", () => {
  assert.equal(nameRule.length, 1);
  assert.equal(checkAgainst("Züritüütsch", nameRule).ok, false);
});

test("no reader-facing string names Zurich German with the eastern t", () => {
  const all: [string, string][] = [];
  for (const locale of LOCALES) strings(getDictionary(locale), `dict.${locale}`, all);
  // `DISPLAY.rules` lists the forms the gate REJECTS, to show them on /method —
  // the one place a forbidden form belongs on the page.
  strings({ ...DISPLAY, rules: [] }, "DISPLAY", all);
  strings(SCENES, "SCENES", all);
  strings(ROADMAP, "ROADMAP", all);
  strings(CHANGELOG, "CHANGELOG", all);
  // Other regions' own names for their dialect are names, and the checker
  // leaves them alone by construction (only the bare word and the Zurich or
  // generic compounds match) — so there is no allowlist here to grow.
  const bad = all.filter(([, s]) => !checkAgainst(s, nameRule).ok).map(([p, s]) => `${p}: ${s.slice(0, 80)}`);
  assert.deepEqual(bad, []);
});
