import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  MEASURES,
  anyMeasureAvailable,
  sourceUrl,
  verdictFor,
  verdicts,
  type VarietySpeech,
} from "./capability.ts";
import { FORM_JUDGEMENT_MAX_WER } from "@bitbaum/speechkit";
import type { VarietyPack } from "../variety/pack.ts";
import { ZURICH_GERMAN } from "../variety/packs/gsw-zh.ts";
import { UKRAINIAN } from "../variety/packs/uk.ts";

/**
 * These assert the CLAIM, which is the thing this file is for. Every other
 * test in `lib/speech` checks a measurement; these check what the product is
 * allowed to say it measures, which is the half that gets a company sued.
 */

const measure = (id: string) => {
  const m = MEASURES.find((x) => x.id === id);
  assert.ok(m, `no measure ${id}`);
  return m;
};

/** A pack's capabilities in the shape the register asks about. */
const speechOf = (pack: VarietyPack): VarietySpeech => ({
  recognition: pack.capabilities.recognition,
  bridgeRecognition: pack.capabilities.bridgeRecognition,
  grammarCode: pack.speech.grammarCode,
  bridgeGrammarCode: pack.speech.bridgeGrammarCode,
});

test("delivery needs nothing but the sound, so a dialect nobody transcribes still gets it", () => {
  // The load-bearing case for the whole feature. If this ever returns anything
  // but "target", the speaking surface has stopped working for the language
  // this product actually teaches.
  const zurich = speechOf(ZURICH_GERMAN);
  assert.equal(verdictFor(measure("delivery"), zurich), "target");

  // And for a variety with no recogniser at all.
  const nothing: VarietySpeech = { recognition: { available: false, returnsSpokenVariety: false }, grammarCode: null };
  assert.equal(verdictFor(measure("delivery"), nothing), "target");
  assert.ok(anyMeasureAvailable(nothing), "delivery alone is still something");
});

test("Zurich German gets its grammar checked on the BRIDGE, never on the dialect", () => {
  // The diglossic answer, and the one a buyer will ask about. Dialect
  // recognition translates into Standard German, so judging dialect grammar
  // from it would bill the recogniser's output to the learner.
  const zurich = speechOf(ZURICH_GERMAN);
  assert.equal(verdictFor(measure("grammar"), zurich), "bridge");
  assert.equal(verdictFor(measure("fluency"), zurich), "bridge");
  assert.equal(verdictFor(measure("words"), zurich), "bridge");
});

test("a variety whose recogniser answers in the variety spoken gets everything on the target", () => {
  // Ukrainian is the second pack, and it exists precisely so claims like this
  // are tested against something that is not Swiss.
  const uk = speechOf(UKRAINIAN);
  for (const id of ["delivery", "fluency", "words", "grammar"]) {
    assert.equal(verdictFor(measure(id), uk), "target", `${id} should be available on Ukrainian itself`);
  }
});

test("PRONUNCIATION IS REFUSED, and no improvement in recognition changes that", () => {
  // §8. The flag is not a "not yet" — it is a decision, and this test is what
  // stops somebody reading the other verdicts as a roadmap.
  const perfect: VarietySpeech = {
    recognition: { available: true, returnsSpokenVariety: true, wer: 0 },
    grammarCode: "de-CH",
  };
  assert.equal(verdictFor(measure("pronunciation"), perfect), "refused");
  assert.equal(verdictFor(measure("pronunciation"), speechOf(ZURICH_GERMAN)), "refused");
  assert.equal(verdictFor(measure("pronunciation"), speechOf(UKRAINIAN)), "refused");
});

test("the error-rate line is where evidence.ts says it is, and it is not off by one", () => {
  // The verdict must move on the same threshold the engine uses, or the page
  // describes a product that does not exist.
  const at: VarietySpeech = {
    recognition: { available: true, returnsSpokenVariety: true, wer: FORM_JUDGEMENT_MAX_WER },
    grammarCode: "de-CH",
  };
  const over: VarietySpeech = {
    recognition: { available: true, returnsSpokenVariety: true, wer: FORM_JUDGEMENT_MAX_WER + 0.1 },
    grammarCode: "de-CH",
  };
  assert.equal(verdictFor(measure("grammar"), at), "target", "at the threshold is still usable");
  assert.equal(verdictFor(measure("grammar"), over), "none", "past it, nothing to fall back to here");
});

test("good recognition with no grammar service reports the RIGHT reason", () => {
  // Two independent failures. A variety can be perfectly transcribed and still
  // have nobody offering a rule checker for it, and a verdict that conflated
  // them would tell a reader the recognition was the problem.
  const noService: VarietySpeech = {
    recognition: { available: true, returnsSpokenVariety: true, wer: 3 },
    grammarCode: null,
  };
  assert.equal(verdictFor(measure("grammar"), noService), "none");
  assert.equal(verdictFor(measure("fluency"), noService), "target", "fluency never needed a grammar service");
});

test("the target variety is preferred over the bridge when both would work", () => {
  // Otherwise the product understates itself: reporting "we checked your
  // Standard German" when it checked the dialect is as wrong as the reverse.
  const both: VarietySpeech = {
    recognition: { available: true, returnsSpokenVariety: true, wer: 5 },
    bridgeRecognition: { available: true, returnsSpokenVariety: true, wer: 2 },
    grammarCode: "gsw",
    bridgeGrammarCode: "de-CH",
  };
  assert.equal(verdictFor(measure("grammar"), both), "target");
});

/**
 * The page links each module for a reader to open, so it has to EXIST.
 *
 * The first version of this test checked only that the path looked like a
 * path, and the "words" row pointed readers at `lib/variety/gate.ts` — a file
 * that never existed — for as long as the page did. Now: a Heidi path must be
 * in this repo, and a speechkit path must have its built counterpart in the
 * installed package (the package ships `dist/`, not `src/`).
 */
test("every measure's source link points at a file that exists", () => {
  const root = new URL("../../", import.meta.url);
  for (const m of MEASURES) {
    if (m.refused) continue;
    const [repo, ...rest] = m.module.split("/");
    const path = rest.join("/");
    const onDisk =
      repo === "heidi"
        ? new URL(path, root)
        : repo === "speechkit"
          ? new URL(`node_modules/@bitbaum/speechkit/${path.replace(/^src\//, "dist/").replace(/\.ts$/, ".js")}`, root)
          : null;
    assert.ok(onDisk, `${m.id}: unknown repo in ${m.module}`);
    assert.ok(existsSync(onDisk), `${m.id} links readers to ${m.module}, which does not exist`);
    assert.match(sourceUrl(m.module), /^https:\/\/github\.com\/bitbaum\/(heidi|speechkit)\/blob\/main\/.+\.ts$/);
  }
});

test("the verdict list covers every measure exactly once", () => {
  const list = verdicts(speechOf(ZURICH_GERMAN));
  assert.equal(list.length, MEASURES.length);
  assert.equal(new Set(list.map((v) => v.id)).size, MEASURES.length, "a duplicate id would render a row twice");
});
