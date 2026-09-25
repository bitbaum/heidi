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
    /**
     * The three branches of Alemannic, which is the answer to "why are there
     * so many?" that a list of eleven names cannot give.
     *
     * The lines are drawn by sound changes that stopped at different places,
     * and each is shown as the pair of forms that crosses it rather than as a
     * sentence about the pair. The `k`/`ch` line is the one a visitor can hear
     * on their first day: Basel says `Kind`, and from a few kilometres south
     * of it to the Italian border everybody says `Chind`.
     */
    dialectGroups: [
      {
        id: "low",
        diagnostic: { inside: "Kind", outside: "Chind", standard: "Kind" },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "high",
        diagnostic: { inside: "schneie", outside: "schniie", standard: "schneien" },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "highest",
        diagnostic: { inside: "schniie", outside: "schneie", standard: "schneien" },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
    ],
    areas: [
      {
        id: "zueritueuetsch",
        group: "high",
        endonym: "Züritüütsch",
        cantons: ["ZH"],
        town: "Zürich",
        place: { lon: 8.5417, lat: 47.3769 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "baerndueuetsch",
        group: "high",
        endonym: "Bärndütsch",
        cantons: ["BE"],
        town: "Bern",
        place: { lon: 7.4474, lat: 46.948 },
        ruleOrigin: "Bern",
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "baseldytsch",
        group: "low",
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
        group: "high",
        endonym: "Ostschwiizertütsch",
        cantons: ["SG", "TG", "AR", "AI", "SH"],
        town: "St. Gallen",
        place: { lon: 9.3767, lat: 47.4245 },
        ruleOrigin: "Ostschweiz",
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "aargauerdueuetsch",
        group: "high",
        endonym: "Aargauerdütsch",
        cantons: ["AG"],
        town: "Aarau",
        place: { lon: 8.0456, lat: 47.3909 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "glarnertueuetsch",
        group: "highest",
        endonym: "Glarnertüütsch",
        cantons: ["GL"],
        town: "Glarus",
        place: { lon: 9.0678, lat: 47.0404 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "solothurnerdueuetsch",
        group: "high",
        endonym: "Solothurnerdütsch",
        cantons: ["SO"],
        town: "Solothurn",
        place: { lon: 7.5378, lat: 47.2088 },
        sources: ["sds-atlas", "kleiner-sprachatlas"],
      },
      {
        id: "seyslerdueuetsch",
        group: "high",
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
        group: "highest",
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
  /**
   * The pronouns a Zurich paradigm is printed with, so a conjugation question
   * can ask «mir ___» rather than «wir ___».
   *
   * `er` covers all three of the third person because the VERB does not
   * distinguish them — one row, one form, and the gloss underneath says
   * er / sie / es. `plural` and `past` are absent because they are categories
   * rather than persons: there is no word to put in front of them.
   */
  /**
   * `articles` is the topic that answers "which article", and there is no one
   * topic that answers "which form" — `unified-plural` covers `mir/ihr/si`
   * and would be a wrong explanation over `ich bi`. An absent entry shows no
   * explanation, which is better than a confident irrelevant one.
   */
  explains: { article: "articles" },

  subjects: {
    ich: "ich",
    du: "du",
    er: "er",
    mir: "mir",
    ihr: "ihr",
    si: "si",
  },
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
    /**
     * The second batch of short words, added because the exercises were
     * repeating: eight questions a sitting out of a pool this size means
     * meeting the same ones within the week, and the honest fix is more
     * material rather than a cleverer shuffle.
     *
     * The rule for what belongs here has not changed and these were chosen by
     * it: a German reader gets NOTHING from them. `gäng`, `äbe`, `sölli` and
     * `grad` are not recoverable by any correspondence, and every one of them
     * turns up in an ordinary sentence several times a day.
     */
    { target: "grad", bridge: "gerade, sofort", group: "function" },
    { target: "gäng", bridge: "immer", group: "function" },
    { target: "äbe", bridge: "eben, genau", group: "function" },
    { target: "sowieso", bridge: "ohnehin", group: "function" },
    { target: "zäme", bridge: "zusammen", group: "function" },
    { target: "deheim", bridge: "zu Hause", group: "function" },
    { target: "hüt", bridge: "heute", group: "function" },
    { target: "morn", bridge: "morgen", group: "function" },
    { target: "geschter", bridge: "gestern", group: "function" },
    { target: "spööter", bridge: "später", group: "function" },
    { target: "ame", bridge: "normalerweise", group: "function" },
    { target: "sicher", bridge: "bestimmt", group: "function" },

    {
      /**
       * The second paradigm this pack can fill from its own pages, and the
       * most valuable one in the language.
       *
       * Same standard as `ha` below: every form here already appears in a
       * sentence this file or the care pack publishes — "Ich bi geschter hei
       * gange", "Si isch am Znacht choche", "Mir sind scho lang am warte",
       * "Er isch am Morge scho wach gsi". So the table is a reorganisation of
       * claims already made, not four new assertions about the language.
       *
       * `gsi` earns its row above any second-person form. It is the participle
       * that carries every past tense of `sein` in a variety with no
       * preterite — `no-preterite` is the pack's first grammar topic and this
       * is the word it runs on. A German reader waiting for `war` gets `isch
       * … gsi` and has nothing to recognise: `gsi` looks like no German word
       * at all, which is exactly why it has to be learned rather than derived.
       */
      target: "si",
      bridge: "sein",
      group: "verbs",
      forms: [
        { label: "ich", target: "bi", bridge: "bin" },
        { label: "er", target: "isch", bridge: "ist" },
        { label: "mir", target: "sind", bridge: "sind" },
        { label: "past", target: "gsi", bridge: "gewesen" },
      ],
      source: "idiotikon",
    },
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
    {
      /**
       * Attested the same way: "Ich gang go poschte" here, "Wie gaht s ere
       * hüt?" and "mir gönd zäme zrugg is Zimmer" in the care pack.
       *
       * Worth a paradigm because the stem changes in a way a German reader
       * cannot predict from `gehen`: `gang` and `gönd` share no vowel with it,
       * so neither is recoverable by the correspondences.
       */
      target: "gah",
      bridge: "gehen",
      group: "verbs",
      forms: [
        { label: "ich", target: "gang", bridge: "gehe" },
        { label: "er", target: "gaht", bridge: "geht" },
        { label: "mir", target: "gönd", bridge: "gehen" },
      ],
      source: "idiotikon",
    },
    {
      /**
       * "Chunnsch au no verbi hüt Abig?" is the pack's own showcase line, "De
       * Dokter chunt am zäh" is in the care pack, and "Chömed er hüt no?" is
       * the `unified-plural` example two hundred lines below.
       */
      target: "cho",
      bridge: "kommen",
      group: "verbs",
      forms: [
        { label: "du", target: "chunnsch", bridge: "kommst" },
        { label: "er", target: "chunt", bridge: "kommt" },
        { label: "mir", target: "chömed", bridge: "kommen" },
      ],
      source: "idiotikon",
    },
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
     * More verbs, by the same test as the two above: each one is a word a
     * German reader either cannot recover at all, or — worse — recovers
     * confidently and wrongly.
     *
     * `aalüte` is the sharpest of them. Nothing in `anrufen` is visible in it,
     * and it is one of the handful of things somebody has to do in their first
     * week: ring the doctor, ring the landlord, ring the Amt.
     */

    /**
     * THE WORDS A GERMAN READER IS SURE THEY ALREADY KNOW.
     *
     * Every other row in this list works by looking different. These work by
     * looking the same, which is why they are the ones that actually cost
     * something: a reader meets `Peperoni`, recognises it, and never finds out
     * they were wrong until the plate arrives.
     *
     * Split in two by whether `mistakenFor` is present. With it, the word is a
     * TRAP — it exists in German and means something else. Without it, the
     * word is simply absent from German, which is a safer gap: `Trottoir` is
     * unknown rather than misunderstood, and unknown announces itself.
     *
     * The French layer is here because it is the part of Swiss usage that no
     * amount of German prepares anybody for, and because it is not dialect in
     * the narrow sense — `Billett` and `Perron` are written in newspapers and
     * said on platforms. A learner who can follow a Zurich sentence and still
     * does not know `Perron` has not been helped.
     */
    {
      target: "Eschtrich",
      bridge: "Dachboden",
      group: "helvetisms",
      mistakenFor: "Fussbodenbelag",
      source: "idiotikon",
    },
    {
      target: "Peperoni",
      bridge: "Paprika",
      group: "helvetisms",
      mistakenFor: "eine scharfe Schote",
      source: "idiotikon",
    },
    {
      target: "Finke",
      bridge: "Hausschuhe",
      group: "helvetisms",
      mistakenFor: "Finken, die Vögel",
      source: "idiotikon",
    },
    {
      target: "schmöcke",
      bridge: "riechen",
      group: "helvetisms",
      mistakenFor: "schmecken, mit der Zunge",
      source: "idiotikon",
    },
    {
      target: "zügle",
      bridge: "umziehen",
      group: "helvetisms",
      mistakenFor: "zügeln, im Zaum halten",
      source: "idiotikon",
    },
    {
      target: "lose",
      bridge: "zuhören",
      group: "helvetisms",
      mistakenFor: "losen, das Los ziehen",
      source: "idiotikon",
    },
    {
      target: "springe",
      bridge: "rennen",
      group: "helvetisms",
      mistakenFor: "springen, hüpfen",
      source: "idiotikon",
    },
    { target: "Perron", bridge: "Bahnsteig", group: "helvetisms" },
    { target: "Glace", bridge: "Speiseeis", group: "helvetisms" },
    { target: "Coiffeur", bridge: "Friseur", group: "helvetisms" },
    { target: "Güsel", bridge: "Abfall", group: "helvetisms" },
    { target: "Spital", bridge: "Krankenhaus", group: "helvetisms" },
    { target: "Nastuech", bridge: "Taschentuch", group: "helvetisms" },
    { target: "parkiere", bridge: "parken", group: "helvetisms" },

    /**
     * MORE OF THE WORDS NO SOUND RULE RESCUES — added with the larger list, so
     * the page stays what it argues it is. Asked for: "there are just not
     * enough words". Nouns and slang were added too, and every one of those
     * is matched here by a function word or a verb, because the vocabulary
     * test's rule — carrying words must outnumber the rest — is the page's
     * whole thesis, and satisfying it by adding more of what it is FOR is
     * better than carving a second exception into it.
     */
    { target: "mängisch", bridge: "manchmal", group: "function" },
    { target: "öppedie", bridge: "ab und zu", group: "function" },
    { target: "gliich", bridge: "trotzdem", group: "function" },
    { target: "zerscht", bridge: "zuerst", group: "function" },
    { target: "susch", bridge: "sonst", group: "function" },
    { target: "dänk", bridge: "wohl, doch", group: "function" },
    { target: "gnueg", bridge: "genug", group: "function" },
    { target: "vill", bridge: "viel", group: "function" },
    { target: "nüt", bridge: "nichts", group: "function" },
    { target: "niemer", bridge: "niemand", group: "function" },
    { target: "dört", bridge: "dort", group: "function" },
    { target: "ufe", bridge: "hinauf", group: "function" },
    { target: "abe", bridge: "hinunter", group: "function" },
    { target: "ine", bridge: "hinein", group: "function" },
    { target: "use", bridge: "hinaus", group: "function" },
    { target: "zrugg", bridge: "zurück", group: "function" },
    { target: "ewäg", bridge: "weg", group: "function" },
    { target: "öb", bridge: "ob", group: "function" },
    { target: "wil", bridge: "weil", group: "function" },
    { target: "wänn", bridge: "wenn", group: "function" },
    { target: "gseh", bridge: "sehen", group: "verbs" },
    { target: "ghöre", bridge: "hören", group: "verbs" },
    { target: "gä", bridge: "geben", group: "verbs" },
    { target: "neh", bridge: "nehmen", group: "verbs" },
    { target: "tänke", bridge: "denken", group: "verbs" },
    { target: "sölle", bridge: "sollen", group: "verbs" },
    { target: "dörfe", bridge: "dürfen", group: "verbs" },
    { target: "chaufe", bridge: "kaufen", group: "verbs" },
    { target: "zale", bridge: "zahlen", group: "verbs" },
    { target: "trinke", bridge: "trinken", group: "verbs" },
    { target: "schlafe", bridge: "schlafen", group: "verbs" },
    { target: "hocke", bridge: "sitzen", group: "verbs" },
    { target: "verzelle", bridge: "erzählen", group: "verbs" },
    { target: "choche", bridge: "kochen", group: "verbs" },
    { target: "gumpe", bridge: "hüpfen", group: "verbs" },
    { target: "aalüte", bridge: "anrufen", group: "verbs" },
    { target: "reklamiere", bridge: "sich beschweren", group: "verbs" },
    { target: "abmache", bridge: "vereinbaren", group: "verbs" },
    { target: "bruuche", bridge: "brauchen", group: "verbs" },
    { target: "hälfe", bridge: "helfen", group: "verbs" },
    { target: "warte", bridge: "warten", group: "verbs" },
    { target: "verstah", bridge: "verstehen", group: "verbs" },

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
    /**
     * The nouns, with their articles — and the articles are the point.
     *
     * The list had three of them, so the article drill had three questions and
     * a learner met the same one twice a week. Gender is the error a German
     * reader is least able to avoid, because it is carried by a word they
     * never had to learn, and `der Velo` survives a hundred correct readings
     * of the noun — so this is the cheapest real exercise the pack can grow.
     *
     * EVERY ROW HERE DIFFERS FROM GERMAN IN THE WORD TOO, and that is a
     * constraint rather than a coincidence: the vocabulary test refuses a row
     * whose two halves are the same string, so `Zimmer`, `Tür`, `Bahnhof` and
     * `Jahr` are deliberately absent. A row that teaches only the article
     * would be a row teaching one thing, and this page is not where gender
     * alone is taught — the `articles` topic is.
     *
     * `s Tram` is the sharpest of them. Germany says `die Straßenbahn`;
     * Switzerland says `das Tram` even in Standard German, and Zurich says
     * `s Tram`. A German speaker gets the article AND the word wrong.
     */
    {
      target: "Tram",
      bridge: "Strassenbahn",
      group: "everyday",
      article: "s",
      example: { target: "S Tram fahrt hüt nöd.", bridge: "Das Tram fährt heute nicht." },
      source: "idiotikon",
    },
    { target: "Billett", bridge: "Fahrkarte", group: "helvetisms", article: "s", source: "idiotikon" },
    { target: "Chuchi", bridge: "Küche", group: "everyday", article: "d", source: "idiotikon" },
    { target: "Gäld", bridge: "Geld", group: "everyday", article: "s", source: "idiotikon" },
    { target: "Arbet", bridge: "Arbeit", group: "everyday", article: "d", source: "idiotikon" },
    { target: "Fründ", bridge: "Freund", group: "everyday", article: "de", source: "idiotikon" },
    { target: "Wuche", bridge: "Woche", group: "everyday", article: "d", source: "idiotikon" },
    { target: "Morge", bridge: "Morgen", group: "everyday", article: "de", source: "idiotikon" },
    { target: "Aabig", bridge: "Abend", group: "everyday", article: "de", source: "idiotikon" },
    { target: "Wätter", bridge: "Wetter", group: "everyday", article: "s", source: "idiotikon" },
    { target: "Wohnig", bridge: "Wohnung", group: "everyday", article: "d", source: "idiotikon" },
    { target: "Stross", bridge: "Strasse", group: "everyday", article: "d", source: "idiotikon" },
    { target: "Lade", bridge: "Laden", group: "everyday", article: "de", source: "idiotikon" },
    { target: "Poscht", bridge: "Post", group: "everyday", article: "d", source: "idiotikon" },
    { target: "Chind", bridge: "Kind", group: "everyday", article: "s", source: "idiotikon" },
    { target: "Ziit", bridge: "Zeit", group: "everyday", article: "d", source: "idiotikon" },
    { target: "Wuchenend", bridge: "Wochenende", group: "everyday", article: "s", source: "idiotikon" },
    { target: "Ässe", bridge: "Essen", group: "everyday", article: "s", source: "idiotikon" },
    { target: "Zmorge", bridge: "Frühstück", group: "everyday", article: "s", source: "idiotikon" },
    { target: "Zmittag", bridge: "Mittagessen", group: "everyday", article: "s", source: "idiotikon" },
    { target: "Znacht", bridge: "Abendessen", group: "everyday", article: "s", source: "idiotikon" },
    { target: "Lüüt", bridge: "Leute", group: "everyday" },
    { target: "Velo", bridge: "Fahrrad", group: "helvetisms" },
    { target: "Znüni", bridge: "zweites Frühstück", group: "everyday" },
    { target: "Zvieri", bridge: "Zwischenmahlzeit am Nachmittag", group: "everyday" },
    { target: "Güetzi", bridge: "Keks", group: "everyday" },
    { target: "Rüebli", bridge: "Karotte", group: "everyday" },
    { target: "Poulet", bridge: "Hähnchen", group: "helvetisms" },
    { target: "Trottoir", bridge: "Bürgersteig", group: "helvetisms" },

    /**
     * Where the situations are: the table, the kitchen, the staircase, the doctor.
     */
    { target: "Gipfeli", bridge: "Croissant", group: "everyday" },
    { target: "Weggli", bridge: "Brötchen", group: "everyday" },
    { target: "Härdöpfel", bridge: "Kartoffel", group: "everyday" },
    { target: "Anke", bridge: "Butter", group: "everyday" },
    { target: "Nidle", bridge: "Sahne", group: "everyday" },
    { target: "Chäs", bridge: "Käse", group: "everyday" },
    { target: "Schoggi", bridge: "Schokolade", group: "everyday" },
    { target: "Zibele", bridge: "Zwiebel", group: "everyday" },
    { target: "Kafi", bridge: "Kaffee", group: "everyday" },
    { target: "Beiz", bridge: "Kneipe", group: "everyday" },
    { target: "Stange", bridge: "kleines Bier", group: "everyday" },
    { target: "Waschchuchi", bridge: "Waschküche", group: "everyday" },
    { target: "Stäge", bridge: "Treppe", group: "everyday" },
    { target: "Chopfweh", bridge: "Kopfschmerzen", group: "everyday" },
    { target: "Buuchweh", bridge: "Bauchschmerzen", group: "everyday" },
    { target: "Grüezi", bridge: "Guten Tag", group: "greetings" },
    { target: "Hoi", bridge: "Hallo", group: "greetings" },
    { target: "Salü", bridge: "Hallo", group: "greetings" },
    { target: "Ade", bridge: "Auf Wiedersehen", group: "greetings" },
    { target: "merci", bridge: "danke", group: "greetings" },
    { target: "Exgüsi", bridge: "Entschuldigung", group: "greetings" },
    { target: "en Guete", bridge: "guten Appetit", group: "greetings" },
    { target: "Proscht", bridge: "Prost", group: "greetings" },
    { target: "Tschau", bridge: "Tschüss", group: "greetings" },

    /**
     * SLANG, EACH WITH ITS REGISTER. Asked for by name. The meaning is the easy
     * half; `register` is the half a learner cannot audit — see `VocabularyEntry`.
     * Only words the Idiotikon attests; Zurich youth slang dates fast and is
     * deliberately not chased here.
     */
    { target: "Stutz", bridge: "Franken", group: "slang", register: "casual" },
    { target: "Chlotz", bridge: "Geld", group: "slang", register: "casual" },
    { target: "Büez", bridge: "Arbeit", group: "slang", register: "casual" },
    { target: "chrampfe", bridge: "hart arbeiten", group: "slang", register: "casual" },
    { target: "Seich", bridge: "Unsinn", group: "slang", register: "casual" },
    { target: "mega", bridge: "sehr", group: "slang", register: "casual" },
    { target: "gheie", bridge: "fallen", group: "slang", register: "casual" },
    { target: "schiffe", bridge: "stark regnen", group: "slang", register: "casual" },
    { target: "Hopp", bridge: "los", group: "slang", register: "casual" },
    { target: "Grind", bridge: "Kopf", group: "slang", register: "rude" },
    { target: "Schnure", bridge: "Mund", group: "slang", register: "rude" },
    { target: "Löli", bridge: "Dummkopf", group: "slang", register: "rude" },
    { target: "huere", bridge: "sehr", group: "slang", register: "rude" },
    { target: "Gof", bridge: "Kind", group: "slang", register: "rude" },
  ],

  vocabularySources: ["idiotikon"],

  grammar: [
    {
      // The single biggest one. There is no simple past in speech at all, so
      // a German reader waiting for "ging" or "war" waits forever.
      id: "no-preterite",
      band: "blocks",
      note: "the answer used a perfect where German would use a simple past, or somebody asked why nobody ever says ging, war or sagte",
      examples: [
        { target: "Ich bi geschter hei gange.", bridge: "Ich ging gestern nach Hause." },
        { target: "Si hät nüüt gseit.", bridge: "Sie sagte nichts." },
        { target: "Mir händ das scho gmacht.", bridge: "Wir machten das schon." },
      ],
    },
    {
      /**
       * Second, because it is the one a German reader gets wrong without
       * noticing — and the one this pack can now prove.
       *
       * `de`, `d` and `s` are the whole article system, and none of them is
       * the German word. SDS map 3869 gives the masculine nominative as `də`
       * at 66 of 66 Zurich survey points and map 3866 gives the neuter `s` at
       * 66 of 66, which is about as settled as a dialect fact gets.
       *
       * The third example is there to stop the rule sounding tidier than the
       * language is: the same atlas splits the canton on the feminine dative,
       * 57 points saying `dr` against 48 saying `də`. Zurich German is not one
       * system even in Zurich, and a page that implied otherwise would be
       * making the same mistake this product exists to correct.
       */
      id: "articles",
      band: "marks",
      note: "the answer turned on de, d or s — or the person wrote der, die or das, or gave a noun the German gender rather than this one",
      examples: [
        { target: "De Maa, d Frau, s Huus.", bridge: "Der Mann, die Frau, das Haus." },
        { target: "S Velo staht vor em Huus.", bridge: "Das Fahrrad steht vor dem Haus." },
        { target: "Gib s Rüebli em Chind.", bridge: "Gib die Karotte dem Kind." },
      ],
    },
    {
      // `wo` never inflects. German readers parse it as "where" and lose the
      // clause.
      id: "wo-relative",
      band: "blocks",
      note: "a relative clause built with wo, or somebody read wo as a question about a place and lost the sentence",
      examples: [
        { target: "De Maa, wo dört staht.", bridge: "Der Mann, der dort steht." },
        { target: "D Frau, wo ich gsee ha.", bridge: "Die Frau, die ich gesehen habe." },
        { target: "S Huus, wo mir gwohnt händ.", bridge: "Das Haus, in dem wir gewohnt haben." },
      ],
    },
    {
      /**
       * The last of the four that break comprehension outright.
       *
       * All three plural persons take one ending, so `mir`, `ihr` and `si`
       * carry the same verb — where German has `haben / habt / haben` and
       * `gehen / geht / gehen`, this has one form for the three. A German
       * reader hunting for the `-t` of the second person plural does not find
       * it, and `händ` looks like nothing they have ever conjugated.
       *
       * It is the reason the vocabulary's paradigms stop where they do: `ha`
       * carries `mir händ` and nothing separate for `ihr` or `si`, because
       * there is nothing separate to carry.
       */
      id: "unified-plural",
      band: "blocks",
      note: "a plural verb such as händ, gönd or chömed — or somebody hunting for a separate second-person-plural ending that does not exist",
      examples: [
        { target: "Mir händ, ihr händ, si händ.", bridge: "Wir haben, ihr habt, sie haben." },
        { target: "Chömed er hüt no?", bridge: "Kommt ihr heute noch?" },
        { target: "Si mached das scho.", bridge: "Sie machen das schon." },
      ],
    },
    {
      // Possession runs the other way round, and the genitive is simply gone.
      id: "possessive-dative",
      band: "blocks",
      note: "possession said as em Peter sis Auto, or somebody reaching for a genitive that this variety does not have",
      examples: [
        { target: "Em Peter sis Auto.", bridge: "Peters Auto." },
        { target: "De Anna ihri Schwöschter.", bridge: "Annas Schwester." },
        { target: "S Dach vom Huus.", bridge: "Das Dach des Hauses." },
      ],
    },
    {
      /**
       * The question words, and the trap in the middle of them.
       *
       * `wänn` is what earns this a place in `blocks`: a German reader hears
       * it as `wenn` and parses a CONDITION where a question was asked.
       * "Wänn chunt d Abfuhr?" read that way is not a sentence with a missing
       * detail, it is a sentence with the wrong shape, and the reply will
       * answer a question nobody put.
       *
       * Every example is a line the packs already publish.
       */
      id: "question-words",
      band: "blocks",
      note: "a question word — wänn, wo, was, wie, weer — and especially a learner who has read «wänn» as German «wenn»",
      examples: [
        { target: "Wänn chunt d Abfuhr?", bridge: "Wann kommt die Abfuhr?" },
        { target: "Wo find ich d Rüebli?", bridge: "Wo finde ich die Karotten?" },
        { target: "Was machsch am Wuchenend?", bridge: "Was machst du am Wochenende?" },
      ],
    },
    {
      /**
       * The indefinite article, which the pack taught by example in a dozen
       * sentences and never named.
       *
       * `es` is why this is `blocks` rather than `marks`: it is identical to
       * the pronoun `es`, so "Bruuched Sie es Säckli?" reads to a German eye
       * as "do you need IT, little bag" — a garden path with no exit. The
       * definite articles already have a topic; this is the other half of the
       * same fact, and its absence was the gap.
       */
      id: "indefinite-article",
      band: "blocks",
      note: "the indefinite article — en, e, es — and a learner who has read the article «es» as the pronoun «es»",
      examples: [
        { target: "Bruuched Sie es Säckli?", bridge: "Brauchen Sie ein Tütchen?" },
        { target: "Händ Sie e Charte?", bridge: "Haben Sie eine Karte?" },
        { target: "Ich möcht en Termin abmache.", bridge: "Ich möchte einen Termin vereinbaren." },
      ],
    },
    {
      /**
       * The imperative, which is where the polite form stops looking German.
       *
       * `-ed` is the whole topic: "Chömed Sie" beside "Kommen Sie". A learner
       * who has only ever met the German ending produces `Chömen Sie`, which
       * is understood perfectly and marks them instantly — the definition of
       * the `marks` band.
       */
      id: "imperative",
      band: "marks",
      note: "a command or a request, and a learner who has produced a polite form ending in -en rather than -ed",
      examples: [
        { target: "Chömed Sie doch ine.", bridge: "Kommen Sie doch herein." },
        { target: "Blibed Sie no ächli da.", bridge: "Bleiben Sie noch ein bisschen da." },
        { target: "Chumm, mir lauffed.", bridge: "Komm, wir gehen zu Fuss." },
      ],
    },
    {
      // Productive to a degree German is not: it attaches to almost anything
      // and often carries no smallness at all.
      id: "diminutive-li",
      band: "marks",
      note: "a word ending in -li, especially one that means nothing small and was taken literally",
      examples: [
        { target: "Machsch es Bierli?", bridge: "Trinken wir ein Bier?" },
        { target: "Es Kafi und es Gipfeli.", bridge: "Ein Kaffee und ein Croissant." },
        { target: "Gang no schnäll go poschte, es Sächeli.", bridge: "Geh noch kurz einkaufen, eine Kleinigkeit." },
      ],
    },
    {
      /**
       * A tense German does not have, used constantly.
       *
       * `am` plus the infinitive is how "right now, in the middle of it" is
       * said, and German has no grammatical equivalent — it reaches for
       * `gerade` or for nothing. So a German reader understands the words and
       * misses the aspect, and produces a flat present where a speaker here
       * would mark the ongoing action.
       *
       * Ordered down here with the others they will understand on a second
       * pass: this one costs you nothing to miss and marks you as foreign to
       * skip.
       */
      id: "am-progressive",
      band: "marks",
      note: "am plus a verb for something happening right now, or somebody asking how to say they are in the middle of doing something",
      examples: [
        { target: "Ich bi am schaffe.", bridge: "Ich arbeite gerade." },
        { target: "Si isch am Znacht choche.", bridge: "Sie kocht gerade Abendessen." },
        { target: "Mir sind scho lang am warte.", bridge: "Wir warten schon lange." },
      ],
    },
    {
      /**
       * The little word before the second verb.
       *
       * Going somewhere to do something takes `go`, coming takes `cho` — a
       * particle with no German counterpart at all, which is why a German
       * speaker says `Ich gang poschte` and is understood, and marked, at
       * once. The pack already publishes one of these under `diminutive-li`
       * (`Gang no schnäll go poschte`); this is the topic that explains it
       * rather than leaving it as scenery in somebody else's example.
       */
      id: "go-cho-infinitive",
      band: "marks",
      note: "go or cho in front of a second verb — or somebody who left it out, was understood, and read as standard German doing it",
      examples: [
        { target: "Ich gang go poschte.", bridge: "Ich gehe einkaufen." },
        // `Chunnsch`, matching the showcase line at the top of this file. The
        // two spellings of one word were both in the pack, which is exactly
        // what the orthography note promises not to do: there is no standard
        // to be wrong against here, so the house spelling has to be kept by
        // hand or it means nothing.
        { target: "Chunnsch cho hälfe?", bridge: "Kommst du helfen?" },
        { target: "Si isch go luege gange.", bridge: "Sie ist schauen gegangen." },
      ],
    },
    {
      /**
       * The small words that carry the stance.
       *
       * `gäll`, `halt`, `äbe`, `dänk` — none of them changes who did what, and
       * a learner who strips them all out still gets every fact in the
       * sentence. What they lose is the SPEAKER'S POSITION: whether they are
       * being asked to agree, told that nothing can be done, or answered with
       * "that is exactly my point".
       *
       * DELIBERATELY IN `marks` RATHER THAN `blocks`, and the honest reason is
       * that German has most of them. `halt` and `eben` are the same word
       * doing the same work, and `gell` is alive across southern Germany — a
       * reader from Stuttgart meets nothing new here and one from Hamburg
       * meets a little. What is genuinely Zurich is the FREQUENCY and `dänk`,
       * which has no German counterpart at all. Filing this under `blocks`
       * would overclaim, and §8 is about exactly that.
       *
       * The pack already lets these through as scenery — `gäll` stands
       * unexplained in the Bern rule at the top of this file. This is the
       * topic that names them.
       */
      id: "modal-particles",
      band: "marks",
      note: "gäll, halt, äbe or dänk — or somebody asking why a sentence has a small extra word in it that no dictionary explains",
      examples: [
        { target: "Das isch halt so.", bridge: "Das ist eben so, da kann man nichts machen." },
        { target: "Du chunnsch au, gäll?", bridge: "Du kommst auch, oder?" },
        { target: "Äbe, gnau das han ich gmeint.", bridge: "Genau, das habe ich gemeint." },
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
