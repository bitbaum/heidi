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
    // Area ids, in the order we expect to add them.
    planned: [
      "baerndueuetsch",
      "baseldytsch",
      "innerschwyzertuetsch",
      "ostschwiizertuetsch",
      "aargauerdueuetsch",
      "wallisertitsch",
    ],

    /**
     * Every German-speaking dialect area of Switzerland — what EXISTS, as
     * opposed to `planned`, which is what Heidi intends to teach next.
     *
     * The two were one list, and that is how the map came to answer "where is
     * Swiss German spoken?" with a roadmap. A reader looking at Switzerland
     * with six dots on it reasonably asked where Graubünden was; the answer
     * was "nobody put it on the roadmap", which is not an answer about
     * language at all.
     *
     * AREAS, NOT CANTONS, because that is what dialects are. Central
     * Switzerland is one area across six cantons and Basel is one across two.
     * `cantons` is listed because it is the handle a reader actually has —
     * they know which canton they are in — and not because the dialect stops
     * at the border. It does not.
     *
     * Sourced to the SDS, the eight-volume atlas built on fieldwork from
     * 1939–58, and its general-readership condensation. Every entry names one;
     * `family.test.ts` refuses an entry that names none.
     */
    areas: [
      {
        id: "zueritueuetsch",
        endonym: "Züritüütsch",
        cantons: ["ZH"],
        town: "Zürich",
        place: { lon: 8.5417, lat: 47.3769 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "baerndueuetsch",
        endonym: "Bärndütsch",
        cantons: ["BE"],
        town: "Bern",
        place: { lon: 7.4474, lat: 46.948 },
        ruleOrigin: "Bern",
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "baseldytsch",
        endonym: "Baseldytsch",
        cantons: ["BS", "BL"],
        town: "Basel",
        place: { lon: 7.5886, lat: 47.5596 },
        ruleOrigin: "Basel",
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "innerschwyzertuetsch",
        endonym: "Innerschwyzertütsch",
        cantons: ["LU", "UR", "SZ", "OW", "NW", "ZG"],
        town: "Luzern",
        place: { lon: 8.3093, lat: 47.0502 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "ostschwiizertuetsch",
        endonym: "Ostschwiizertütsch",
        cantons: ["SG", "TG", "AR", "AI", "SH"],
        town: "St. Gallen",
        place: { lon: 9.3767, lat: 47.4245 },
        ruleOrigin: "Ostschweiz",
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "aargauerdueuetsch",
        endonym: "Aargauerdütsch",
        cantons: ["AG"],
        town: "Aarau",
        place: { lon: 8.0456, lat: 47.3909 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "glarnertueuetsch",
        endonym: "Glarnertüütsch",
        cantons: ["GL"],
        town: "Glarus",
        place: { lon: 9.0678, lat: 47.0404 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "solothurnerdueuetsch",
        endonym: "Solothurnerdütsch",
        cantons: ["SO"],
        town: "Solothurn",
        place: { lon: 7.5378, lat: 47.2088 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "seyslerdueuetsch",
        endonym: "Seyslertütsch",
        cantons: ["FR"],
        town: "Freiburg",
        place: { lon: 7.162, lat: 46.8065 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        // The one the map was missing, and not a small omission: Graubünden is
        // Switzerland's largest canton and its German is Alemannic throughout.
        id: "buendnerdueuetsch",
        endonym: "Bündnerdütsch",
        cantons: ["GR"],
        town: "Chur",
        place: { lon: 9.53, lat: 46.85 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        // Highest Alemannic, and the reason the SDS extends past the border:
        // the Walser carried these dialects into northern Italy.
        id: "wallisertitsch",
        endonym: "Wallisertitsch",
        cantons: ["VS"],
        // Brig, not Sion. Sion is the cantonal capital and French-speaking;
        // the German half of Valais is the upper valley, and naming a dialect
        // after a town that does not speak it is exactly the sort of error
        // this file exists to avoid.
        town: "Brig",
        place: { lon: 7.988, lat: 46.316 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
    ],

    atlas: {
      region: "switzerland",
      home: { lon: 8.5417, lat: 47.3769 }, // Zürich
    },
  },

  bridges: [
    // Ranked. The sibling is what correspondences are computed from.
    {
      tag: "de-CH",
      name: "Swiss Standard German",
      relation: "sibling",
      /**
       * What makes written German Swiss rather than German.
       *
       * Deliberately short and deliberately certain. Every entry here is a
       * thing a learner CANNOT detect — that is the test for belonging in
       * this list. Somebody who writes a careful German email asking about a
       * *Fahrrad* has written perfect German and marked themselves as
       * foreign in the first line, and no amount of care on their part would
       * have caught it. That is exactly the gap the target gate exists to
       * close, one variety over.
       *
       * Nothing marginal is included. Regional words that vary WITHIN
       * Switzerland, or that a Swiss writer might reasonably use, are left
       * out: a gate that nags about defensible choices trains people to
       * ignore it, and then it is worth nothing on the day it is right.
       */
      rules: [
        {
          // Not a spelling preference — Switzerland does not use the letter.
          // It was dropped from Swiss orthography entirely, so a ß in text
          // claiming to be Swiss is as wrong as a form that does not exist.
          match: /ß/u,
          display: "ß",
          severity: "unattested",
          reason: "Switzerland does not use ß at all; Swiss German writing always uses ss.",
          suggest: "ss",
        },
        {
          match: "Fahrrad",
          severity: "foreign",
          reason: "Germany's word. Swiss Standard German says Velo.",
          origin: "Germany",
          suggest: "Velo",
        },
        {
          match: "Bürgersteig",
          severity: "foreign",
          reason: "Germany's word. Swiss Standard German says Trottoir.",
          origin: "Germany",
          suggest: "Trottoir",
        },
        {
          match: "Abitur",
          severity: "foreign",
          reason: "Germany's school-leaving exam. The Swiss one is the Matura.",
          origin: "Germany",
          suggest: "Matura",
        },
        {
          match: "parken",
          severity: "foreign",
          reason: "Germany's verb. Swiss Standard German says parkieren.",
          origin: "Germany",
          suggest: "parkieren",
        },
        {
          match: "Sahne",
          severity: "foreign",
          reason: "Germany's word. Swiss Standard German says Rahm.",
          origin: "Germany",
          suggest: "Rahm",
        },
        {
          match: "Strassenbahn",
          severity: "foreign",
          reason: "Germany's word. In Switzerland it is the Tram.",
          origin: "Germany",
          suggest: "Tram",
        },
        {
          match: "Tüte",
          severity: "foreign",
          reason: "Germany's word. Swiss Standard German says Sack.",
          origin: "Germany",
          suggest: "Sack",
        },
      ],
    },
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
  // Chosen because a German speaker gets nothing from it: "Chunnsch" (kommst)
  // and "hüt Abig" (heute Abend) are both opaque, and it is the sort of line
  // that actually arrives on a phone on a Tuesday.
  showcase: { line: "Chunnsch au no verbi hüt Abig?" },

  correspondences: [
    { bridge: "Kind", target: "Chind", rule: "k → ch", cue: "Listen for a scrape at the front where German has a hard k." },
    { bridge: "ist", target: "isch", rule: "st → sch", cue: "Listen for sch where German ends in st." },
    { bridge: "Haus", target: "Huus", rule: "au → uu", cue: "Listen for a long flat uu where German glides through au." },
    { bridge: "gut", target: "guet", rule: "u → ue", cue: "Listen for two vowels sliding together where German has one u." },
  ],

  /**
   * Four things that stop a German reader following spoken Zurich German.
   *
   * Chosen by what actually blocks COMPREHENSION, which is not the same list a
   * grammar book would give. Somebody who reads German already has the
   * vocabulary and the word order; what derails them is a past tense that does
   * not exist, a relative pronoun that never changes, a possessive built the
   * wrong way round, and a diminutive stuck to half the nouns in the sentence.
   *
   * Each one is here because a learner meeting it cannot reason their way out:
   * it is not a harder version of something they know, it is a different move.
   * Anything they could work out from German is deliberately absent.
   */
  /**
   * The words that actually block comprehension, and nothing that does not.
   *
   * Chosen by the same test as the grammar topics: what stops a person who
   * already reads German. Content words are mostly cognate and the
   * correspondences carry them — a reader who knows `k → ch` gets `Chind` for
   * free — so listing nouns would be padding. What no correspondence rescues
   * is the short constant stuff: negation, the quantifiers, `mir` meaning
   * *wir*, and the dozen verbs that turn up in every other sentence.
   *
   * Deliberately NOT a phrasebook. Nobody fails to follow a Zurich lunch table
   * because they cannot say "good evening".
   *
   * Sourced to the Idiotikon, the sixteen-volume reference dictionary of Swiss
   * German, which is what a word-level claim needs and a dialect atlas is not.
   */
  /**
   * WHERE THE DETAIL ON A WORD MAY COME FROM, AND WHERE IT MAY NOT.
   *
   * Checked against the actual licences on 2026-09-17, because "it is online
   * and free to read" and "we may ship it" are different claims and the gap
   * between them is where an open-source language product gets itself sued.
   *
   * MAY BE CITED AS EVIDENCE, NEVER COPIED FROM:
   *   Sprachatlas der deutschen Schweiz (sprachatlas.ch) — CC BY-SA 4.0, with
   *     a live API. It is the citable authority for the ARTICLE SYSTEM: map
   *     3869 gives `də` at 66 of 66 Zurich survey points for the masculine
   *     nominative, map 3866 gives `s` at 66 of 66 for the neuter. Worth
   *     knowing before anyone calls this settled: map 3870, the feminine
   *     dative, is SPLIT inside the canton — 57 points `dr` against 48 `də`.
   *     Zurich German is not one system even in Zurich.
   *   Schweizerisches Idiotikon — the reference dictionary, and the authority
   *     for whether a word and a gender are Zurich-attested at all. Careful:
   *     its CC BY-SA 4.0 covers the REST API, which returns headwords and
   *     definitions ONLY. The scans and OCR — which is where the gender
   *     markings and the example sentences actually live — publish no licence
   *     whatsoever.
   *
   * MUST NOT BE USED AS A SOURCE OF TEXT:
   *   ArchiMob — non-commercial under all three of its published statements,
   *     and NoDerivatives under the Zenodo one. Consult it; do not lift.
   *   SwissCrawl, the Swiss SMS Corpus — non-commercial.
   *   NOAH's Corpus — the annotations are CC BY 4.0, the sentences are
   *     third-party text under no licence at all.
   *   Weber, `Zürichdeutsche Grammatik` (1948) — in copyright until 31 Dec
   *     2027. Weber, `Die Mundart des Zürcher Oberlandes` (1923) is readable
   *     on e-Helvetica but PRIVATE USE ONLY. Weber & Bächtold's dictionary
   *     runs to 2054.
   *
   * SO: EVERY EXAMPLE SENTENCE IN THIS FILE IS WRITTEN HERE, and every entry
   * below goes further than that — it reuses a sentence this pack ALREADY
   * publishes in its own grammar topics. Not one string in the additions below
   * is a new claim about the language; they are forms this file already
   * asserts, promoted into the vocabulary where a learner can find them.
   *
   * The one thing still outstanding is the one §9 already names: none of it
   * has been reviewed by a native Zurich speaker.
   */
  vocabulary: [
    // The short words. Individually tiny, collectively most of why a sentence
    // is unfollowable.
    { target: "nöd", bridge: "nicht", group: "function" },
    { target: "au", bridge: "auch", group: "function" },
    { target: "scho", bridge: "schon", group: "function" },
    { target: "no", bridge: "noch", group: "function" },
    { target: "nüme", bridge: "nicht mehr", group: "function" },
    { target: "öppis", bridge: "etwas", group: "function" },
    { target: "öpper", bridge: "jemand", group: "function" },
    { target: "öppe", bridge: "etwa", group: "function" },
    { target: "niene", bridge: "nirgends", group: "function" },
    { target: "villicht", bridge: "vielleicht", group: "function" },
    { target: "eifach", bridge: "einfach", group: "function" },
    { target: "gäll", bridge: "nicht wahr", group: "function" },
    // The one that silently breaks a whole sentence: a German reader takes
    // `mir` for the dative "me" and loses the subject.
    { target: "mir", bridge: "wir", group: "function" },
    { target: "ächli", bridge: "ein bisschen", group: "function" },

    { target: "si", bridge: "sein", group: "verbs" },
    {
      /**
       * The only paradigm this pack can already fill from its own pages.
       *
       * `häsch`, `hät` and `händ` all appear in sentences this file or its
       * dictionaries already publish — "Häsch du am Samschtig scho öppis vor?",
       * "Si hät nüüt gseit", "Mir händ das scho gmacht". So the table is a
       * reorganisation, not an assertion.
       *
       * The first person is deliberately absent. `ha` is the headword here and
       * a row identical to its own headword teaches nothing — which is exactly
       * what the vocabulary test refuses. Filling it would need a source, and
       * the sources that could settle it are the ones listed above as
       * unusable.
       *
       * It matters more than any other verb because it carries every compound
       * past in the language: `no-preterite` is the pack's biggest grammar
       * topic and this is the auxiliary it runs on.
       */
      target: "ha",
      bridge: "haben",
      group: "verbs",
      forms: [
        { label: "du", target: "häsch", bridge: "hast" },
        { label: "er", target: "hät", bridge: "hat" },
        { label: "mir", target: "händ", bridge: "haben" },
      ],
      source: "idiotikon",
    },
    { target: "gah", bridge: "gehen", group: "verbs" },
    { target: "cho", bridge: "kommen", group: "verbs" },
    { target: "mache", bridge: "machen", group: "verbs" },
    { target: "luege", bridge: "schauen", group: "verbs" },
    { target: "säge", bridge: "sagen", group: "verbs" },
    { target: "wüsse", bridge: "wissen", group: "verbs" },
    { target: "chönne", bridge: "können", group: "verbs" },
    { target: "müesse", bridge: "müssen", group: "verbs" },
    // Both mean something else in German, which is worse than being unknown:
    // a German reader understands them confidently and wrongly.
    { target: "schaffe", bridge: "arbeiten", group: "verbs" },
    { target: "poschte", bridge: "einkaufen", group: "verbs" },

    /**
     * Three nouns, one per gender, and every string here already appears in
     * this file's own grammar examples — `De Maa, wo dört staht`,
     * `D Frau, wo ich gsee ha`, `S Dach vom Huus`. Promoting them into the
     * vocabulary adds no claim; it makes a claim the pack already makes
     * findable, and gives the article a place to live.
     *
     * They also make the article drill possible at all. Every noun the list
     * had was neuter — `s Velo`, `s Znüni`, `s Güetzi`, `s Rüebli` — because
     * four of them are `-li` diminutives, which this pack already teaches take
     * the neuter. An exercise whose answer is `s` every time is not an
     * exercise.
     */
    {
      target: "Maa",
      bridge: "Mann",
      group: "everyday",
      article: "de",
      example: { target: "De Maa, wo dört staht.", bridge: "Der Mann, der dort steht." },
      source: "sds-atlas",
    },
    {
      /**
       * `Frau` would have been the obvious feminine, and the vocabulary test
       * refuses it: the word is identical in both varieties, and a row whose
       * two halves are the same string teaches nothing. Correct — the article
       * is the whole difference there, and this list is not where that is
       * taught.
       *
       * `Schwöschter` carries both: it differs from the German word AND it is
       * feminine. The pack's own `D Frau, wo ich gsee ha.` is what attests the
       * feminine article; this entry is what makes it learnable.
       */
      target: "Schwöschter",
      bridge: "Schwester",
      group: "everyday",
      article: "d",
      example: { target: "De Anna ihri Schwöschter.", bridge: "Annas Schwester." },
      source: "sds-atlas",
    },
    {
      target: "Huus",
      bridge: "Haus",
      group: "everyday",
      article: "s",
      example: { target: "S Dach vom Huus.", bridge: "Das Dach des Hauses." },
      source: "sds-atlas",
    },
    { target: "Velo", bridge: "Fahrrad", group: "everyday" },
    { target: "Znüni", bridge: "Vormittagssnack", group: "everyday" },
    { target: "Zvieri", bridge: "Nachmittagssnack", group: "everyday" },
    { target: "Güetzi", bridge: "Keks", group: "everyday" },
    { target: "Rüebli", bridge: "Karotte", group: "everyday" },
    { target: "Poulet", bridge: "Hähnchen", group: "everyday" },
    { target: "Trottoir", bridge: "Bürgersteig", group: "everyday" },

    { target: "Grüezi", bridge: "Guten Tag", group: "greetings" },
    { target: "Hoi", bridge: "Hallo", group: "greetings" },
    { target: "Salü", bridge: "Hallo", group: "greetings" },
    { target: "Ade", bridge: "Auf Wiedersehen", group: "greetings" },
    { target: "merci", bridge: "danke", group: "greetings" },
    { target: "Exgüsi", bridge: "Entschuldigung", group: "greetings" },
  ],

  vocabularySources: ["idiotikon"],

  grammar: [
    {
      // The single biggest one. There is no simple past in speech at all, so
      // a German reader waiting for "ging" or "war" waits forever.
      id: "no-preterite",
      examples: [
        { target: "Ich bi geschter hei gange.", bridge: "Ich ging gestern nach Hause." },
        { target: "Si hät nüüt gseit.", bridge: "Sie sagte nichts." },
        { target: "Mir händ das scho gmacht.", bridge: "Wir machten das schon." },
      ],
    },
    {
      // `wo` never inflects. German readers parse it as "where" and lose the
      // clause.
      id: "wo-relative",
      examples: [
        { target: "De Maa, wo dört staht.", bridge: "Der Mann, der dort steht." },
        { target: "D Frau, wo ich gsee ha.", bridge: "Die Frau, die ich gesehen habe." },
        { target: "S Huus, wo mir gwohnt händ.", bridge: "Das Haus, in dem wir gewohnt haben." },
      ],
    },
    {
      // Possession runs the other way round, and the genitive is simply gone.
      id: "possessive-dative",
      examples: [
        { target: "Em Peter sis Auto.", bridge: "Peters Auto." },
        { target: "De Anna ihri Schwöschter.", bridge: "Annas Schwester." },
        { target: "S Dach vom Huus.", bridge: "Das Dach des Hauses." },
      ],
    },
    {
      // Productive to a degree German is not: it attaches to almost anything
      // and often carries no smallness at all.
      id: "diminutive-li",
      examples: [
        { target: "Machsch es Bierli?", bridge: "Trinken wir ein Bier?" },
        { target: "Es Kafi und es Gipfeli.", bridge: "Ein Kaffee und ein Croissant." },
        { target: "Gang no schnäll go poschte, es Sächeli.", bridge: "Geh noch kurz einkaufen, eine Kleinigkeit." },
      ],
    },
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

  speech: {
    // `de-CH`, not this pack's own `gsw-*` tag: no platform ships a Zurich
    // German voice, and asking a synthesiser for `gsw` gets silence. What
    // `de-CH` gets is Swiss Standard German in a Swiss accent, which the voice
    // gate reports honestly rather than passing off as dialect. It was a
    // constant inside the voice module until this field existed, which meant a
    // Ukrainian deployment would still have asked for Swiss German.
    lang: "de-CH",
    vowels: "aeiouäöüy",
    // German writes its diphthongs as adjacent vowels: `Haus` is one syllable.
    adjacentVowelsMerge: true,
    fillers: ["äh", "ähm", "öh", "ehm", "hm", "mhm"],
    // LanguageTool has no Swiss German, and that is correct rather than a gap:
    // a checker built for a standard would flag every dialect form as an error,
    // which is the §6 failure with a different engine behind it.
    grammarCode: null,
    // The bridge does have one, and `de-CH` rather than `de-DE` so that Swiss
    // spelling — no ß — is what it checks against.
    bridgeGrammarCode: "de-CH",
    /**
     * The words that decide whether a recogniser kept the dialect.
     *
     * Every pair here is the SAME word in the two varieties, and each appears
     * in almost any sentence either one produces — which is what makes ten
     * seconds of audio enough to settle it:
     *
     *   isch/ist   nöd/nicht   gaat/geht   öppis/etwas   gsi/gewesen
     *   hät/hat    chli/klein  au/auch     scho/schon    mir/wir
     */
    markers: {
      target: ["isch", "nöd", "nid", "gaat", "gaht", "öppis", "gsi", "hät", "chli", "au", "scho", "zäme", "öpper"],
      bridge: ["ist", "nicht", "geht", "etwas", "gewesen", "hat", "klein", "auch", "schon", "zusammen", "jemand"],
    },
  },

  capabilities: {
    // No production-grade dialect ASR exists. The state of the art transcribes
    // Swiss German INTO Standard German — it translates the dialect away, which
    // is precisely the information a learner needs. Best honest published
    // figure is ~25.6% WER after fine-tuning on 1,367h.
    // Recognition EXISTS and is usable — Whisper answers Swiss German at a
    // published 25.6% WER. What it does not do is answer in the variety that
    // was SPOKEN: every corpus was built to map dialect speech to Standard
    // German text, so the transcript carries what was meant and nothing about
    // which forms were used. `returnsSpokenVariety: false` is the whole reason
    // `lib/voice/correction.ts` may not judge a spoken take's forms, and it is
    // a different statement from "there is no ASR", which is what the old
    // boolean was forced to say.
    //
    // Swiss specialist vendors now advertise dialect-PRESERVING recognition.
    // Nobody here has tested one, so this stays as it is; see the
    // `swissVendors` row in lib/research/language-tech.ts for the experiment
    // that would settle it. The day it is verified, this object is the edit —
    // no engine code changes.
    recognition: { available: true, returnsSpokenVariety: false, wer: 25.6 },
    // The bridge is the other answer, and it is why a speaking surface can
    // exist at all today: Standard German recognition returns Standard German,
    // so a learner practising the German they need at a doctor's desk CAN be
    // told about their own words.
    bridgeRecognition: { available: true, returnsSpokenVariety: true, wer: 6.4 },
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
