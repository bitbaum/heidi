/**
 * Ukrainian — a SKELETON, deliberately.
 *
 * This is not a product and not a serious description of Ukrainian. It is the
 * second instance that keeps the contract honest: an abstraction with one
 * implementation is a guess, and the contract suite in `check.test.ts` runs
 * over every pack, so a field Heidi happens not to need cannot quietly become
 * a Zurich assumption baked into the engine.
 *
 * It earns its place by having already broken the contract twice and forced
 * two fields that Heidi alone would never have revealed:
 *
 *   `orthography.standardised` — Zurich German has no standard spelling, so a
 *   variant is not an error. Ukrainian has a state orthography, so it is.
 *
 *   `learner.priority` — a Russian-speaking Ukrainian has understood Ukrainian
 *   since school; their gap is production, not comprehension. Heidi's
 *   listening-first front door would be the wrong product for them, so the
 *   engine reads `priority[0]` instead of assuming.
 *
 * If Lesya ever becomes real, this file grows and nothing above it changes.
 * Until then it stays small on purpose.
 */

import type { VarietyPack } from "../pack.ts";

export const UKRAINIAN: VarietyPack = {
  tag: "uk",
  name: "Ukrainian",
  endonym: "українська",
  region: "Ukraine",

  bridges: [
    { tag: "ru", name: "Russian", relation: "sibling" },
    { tag: "en", name: "English", relation: "gloss" },
  ],

  learner: {
    who: "A Russian-speaking Ukrainian who understands Ukrainian and hesitates when producing it.",
    priority: ["texting", "speaking", "listening", "reading"],
    because: "Comprehension is not the gap here; interference-free production is.",
  },

  correspondences: [
    { bridge: "дом", target: "дім", rule: "о → і in closed syllables", cue: "Listen for і where Russian has о." },
  ],

  rules: [
    {
      // The counterpart of Heidi's ß rule: letters that do not exist in this
      // alphabet at all. Certain, deterministic, and enough to prove the gate
      // is not Zurich-shaped.
      match: /[ыэъё]/giu,
      severity: "unattested",
      origin: "Russian",
      reason: "ы, э, ъ and ё are not letters of the Ukrainian alphabet",
    },
  ],

  orthography: {
    standardised: true,
    convention: "Український правопис (2019)",
    note: "Ukrainian has an official orthography, so a spelling really can be wrong.",
  },

  speech: {
    lang: "uk-UA",
    // Ukrainian vowels, including the two the Latin-alphabet rule would miss.
    vowels: "аеєиіїоуюя",
    // Ukrainian has no diphthongs — every vowel letter is its own nucleus, so
    // `дякую` is three syllables and merging would report two.
    adjacentVowelsMerge: false,
    fillers: ["еее", "ем", "ну", "теє"],
    // Ukrainian has a LanguageTool checker, so the full speaking surface is
    // available on day one here — which is the whole point of the contract:
    // the engine did not change, the pack answered differently.
    grammarCode: "uk-UA",
    // No sibling bridge to check separately; Ukrainian IS the standard.
    bridgeGrammarCode: null,
  },

  capabilities: {
    // The contrast that makes the field worth having. Ukrainian recognition
    // returns Ukrainian, so a transcript IS the learner's own words and
    // grammar, vocabulary and speech rate are all measurable — the surfaces
    // Zurich German cannot have, available here without an engine change.
    recognition: { available: true, returnsSpokenVariety: true, wer: 8.0 },
    tts: true,
    licensedAudio: true,
  },
};
