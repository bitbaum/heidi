/**
 * Zurich German — the pack Heidi ships.
 *
 * Every Zurich-specific fact in this product lives in this file. If you find
 * a Swiss fact anywhere else in `lib/` or `app/`, it has leaked and belongs
 * back here.
 *
 * Rules ported verbatim from the original `lib/domain/dialect/purity.ts`,
 * with severity and a suggested form added. The regional judgements are
 * unchanged and still await a native Zurich reviewer — see docs/LINGUISTICS.md.
 */

import type { VarietyPack } from "../pack.ts";

export const ZURICH_GERMAN: VarietyPack = {
  tag: "gsw-u-sd-chzh",
  name: "Zurich German",
  endonym: "Züritüütsch",
  region: "Canton of Zürich, Switzerland",

  family: {
    name: "Swiss German",
    endonym: "Schwiizerdütsch",
    // The dialects the gate currently rejects. They are not errors — they are
    // the next packs. Ordered by how many speakers they would reach.
    planned: ["Bern", "Basel", "Luzern", "St. Gallen", "Aargau", "Wallis"],

    // Where each of those is spoken — the canton's main town, which is what a
    // dialect is named after in practice. These are points, not territories:
    // an isogloss does not follow a cantonal border, and claiming it did would
    // be the inaccuracy that made us avoid a map in the first place. Marking
    // "Bernese is spoken at Bern" asserts only what is true.
    atlas: {
      region: "switzerland",
      home: { lon: 8.5417, lat: 47.3769 }, // Zürich
      places: {
        Bern: { lon: 7.4474, lat: 46.948 },
        Basel: { lon: 7.5886, lat: 47.5596 },
        Luzern: { lon: 8.3093, lat: 47.0502 },
        "St. Gallen": { lon: 9.3767, lat: 47.4245 },
        Aargau: { lon: 8.0456, lat: 47.3909 }, // Aarau, the cantonal town
        Wallis: { lon: 7.359, lat: 46.2311 }, // Sion/Sitten
      },
    },
  },

  bridges: [
    // Ranked. The sibling is what correspondences are computed from.
    { tag: "de-CH", name: "Swiss Standard German", relation: "sibling" },
    { tag: "de", name: "Standard German", relation: "roof" },
    { tag: "en", name: "English", relation: "gloss" },
  ],

  learner: {
    who: "An adult who already reads and writes German and understands almost nothing at the Zurich lunch table.",
    priority: ["listening", "texting", "reading", "speaking"],
    because:
      "The gap is comprehension of an oral vernacular they were never taught. Production is optional: understanding dialect and replying in Standard German is a complete and respected way to take part, so speaking is last on purpose, not by neglect.",
  },

  /**
   * Presented one at a time beside a clip the learner is about to hear again,
   * never as a lesson up front. Note for whoever extends this list: across 70
   * language pairs, consonant correspondences predicted intelligibility far
   * better than vowel correspondences (r ~ -.74 vs -.29, Gooskens & Heeringa).
   * Two of the four below are vowel rules and are the weaker bet — add
   * consonant correspondences before adding more vowels.
   */
  correspondences: [
    { bridge: "Kind", target: "Chind", rule: "k → ch", cue: "Listen for a scrape at the front where German has a hard k." },
    { bridge: "ist", target: "isch", rule: "st → sch", cue: "Listen for sch where German ends in st." },
    { bridge: "Haus", target: "Huus", rule: "au → uu", cue: "Listen for a long flat uu where German glides through au." },
    { bridge: "gut", target: "guet", rule: "u → ue", cue: "Listen for two vowels sliding together where German has one u." },
  ],

  rules: [
    {
      match: /(?<!\p{L})tüü?tsch(?!\p{L})/giu,
      display: "tüütsch / tütsch",
      severity: "foreign",
      origin: "Ostschweiz",
      reason: "Ostschweiz form — Zurich says it only inside Züritüütsch",
    },
    { match: "nid", severity: "foreign", origin: "Ostschweiz", reason: "Ostschweiz 'nid' — Zurich says nöd", suggest: "nöd" },
    { match: "güet", severity: "foreign", origin: "Bern", reason: "Bernese 'güet' — Zurich says guet", suggest: "guet" },
    { match: "gäu", severity: "foreign", origin: "Bern", reason: "Bernese tag 'gäu' — Zurich says gäll", suggest: "gäll" },
    {
      match: /\p{L}*öu\p{L}*/giu,
      display: "…öu…",
      severity: "foreign",
      origin: "Bern",
      reason: "Bernese öu diphthong — Zurich says au",
    },
    { match: "sai", severity: "foreign", origin: "Basel", reason: "Basel 'sai'" },
    {
      match: /ß/gu,
      display: "ß",
      severity: "unattested",
      reason: "ß is not used anywhere in Switzerland — write ss",
      suggest: "ss",
    },
  ],

  orthography: {
    standardised: false,
    convention: "Heidi house spelling",
    note: "Zurich German has no official spelling. Dieth-Schreibung exists but needs diacritics no one has on a keyboard, so real writing is ad-hoc. We spell consistently so you meet the same word the same way twice; your spelling is not wrong.",
  },

  capabilities: {
    // No production-grade dialect ASR exists. The state of the art transcribes
    // Swiss German INTO Standard German — it translates the dialect away, which
    // is precisely the information a learner needs. Best honest published
    // figure is ~25.6% WER after fine-tuning on 1,367h.
    asr: false,
    // Contested. At least one vendor now advertises commercially licensed
    // Züridütsch voices; most "Swiss German" TTS on the market is Standard
    // German in a Swiss accent. Stays false until someone listens to output.
    tts: false,
    // Every Zurich-region corpus found is CC BY-NC or has a contested licence
    // (SwissDial, SDS-200, STT4SG-350, ArchiMob, What's Up). Research-only.
    // So Heidi records its own speakers — not for romance, for the licence.
    licensedAudio: false,
  },
};
