import { test } from "node:test";
import assert from "node:assert/strict";
import { LISTENING_SOURCES } from "./sources.ts";
import { areasOf } from "../variety/family.ts";
import { getDictionary } from "../i18n/index.ts";
import { LOCALES } from "../i18n/locales.ts";
import { VARIETY } from "../variety/active.ts";

/**
 * A list of Swiss media is worth nothing to a learner and is one search away.
 * What this register is FOR is the variety label on each row — and a label
 * nobody can check is exactly the lemons market §6 built the variety gate to
 * close, one level up.
 *
 * These tests hold the properties that make the register worth publishing.
 */

test("every row says what is spoken, and where that claim came from", () => {
  for (const s of LISTENING_SOURCES) {
    assert.ok(s.spoken, `${s.id} does not say what is spoken`);
    assert.ok(s.basis, `${s.id} claims "${s.spoken}" on no basis`);
  }
});

test("no row claims somebody listened, because nobody has", () => {
  // The moment this fails, the register has become better than it was and the
  // page copy that says "labelled from format, not yet verified by ear" has
  // to change with it. Failing loudly is the point: an upgrade in what we
  // know must not quietly leave the page saying the old thing.
  const listened = LISTENING_SOURCES.filter((s) => s.basis === "listened");
  assert.deepEqual(
    listened.map((s) => s.id),
    [],
    "a row claims `listened` — update the page copy and this test together",
  );
});

test("the register is mostly dialect, or it is a media list wearing a label", () => {
  // The same shape as the vocabulary page's test, for the same reason: the
  // useful version and the useless version of this page look identical from
  // a distance, and only a count tells them apart.
  const dialectal = LISTENING_SOURCES.filter((s) => s.spoken === "dialect" || s.spoken === "mixed");
  assert.ok(
    dialectal.length * 2 > LISTENING_SOURCES.length,
    `only ${dialectal.length} of ${LISTENING_SOURCES.length} rows are dialect or mixed`,
  );
});

test("Standard German rows are here on purpose, and there are some", () => {
  // The diglossia trap only gets taught if the trap is in the register. A
  // version of this file with every Standard German row removed would be
  // tidier and would leave the learner to discover Tagesschau alone.
  const standard = LISTENING_SOURCES.filter((s) => s.spoken === "standard");
  assert.ok(standard.length >= 2, "no Standard German rows — the diglossia trap is not being taught");
});

test("every area names a dialect area the atlas has", () => {
  const known = new Set(areasOf(VARIETY).map((a) => a.id));
  for (const s of LISTENING_SOURCES) {
    if (!s.area) continue;
    assert.ok(known.has(s.area), `${s.id} names area "${s.area}", which the atlas does not have`);
  }
});

test("ids and urls are unique", () => {
  const ids = new Set<string>();
  const urls = new Set<string>();
  for (const s of LISTENING_SOURCES) {
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`);
    assert.ok(!urls.has(s.url), `duplicate url ${s.url} (${s.id})`);
    ids.add(s.id);
    urls.add(s.url);
  }
});

test("every url is https and every row carries a check date that has passed", () => {
  for (const s of LISTENING_SOURCES) {
    assert.match(s.url, /^https:\/\//, `${s.id} is not an https link`);
    assert.match(s.checked, /^\d{4}-\d{2}-\d{2}$/, `${s.id} has no ISO check date`);
    assert.ok(
      new Date(s.checked).getTime() <= Date.now(),
      `${s.id} was checked in the future, which means the date was typed rather than measured`,
    );
  }
});

test("films and series link to a page about them, not to a play button", () => {
  // Streaming rights move; a `play` link to a Swiss film is a link that will
  // be wrong within the year, and the link sweep would then delete a row that
  // is still a perfectly good recommendation.
  for (const s of LISTENING_SOURCES) {
    if (s.medium !== "film" && s.medium !== "series") continue;
    assert.equal(s.linkKind, "about", `${s.id} promises a play link to a film`);
  }
});

test("there is something for a learner who cannot reach Play SRF", () => {
  // Most of the register's television is geo-blocked. Someone learning Zurich
  // German before they move — which is a large share of the people with this
  // problem — must not open the page to a wall of unreachable links.
  const open = LISTENING_SOURCES.filter((s) => s.reach === "open" && s.spoken !== "standard");
  assert.ok(open.length >= 10, `only ${open.length} dialect sources play outside Switzerland`);
});

test("no row carries a difficulty number", () => {
  // Prove by shape, not by intention: `demand()` derives an ordering from
  // observable properties, and the moment a hand-written level appears on a
  // row the derivation has been quietly abandoned.
  for (const s of LISTENING_SOURCES) {
    const row = s as Record<string, unknown>;
    for (const forbidden of ["level", "difficulty", "cefr", "stars", "rating"]) {
      assert.ok(!(forbidden in row), `${s.id} carries a hand-written "${forbidden}"`);
    }
  }
});

test("every commentary names a source that exists, in every language", () => {
  // Commentary is keyed by source id, so a renamed or dropped row leaves a
  // paragraph nothing renders — invisible, and wrong in seven languages at
  // once. This is the join, checked.
  const ids = new Set(LISTENING_SOURCES.map((s) => s.id));
  for (const locale of LOCALES) {
    const commentary = getDictionary(locale).listening.commentary as Record<string, string>;
    for (const id of Object.keys(commentary)) {
      assert.ok(ids.has(id), `${locale}: commentary for "${id}", which is not in the register`);
      assert.ok(commentary[id].trim().length > 0, `${locale}: commentary for "${id}" is empty`);
    }
  }
});

test("every language comments on the same titles", () => {
  // Not a shape test: a missing key here means one language silently says less
  // about a film than another, which is the failure key-parity alone misses.
  const german = Object.keys(getDictionary("de").listening.commentary).sort();
  for (const locale of LOCALES) {
    const mine = Object.keys(getDictionary(locale).listening.commentary).sort();
    assert.deepEqual(mine, german, `${locale} comments on a different set of titles`);
  }
});

test("every film and series says which dialect it is, or admits it does not know", () => {
  // The point of the section. A film row with no area and no commentary is a
  // title with nothing a learner can act on — which is the state the register
  // was in before somebody asked for this.
  const commentary = getDictionary("de").listening.commentary as Record<string, string>;
  for (const s of LISTENING_SOURCES) {
    if (s.medium !== "film" && s.medium !== "series") continue;
    assert.ok(s.area || commentary[s.id], `${s.id} names neither a dialect area nor anything about itself`);
  }
});

test("the Zurich features are here, because that was the scarce thing", () => {
  // Recorded as a property rather than a comment: the register's own finding
  // was that Zurich material is scarce, and the fix was to go and find some.
  const zurichFeatures = LISTENING_SOURCES.filter(
    (s) => (s.medium === "film" || s.medium === "series") && s.area === "zueriduetsch",
  );
  assert.ok(zurichFeatures.length >= 3, `only ${zurichFeatures.length} Zurich features in the register`);
});

test("the maintainer note never reaches a reader", () => {
  // `providers.ts` and `language-tech.ts` both record having leaked an
  // English source-copy field into a translated page. This asserts the shape
  // that makes it possible, so the next person sees the rule before the bug.
  const withNotes = LISTENING_SOURCES.filter((s) => s.note);
  assert.ok(withNotes.length > 0, "no notes at all — this test is no longer checking anything");
  for (const s of withNotes) {
    assert.equal(typeof s.note, "string");
  }
});
