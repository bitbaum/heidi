import { test } from "node:test";
import assert from "node:assert/strict";
import { SOURCES, citation, shortCitation, type Source, type SourceId } from "./sources.ts";
import { techSources } from "./language-tech.ts";
import { paperSources } from "../config/paper.ts";
import { ESSAYS } from "../essays/registry.ts";
import { areasOf } from "../variety/family.ts";
import { VARIETY } from "../variety/active.ts";
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
    const dict = getDictionary(locale);
    // `/practice` explains its own design on the page it describes, with the
    // same shape and therefore the same guarantee: a row that cites nothing
    // would be the product asserting a method with no evidence, on the page
    // whose entire point is that the method has some.
    const t = { facts: [...dict.research.facts, ...dict.practice.why], hypotheses: dict.research.hypotheses };
    for (const entry of [...t.facts, ...t.hypotheses]) {
      assert.ok(entry.source.length > 0, `${locale}: "${entry.claim}" cites nothing`);
      for (const id of entry.source) {
        assert.ok(id in SOURCES, `${locale}: "${entry.claim}" cites unknown source "${id}"`);
      }
    }
  }
});

test("every source is reachable — a link, not a mention", () => {
  // Typed as `Source` for the loop: `as const` gives each entry a literal
  // type where an omitted optional field simply is not there, so reading
  // `kind` off the union fails even though `satisfies` already proved every
  // entry is a Source.
  for (const [id, s] of Object.entries(SOURCES) as [string, Source][]) {
    assert.match(s.url, /^https:\/\//, `${id} has no https link`);

    if ((s.kind ?? "article") === "article") {
      /**
       * A DOI or a permanent proceedings record. A search results page or a
       * PDF on somebody's homepage is not a citation.
       *
       * WIDENED DELIBERATELY for the language-technology sources. Almost none
       * of that literature has a DOI, and that is not a quality signal: it is
       * published at ACL and its workshops, where the Anthology record is the
       * permanent citable identifier — more stable than many DOIs, free to
       * read, and what the papers themselves cite each other by. CEUR-WS is
       * the same arrangement for the Swiss Text conference.
       *
       * What is still refused is what was refused before: a link that is not a
       * record. An arXiv preprint has to come in through `doi.org/10.48550/…`
       * and say "preprint" in its venue, so a reader is told what they are
       * looking at rather than being shown a URL that resembles a journal.
       */
      assert.ok(
        /doi\.org|pubmed\.ncbi\.nlm\.nih\.gov|\.uzh\.ch|\.unibe\.ch|aclanthology\.org|ceur-ws\.org/.test(s.url),
        `${id} does not resolve through a DOI or a permanent proceedings record: ${s.url}`,
      );
    } else {
      // A reference work has no DOI and never will. What it must have is a
      // publisher or institution behind the link — the thing that makes it
      // citable — rather than a bookshop or a search result.
      assert.ok(
        !/amazon\.|zvab\.com|abebooks\.|\?q=|\/search/.test(s.url),
        `${id} links to a shop or a search, not a record: ${s.url}`,
      );
    }

    assert.ok(s.authors.length > 0 && s.title.length > 0 && s.venue.length > 0, `${id} is missing reference details`);
    // 1800 rather than 1950: the Idiotikon began publishing in 1881 and is
    // still going. A standing work is older than any paper here and no less
    // real for it.
    assert.ok(s.year > 1800 && s.year <= new Date().getFullYear(), `${id} has an implausible year`);
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

  // The same, for the practice page's own explanation of itself. A locale that
  // quietly cites a different paper for the same sentence is how two readers
  // end up being told two different things about why the product works.
  const practiceRows = LOCALES.map((locale) =>
    getDictionary(locale).practice.why.map((entry) => [...entry.source]),
  );
  for (const row of practiceRows) {
    assert.deepEqual(row, practiceRows[0], "a locale cites different sources than the others on /practice");
  }
});

test("no source is defined but never cited", () => {
  // A registry that outgrows the page is one where a stale reference sits
  // waiting to be attached to the wrong claim.
  const used = new Set<string>();
  for (const locale of LOCALES) {
    const t = getDictionary(locale).research;
    for (const entry of [...t.facts, ...t.hypotheses]) for (const id of entry.source) used.add(id);
    for (const entry of getDictionary(locale).practice.why) for (const id of entry.source) used.add(id);
  }
  // The research page is no longer the only thing that cites: a dialect area
  // vouches for itself the same way, and a source used only there is being
  // used, not orphaned.
  for (const area of areasOf(VARIETY)) for (const id of area.sources) used.add(id);
  for (const id of VARIETY.vocabularySources ?? []) used.add(id);
  // The technology page vouches for every figure it prints the same way, and
  // its data lives outside the dictionaries because a number is not
  // translatable. See `language-tech.ts`.
  for (const id of techSources()) used.add(id);
  // An essay vouches for itself the same way — see `lib/essays/types.ts`. A
  // source cited only by a piece of writing is being used, not orphaned.
  for (const essay of ESSAYS) for (const id of essay.sources) used.add(id);
  // And the white paper, which is the one surface that cites a source from
  // outside linguistics: §2's argument that a learner cannot audit what they
  // are sold IS Akerlof's asymmetric-information market, and the paper names
  // the original rather than paraphrasing it. See `lib/config/paper.ts`.
  for (const id of paperSources()) used.add(id);
  // So does a branch of the dialect family: "these areas form a group, and
  // this pair of forms is the line" is a claim about language like any other.
  for (const group of VARIETY.family?.dialectGroups ?? []) for (const id of group.sources) used.add(id);

  const orphans = Object.keys(SOURCES).filter((id) => !used.has(id));
  assert.deepEqual(orphans, [], `defined but never cited: ${orphans.join(", ")}`);
});

test("a reference renders as a reference", () => {
  const id = "yang-2021" satisfies SourceId;
  assert.match(citation(id), /Yang.*2021.*Psychological Bulletin/);
  assert.equal(shortCitation(id), "Yang, Luo, Vadillo, Yu & Shanks 2021");
});

/**
 * The reverse of the orphan check, and the one that matters more.
 *
 * `/method` exists to refuse unsourced claims, and an essay is where the
 * strongest claims on this site are made — how a language situation came to
 * be, why one country kept something another gave up. A piece that argues that
 * and names nothing is exactly the decoration-wearing-the-costume-of-evidence
 * this whole registry was built to remove.
 */
test("every essay names at least one source, and every source it names exists", () => {
  for (const essay of ESSAYS) {
    assert.ok(essay.sources.length > 0, `essay "${essay.slug}" cites nothing`);
    for (const id of essay.sources) {
      assert.ok(id in SOURCES, `essay "${essay.slug}" cites unknown source "${id}"`);
    }
    assert.ok(
      Object.keys(essay.text).length > 0,
      `essay "${essay.slug}" exists in no language and would be a dead row in the index`,
    );
  }
});

/** A branch of the family is a claim about language, and carries its atlas. */
test("every dialect group names a source that exists", () => {
  for (const group of VARIETY.family?.dialectGroups ?? []) {
    assert.ok(group.sources.length > 0, `dialect group "${group.id}" cites nothing`);
    for (const id of group.sources) {
      assert.ok(id in SOURCES, `dialect group "${group.id}" cites unknown source "${id}"`);
    }
  }
});
