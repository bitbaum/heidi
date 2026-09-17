import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ASR_RESULTS, CORPORA, SPEAKING, TEXT_MODELS, techSources } from "./language-tech.ts";
import { SOURCES } from "./sources.ts";

/**
 * The properties that keep a page of numbers honest.
 *
 * This page prints hours, speaker counts, error rates and licences about other
 * people's work. Getting one wrong is worse than not having the page: it is a
 * confident, checkable, false statement about a named researcher's corpus,
 * sitting on a site whose whole argument is that it does not overclaim.
 */

describe("every figure is attached to a source", () => {
  test("every row names a source that exists", () => {
    for (const c of CORPORA) assert.ok(c.source in SOURCES, `corpus ${c.id} cites unknown source ${c.source}`);
    for (const r of ASR_RESULTS) assert.ok(r.source in SOURCES, `result ${r.system} cites unknown source`);
    for (const m of TEXT_MODELS) assert.ok(m.source in SOURCES, `model ${m.name} cites unknown source`);
    for (const s of SPEAKING) {
      if (s.source) assert.ok(s.source in SOURCES, `${s.id} cites unknown source ${s.source}`);
    }
  });

  test("techSources() reports every source the page uses", () => {
    // The orphan check in sources.test.ts reads this. If it under-reports, a
    // source the page relies on looks uncited and gets deleted as dead weight.
    const reported = new Set(techSources());
    for (const c of CORPORA) assert.ok(reported.has(c.source), `${c.source} missing from techSources()`);
    for (const r of ASR_RESULTS) assert.ok(reported.has(r.source), `${r.source} missing from techSources()`);
    for (const m of TEXT_MODELS) assert.ok(reported.has(m.source), `${m.source} missing from techSources()`);
  });

  test("a licence is stated for every corpus", () => {
    // "Freely available" is the sentence that gets a dataset used in a product
    // it was never licensed for. Every row says something, including the two
    // that have to say that nothing was published.
    for (const c of CORPORA) {
      // Either a named licence, or one of the keyed sentences — including the
      // one that says nothing was published, which is itself a statement.
      assert.ok(
        (c.licence && c.licence.trim().length > 0) || c.licenceKey,
        `${c.id} states no licence at all`,
      );
    }
  });
});

describe("the claims that must not drift", () => {
  test("the field's central fact is visible in the data", () => {
    /**
     * Almost every Swiss German speech corpus pairs dialect SPEECH with
     * STANDARD GERMAN text, because writing down what was said here is a
     * translation task rather than a transcription one. If a future edit ever
     * makes this false, the page's argument changes and the prose has to
     * change with it — so it fails here rather than quietly reading wrong.
     */
    const speech = CORPORA.filter((c) => c.direction === "speech-to-standard");
    assert.ok(speech.length >= 3, "expected the standard-German-output corpora to dominate");
    assert.equal(
      CORPORA.filter((c) => c.direction === "speech-to-dialect").length,
      0,
      "if a corpus now transcribes INTO dialect, the technology page is out of date",
    );
  });

  test("no ASR row claims to produce dialect text", () => {
    // Every number in that table is a word error rate against a STANDARD
    // GERMAN reference. Presenting it as dialect accuracy would be the exact
    // overclaim §8 forbids.
    for (const r of ASR_RESULTS) {
      assert.ok(r.wer > 0 && r.wer < 100, `${r.system} has an implausible WER`);
    }
  });

  test("the speaking table keeps the standard/dialect distinction", () => {
    // The commercial "Swiss German" voices are Swiss STANDARD German. A table
    // that lost that flag would tell a learner they can buy dialect speech.
    assert.ok(
      SPEAKING.some((s) => !s.dialect),
      "the standard-German-in-disguise case must stay in the table",
    );
    assert.ok(SPEAKING.some((s) => s.dialect && s.status === "research"));
  });

  test("a model with no published dialect evaluation is marked as such", () => {
    // The pattern this exists to catch: a press release names Swiss German,
    // the technical report measures nothing. `evaluated` is the difference
    // between a claim and a result.
    const apertus = TEXT_MODELS.find((m) => m.name === "Apertus");
    assert.ok(apertus, "expected Apertus in the table");
    assert.equal(apertus.dialect, true, "it does carry a dialect component");
    assert.equal(apertus.evaluated, false, "and no dialect evaluation is published");
  });

  test("the Dieth entry says it is not a standard", () => {
    // The single most tempting wrong sentence about this language.
    assert.match(SOURCES.dieth.venue, /not an orthographic standard/);
  });
});
