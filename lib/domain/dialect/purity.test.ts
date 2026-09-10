import { test } from "node:test";
import assert from "node:assert/strict";
import { checkZurichPurity } from "./purity.ts";

// Mutation-style: every forbidden form must be caught on its own, every
// allowed form must pass on its own. A rule that silently stops matching
// turns one of these red.
const FORBIDDEN: Array<[string, string]> = [
  ["tüütsch", "Ostschweiz"],
  ["tütsch", "Ostschweiz"],
  ["nid", "Ostschweiz"],
  ["güet", "Bernese"],
  ["gäu", "Bernese"],
  ["öu", "Bernese"],
  ["Löu", "Bernese"], // any word carrying the diphthong
  ["sai", "Basel"],
  ["Strasse mit ß", "ß"],
];

const ALLOWED = ["nöd", "chli", "guet", "grad", "au", "mer gönd", "mer mached", "mer händ", "Züri", "Züritüütsch", "Schwiizertüütsch"];

for (const [form, why] of FORBIDDEN) {
  test(`rejects ${JSON.stringify(form)} (${why})`, () => {
    const r = checkZurichPurity(`Das isch ${form} gsi.`);
    assert.equal(r.ok, false);
    assert.ok(r.violations.length >= 1);
    assert.ok(r.violations[0].reason.length > 0);
  });
}

for (const form of ALLOWED) {
  test(`passes ${JSON.stringify(form)}`, () => {
    const r = checkZurichPurity(`Ja, ${form} — das stimmt.`);
    assert.deepEqual(r, { ok: true, violations: [] });
  });
}

test("is case-insensitive and reports the offset", () => {
  const r = checkZurichPurity("Nid so.");
  assert.equal(r.ok, false);
  assert.equal(r.violations[0].form, "Nid");
  assert.equal(r.violations[0].index, 0);
});

test("reports multiple violations in text order", () => {
  const r = checkZurichPurity("gäu, das isch nid güet");
  assert.deepEqual(
    r.violations.map((v) => v.form),
    ["gäu", "nid", "güet"],
  );
});
