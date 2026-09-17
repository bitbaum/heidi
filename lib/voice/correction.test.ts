import { test } from "node:test";
import assert from "node:assert/strict";
import { canCorrectVariety, corrections } from "./correction.ts";
import type { Finding } from "../variety/check.ts";
import type { Severity } from "../variety/pack.ts";

const finding = (severity: Severity, form: string, index = 0): Finding => ({
  form,
  severity,
  reason: `${form} is ${severity}`,
  index,
});

const UNATTESTED = finding("unattested", "ß", 3);
const FOREIGN = finding("foreign", "güet", 10);
const DISPREFERRED = finding("dispreferred", "gäll", 20);
const VARIANT = finding("variant", "nööd", 30);
const ALL = [UNATTESTED, FOREIGN, DISPREFERRED, VARIANT];

test("off says nothing, and says that that is why", () => {
  const result = corrections(ALL, { origin: "typed", level: "off" });
  assert.deepEqual(result.findings, []);
  assert.equal(result.silence, "off");
});

test("blocking mentions only what is not the language at all", () => {
  const result = corrections(ALL, { origin: "typed", level: "blocking" });
  assert.deepEqual(
    result.findings.map((f) => f.form),
    ["ß"],
    "blocking level passed a regional judgement",
  );
});

test("all adds another variety's forms, and nothing below that", () => {
  const result = corrections(ALL, { origin: "typed", level: "all" });
  assert.deepEqual(result.findings.map((f) => f.form), ["ß", "güet"]);
});

test("spelling is never corrected, at any level", () => {
  // There is no standard orthography for Zurich German. A product that
  // corrects spelling in a variety that has none has invented an authority.
  for (const level of ["blocking", "all"] as const) {
    const result = corrections([DISPREFERRED, VARIANT], { origin: "typed", level });
    assert.deepEqual(result.findings, [], `${level} corrected a spelling choice`);
    assert.equal(result.silence, "clean");
  }
});

test("speech is never corrected for its variety, at any level", () => {
  // The rule that is easy to get wrong and silently ruins the feature:
  // Swiss German recognition transcribes dialect INTO Standard German, so a
  // learner who spoke perfect Zurich German gets a transcript full of forms
  // they did not say. Correcting it bills the recogniser's output to them.
  for (const level of ["blocking", "all"] as const) {
    const result = corrections(ALL, { origin: "spoken", level });
    assert.deepEqual(result.findings, [], `${level} corrected a transcript`);
    assert.equal(result.silence, "spoken");
  }
});

test("the reason for silence is never guessed from an empty list", () => {
  // Three different silences that a learner must be able to tell apart: you
  // turned this off, this cannot be judged, and you made no mistakes.
  assert.equal(corrections([], { origin: "typed", level: "off" }).silence, "off");
  assert.equal(corrections([], { origin: "spoken", level: "all" }).silence, "spoken");
  assert.equal(corrections([], { origin: "typed", level: "all" }).silence, "clean");
});

test("findings come back worst first, then in the order they were said", () => {
  const second = finding("unattested", "ß", 40);
  const result = corrections([FOREIGN, second, UNATTESTED], { origin: "typed", level: "all" });
  assert.deepEqual(
    result.findings.map((f) => f.index),
    [3, 40, 10],
  );
});

test("the module takes nothing it could score a pronunciation with", () => {
  // Structural rather than principled: there is no audio, no confidence and
  // no alignment in this file's inputs, so "93% native" would have to be
  // invented rather than measured. §8 forbids it; the shape prevents it.
  assert.equal(canCorrectVariety("spoken"), false);
  assert.equal(canCorrectVariety("typed"), true);
});

test("a finding is passed through unchanged, not rewritten", () => {
  // Whatever the gate says is what the learner sees. A correction layer that
  // paraphrases the reason has become a second, unsourced explainer.
  const [only] = corrections([UNATTESTED], { origin: "typed", level: "blocking" }).findings;
  assert.deepEqual(only, UNATTESTED);
});
