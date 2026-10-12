import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, typoCases, words } from "@bitbaum/searchkit";
import { VARIETY } from "../../variety/active.ts";
import { dialectSpelling, findWords, vocabularySearch } from "./search.ts";

const VOCABULARY = VARIETY.vocabulary ?? [];
const searcher = vocabularySearch(VOCABULARY);
const find = (query: string) => findWords(searcher, VOCABULARY, query).map(({ word }) => word.target);
const first = (query: string) => find(query)[0];

test("either side, any case, any accent", () => {
  assert.equal(first("karo"), "Rüebli");
  assert.equal(first("RÜEB"), "Rüebli");
  assert.equal(first("ruebli"), "Rüebli", "typed without the umlaut");
  assert.equal(first("nod"), "nöd");
});

test("spellings writers mix for one sound find each other", () => {
  assert.equal(first("vilicht"), "villicht");
  assert.equal(first("vielicht"), "villicht");
  assert.equal(first("spoter"), "spööter");
  assert.equal(first("zit"), "Ziit");
  assert.equal(first("schribe"), "schriibe");
  assert.equal(first("spiele"), "spile");
  assert.equal(first("uf wiederluege"), "Uf Widerluege");
  assert.equal(first("hus"), "Huus");
  assert.equal(dialectSpelling("viel"), dialectSpelling("vill"));
});

test("one slip still finds the word", () => {
  assert.equal(first("schwöchter"), "Schwöschter");
  assert.equal(first("gruezu"), "Grüezi");
  assert.equal(first("gipfleli"), "Gipfeli");
  assert.equal(first("härdöfpel"), "Härdöpfel");
  assert.equal(first("kartofel"), "Härdöpfel", "the German side forgives too");
});

test("a blank query is the whole list in the order given; a wrong one nothing", () => {
  assert.deepEqual(find("  "), VOCABULARY.map((w) => w.target));
  assert.deepEqual(find("xylofon"), []);
});

test("ties keep the order given, so the word worth learning first stays first", () => {
  // «Salü» and «Hoi» both mean exactly «Hallo»: nothing but the order decides.
  const pair = (list: typeof VOCABULARY) =>
    findWords(vocabularySearch(list), list, "hallo")
      .slice(0, 2)
      .map(({ word }) => word.target);
  const given = pair(VOCABULARY);
  assert.deepEqual([...given].sort(), ["Hoi", "Salü"]);
  assert.deepEqual(pair([...VOCABULARY].reverse()), [...given].reverse());
});

test("matches carry ranges to mark", () => {
  const [hit] = findWords(searcher, VOCABULARY, "karo");
  assert.deepEqual(hit?.match?.bridge, [{ start: 0, end: 4 }]);
});

const NAMES = VOCABULARY.map((word) => ({ id: word.target, name: word.target }));

/**
 * Every one-slip misspelling of every word in the list — a neighbouring key,
 * a dropped, doubled or swapped letter — generated, not imagined (~9700).
 *
 * Not "always first", and it should not be: a slip often lands on ANOTHER
 * word of the list (`cho` is `scho` without its first letter, and a word of
 * its own), and `dialectSpelling` shortens some four-letter words to three
 * (`vill` → `vil`), too short for a typo. Measured at 0.90 / 0.97; this is
 * the floor, so a change that loses ground fails here.
 */
test("one slip in any word of the list still finds it", async () => {
  const report = await evaluate(typoCases(NAMES, { fold: words }), find);
  assert.ok(report.successAt1 >= 0.9, `success@1 ${report.successAt1}`);
  assert.ok(report.successAt3 >= 0.96, `success@3 ${report.successAt3}`);
});

/**
 * The case the spelling rule exists for: a word written the other way the
 * dialect is written — `schribe` for `schriibe`, `Hus` for `Huus` — AND
 * slipped once. Without the rule this found its word 0.24 of the time.
 */
test("another writer's spelling, slipped once, still finds it", async () => {
  const otherSpelling = NAMES.filter(({ name }) => /(.)\1/i.test(name)).map(({ id, name }) => ({
    id,
    name: name.toLowerCase().replace(/(.)\1+/g, "$1"),
  }));
  const report = await evaluate(typoCases(otherSpelling, { fold: words }), find);
  assert.ok(report.successAt1 >= 0.9, `success@1 ${report.successAt1}`);
  assert.ok(report.successAt3 >= 0.97, `success@3 ${report.successAt3}`);
});
