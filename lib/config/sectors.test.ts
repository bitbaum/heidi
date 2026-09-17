import { test } from "node:test";
import assert from "node:assert/strict";
import { FORBIDDEN_CLAIMS, SECTORS, sectorLocale } from "./sectors.ts";

/**
 * Sales copy is where "claim nothing untrue" is hardest to hold, so it is the
 * one place worth enforcing with a test rather than with good intentions.
 */

test("every sector is written in both languages, with nothing left blank", () => {
  for (const s of SECTORS) {
    for (const [field, copy] of Object.entries({
      name: s.name,
      moment: s.moment,
      stake: s.stake,
      offer: s.offer,
      unknown: s.unknown,
    })) {
      assert.ok(copy.de.trim().length > 0, `${s.id}.${field} has no German`);
      assert.ok(copy.en.trim().length > 0, `${s.id}.${field} has no English`);
      assert.notEqual(copy.de, copy.en, `${s.id}.${field} is the same string twice — one is untranslated`);
    }
  }
});

/**
 * THE RULE. No customers, no pilots, no case studies — because there are none.
 */
test("NO SECTOR CLAIMS A CUSTOMER THIS PRODUCT DOES NOT HAVE", () => {
  const everything = JSON.stringify(SECTORS).toLowerCase();
  for (const claim of FORBIDDEN_CLAIMS) {
    assert.ok(
      !everything.includes(claim.toLowerCase()),
      `the sector copy says "${claim}" — there are no customers, and a page that says otherwise is the fastest way to lose the first one`,
    );
  }
});

/**
 * `unknown` is the field that turns a page into a meeting. A sector without a
 * real question has quietly become a claim.
 */
test("every sector names something we would have to learn from them", () => {
  for (const s of SECTORS) {
    assert.ok(s.unknown.de.length > 30, `${s.id} has no real open question`);
    // A question, not a hedge: it has to be about THEM, not about us being humble.
    assert.ok(
      /\b(ob|was|wie|wer)\b/i.test(s.unknown.de),
      `${s.id}.unknown reads as modesty rather than as a question`,
    );
  }
});

test("the moment is a scene, not a benefit", () => {
  // The field that decides whether the rest gets read. Vendor abstractions are
  // what it exists instead of.
  const vendorSpeak = /\b(solution|synergy|empower|leverage|seamless|Lösung für alle|ganzheitlich)\b/i;
  for (const s of SECTORS) {
    assert.ok(s.moment.de.length > 80, `${s.id}.moment is too short to be a scene`);
    assert.ok(!vendorSpeak.test(s.moment.de + s.moment.en), `${s.id}.moment slipped into vendor language`);
  }
});

test("a sector that states a fact cites where to check it", () => {
  for (const s of SECTORS) {
    if (!s.fact) continue;
    assert.ok(s.fact.source.startsWith("https://"), `${s.id} states a fact with no source`);
    assert.ok(s.fact.text.de.length > 40 && s.fact.text.en.length > 40, `${s.id} fact is not stated in both`);
  }
  // The strongest one is load-bearing for the schools argument and must stay.
  const schools = SECTORS.find((s) => s.id === "schools");
  assert.ok(schools?.fact, "the kindergarten dialect ruling is the whole schools case");
  assert.match(schools.fact.source, /zh\.ch/, "and it is cited to the canton, not to a newspaper");
});

test("the reader gets German in the German-speaking locales and English otherwise", () => {
  assert.equal(sectorLocale("de"), "de");
  assert.equal(sectorLocale("gsw"), "de", "a Züritüütsch reader is a German-speaking reader");
  assert.equal(sectorLocale("fr"), "en");
  assert.equal(sectorLocale("ru"), "en");
  assert.equal(sectorLocale("it"), "en");
  assert.equal(sectorLocale("rm"), "en");
});

test("the sectors are the ones with somebody else's problem to solve", () => {
  const ids = SECTORS.map((s) => s.id);
  for (const expected of ["care", "hospitals", "schools", "relocation"]) {
    assert.ok(ids.includes(expected as never), `${expected} is missing`);
  }
  assert.equal(new Set(ids).size, ids.length, "duplicate sector id");
});
