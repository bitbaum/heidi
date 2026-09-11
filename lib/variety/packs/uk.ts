/**
 * Ukrainian — the second pack, and the reason the first one is a pack at all.
 *
 * STATUS: a real but SMALL pack, unreviewed by a native speaker. It exists to
 * hold the contract honest, not to ship a product. If Lesya becomes real, this
 * file grows and nothing above it changes — that is the whole claim.
 *
 * What writing it actually proved, and what it cost:
 *
 *  1. The contamination gate generalises exactly. Heidi's threat is Bernese
 *     forms passing as Zurich; Lesya's is Russian calques passing as Ukrainian.
 *     Both are fluent, grammatical, meaning-transparent, and undetectable by
 *     the very learner who is buying the variety. Same shape, same gate.
 *     There is even prior art: `osyvokon/spella`, a Ukrainian checker built
 *     for exactly this and archived in 2018.
 *
 *  2. Two fields had to be ADDED to the contract because Ukrainian broke it:
 *     `orthography.standardised` (Ukrainian has a state orthography; Zurich
 *     German has none, so identical checker behaviour would be wrong in one
 *     direction or the other) and `learner.priority` (see below).
 *
 *  3. The learner's broken skill INVERTS. This is the finding that would have
 *     sunk a naive port: a Russian-speaking Ukrainian has understood Ukrainian
 *     since school and receives it fluently. Their gap is confident production
 *     without interference. Shipping Heidi's listening-first front door here
 *     would drill a skill this population already has.
 */

import type { VarietyPack } from "../pack.ts";

export const UKRAINIAN: VarietyPack = {
  tag: "uk",
  name: "Ukrainian",
  endonym: "українська",
  region: "Ukraine, and the post-2022 diaspora",

  bridges: [
    // Russian is the bridge as a matter of fact, not of politics: it is the
    // language most of these learners think in, and the one leaking into their
    // Ukrainian. Naming it is what lets us filter it.
    { tag: "ru", name: "Russian", relation: "sibling" },
    { tag: "pl", name: "Polish", relation: "sibling" },
    { tag: "en", name: "English", relation: "gloss" },
  ],

  learner: {
    who: "A Russian-speaking Ukrainian who understands Ukrainian perfectly well and hesitates every time they have to produce it.",
    priority: ["texting", "speaking", "listening", "reading"],
    because:
      "Ukrainian was a school subject and a lifelong ambient presence, so comprehension is not the gap — interference-free production is. Daily Ukrainian use went from 53% (Feb 2022) to 68% (Aug 2025); that shift is people producing a language they already understood.",
  },

  /** Stub. Consonant correspondences should be preferred when this grows. */
  correspondences: [
    { bridge: "дом", target: "дім", rule: "о → і in closed syllables", cue: "Listen for і where Russian has о." },
    { bridge: "он", target: "він", rule: "prothetic в- before initial о", cue: "Listen for a v- glued to the front." },
    { bridge: "что", target: "що", rule: "чт → щ", cue: "Listen for shch where Russian has cht." },
  ],

  rules: [
    {
      // The exact counterpart of Heidi's ß rule: four letters that simply do
      // not exist in the Ukrainian alphabet. Certain, deterministic, cheap.
      match: /[ыэъё]/giu,
      severity: "unattested",
      origin: "Russian",
      reason: "ы, э, ъ and ё are not letters of the Ukrainian alphabet",
    },
    {
      match: "кофе",
      severity: "foreign",
      origin: "Russian",
      reason: "Soviet-era import aligning Ukrainian to Russian; the native form is кава",
      suggest: "кава",
    },
    {
      match: "приймати участь",
      severity: "foreign",
      origin: "Russian",
      reason: "Calque of 'принимать участие' — Ukrainian takes part, it does not receive it",
      suggest: "брати участь",
    },
    {
      match: "на протязі",
      severity: "foreign",
      origin: "Russian",
      reason: "Calque of 'на протяжении'; на протязі means 'in a draught' in Ukrainian",
      suggest: "протягом",
    },
    {
      match: "співпадати",
      severity: "foreign",
      origin: "Russian",
      reason: "Calque of 'совпадать'",
      suggest: "збігатися",
    },
  ],

  orthography: {
    standardised: true,
    convention: "Український правопис (2019)",
    // Because a standard exists, the honest message here is the opposite of
    // Heidi's. The same checker, the same data shape, a different truth.
    note: "Ukrainian has an official orthography, so a spelling really can be wrong — and we can say so.",
  },

  capabilities: {
    // Every one of these is the opposite of Heidi's, which is why the field
    // exists: the same engine must build a different product here without
    // anyone editing the engine.
    asr: true,
    tts: true,
    licensedAudio: true,
  },
};
