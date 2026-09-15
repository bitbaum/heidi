import { test } from "node:test";
import assert from "node:assert/strict";
import { SOURCES, citation, shortCitation, type SourceId } from "./sources.ts";
import { getDictionary } from "../i18n/index.ts";
import { LOCALES } from "../i18n/locales.ts";

/**
 * The research page exists to stop this product claiming more than it can
 * show. It spent months asserting effect sizes behind author-and-year strings
 * that linked nowhere, which is the same failure in the one place it is least
 * affordable.
 *
 * These are the properties that keep it honest.
 */

test("every claim in every locale names a source that exists", () => {
  for (const locale of LOCALES) {
    const t = getDictionary(locale).research;
    for (const entry of [...t.facts, ...t.hypotheses]) {
      assert.ok(entry.source.length > 0, `${locale}: "${entry.claim}" cites nothing`);
      for (const id of entry.source) {
        assert.ok(id in SOURCES, `${locale}: "${entry.claim}" cites unknown source "${id}"`);
      }
    }
  }
});

test("every source is reachable — a link, not a mention", () => {
  for (const [id, s] of Object.entries(SOURCES)) {
    assert.match(s.url, /^https:\/\//, `${id} has no https link`);
    // A DOI or a stable catalogue record. A search results page or a PDF on
    // somebody's homepage is not a citation.
    assert.ok(
      /doi\.org|pubmed\.ncbi\.nlm\.nih\.gov|\.uzh\.ch|\.unibe\.ch/.test(s.url),
      `${id} does not resolve through a DOI or a stable record: ${s.url}`,
    );
    assert.ok(s.authors.length > 0 && s.title.length > 0 && s.venue.length > 0, `${id} is missing reference details`);
    assert.ok(s.year > 1950 && s.year <= new Date().getFullYear(), `${id} has an implausible year`);
  }
});

test("the same claim cites the same source in every language", () => {
  // Citations used to live in the dictionaries, so someone translated one —
  // the same corpus was credited to "University of Bern", "Universität Bern"
  // and "Университет Берна". A reference is not translatable, so it is named
  // by id and the id must not vary by locale.
  const byLocale = LOCALES.map((l) => {
    const t = getDictionary(l).research;
    return [...t.facts, ...t.hypotheses].map((e) => e.source.join("+"));
  });

  for (const row of byLocale.slice(1)) {
    assert.deepEqual(row, byLocale[0], "a locale cites different sources than the others");
  }
});

test("no source is defined but never cited", () => {
  // A registry that outgrows the page is one where a stale reference sits
  // waiting to be attached to the wrong claim.
  const used = new Set<string>();
  for (const locale of LOCALES) {
    const t = getDictionary(locale).research;
    for (const entry of [...t.facts, ...t.hypotheses]) for (const id of entry.source) used.add(id);
  }
  const orphans = Object.keys(SOURCES).filter((id) => !used.has(id));
  assert.deepEqual(orphans, [], `defined but never cited: ${orphans.join(", ")}`);
});

test("a reference renders as a reference", () => {
  const id = "yang-2021" satisfies SourceId;
  assert.match(citation(id), /Yang.*2021.*Psychological Bulletin/);
  assert.equal(shortCitation(id), "Yang, Luo, Vadillo, Yu & Shanks 2021");
});
