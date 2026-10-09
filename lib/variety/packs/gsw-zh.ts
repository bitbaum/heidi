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

import type { VarietyPack, VarietyRule } from "../pack.ts";

/**
 * Standard German words that never occur in a Zurich German sentence, with
 * the Zurich form. See `VarietyPack.leaks`: a word both varieties use («und»,
 * «Sie», «immer», «sehr», «zu») is not here, however German it looks.
 */
const STANDARD_ONLY: readonly (readonly [string, string])[] = [
  // Verbs: the forms in every sentence, and the past tense Zurich does not have.
  ["ist", "isch"], ["habe", "ha"], ["haben", "händ"], ["hast", "häsch"], ["hat", "hät"],
  ["hatte", "ha gha"], ["hatten", "händ gha"], ["war", "isch gsi"], ["waren", "sind gsi"],
  ["wäre", "wär"], ["hätte", "hett"], ["würde", "würd"],
  ["gehen", "gah"], ["gehe", "gang"], ["geht", "gaht"], ["gegangen", "gange"],
  ["kommen", "cho"], ["komme", "chume"], ["kommt", "chunt"], ["gekommen", "cho"],
  ["können", "chönne"], ["kann", "cha"], ["kannst", "chasch"],
  ["müssen", "müesse"], ["muss", "mues"], ["musst", "muesch"],
  ["willst", "wotsch"], ["wollen", "wele"],
  ["sagen", "säge"], ["sagt", "seit"], ["gesagt", "gseit"],
  ["hören", "ghöre"], ["gehört", "ghört"],
  ["sehen", "gseh"], ["sieht", "gseht"], ["gesehen", "gseh"],
  ["kaufen", "chaufe"], ["einkaufen", "iichaufe"], ["schreiben", "schriibe"], ["bleiben", "bliibe"],
  ["lesen", "läse"], ["essen", "ässe"], ["arbeiten", "schaffe"], ["wissen", "wüsse"],
  ["geben", "gä"], ["gegeben", "gä"],
  // Pronouns and articles.
  ["wir", "mir"], ["uns", "eus"], ["euch", "eu"], ["mein", "min"], ["meine", "mini"],
  ["dein", "din"], ["deine", "dini"], ["einen", "en"],
  // The small words.
  ["nicht", "nöd"], ["nichts", "nüt"], ["auch", "au"], ["schon", "scho"], ["noch", "no"],
  ["etwas", "öppis"], ["jemand", "öpper"], ["niemand", "niemer"], ["nirgends", "niene"],
  ["hier", "do"], ["zusammen", "zäme"], ["ohne", "ohni"], ["bei", "bi"], ["auf", "uf"], ["aus", "us"],
  ["warum", "worum"], ["wann", "wänn"], ["wenn", "wänn"], ["dann", "dänn"], ["denn", "dänn"],
  ["heute", "hüt"], ["morgen", "morn"], ["gestern", "geschter"],
  ["gut", "guet"], ["klein", "chli"], ["kalt", "chalt"], ["krank", "chrank"], ["kurz", "churz"],
  ["viel", "vill"], ["viele", "vill"], ["mehr", "meh"], ["gerne", "gärn"],
  ["drei", "drüü"], ["neu", "nöi"],
  // Nouns whose Zurich shape is fixed.
  ["Zeit", "Ziit"], ["Haus", "Huus"], ["Hause", "deheim"], ["Leute", "Lüüt"], ["Kind", "Chind"],
  ["Kinder", "Chind"], ["Kopf", "Chopf"], ["Küche", "Chuchi"], ["Käse", "Chäs"], ["Geld", "Gäld"],
  ["Arbeit", "Arbet"], ["Abend", "Aabig"], ["Woche", "Wuche"], ["Mutter", "Mueter"],
  ["Strasse", "Stross"], ["Mann", "Maa"], ["Freund", "Fründ"],
];

export const ZURICH_GERMAN: VarietyPack = {
  tag: "gsw-u-sd-chzh",
  name: "Zurich German",
  endonym: "Züridütsch",
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
        id: "zueriduetsch",
        group: "high",
        endonym: "Züridütsch",
        cantons: ["ZH"],
        town: "Zürich",
        place: { lon: 8.5417, lat: 47.3769 },
        sources: ["sds-atlas", "kleiner-sprachatlas", "dialektatlas-2025", "hotzenkoecherle-1984", "weber-zuerich-grammatik", "gallmann-zuerich-woerterbuch", "fleischer-schmid-2006", "leemann-2016-crowdsourcing"],
      },
      {
        id: "baerndueuetsch",
        group: "high",
        endonym: "Bärndütsch",
        cantons: ["BE"],
        town: "Bern",
        place: { lon: 7.4474, lat: 46.948 },
        ruleOrigin: "Bern",
        sources: ["sds-atlas", "kleiner-sprachatlas", "dialektatlas-2025", "hotzenkoecherle-1984", "marti-bern-grammatik"],
      },
      {
        id: "baseldytsch",
        group: "low",
        endonym: "Baseldytsch",
        cantons: ["BS", "BL"],
        town: "Basel",
        place: { lon: 7.5886, lat: 47.5596 },
        ruleOrigin: "Basel",
        sources: ["sds-atlas", "kleiner-sprachatlas", "dialektatlas-2025", "hotzenkoecherle-1984", "suter-basel-grammatik", "suter-basel-woerterbuch"],
      },
      {
        id: "innerschwyzertuetsch",
        endonym: "Innerschwyzertütsch",
        cantons: ["LU", "UR", "SZ", "OW", "NW", "ZG"],
        town: "Luzern",
        place: { lon: 8.3093, lat: 47.0502 },
        ruleOrigin: "Innerschweiz",
        sources: ["sds-atlas", "kleiner-sprachatlas", "dialektatlas-2025", "hotzenkoecherle-1984", "bossard-zuger-mundartbuch", "aschwanden-urner-woerterbuch"],
      },
      {
        id: "ostschwiizertuetsch",
        group: "high",
        endonym: "Ostschwiizertütsch",
        cantons: ["SG", "TG", "AR", "AI", "SH"],
        town: "St. Gallen",
        place: { lon: 9.3767, lat: 47.4245 },
        ruleOrigin: "Ostschweiz",
        sources: ["sds-atlas", "kleiner-sprachatlas", "dialektatlas-2025", "hotzenkoecherle-1984", "schaffhauser-mundartwoerterbuch", "sonderegger-appenzeller-sprachbuch"],
      },
      {
        id: "aargauerdueuetsch",
        group: "high",
        endonym: "Aargauerdütsch",
        cantons: ["AG"],
        town: "Aarau",
        place: { lon: 8.0456, lat: 47.3909 },
        sources: ["sds-atlas", "kleiner-sprachatlas", "dialektatlas-2025", "hotzenkoecherle-1984", "meng-baden-woerterbuch"],
      },
      {
        id: "glarnertueuetsch",
        group: "highest",
        endonym: "Glarnertüütsch",
        cantons: ["GL"],
        town: "Glarus",
        place: { lon: 9.0678, lat: 47.0404 },
        ruleOrigin: "Glarus",
        sources: ["sds-atlas", "kleiner-sprachatlas", "dialektatlas-2025", "hotzenkoecherle-1984", "glarner-mundartwoerterbuch"],
      },
      {
        id: "solothurnerdueuetsch",
        group: "high",
        endonym: "Solothurnerdütsch",
        cantons: ["SO"],
        town: "Solothurn",
        place: { lon: 7.5378, lat: 47.2088 },
        sources: ["sds-atlas", "kleiner-sprachatlas", "dialektatlas-2025", "hotzenkoecherle-1984", "solothurner-mundartverein"],
      },
      {
        id: "seyslerdueuetsch",
        group: "high",
        endonym: "Seyslertütsch",
        cantons: ["FR"],
        town: "Freiburg",
        place: { lon: 7.162, lat: 46.8065 },
        ruleOrigin: "Sense",
        sources: ["sds-atlas", "kleiner-sprachatlas", "dialektatlas-2025", "hotzenkoecherle-1984", "schmutz-haas-sensler-woerterbuch"],
      },
      {
        // The one the map was missing, and not a small omission: Graubünden is
        // Switzerland's largest canton and its German is Alemannic throughout.
        id: "buendnerdueuetsch",
        endonym: "Bündnerdütsch",
        cantons: ["GR"],
        town: "Chur",
        place: { lon: 9.53, lat: 46.85 },
        ruleOrigin: "Graubünden",
        sources: ["sds-atlas", "kleiner-sprachatlas", "dialektatlas-2025", "hotzenkoecherle-1984", "davoser-woerterbuch", "rheinwalder-woerterbuch"],
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
        ruleOrigin: "Wallis",
        sources: ["sds-atlas", "kleiner-sprachatlas", "dialektatlas-2025", "hotzenkoecherle-1984", "bohnenberger-walliser-mundart"],
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
  explains: { article: "articles", clock: "clock-time", auxiliary: "perfect-auxiliary" },

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
    {
      target: "niene",
      bridge: "nirgends",
      group: "function",
      example: { target: "Ich find mini Schlüssel niene.", bridge: "Ich finde meine Schlüssel nirgends." },
      source: "idiotikon",
    },
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
    {
      target: "gäng",
      bridge: "immer",
      group: "function",
      example: { target: "Er chunt gäng z spaat.", bridge: "Er kommt immer zu spät." },
      source: "idiotikon",
    },
    {
      target: "äbe",
      bridge: "eben, genau",
      group: "function",
      example: { target: "Äbe, das han ich doch gseit.", bridge: "Eben, das habe ich doch gesagt." },
      source: "idiotikon",
    },
    {
      target: "sowieso",
      bridge: "ohnehin",
      group: "function",
      example: { target: "Das gaht sowieso nöd.", bridge: "Das geht ohnehin nicht." },
      source: "idiotikon",
    },
    { target: "zäme", bridge: "zusammen", group: "function" },
    {
      target: "deheim",
      bridge: "zu Hause",
      group: "function",
      example: { target: "Am Sunntig bin ich deheim.", bridge: "Am Sonntag bin ich zu Hause." },
      source: "idiotikon",
    },
    { target: "hüt", bridge: "heute", group: "function" },
    { target: "morn", bridge: "morgen", group: "function" },
    { target: "geschter", bridge: "gestern", group: "function" },
    { target: "spööter", bridge: "später", group: "function" },
    { target: "ame", bridge: "normalerweise", group: "function" },
    { target: "sicher", bridge: "bestimmt", group: "function" },

    /**
     * EVERY VERB CARRIES ITS PARADIGM: ich, du, er, one plural, and the past.
     *
     * One plural row because Zurich German has one plural form (`mir/ihr/si
     * händ`, see `unified-plural`); a separate `ihr` row would repeat it and
     * turn the form drill into a question with two right answers. The `ich`
     * row may equal the headword — it does for most verbs, and seeing that is
     * part of the paradigm.
     *
     * The past is the er-form of the perfect, auxiliary included («isch
     * gange», «hät gmacht»), because there is no other past (`no-preterite`)
     * and the auxiliary is half of what has to be learned: `hocke` takes
     * `si`, where a German reader from the north would reach for `haben`.
     * The bare participle would also often be the headword itself (`cho`).
     *
     * Modals stop before the past. Their past is almost always the double
     * infinitive («ha nöd chönne cho», `verb-order`), not a participle.
     *
     * Spellings follow the ones this pack and its scenes already publish
     * (`cha`, `gaasch`, `gää`, `gno`). As everywhere here, none of it has yet
     * been reviewed by a native Zurich speaker; every form faces the gate.
     */
    {
      /**
       * The most valuable paradigm in the language. `gsi` carries every past
       * tense of `sein` in a variety with no preterite; a German reader
       * waiting for `war` gets `isch … gsi` and has nothing to recognise.
       */
      target: "si",
      bridge: "sein",
      group: "verbs",
      forms: [
        { label: "ich", target: "bi", bridge: "bin" },
        { label: "du", target: "bisch", bridge: "bist" },
        { label: "er", target: "isch", bridge: "ist" },
        { label: "mir", target: "sind", bridge: "sind" },
        { label: "past", target: "isch gsi", bridge: "ist gewesen" },
      ],
      source: "idiotikon",
    },
    {
      /**
       * It matters more than any other verb because it carries every compound
       * past in the language: `no-preterite` is the pack's biggest grammar
       * topic and this is the auxiliary it runs on.
       */
      target: "ha",
      bridge: "haben",
      group: "verbs",
      forms: [
        { label: "ich", target: "ha", bridge: "habe" },
        { label: "du", target: "häsch", bridge: "hast" },
        { label: "er", target: "hät", bridge: "hat" },
        { label: "mir", target: "händ", bridge: "haben" },
        { label: "past", target: "hät gha", bridge: "hat gehabt" },
      ],
      source: "idiotikon",
    },
    {
      /**
       * The stem changes in a way a German reader cannot predict from
       * `gehen`: `gang` and `gönd` share no vowel with it, so neither is
       * recoverable by the correspondences.
       */
      target: "gah",
      bridge: "gehen",
      group: "verbs",
      forms: [
        { label: "ich", target: "gang", bridge: "gehe" },
        { label: "du", target: "gaasch", bridge: "gehst" },
        { label: "er", target: "gaht", bridge: "geht" },
        { label: "mir", target: "gönd", bridge: "gehen" },
        { label: "past", target: "isch gange", bridge: "ist gegangen" },
      ],
      source: "idiotikon",
    },
    {
      target: "cho",
      bridge: "kommen",
      group: "verbs",
      forms: [
        { label: "ich", target: "chume", bridge: "komme" },
        { label: "du", target: "chunnsch", bridge: "kommst" },
        { label: "er", target: "chunt", bridge: "kommt" },
        { label: "mir", target: "chömed", bridge: "kommen" },
        { label: "past", target: "isch cho", bridge: "ist gekommen" },
      ],
      source: "idiotikon",
    },
    {
      target: "mache",
      bridge: "machen",
      group: "verbs",
      forms: [
        { label: "ich", target: "mache", bridge: "mache" },
        { label: "du", target: "machsch", bridge: "machst" },
        { label: "er", target: "macht", bridge: "macht" },
        { label: "mir", target: "mached", bridge: "machen" },
        { label: "past", target: "hät gmacht", bridge: "hat gemacht" },
      ],
      source: "idiotikon",
    },
    {
      target: "luege",
      bridge: "schauen",
      group: "verbs",
      forms: [
        { label: "ich", target: "luege", bridge: "schaue" },
        { label: "du", target: "luegsch", bridge: "schaust" },
        { label: "er", target: "luegt", bridge: "schaut" },
        { label: "mir", target: "lueged", bridge: "schauen" },
        { label: "past", target: "hät gluegt", bridge: "hat geschaut" },
      ],
      source: "idiotikon",
    },
    {
      target: "säge",
      bridge: "sagen",
      group: "verbs",
      forms: [
        { label: "ich", target: "säge", bridge: "sage" },
        { label: "du", target: "seisch", bridge: "sagst" },
        { label: "er", target: "seit", bridge: "sagt" },
        { label: "mir", target: "säged", bridge: "sagen" },
        { label: "past", target: "hät gseit", bridge: "hat gesagt" },
      ],
      source: "idiotikon",
    },
    {
      target: "wüsse",
      bridge: "wissen",
      group: "verbs",
      forms: [
        { label: "ich", target: "weiss", bridge: "weiss" },
        { label: "du", target: "weisch", bridge: "weisst" },
        { label: "er", target: "weiss", bridge: "weiss" },
        { label: "mir", target: "wüssed", bridge: "wissen" },
        { label: "past", target: "hät gwüsst", bridge: "hat gewusst" },
      ],
      example: { target: "Das wott ich wüsse.", bridge: "Das will ich wissen." },
      source: "idiotikon",
    },
    {
      target: "chönne",
      bridge: "können",
      group: "verbs",
      forms: [
        { label: "ich", target: "cha", bridge: "kann" },
        { label: "du", target: "chasch", bridge: "kannst" },
        { label: "er", target: "cha", bridge: "kann" },
        { label: "mir", target: "chönd", bridge: "können" },
      ],
      example: { target: "Mir händ nöd chönne cho.", bridge: "Wir haben nicht kommen können." },
      source: "idiotikon",
    },
    {
      target: "müesse",
      bridge: "müssen",
      group: "verbs",
      forms: [
        { label: "ich", target: "mues", bridge: "muss" },
        { label: "du", target: "muesch", bridge: "musst" },
        { label: "er", target: "mues", bridge: "muss" },
        { label: "mir", target: "müend", bridge: "müssen" },
      ],
      example: { target: "Ich ha hüt lang müesse schaffe.", bridge: "Ich habe heute lange arbeiten müssen." },
      source: "idiotikon",
    },
    // Both mean something else in German, which is worse than being unknown:
    // a German reader understands them confidently and wrongly.
    {
      target: "schaffe",
      bridge: "arbeiten",
      group: "verbs",
      forms: [
        { label: "ich", target: "schaffe", bridge: "arbeite" },
        { label: "du", target: "schaffsch", bridge: "arbeitest" },
        { label: "er", target: "schafft", bridge: "arbeitet" },
        { label: "mir", target: "schaffed", bridge: "arbeiten" },
        { label: "past", target: "hät gschaffet", bridge: "hat gearbeitet" },
      ],
      example: { target: "Ich gang go schaffe.", bridge: "Ich gehe arbeiten." },
      source: "idiotikon",
    },
    {
      target: "poschte",
      bridge: "einkaufen",
      group: "verbs",
      forms: [
        { label: "ich", target: "poschte", bridge: "kaufe ein" },
        { label: "du", target: "poschtisch", bridge: "kaufst ein" },
        { label: "er", target: "poschtet", bridge: "kauft ein" },
        { label: "mir", target: "poschted", bridge: "kaufen ein" },
        { label: "past", target: "hät poschtet", bridge: "hat eingekauft" },
      ],
      source: "idiotikon",
    },
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
      example: { target: "Di alte Sache sind im Eschtrich.", bridge: "Die alten Sachen sind auf dem Dachboden." },
      source: "idiotikon",
    },
    {
      target: "Peperoni",
      bridge: "Paprika",
      group: "helvetisms",
      mistakenFor: "eine scharfe Schote",
      example: { target: "Ich nime no en rote Peperoni.", bridge: "Ich nehme noch eine rote Paprika." },
      source: "idiotikon",
    },
    {
      target: "Finke",
      bridge: "Hausschuhe",
      group: "helvetisms",
      mistakenFor: "Finken, die Vögel",
      example: { target: "Zieh d Finke aa.", bridge: "Zieh die Hausschuhe an." },
      source: "idiotikon",
    },
    {
      target: "schmöcke",
      bridge: "riechen",
      group: "helvetisms",
      mistakenFor: "schmecken, mit der Zunge",
      forms: [
        { label: "ich", target: "schmöcke", bridge: "rieche" },
        { label: "du", target: "schmöcksch", bridge: "riechst" },
        { label: "er", target: "schmöckt", bridge: "riecht" },
        { label: "mir", target: "schmöcked", bridge: "riechen" },
        { label: "past", target: "hät gschmöckt", bridge: "hat gerochen" },
      ],
      example: { target: "Chasch das schmöcke?", bridge: "Kannst du das riechen?" },
      source: "idiotikon",
    },
    {
      target: "zügle",
      bridge: "umziehen",
      group: "helvetisms",
      mistakenFor: "zügeln, im Zaum halten",
      forms: [
        { label: "ich", target: "zügle", bridge: "ziehe um" },
        { label: "du", target: "züglisch", bridge: "ziehst um" },
        { label: "er", target: "züglet", bridge: "zieht um" },
        { label: "mir", target: "zügled", bridge: "ziehen um" },
        { label: "past", target: "isch züglet", bridge: "ist umgezogen" },
      ],
      example: { target: "Mir zügled im Mai.", bridge: "Wir ziehen im Mai um." },
      source: "idiotikon",
    },
    {
      target: "lose",
      bridge: "zuhören",
      group: "helvetisms",
      mistakenFor: "losen, das Los ziehen",
      forms: [
        { label: "ich", target: "lose", bridge: "höre zu" },
        { label: "du", target: "losisch", bridge: "hörst zu" },
        { label: "er", target: "loset", bridge: "hört zu" },
        { label: "mir", target: "losed", bridge: "hören zu" },
        { label: "past", target: "hät glost", bridge: "hat zugehört" },
      ],
      example: { target: "Du muesch guet lose.", bridge: "Du musst gut zuhören." },
      source: "idiotikon",
    },
    {
      target: "springe",
      bridge: "rennen",
      group: "helvetisms",
      mistakenFor: "springen, hüpfen",
      example: { target: "Mir müend springe, s Tram chunt.", bridge: "Wir müssen rennen, das Tram kommt." },
      source: "idiotikon",
    },
    {
      target: "Perron",
      bridge: "Bahnsteig",
      group: "helvetisms",
      example: { target: "Mir träffed eus uf em Perron.", bridge: "Wir treffen uns auf dem Bahnsteig." },
      source: "idiotikon",
    },
    {
      target: "Glace",
      bridge: "Speiseeis",
      group: "helvetisms",
      article: "d",
      bridgeArticle: "das",
      source: "idiotikon",
      example: { target: "Mir nämed no e Glace.", bridge: "Wir nehmen noch ein Eis." },
    },
    {
      target: "Coiffeur",
      bridge: "Friseur",
      group: "helvetisms",
      example: { target: "Ich ha morn en Termin bim Coiffeur.", bridge: "Ich habe morgen einen Termin beim Friseur." },
      source: "idiotikon",
    },
    { target: "Güsel", bridge: "Abfall", group: "helvetisms" },
    {
      target: "Spital",
      bridge: "Krankenhaus",
      group: "helvetisms",
      example: { target: "Si isch im Spital.", bridge: "Sie ist im Krankenhaus." },
      source: "idiotikon",
    },
    {
      target: "Nastuech",
      bridge: "Taschentuch",
      group: "helvetisms",
      example: { target: "Häsch mer es Nastuech?", bridge: "Hast du mir ein Taschentuch?" },
      source: "idiotikon",
    },
    {
      target: "parkiere",
      bridge: "parken",
      group: "helvetisms",
      example: { target: "Do dörf mer nöd parkiere.", bridge: "Hier darf man nicht parken." },
      source: "idiotikon",
    },

    /**
     * MORE OF THE WORDS NO SOUND RULE RESCUES — added with the larger list, so
     * the page stays what it argues it is. Asked for: "there are just not
     * enough words". Nouns and slang were added too, and every one of those
     * is matched here by a function word or a verb, because the vocabulary
     * test's rule — carrying words must outnumber the rest — is the page's
     * whole thesis, and satisfying it by adding more of what it is FOR is
     * better than carving a second exception into it.
     */
    {
      target: "mängisch",
      bridge: "manchmal",
      group: "function",
      example: { target: "Mängisch gang ich z Fuess.", bridge: "Manchmal gehe ich zu Fuss." },
      source: "idiotikon",
    },
    {
      target: "öppedie",
      bridge: "ab und zu",
      group: "function",
      example: { target: "Mir gönd öppedie i d Beiz.", bridge: "Wir gehen ab und zu in die Kneipe." },
      source: "idiotikon",
    },
    { target: "gliich", bridge: "trotzdem", group: "function" },
    { target: "zerscht", bridge: "zuerst", group: "function" },
    {
      target: "susch",
      bridge: "sonst",
      group: "function",
      example: { target: "Chumm jetzt, susch verpasse mer s Tram.", bridge: "Komm jetzt, sonst verpassen wir das Tram." },
      source: "idiotikon",
    },
    {
      target: "dänk",
      bridge: "wohl, doch",
      group: "function",
      example: { target: "Das isch dänk de Nachber.", bridge: "Das ist wohl der Nachbar." },
      source: "idiotikon",
    },
    {
      target: "gnueg",
      bridge: "genug",
      group: "function",
      example: { target: "Mir händ gnueg Ziit.", bridge: "Wir haben genug Zeit." },
      source: "idiotikon",
    },
    { target: "vill", bridge: "viel", group: "function" },
    {
      target: "nüt",
      bridge: "nichts",
      group: "function",
      example: { target: "Das isch nüt für mich.", bridge: "Das ist nichts für mich." },
      source: "idiotikon",
    },
    {
      target: "niemer",
      bridge: "niemand",
      group: "function",
      example: { target: "Es isch niemer deheim.", bridge: "Es ist niemand zu Hause." },
      source: "idiotikon",
    },
    { target: "dört", bridge: "dort", group: "function" },
    {
      target: "ufe",
      bridge: "hinauf",
      group: "function",
      example: { target: "Chumm ufe!", bridge: "Komm herauf!" },
      source: "idiotikon",
    },
    {
      target: "abe",
      bridge: "hinunter",
      group: "function",
      example: { target: "Gang d Stäge abe.", bridge: "Geh die Treppe hinunter." },
      source: "idiotikon",
    },
    { target: "ine", bridge: "hinein", group: "function" },
    { target: "use", bridge: "hinaus", group: "function" },
    { target: "zrugg", bridge: "zurück", group: "function" },
    {
      target: "ewäg",
      bridge: "weg",
      group: "function",
      example: { target: "Mis Velo isch ewäg.", bridge: "Mein Velo ist weg." },
      source: "idiotikon",
    },
    { target: "öb", bridge: "ob", group: "function" },
    {
      target: "wil",
      bridge: "weil",
      group: "function",
      example: { target: "Ich chume nöd, wil ich chrank bin.", bridge: "Ich komme nicht, weil ich krank bin." },
      source: "idiotikon",
    },
    { target: "wänn", bridge: "wenn", group: "function" },
    {
      target: "gseh",
      bridge: "sehen",
      group: "verbs",
      forms: [
        { label: "ich", target: "gseh", bridge: "sehe" },
        { label: "du", target: "gsehsch", bridge: "siehst" },
        { label: "er", target: "gseht", bridge: "sieht" },
        { label: "mir", target: "gsehnd", bridge: "sehen" },
        { label: "past", target: "hät gseh", bridge: "hat gesehen" },
      ],
      source: "idiotikon",
    },
    {
      target: "ghöre",
      bridge: "hören",
      group: "verbs",
      forms: [
        { label: "ich", target: "ghöre", bridge: "höre" },
        { label: "du", target: "ghörsch", bridge: "hörst" },
        { label: "er", target: "ghört", bridge: "hört" },
        { label: "mir", target: "ghöred", bridge: "hören" },
        { label: "past", target: "hät ghört", bridge: "hat gehört" },
      ],
      example: { target: "Ich cha dich nöd ghöre.", bridge: "Ich kann dich nicht hören." },
      source: "idiotikon",
    },
    {
      target: "gä",
      bridge: "geben",
      group: "verbs",
      forms: [
        { label: "ich", target: "gibe", bridge: "gebe" },
        { label: "du", target: "gisch", bridge: "gibst" },
        { label: "er", target: "git", bridge: "gibt" },
        { label: "mir", target: "gänd", bridge: "geben" },
        { label: "past", target: "hät gää", bridge: "hat gegeben" },
      ],
      example: { target: "Chasch mer s Salz gä?", bridge: "Kannst du mir das Salz geben?" },
      source: "idiotikon",
    },
    {
      target: "neh",
      bridge: "nehmen",
      group: "verbs",
      forms: [
        { label: "ich", target: "nime", bridge: "nehme" },
        { label: "du", target: "nimmsch", bridge: "nimmst" },
        { label: "er", target: "nimmt", bridge: "nimmt" },
        { label: "mir", target: "nämed", bridge: "nehmen" },
        { label: "past", target: "hät gno", bridge: "hat genommen" },
      ],
      source: "idiotikon",
    },
    {
      target: "tänke",
      bridge: "denken",
      group: "verbs",
      forms: [
        { label: "ich", target: "tänke", bridge: "denke" },
        { label: "du", target: "tänksch", bridge: "denkst" },
        { label: "er", target: "tänkt", bridge: "denkt" },
        { label: "mir", target: "tänked", bridge: "denken" },
        { label: "past", target: "hät tänkt", bridge: "hat gedacht" },
      ],
      example: { target: "Ich mues zerscht tänke.", bridge: "Ich muss zuerst nachdenken." },
      source: "idiotikon",
    },
    {
      target: "sölle",
      bridge: "sollen",
      group: "verbs",
      forms: [
        { label: "ich", target: "söll", bridge: "soll" },
        { label: "du", target: "söllsch", bridge: "sollst" },
        { label: "er", target: "söll", bridge: "soll" },
        { label: "mir", target: "sölled", bridge: "sollen" },
      ],
      example: { target: "Was hett ich sölle mache?", bridge: "Was hätte ich tun sollen?" },
      source: "idiotikon",
    },
    {
      target: "dörfe",
      bridge: "dürfen",
      group: "verbs",
      forms: [
        { label: "ich", target: "darf", bridge: "darf" },
        { label: "du", target: "darfsch", bridge: "darfst" },
        { label: "er", target: "darf", bridge: "darf" },
        { label: "mir", target: "dörfed", bridge: "dürfen" },
      ],
      example: { target: "Mir händ nöd dörfe ine.", bridge: "Wir durften nicht hinein." },
      source: "idiotikon",
    },
    {
      target: "chaufe",
      bridge: "kaufen",
      group: "verbs",
      forms: [
        { label: "ich", target: "chaufe", bridge: "kaufe" },
        { label: "du", target: "chaufsch", bridge: "kaufst" },
        { label: "er", target: "chauft", bridge: "kauft" },
        { label: "mir", target: "chaufed", bridge: "kaufen" },
        { label: "past", target: "hät kauft", bridge: "hat gekauft" },
      ],
      example: { target: "Ich wott es nöis Velo chaufe.", bridge: "Ich will ein neues Velo kaufen." },
      source: "idiotikon",
    },
    {
      target: "zale",
      bridge: "zahlen",
      group: "verbs",
      forms: [
        { label: "ich", target: "zale", bridge: "zahle" },
        { label: "du", target: "zalsch", bridge: "zahlst" },
        { label: "er", target: "zalt", bridge: "zahlt" },
        { label: "mir", target: "zaled", bridge: "zahlen" },
        { label: "past", target: "hät zalt", bridge: "hat gezahlt" },
      ],
      source: "idiotikon",
    },
    {
      target: "trinke",
      bridge: "trinken",
      group: "verbs",
      forms: [
        { label: "ich", target: "trinke", bridge: "trinke" },
        { label: "du", target: "trinksch", bridge: "trinkst" },
        { label: "er", target: "trinkt", bridge: "trinkt" },
        { label: "mir", target: "trinked", bridge: "trinken" },
        { label: "past", target: "hät trunke", bridge: "hat getrunken" },
      ],
      example: { target: "Wänd Sie öppis trinke?", bridge: "Möchten Sie etwas trinken?" },
      source: "idiotikon",
    },
    {
      target: "schlafe",
      bridge: "schlafen",
      group: "verbs",
      forms: [
        { label: "ich", target: "schlafe", bridge: "schlafe" },
        { label: "du", target: "schlafsch", bridge: "schläfst" },
        { label: "er", target: "schlaft", bridge: "schläft" },
        { label: "mir", target: "schlafed", bridge: "schlafen" },
        { label: "past", target: "hät gschlafe", bridge: "hat geschlafen" },
      ],
      source: "idiotikon",
    },
    {
      target: "hocke",
      bridge: "sitzen",
      group: "verbs",
      forms: [
        { label: "ich", target: "hocke", bridge: "sitze" },
        { label: "du", target: "hocksch", bridge: "sitzt" },
        { label: "er", target: "hockt", bridge: "sitzt" },
        { label: "mir", target: "hocked", bridge: "sitzen" },
        { label: "past", target: "isch ghocket", bridge: "ist gesessen" },
      ],
      example: { target: "Wo wänd Sie hocke?", bridge: "Wo möchten Sie sitzen?" },
      source: "idiotikon",
    },
    {
      target: "verzelle",
      bridge: "erzählen",
      group: "verbs",
      forms: [
        { label: "ich", target: "verzelle", bridge: "erzähle" },
        { label: "du", target: "verzellsch", bridge: "erzählst" },
        { label: "er", target: "verzellt", bridge: "erzählt" },
        { label: "mir", target: "verzelled", bridge: "erzählen" },
        { label: "past", target: "hät verzellt", bridge: "hat erzählt" },
      ],
      example: { target: "Du muesch mer alles verzelle.", bridge: "Du musst mir alles erzählen." },
      source: "idiotikon",
    },
    {
      target: "choche",
      bridge: "kochen",
      group: "verbs",
      forms: [
        { label: "ich", target: "choche", bridge: "koche" },
        { label: "du", target: "chochsch", bridge: "kochst" },
        { label: "er", target: "chochet", bridge: "kocht" },
        { label: "mir", target: "choched", bridge: "kochen" },
        { label: "past", target: "hät kochet", bridge: "hat gekocht" },
      ],
      source: "idiotikon",
    },
    {
      target: "gumpe",
      bridge: "hüpfen",
      group: "verbs",
      forms: [
        { label: "ich", target: "gumpe", bridge: "hüpfe" },
        { label: "du", target: "gumpsch", bridge: "hüpfst" },
        { label: "er", target: "gumpt", bridge: "hüpft" },
        { label: "mir", target: "gumped", bridge: "hüpfen" },
        { label: "past", target: "isch gumpet", bridge: "ist gehüpft" },
      ],
      example: { target: "D Chind gumped im Bett.", bridge: "Die Kinder hüpfen im Bett." },
      source: "idiotikon",
    },
    {
      target: "aalüte",
      bridge: "anrufen",
      group: "verbs",
      forms: [
        { label: "ich", target: "lüte aa", bridge: "rufe an" },
        { label: "du", target: "lütisch aa", bridge: "rufst an" },
        { label: "er", target: "lütet aa", bridge: "ruft an" },
        { label: "mir", target: "lüted aa", bridge: "rufen an" },
        { label: "past", target: "hät aaglüte", bridge: "hat angerufen" },
      ],
      source: "idiotikon",
    },
    {
      target: "reklamiere",
      bridge: "sich beschweren",
      group: "verbs",
      forms: [
        { label: "ich", target: "reklamiere", bridge: "beschwere mich" },
        { label: "du", target: "reklamiersch", bridge: "beschwerst dich" },
        { label: "er", target: "reklamiert", bridge: "beschwert sich" },
        { label: "mir", target: "reklamiered", bridge: "beschweren uns" },
        { label: "past", target: "hät reklamiert", bridge: "hat sich beschwert" },
      ],
      example: { target: "Ich wott reklamiere.", bridge: "Ich möchte mich beschweren." },
      source: "idiotikon",
    },
    {
      target: "abmache",
      bridge: "vereinbaren",
      group: "verbs",
      forms: [
        { label: "ich", target: "mache ab", bridge: "vereinbare" },
        { label: "du", target: "machsch ab", bridge: "vereinbarst" },
        { label: "er", target: "macht ab", bridge: "vereinbart" },
        { label: "mir", target: "mached ab", bridge: "vereinbaren" },
        { label: "past", target: "hät abgmacht", bridge: "hat vereinbart" },
      ],
      source: "idiotikon",
    },
    {
      target: "bruuche",
      bridge: "brauchen",
      group: "verbs",
      forms: [
        { label: "ich", target: "bruuche", bridge: "brauche" },
        { label: "du", target: "bruuchsch", bridge: "brauchst" },
        { label: "er", target: "bruucht", bridge: "braucht" },
        { label: "mir", target: "bruuched", bridge: "brauchen" },
        { label: "past", target: "hät bruucht", bridge: "hat gebraucht" },
      ],
      source: "idiotikon",
    },
    {
      target: "hälfe",
      bridge: "helfen",
      group: "verbs",
      forms: [
        { label: "ich", target: "hilfe", bridge: "helfe" },
        { label: "du", target: "hilfsch", bridge: "hilfst" },
        { label: "er", target: "hilft", bridge: "hilft" },
        { label: "mir", target: "hälfed", bridge: "helfen" },
        { label: "past", target: "hät ghulfe", bridge: "hat geholfen" },
      ],
      source: "idiotikon",
    },
    {
      target: "warte",
      bridge: "warten",
      group: "verbs",
      forms: [
        { label: "ich", target: "warte", bridge: "warte" },
        { label: "du", target: "wartisch", bridge: "wartest" },
        { label: "er", target: "wartet", bridge: "wartet" },
        { label: "mir", target: "warted", bridge: "warten" },
        { label: "past", target: "hät gwartet", bridge: "hat gewartet" },
      ],
      source: "idiotikon",
    },
    {
      target: "verstah",
      bridge: "verstehen",
      group: "verbs",
      forms: [
        { label: "ich", target: "verstah", bridge: "verstehe" },
        { label: "du", target: "verstaasch", bridge: "verstehst" },
        { label: "er", target: "verstaht", bridge: "versteht" },
        { label: "mir", target: "verstönd", bridge: "verstehen" },
        { label: "past", target: "hät verstande", bridge: "hat verstanden" },
      ],
      source: "idiotikon",
    },

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
      bridgeArticle: "der",
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
      bridgeArticle: "die",
      example: { target: "De Anna ihri Schwöschter.", bridge: "Annas Schwester." },
      source: "sds-atlas",
    },
    {
      target: "Huus",
      bridge: "Haus",
      group: "everyday",
      article: "s",
      bridgeArticle: "das",
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
      bridgeArticle: "die",
      example: { target: "S Tram fahrt hüt nöd.", bridge: "Das Tram fährt heute nicht." },
      source: "idiotikon",
    },
    { target: "Billett", bridge: "Fahrkarte", group: "helvetisms", article: "s", bridgeArticle: "die", source: "idiotikon" },
    { target: "Chuchi", bridge: "Küche", group: "everyday", article: "d", bridgeArticle: "die", source: "idiotikon" },
    {
      target: "Gäld",
      bridge: "Geld",
      group: "everyday",
      article: "s",
      bridgeArticle: "das",
      source: "idiotikon",
      example: { target: "Ich ha kei Gäld debii.", bridge: "Ich habe kein Geld dabei." },
    },
    { target: "Arbet", bridge: "Arbeit", group: "everyday", article: "d", bridgeArticle: "die", source: "idiotikon" },
    {
      target: "Fründ",
      bridge: "Freund",
      group: "everyday",
      article: "de",
      bridgeArticle: "der",
      source: "idiotikon",
      example: { target: "Das isch min Fründ.", bridge: "Das ist mein Freund." },
    },
    { target: "Wuche", bridge: "Woche", group: "everyday", article: "d", bridgeArticle: "die", source: "idiotikon" },
    { target: "Morge", bridge: "Morgen", group: "everyday", article: "de", bridgeArticle: "der", source: "idiotikon" },
    { target: "Aabig", bridge: "Abend", group: "everyday", article: "de", bridgeArticle: "der", source: "idiotikon" },
    { target: "Wätter", bridge: "Wetter", group: "everyday", article: "s", bridgeArticle: "das", source: "idiotikon" },
    {
      target: "Wohnig",
      bridge: "Wohnung",
      group: "everyday",
      article: "d",
      bridgeArticle: "die",
      source: "idiotikon",
      example: { target: "Mir sueched e Wohnig.", bridge: "Wir suchen eine Wohnung." },
    },
    {
      target: "Stross",
      bridge: "Strasse",
      group: "everyday",
      article: "d",
      bridgeArticle: "die",
      source: "idiotikon",
      example: { target: "D Stross isch gsperrt.", bridge: "Die Strasse ist gesperrt." },
    },
    {
      target: "Lade",
      bridge: "Laden",
      group: "everyday",
      article: "de",
      bridgeArticle: "der",
      source: "idiotikon",
      example: { target: "De Lade isch scho zue.", bridge: "Der Laden ist schon zu." },
    },
    { target: "Poscht", bridge: "Post", group: "everyday", article: "d", bridgeArticle: "die", source: "idiotikon" },
    { target: "Chind", bridge: "Kind", group: "everyday", article: "s", bridgeArticle: "das", source: "idiotikon" },
    { target: "Ziit", bridge: "Zeit", group: "everyday", article: "d", bridgeArticle: "die", source: "idiotikon" },
    { target: "Wuchenend", bridge: "Wochenende", group: "everyday", article: "s", bridgeArticle: "das", source: "idiotikon" },
    { target: "Ässe", bridge: "Essen", group: "everyday", article: "s", bridgeArticle: "das", source: "idiotikon" },
    { target: "Zmorge", bridge: "Frühstück", group: "everyday", article: "s", bridgeArticle: "das", source: "idiotikon" },
    { target: "Zmittag", bridge: "Mittagessen", group: "everyday", article: "s", bridgeArticle: "das", source: "idiotikon" },
    { target: "Znacht", bridge: "Abendessen", group: "everyday", article: "s", bridgeArticle: "das", source: "idiotikon" },
    {
      target: "Lüüt",
      bridge: "Leute",
      group: "everyday",
      example: { target: "Es hät vill Lüüt.", bridge: "Es hat viele Leute." },
      source: "idiotikon",
    },
    { target: "Velo", bridge: "Fahrrad", group: "helvetisms" },
    { target: "Znüni", bridge: "zweites Frühstück", group: "everyday" },
    { target: "Zvieri", bridge: "Zwischenmahlzeit am Nachmittag", group: "everyday", article: "s", bridgeArticle: "die", source: "idiotikon" },
    { target: "Güetzi", bridge: "Keks", group: "everyday", article: "s", bridgeArticle: "der", source: "idiotikon" },
    { target: "Rüebli", bridge: "Karotte", group: "everyday", article: "s", bridgeArticle: "die", source: "idiotikon" },
    { target: "Poulet", bridge: "Hähnchen", group: "helvetisms" },
    {
      target: "Trottoir",
      bridge: "Bürgersteig",
      group: "helvetisms",
      article: "s",
      bridgeArticle: "der",
      source: "idiotikon",
      example: { target: "Fahr nöd uf em Trottoir!", bridge: "Fahr nicht auf dem Bürgersteig!" },
    },

    /**
     * Where the situations are: the table, the kitchen, the staircase, the doctor.
     */
    {
      target: "Gipfeli",
      bridge: "Croissant",
      group: "everyday",
      example: { target: "Es Gipfeli und en Kafi, bitte.", bridge: "Ein Croissant und einen Kaffee, bitte." },
      source: "idiotikon",
    },
    {
      target: "Weggli",
      bridge: "Brötchen",
      group: "everyday",
      example: { target: "Zwei Weggli, bitte.", bridge: "Zwei Brötchen, bitte." },
      source: "idiotikon",
    },
    {
      target: "Härdöpfel",
      bridge: "Kartoffel",
      group: "everyday",
      article: "de",
      bridgeArticle: "die",
      source: "idiotikon",
      example: { target: "Hüt git s Härdöpfel.", bridge: "Heute gibt es Kartoffeln." },
    },
    {
      target: "Anke",
      bridge: "Butter",
      group: "everyday",
      article: "de",
      bridgeArticle: "die",
      source: "idiotikon",
      example: { target: "Häsch no Anke?", bridge: "Hast du noch Butter?" },
    },
    {
      target: "Nidle",
      bridge: "Sahne",
      group: "everyday",
      example: { target: "En Kafi mit Nidle, bitte.", bridge: "Einen Kaffee mit Sahne, bitte." },
      source: "idiotikon",
    },
    {
      target: "Chäs",
      bridge: "Käse",
      group: "everyday",
      example: { target: "Es Brot mit Chäs.", bridge: "Ein Brot mit Käse." },
      source: "idiotikon",
    },
    {
      target: "Schoggi",
      bridge: "Schokolade",
      group: "everyday",
      example: { target: "Wotsch es Stück Schoggi?", bridge: "Willst du ein Stück Schokolade?" },
      source: "idiotikon",
    },
    {
      target: "Zibele",
      bridge: "Zwiebel",
      group: "everyday",
      example: { target: "Ohni Zibele, bitte.", bridge: "Ohne Zwiebeln, bitte." },
      source: "idiotikon",
    },
    { target: "Kafi", bridge: "Kaffee", group: "everyday" },
    {
      target: "Beiz",
      bridge: "Kneipe",
      group: "everyday",
      example: { target: "Mir gönd no i d Beiz.", bridge: "Wir gehen noch in die Kneipe." },
      source: "idiotikon",
    },
    {
      target: "Stange",
      bridge: "kleines Bier",
      group: "everyday",
      article: "d",
      bridgeArticle: "das",
      source: "idiotikon",
      example: { target: "E Stange, bitte.", bridge: "Ein kleines Bier, bitte." },
    },
    { target: "Waschchuchi", bridge: "Waschküche", group: "everyday" },
    {
      target: "Stäge",
      bridge: "Treppe",
      group: "everyday",
      example: { target: "Nämed Sie d Stäge, de Lift gaht nöd.", bridge: "Nehmen Sie die Treppe, der Lift geht nicht." },
      source: "idiotikon",
    },
    {
      target: "Chopfweh",
      bridge: "Kopfschmerzen",
      group: "everyday",
      example: { target: "Ich ha Chopfweh.", bridge: "Ich habe Kopfschmerzen." },
      source: "idiotikon",
    },
    {
      target: "Buuchweh",
      bridge: "Bauchschmerzen",
      group: "everyday",
      example: { target: "S Chind hät Buuchweh.", bridge: "Das Kind hat Bauchschmerzen." },
      source: "idiotikon",
    },
    { target: "Grüezi", bridge: "Guten Tag", group: "greetings" },
    {
      target: "Hoi",
      bridge: "Hallo",
      group: "greetings",
      example: { target: "Hoi Lea, wie gaht s?", bridge: "Hallo Lea, wie geht's?" },
      source: "idiotikon",
    },
    {
      target: "Salü",
      bridge: "Hallo",
      group: "greetings",
      example: { target: "Salü Marco, alles klar?", bridge: "Hallo Marco, alles klar?" },
      source: "idiotikon",
    },
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
    {
      target: "Stutz",
      bridge: "Franken",
      group: "slang",
      register: "casual",
      example: { target: "Das choschtet zwänzg Stutz.", bridge: "Das kostet zwanzig Franken." },
      source: "idiotikon",
    },
    {
      target: "Chlotz",
      bridge: "Geld",
      group: "slang",
      register: "casual",
      example: { target: "Er hät vill Chlotz.", bridge: "Er hat viel Geld." },
      source: "idiotikon",
    },
    {
      target: "Büez",
      bridge: "Arbeit",
      group: "slang",
      register: "casual",
      example: { target: "Ich ha vill Büez.", bridge: "Ich habe viel Arbeit." },
      source: "idiotikon",
    },
    {
      target: "chrampfe",
      bridge: "hart arbeiten",
      group: "slang",
      register: "casual",
      example: { target: "Mir händ de ganz Tag müesse chrampfe.", bridge: "Wir mussten den ganzen Tag hart arbeiten." },
      source: "idiotikon",
    },
    /**
     * The person, not the money: Zurich's name for whoever enforces the
     * house rules. Asked for by name, and it carries a register because it
     * is affectionate about a third party and an insult to somebody's face.
     * The scene `buenzli` is the whole encounter.
     */
    {
      target: "Bünzli",
      bridge: "Spiesser",
      group: "slang",
      register: "casual",
      article: "de",
      bridgeArticle: "der",
      example: { target: "Lueg, dä isch en richtige Bünzli.", bridge: "Schau, der ist ein richtiger Spiesser." },
      source: "idiotikon",
    },
    {
      target: "Seich",
      bridge: "Unsinn",
      group: "slang",
      register: "casual",
      example: { target: "Das isch doch Seich.", bridge: "Das ist doch Unsinn." },
      source: "idiotikon",
    },
    { target: "mega", bridge: "sehr", group: "slang", register: "casual" },
    {
      target: "gheie",
      bridge: "fallen",
      group: "slang",
      register: "casual",
      example: { target: "Lass es nöd gheie!", bridge: "Lass es nicht fallen!" },
      source: "idiotikon",
    },
    {
      target: "schiffe",
      bridge: "stark regnen",
      group: "slang",
      register: "casual",
      example: { target: "Es schiffet scho de ganz Tag.", bridge: "Es regnet schon den ganzen Tag in Strömen." },
      source: "idiotikon",
    },
    {
      target: "Hopp",
      bridge: "los",
      group: "slang",
      register: "casual",
      example: { target: "Hopp, mir müend gah!", bridge: "Los, wir müssen gehen!" },
      source: "idiotikon",
    },
    {
      target: "Grind",
      bridge: "Kopf",
      group: "slang",
      register: "rude",
      example: { target: "Mir tuet de Grind weh.", bridge: "Mir tut der Kopf weh." },
      source: "idiotikon",
    },
    {
      target: "Schnure",
      bridge: "Mund",
      group: "slang",
      register: "rude",
      example: { target: "Halt d Schnure!", bridge: "Halt den Mund!" },
      source: "idiotikon",
    },
    {
      target: "Löli",
      bridge: "Dummkopf",
      group: "slang",
      register: "rude",
      example: { target: "Du bisch en Löli.", bridge: "Du bist ein Dummkopf." },
      source: "idiotikon",
    },
    {
      target: "huere",
      bridge: "sehr",
      group: "slang",
      register: "rude",
      example: { target: "Das isch huere guet.", bridge: "Das ist sehr gut." },
      source: "idiotikon",
    },
    {
      target: "Gof",
      bridge: "Kind",
      group: "slang",
      register: "rude",
      example: { target: "D Gofe schlafed scho.", bridge: "Die Kinder schlafen schon." },
      source: "idiotikon",
    },
    /**
     * THE LUNCH-TABLE BATCH (2026-09-26). Asked for: "there is a little bit
     * more we can do in terms of content". Chosen by the same test as
     * everything above — a German reader either cannot recover the word, or
     * recovers it wrongly — and weighted the way the page's thesis demands:
     * the short words and the verbs first, nouns second, so the vocabulary
     * test's "carrying words dominate" still holds with room to spare.
     *
     * The direction words (`obe`, `une`, `dusse`, `dinne`, `ume`) belong with
     * the `directions` grammar topic; `wo` is the relative particle the
     * `wo-relative` topic is about, listed so it can be saved like any word.
     */
    {
      target: "ämel",
      bridge: "jedenfalls, wenigstens",
      group: "function",
      example: { target: "Ich bi ämel pünktlich gsi.", bridge: "Ich war jedenfalls pünktlich." },
      source: "idiotikon",
    },
    { target: "fascht", bridge: "fast", group: "function" },
    {
      target: "worum",
      bridge: "warum",
      group: "function",
      example: { target: "Worum chunnsch nöd?", bridge: "Warum kommst du nicht?" },
      source: "idiotikon",
    },
    { target: "dänn", bridge: "dann", group: "function" },
    { target: "eso", bridge: "so", group: "function" },
    {
      target: "sone",
      bridge: "so ein",
      group: "function",
      example: { target: "Ich wott au sone Jacke.", bridge: "Ich will auch so eine Jacke." },
      source: "idiotikon",
    },
    {
      target: "chli",
      bridge: "klein, ein wenig",
      group: "function",
      example: { target: "Mir händ e chli Wohnig.", bridge: "Wir haben eine kleine Wohnung." },
      source: "idiotikon",
    },
    {
      target: "übermorn",
      bridge: "übermorgen",
      group: "function",
      example: { target: "Ich chume übermorn.", bridge: "Ich komme übermorgen." },
      source: "idiotikon",
    },
    {
      target: "vorgeschter",
      bridge: "vorgestern",
      group: "function",
      example: { target: "Vorgeschter isch es warm gsi.", bridge: "Vorgestern war es warm." },
      source: "idiotikon",
    },
    {
      target: "dur",
      bridge: "durch",
      group: "function",
      example: { target: "Mir lauffed dur de Wald.", bridge: "Wir gehen durch den Wald." },
      source: "idiotikon",
    },
    {
      target: "alli",
      bridge: "alle",
      group: "function",
      example: { target: "Alli sind cho.", bridge: "Alle sind gekommen." },
      source: "idiotikon",
    },
    {
      target: "beidi",
      bridge: "beide",
      group: "function",
      example: { target: "Mir chömed beidi.", bridge: "Wir kommen beide." },
      source: "idiotikon",
    },
    {
      target: "zwüsche",
      bridge: "zwischen",
      group: "function",
      example: { target: "De Lade isch zwüsche de Post und em Bahnhof.", bridge: "Der Laden ist zwischen der Post und dem Bahnhof." },
      source: "idiotikon",
    },
    { target: "ohni", bridge: "ohne", group: "function" },
    {
      target: "wäge",
      bridge: "wegen",
      group: "function",
      example: { target: "Wäge em Räge bliibed mer deheim.", bridge: "Wegen des Regens bleiben wir zu Hause." },
      source: "idiotikon",
    },
    {
      target: "hine",
      bridge: "hinten",
      group: "function",
      example: { target: "Hine im Bus hät s no Platz.", bridge: "Hinten im Bus hat es noch Platz." },
      source: "idiotikon",
    },
    {
      target: "obe",
      bridge: "oben",
      group: "function",
      example: { target: "Mir wohned obe.", bridge: "Wir wohnen oben." },
      source: "idiotikon",
    },
    {
      target: "une",
      bridge: "unten",
      group: "function",
      example: { target: "De Velokeller isch une.", bridge: "Der Velokeller ist unten." },
      source: "idiotikon",
    },
    {
      target: "dusse",
      bridge: "draussen",
      group: "function",
      example: { target: "D Chind spiled dusse.", bridge: "Die Kinder spielen draussen." },
      source: "idiotikon",
    },
    {
      target: "dinne",
      bridge: "drinnen",
      group: "function",
      example: { target: "Es isch chalt, mir bliibed dinne.", bridge: "Es ist kalt, wir bleiben drinnen." },
      source: "idiotikon",
    },
    {
      target: "ume",
      bridge: "herum, hinüber",
      group: "function",
      example: { target: "Chumm doch ume.", bridge: "Komm doch herüber." },
      source: "idiotikon",
    },
    { target: "wo", bridge: "der, die, das (im Relativsatz)", group: "function" },
    { target: "eus", bridge: "uns", group: "function" },
    {
      target: "eu",
      bridge: "euch",
      group: "function",
      example: { target: "Ich hilf eu.", bridge: "Ich helfe euch." },
      source: "idiotikon",
    },
    {
      target: "wäsche",
      bridge: "waschen",
      group: "verbs",
      forms: [
        { label: "ich", target: "wäsche", bridge: "wasche" },
        { label: "du", target: "wäschsch", bridge: "wäschst" },
        { label: "er", target: "wäscht", bridge: "wäscht" },
        { label: "mir", target: "wäsched", bridge: "waschen" },
        { label: "past", target: "hät gwäsche", bridge: "hat gewaschen" },
      ],
      source: "idiotikon",
    },
    {
      target: "lah",
      bridge: "lassen",
      group: "verbs",
      forms: [
        { label: "ich", target: "lah", bridge: "lasse" },
        { label: "du", target: "laasch", bridge: "lässt" },
        { label: "er", target: "laht", bridge: "lässt" },
        { label: "mir", target: "lönd", bridge: "lassen" },
        { label: "past", target: "hät glaa", bridge: "hat gelassen" },
      ],
      source: "idiotikon",
    },
    {
      target: "tue",
      bridge: "tun",
      group: "verbs",
      forms: [
        { label: "ich", target: "tue", bridge: "tue" },
        { label: "du", target: "tuesch", bridge: "tust" },
        { label: "er", target: "tuet", bridge: "tut" },
        { label: "mir", target: "tüend", bridge: "tun" },
        { label: "past", target: "hät taa", bridge: "hat getan" },
      ],
      source: "idiotikon",
    },
    {
      target: "blibe",
      bridge: "bleiben",
      group: "verbs",
      forms: [
        { label: "ich", target: "blibe", bridge: "bleibe" },
        { label: "du", target: "blibsch", bridge: "bleibst" },
        { label: "er", target: "blibt", bridge: "bleibt" },
        { label: "mir", target: "blibed", bridge: "bleiben" },
        { label: "past", target: "isch blibe", bridge: "ist geblieben" },
      ],
      example: { target: "Wie lang wänd Sie blibe?", bridge: "Wie lange möchten Sie bleiben?" },
      source: "idiotikon",
    },
    {
      // Looks like German `laufen` and is used for plain walking, where a
      // German reader expects running — which is `springe`, further up.
      target: "lauffe",
      bridge: "zu Fuss gehen",
      group: "verbs",
      forms: [
        { label: "ich", target: "lauffe", bridge: "gehe zu Fuss" },
        { label: "du", target: "lauffsch", bridge: "gehst zu Fuss" },
        { label: "er", target: "laufft", bridge: "geht zu Fuss" },
        { label: "mir", target: "lauffed", bridge: "gehen zu Fuss" },
        { label: "past", target: "isch gloffe", bridge: "ist zu Fuss gegangen" },
      ],
      example: { target: "Mir lauffed hei.", bridge: "Wir gehen zu Fuss nach Hause." },
      source: "idiotikon",
    },
    {
      target: "schriibe",
      bridge: "schreiben",
      group: "verbs",
      forms: [
        { label: "ich", target: "schriibe", bridge: "schreibe" },
        { label: "du", target: "schriibsch", bridge: "schreibst" },
        { label: "er", target: "schriibt", bridge: "schreibt" },
        { label: "mir", target: "schriibed", bridge: "schreiben" },
        { label: "past", target: "hät gschribe", bridge: "hat geschrieben" },
      ],
      example: { target: "Chasch mer schriibe?", bridge: "Kannst du mir schreiben?" },
      source: "idiotikon",
    },
    {
      target: "läse",
      bridge: "lesen",
      group: "verbs",
      forms: [
        { label: "ich", target: "läse", bridge: "lese" },
        { label: "du", target: "lisisch", bridge: "liest" },
        { label: "er", target: "list", bridge: "liest" },
        { label: "mir", target: "läsed", bridge: "lesen" },
        { label: "past", target: "hät gläse", bridge: "hat gelesen" },
      ],
      example: { target: "Ich mues das no läse.", bridge: "Ich muss das noch lesen." },
      source: "idiotikon",
    },
    {
      target: "spile",
      bridge: "spielen",
      group: "verbs",
      forms: [
        { label: "ich", target: "spile", bridge: "spiele" },
        { label: "du", target: "spilsch", bridge: "spielst" },
        { label: "er", target: "spilt", bridge: "spielt" },
        { label: "mir", target: "spiled", bridge: "spielen" },
        { label: "past", target: "hät gspilt", bridge: "hat gespielt" },
      ],
      example: { target: "Wotsch mit eus spile?", bridge: "Willst du mit uns spielen?" },
      source: "idiotikon",
    },
    {
      target: "aalege",
      bridge: "anziehen (Kleider)",
      group: "verbs",
      forms: [
        { label: "ich", target: "lege aa", bridge: "ziehe an" },
        { label: "du", target: "leisch aa", bridge: "ziehst an" },
        { label: "er", target: "leit aa", bridge: "zieht an" },
        { label: "mir", target: "leged aa", bridge: "ziehen an" },
        { label: "past", target: "hät aagleit", bridge: "hat angezogen" },
      ],
      source: "idiotikon",
    },
    {
      target: "ufstah",
      bridge: "aufstehen",
      group: "verbs",
      forms: [
        { label: "ich", target: "stah uf", bridge: "stehe auf" },
        { label: "du", target: "staasch uf", bridge: "stehst auf" },
        { label: "er", target: "staht uf", bridge: "steht auf" },
        { label: "mir", target: "stönd uf", bridge: "stehen auf" },
        { label: "past", target: "isch ufgstande", bridge: "ist aufgestanden" },
      ],
      source: "idiotikon",
    },
    {
      target: "vergässe",
      bridge: "vergessen",
      group: "verbs",
      forms: [
        { label: "ich", target: "vergisse", bridge: "vergesse" },
        { label: "du", target: "vergissisch", bridge: "vergisst" },
        { label: "er", target: "vergisst", bridge: "vergisst" },
        { label: "mir", target: "vergässed", bridge: "vergessen" },
        { label: "past", target: "hät vergässe", bridge: "hat vergessen" },
      ],
      example: { target: "Ich ha s vergässe.", bridge: "Ich habe es vergessen." },
      source: "idiotikon",
    },
    {
      target: "iichaufe",
      bridge: "einkaufen",
      group: "verbs",
      forms: [
        { label: "ich", target: "chaufe ii", bridge: "kaufe ein" },
        { label: "du", target: "chaufsch ii", bridge: "kaufst ein" },
        { label: "er", target: "chauft ii", bridge: "kauft ein" },
        { label: "mir", target: "chaufed ii", bridge: "kaufen ein" },
        { label: "past", target: "hät iikauft", bridge: "hat eingekauft" },
      ],
      example: { target: "Ich gang no go iichaufe.", bridge: "Ich gehe noch einkaufen." },
      source: "idiotikon",
    },
    {
      target: "tschuute",
      bridge: "Fussball spielen",
      group: "verbs",
      forms: [
        { label: "ich", target: "tschuute", bridge: "spiele Fussball" },
        { label: "du", target: "tschuutisch", bridge: "spielst Fussball" },
        { label: "er", target: "tschuutet", bridge: "spielt Fussball" },
        { label: "mir", target: "tschuuted", bridge: "spielen Fussball" },
        { label: "past", target: "hät tschuutet", bridge: "hat Fussball gespielt" },
      ],
      example: { target: "D Buebe gönd go tschuute.", bridge: "Die Jungen gehen Fussball spielen." },
      source: "idiotikon",
    },
    {
      target: "verwütsche",
      bridge: "erwischen",
      group: "verbs",
      forms: [
        { label: "ich", target: "verwütsche", bridge: "erwische" },
        { label: "du", target: "verwütschisch", bridge: "erwischst" },
        { label: "er", target: "verwütscht", bridge: "erwischt" },
        { label: "mir", target: "verwütsched", bridge: "erwischen" },
        { label: "past", target: "hät verwütscht", bridge: "hat erwischt" },
      ],
      example: { target: "Mir müend de Zug no verwütsche.", bridge: "Wir müssen den Zug noch erwischen." },
      source: "idiotikon",
    },
    {
      target: "wele",
      bridge: "wollen",
      group: "verbs",
      forms: [
        { label: "ich", target: "wott", bridge: "will" },
        { label: "du", target: "wotsch", bridge: "willst" },
        { label: "er", target: "wott", bridge: "will" },
        { label: "mir", target: "wänd", bridge: "wollen" },
      ],
      source: "idiotikon",
    },
    {
      target: "fahre",
      bridge: "fahren",
      group: "verbs",
      forms: [
        { label: "ich", target: "fahre", bridge: "fahre" },
        { label: "du", target: "fahrsch", bridge: "fährst" },
        { label: "er", target: "fahrt", bridge: "fährt" },
        { label: "mir", target: "fahred", bridge: "fahren" },
        { label: "past", target: "isch gfahre", bridge: "ist gefahren" },
      ],
      source: "idiotikon",
    },
    {
      target: "wohne",
      bridge: "wohnen",
      group: "verbs",
      forms: [
        { label: "ich", target: "wohne", bridge: "wohne" },
        { label: "du", target: "wohnsch", bridge: "wohnst" },
        { label: "er", target: "wohnt", bridge: "wohnt" },
        { label: "mir", target: "wohned", bridge: "wohnen" },
        { label: "past", target: "hät gwohnt", bridge: "hat gewohnt" },
      ],
      source: "idiotikon",
    },
    {
      target: "lerne",
      bridge: "lernen",
      group: "verbs",
      forms: [
        { label: "ich", target: "lerne", bridge: "lerne" },
        { label: "du", target: "lernsch", bridge: "lernst" },
        { label: "er", target: "lernt", bridge: "lernt" },
        { label: "mir", target: "lerned", bridge: "lernen" },
        { label: "past", target: "hät glernt", bridge: "hat gelernt" },
      ],
      source: "idiotikon",
    },
    {
      target: "rede",
      bridge: "reden",
      group: "verbs",
      forms: [
        { label: "ich", target: "rede", bridge: "rede" },
        { label: "du", target: "redsch", bridge: "redest" },
        { label: "er", target: "redt", bridge: "redet" },
        { label: "mir", target: "reded", bridge: "reden" },
        { label: "past", target: "hät gredt", bridge: "hat geredet" },
      ],
      source: "idiotikon",
    },
    {
      target: "frage",
      bridge: "fragen",
      group: "verbs",
      forms: [
        { label: "ich", target: "frage", bridge: "frage" },
        { label: "du", target: "fragsch", bridge: "fragst" },
        { label: "er", target: "fragt", bridge: "fragt" },
        { label: "mir", target: "fraged", bridge: "fragen" },
        { label: "past", target: "hät gfragt", bridge: "hat gefragt" },
      ],
      source: "idiotikon",
    },
    {
      target: "finde",
      bridge: "finden",
      group: "verbs",
      forms: [
        { label: "ich", target: "finde", bridge: "finde" },
        { label: "du", target: "findsch", bridge: "findest" },
        { label: "er", target: "findet", bridge: "findet" },
        { label: "mir", target: "finded", bridge: "finden" },
        { label: "past", target: "hät gfunde", bridge: "hat gefunden" },
      ],
      source: "idiotikon",
    },
    {
      target: "bringe",
      bridge: "bringen",
      group: "verbs",
      forms: [
        { label: "ich", target: "bringe", bridge: "bringe" },
        { label: "du", target: "bringsch", bridge: "bringst" },
        { label: "er", target: "bringt", bridge: "bringt" },
        { label: "mir", target: "bringed", bridge: "bringen" },
        { label: "past", target: "hät bracht", bridge: "hat gebracht" },
      ],
      source: "idiotikon",
    },
    {
      target: "stah",
      bridge: "stehen",
      group: "verbs",
      forms: [
        { label: "ich", target: "stah", bridge: "stehe" },
        { label: "du", target: "staasch", bridge: "stehst" },
        { label: "er", target: "staht", bridge: "steht" },
        { label: "mir", target: "stönd", bridge: "stehen" },
        { label: "past", target: "isch gstande", bridge: "ist gestanden" },
      ],
      source: "idiotikon",
    },
    {
      target: "heisse",
      bridge: "heissen",
      group: "verbs",
      forms: [
        { label: "ich", target: "heisse", bridge: "heisse" },
        { label: "du", target: "heissisch", bridge: "heisst" },
        { label: "er", target: "heisst", bridge: "heisst" },
        { label: "mir", target: "heissed", bridge: "heissen" },
        { label: "past", target: "hät gheisse", bridge: "hat geheissen" },
      ],
      source: "idiotikon",
    },
    {
      target: "wärde",
      bridge: "werden",
      group: "verbs",
      forms: [
        { label: "ich", target: "wirde", bridge: "werde" },
        { label: "du", target: "wirsch", bridge: "wirst" },
        { label: "er", target: "wird", bridge: "wird" },
        { label: "mir", target: "wärded", bridge: "werden" },
        { label: "past", target: "isch worde", bridge: "ist geworden" },
      ],
      source: "idiotikon",
    },
    {
      target: "schicke",
      bridge: "schicken",
      group: "verbs",
      forms: [
        { label: "ich", target: "schicke", bridge: "schicke" },
        { label: "du", target: "schicksch", bridge: "schickst" },
        { label: "er", target: "schickt", bridge: "schickt" },
        { label: "mir", target: "schicked", bridge: "schicken" },
        { label: "past", target: "hät gschickt", bridge: "hat geschickt" },
      ],
      source: "idiotikon",
    },
    {
      target: "ufmache",
      bridge: "aufmachen, öffnen",
      group: "verbs",
      forms: [
        { label: "ich", target: "mache uf", bridge: "mache auf" },
        { label: "du", target: "machsch uf", bridge: "machst auf" },
        { label: "er", target: "macht uf", bridge: "macht auf" },
        { label: "mir", target: "mached uf", bridge: "machen auf" },
        { label: "past", target: "hät ufgmacht", bridge: "hat aufgemacht" },
      ],
      source: "idiotikon",
    },
    {
      target: "zuemache",
      bridge: "zumachen, schliessen",
      group: "verbs",
      forms: [
        { label: "ich", target: "mache zue", bridge: "mache zu" },
        { label: "du", target: "machsch zue", bridge: "machst zu" },
        { label: "er", target: "macht zue", bridge: "macht zu" },
        { label: "mir", target: "mached zue", bridge: "machen zu" },
        { label: "past", target: "hät zuegmacht", bridge: "hat zugemacht" },
      ],
      source: "idiotikon",
    },
    {
      target: "aafange",
      bridge: "anfangen",
      group: "verbs",
      forms: [
        { label: "ich", target: "fange aa", bridge: "fange an" },
        { label: "du", target: "fangsch aa", bridge: "fängst an" },
        { label: "er", target: "fangt aa", bridge: "fängt an" },
        { label: "mir", target: "fanged aa", bridge: "fangen an" },
        { label: "past", target: "hät aagfange", bridge: "hat angefangen" },
      ],
      source: "idiotikon",
    },
    {
      target: "ufhöre",
      bridge: "aufhören",
      group: "verbs",
      forms: [
        { label: "ich", target: "höre uf", bridge: "höre auf" },
        { label: "du", target: "hörsch uf", bridge: "hörst auf" },
        { label: "er", target: "hört uf", bridge: "hört auf" },
        { label: "mir", target: "höred uf", bridge: "hören auf" },
        { label: "past", target: "hät ufghört", bridge: "hat aufgehört" },
      ],
      source: "idiotikon",
    },
    {
      target: "chündige",
      bridge: "kündigen",
      group: "verbs",
      forms: [
        { label: "ich", target: "chündige", bridge: "kündige" },
        { label: "du", target: "chündigsch", bridge: "kündigst" },
        { label: "er", target: "chündiget", bridge: "kündigt" },
        { label: "mir", target: "chündiged", bridge: "kündigen" },
        { label: "past", target: "hät gchündiget", bridge: "hat gekündigt" },
      ],
      source: "idiotikon",
    },
    {
      target: "telefoniere",
      bridge: "telefonieren",
      group: "verbs",
      forms: [
        { label: "ich", target: "telefoniere", bridge: "telefoniere" },
        { label: "du", target: "telefoniersch", bridge: "telefonierst" },
        { label: "er", target: "telefoniert", bridge: "telefoniert" },
        { label: "mir", target: "telefoniered", bridge: "telefonieren" },
        { label: "past", target: "hät telefoniert", bridge: "hat telefoniert" },
      ],
      source: "idiotikon",
    },
    {
      target: "probiere",
      bridge: "versuchen, probieren",
      group: "verbs",
      forms: [
        { label: "ich", target: "probiere", bridge: "versuche" },
        { label: "du", target: "probiersch", bridge: "versuchst" },
        { label: "er", target: "probiert", bridge: "versucht" },
        { label: "mir", target: "probiered", bridge: "versuchen" },
        { label: "past", target: "hät probiert", bridge: "hat versucht" },
      ],
      source: "idiotikon",
    },
    {
      target: "gfalle",
      bridge: "gefallen",
      group: "verbs",
      forms: [
        { label: "ich", target: "gfalle", bridge: "gefalle" },
        { label: "du", target: "gfallsch", bridge: "gefällst" },
        { label: "er", target: "gfallt", bridge: "gefällt" },
        { label: "mir", target: "gfalled", bridge: "gefallen" },
        { label: "past", target: "hät gfalle", bridge: "hat gefallen" },
      ],
      source: "idiotikon",
    },
    {
      target: "sueche",
      bridge: "suchen",
      group: "verbs",
      forms: [
        { label: "ich", target: "sueche", bridge: "suche" },
        { label: "du", target: "suechsch", bridge: "suchst" },
        { label: "er", target: "suecht", bridge: "sucht" },
        { label: "mir", target: "sueched", bridge: "suchen" },
        { label: "past", target: "hät gsuecht", bridge: "hat gesucht" },
      ],
      source: "idiotikon",
    },
    {
      target: "dusche",
      bridge: "duschen",
      group: "verbs",
      forms: [
        { label: "ich", target: "dusche", bridge: "dusche" },
        { label: "du", target: "duschisch", bridge: "duschst" },
        { label: "er", target: "duschet", bridge: "duscht" },
        { label: "mir", target: "dusched", bridge: "duschen" },
        { label: "past", target: "hät duschet", bridge: "hat geduscht" },
      ],
      source: "idiotikon",
    },
    {
      target: "ufrume",
      bridge: "aufräumen",
      group: "verbs",
      forms: [
        { label: "ich", target: "rume uf", bridge: "räume auf" },
        { label: "du", target: "rumsch uf", bridge: "räumst auf" },
        { label: "er", target: "rumt uf", bridge: "räumt auf" },
        { label: "mir", target: "rumed uf", bridge: "räumen auf" },
        { label: "past", target: "hät ufgrumt", bridge: "hat aufgeräumt" },
      ],
      source: "idiotikon",
    },
    {
      target: "verchaufe",
      bridge: "verkaufen",
      group: "verbs",
      forms: [
        { label: "ich", target: "verchaufe", bridge: "verkaufe" },
        { label: "du", target: "verchaufsch", bridge: "verkaufst" },
        { label: "er", target: "verchauft", bridge: "verkauft" },
        { label: "mir", target: "verchaufed", bridge: "verkaufen" },
        { label: "past", target: "hät verchauft", bridge: "hat verkauft" },
      ],
      source: "idiotikon",
    },
    {
      target: "bstelle",
      bridge: "bestellen",
      group: "verbs",
      forms: [
        { label: "ich", target: "bstelle", bridge: "bestelle" },
        { label: "du", target: "bstellsch", bridge: "bestellst" },
        { label: "er", target: "bstellt", bridge: "bestellt" },
        { label: "mir", target: "bstelled", bridge: "bestellen" },
        { label: "past", target: "hät bstellt", bridge: "hat bestellt" },
      ],
      source: "idiotikon",
    },
    {
      target: "iistiige",
      bridge: "einsteigen",
      group: "verbs",
      forms: [
        { label: "ich", target: "stiige ii", bridge: "steige ein" },
        { label: "du", target: "stiigsch ii", bridge: "steigst ein" },
        { label: "er", target: "stiigt ii", bridge: "steigt ein" },
        { label: "mir", target: "stiiged ii", bridge: "steigen ein" },
        { label: "past", target: "isch iigstige", bridge: "ist eingestiegen" },
      ],
      source: "idiotikon",
    },
    {
      target: "usstiige",
      bridge: "aussteigen",
      group: "verbs",
      forms: [
        { label: "ich", target: "stiige us", bridge: "steige aus" },
        { label: "du", target: "stiigsch us", bridge: "steigst aus" },
        { label: "er", target: "stiigt us", bridge: "steigt aus" },
        { label: "mir", target: "stiiged us", bridge: "steigen aus" },
        { label: "past", target: "isch usgstige", bridge: "ist ausgestiegen" },
      ],
      source: "idiotikon",
    },
    {
      target: "umstiige",
      bridge: "umsteigen",
      group: "verbs",
      forms: [
        { label: "ich", target: "stiige um", bridge: "steige um" },
        { label: "du", target: "stiigsch um", bridge: "steigst um" },
        { label: "er", target: "stiigt um", bridge: "steigt um" },
        { label: "mir", target: "stiiged um", bridge: "steigen um" },
        { label: "past", target: "isch umgstige", bridge: "ist umgestiegen" },
      ],
      source: "idiotikon",
    },
    {
      target: "verpasse",
      bridge: "verpassen",
      group: "verbs",
      forms: [
        { label: "ich", target: "verpasse", bridge: "verpasse" },
        { label: "du", target: "verpassisch", bridge: "verpasst" },
        { label: "er", target: "verpasst", bridge: "verpasst" },
        { label: "mir", target: "verpassed", bridge: "verpassen" },
        { label: "past", target: "hät verpasst", bridge: "hat verpasst" },
      ],
      source: "idiotikon",
    },
    {
      target: "flicke",
      bridge: "reparieren, flicken",
      group: "verbs",
      forms: [
        { label: "ich", target: "flicke", bridge: "repariere" },
        { label: "du", target: "flicksch", bridge: "reparierst" },
        { label: "er", target: "flickt", bridge: "repariert" },
        { label: "mir", target: "flicked", bridge: "reparieren" },
        { label: "past", target: "hät gflickt", bridge: "hat repariert" },
      ],
      source: "idiotikon",
    },
    {
      target: "mälde",
      bridge: "melden",
      group: "verbs",
      forms: [
        { label: "ich", target: "mälde", bridge: "melde" },
        { label: "du", target: "mäldsch", bridge: "meldest" },
        { label: "er", target: "mäldet", bridge: "meldet" },
        { label: "mir", target: "mälded", bridge: "melden" },
        { label: "past", target: "hät gmäldet", bridge: "hat gemeldet" },
      ],
      source: "idiotikon",
    },
    {
      target: "gwünne",
      bridge: "gewinnen",
      group: "verbs",
      forms: [
        { label: "ich", target: "gwünne", bridge: "gewinne" },
        { label: "du", target: "gwünnsch", bridge: "gewinnst" },
        { label: "er", target: "gwünnt", bridge: "gewinnt" },
        { label: "mir", target: "gwünned", bridge: "gewinnen" },
        { label: "past", target: "hät gwunne", bridge: "hat gewonnen" },
      ],
      source: "idiotikon",
    },
    {
      target: "verliere",
      bridge: "verlieren",
      group: "verbs",
      forms: [
        { label: "ich", target: "verliere", bridge: "verliere" },
        { label: "du", target: "verliersch", bridge: "verlierst" },
        { label: "er", target: "verliert", bridge: "verliert" },
        { label: "mir", target: "verliered", bridge: "verlieren" },
        { label: "past", target: "hät verlore", bridge: "hat verloren" },
      ],
      source: "idiotikon",
    },
    {
      target: "träffe",
      bridge: "treffen",
      group: "verbs",
      forms: [
        { label: "ich", target: "triffe", bridge: "treffe" },
        { label: "du", target: "triffsch", bridge: "triffst" },
        { label: "er", target: "trifft", bridge: "trifft" },
        { label: "mir", target: "träffed", bridge: "treffen" },
        { label: "past", target: "hät troffe", bridge: "hat getroffen" },
      ],
      source: "idiotikon",
    },
    {
      target: "lache",
      bridge: "lachen",
      group: "verbs",
      forms: [
        { label: "ich", target: "lache", bridge: "lache" },
        { label: "du", target: "lachsch", bridge: "lachst" },
        { label: "er", target: "lacht", bridge: "lacht" },
        { label: "mir", target: "lached", bridge: "lachen" },
        { label: "past", target: "hät glachet", bridge: "hat gelacht" },
      ],
      source: "idiotikon",
    },
    {
      target: "hebe",
      bridge: "halten",
      group: "helvetisms",
      mistakenFor: "heben, hochheben",
      forms: [
        { label: "ich", target: "hebe", bridge: "halte" },
        { label: "du", target: "hebsch", bridge: "hältst" },
        { label: "er", target: "hebt", bridge: "hält" },
        { label: "mir", target: "hebed", bridge: "halten" },
        { label: "past", target: "hät ghebt", bridge: "hat gehalten" },
      ],
      example: { target: "Chasch mer schnäll d Tasche hebe?", bridge: "Kannst du mir kurz die Tasche halten?" },
      source: "idiotikon",
    },
    {
      target: "rüere",
      bridge: "werfen",
      group: "helvetisms",
      mistakenFor: "rühren, umrühren",
      example: { target: "Chasch das in Güsel rüere?", bridge: "Kannst du das in den Abfall werfen?" },
      source: "idiotikon",
    },
    {
      target: "Abwart",
      bridge: "Hauswart",
      group: "helvetisms",
      article: "de",
      bridgeArticle: "der",
      source: "idiotikon",
      example: { target: "Lüüted Sie bim Abwart.", bridge: "Klingeln Sie beim Hauswart." },
    },
    {
      // Neuter, like every noun ending in -li would be — but this one has no
      // -li at all. `s Grosi` is simply the word.
      target: "Grosi",
      bridge: "Grossmutter",
      group: "everyday",
      article: "s",
      bridgeArticle: "die",
      example: { target: "S Grosi chunt am Sunntig.", bridge: "Die Grossmutter kommt am Sonntag." },
      source: "idiotikon",
    },
    {
      // Feminine, and its diminutive is neuter — the `diminutive-li` topic's
      // own first example (`D Chatz hät es Chätzli`).
      target: "Chatz",
      bridge: "Katze",
      group: "everyday",
      article: "d",
      bridgeArticle: "die",
      example: { target: "D Chatz schlaft uf em Sofa.", bridge: "Die Katze schläft auf dem Sofa." },
      source: "idiotikon",
    },
    {
      target: "Meitli",
      bridge: "Mädchen",
      group: "everyday",
      article: "s",
      bridgeArticle: "das",
      source: "idiotikon",
      example: { target: "S Meitli isch sächsi.", bridge: "Das Mädchen ist sechs." },
    },
    {
      target: "Bueb",
      bridge: "Junge",
      group: "everyday",
      article: "de",
      bridgeArticle: "der",
      source: "idiotikon",
      example: { target: "De Bueb gaht i d Schuel.", bridge: "Der Junge geht in die Schule." },
    },
    {
      target: "Nachber",
      bridge: "Nachbar",
      group: "everyday",
      article: "de",
      bridgeArticle: "der",
      source: "idiotikon",
      example: { target: "Üse Nachber hät en Hund.", bridge: "Unser Nachbar hat einen Hund." },
    },
    {
      target: "Schuel",
      bridge: "Schule",
      group: "everyday",
      article: "d",
      bridgeArticle: "die",
      source: "idiotikon",
      example: { target: "D Schuel fangt am achti aa.", bridge: "Die Schule beginnt um acht." },
    },
    {
      target: "Gmeind",
      bridge: "Gemeinde",
      group: "everyday",
      article: "d",
      bridgeArticle: "die",
      source: "idiotikon",
      example: { target: "Ich mues mich bi de Gmeind aamälde.", bridge: "Ich muss mich bei der Gemeinde anmelden." },
    },
    {
      target: "Zältli",
      bridge: "Bonbon",
      group: "everyday",
      article: "s",
      bridgeArticle: "das",
      source: "idiotikon",
      example: { target: "Wotsch es Zältli?", bridge: "Willst du ein Bonbon?" },
    },
    { target: "Säckli", bridge: "Tüte", group: "everyday", article: "s", bridgeArticle: "die", source: "idiotikon" },
    { target: "Wösch", bridge: "Wäsche", group: "everyday", article: "d", bridgeArticle: "die", source: "idiotikon" },
    {
      target: "Pfnüsel",
      bridge: "Schnupfen",
      group: "everyday",
      article: "de",
      bridgeArticle: "der",
      example: { target: "Ich ha de Pfnüsel.", bridge: "Ich habe Schnupfen." },
      source: "idiotikon",
    },
    {
      target: "Chilbi",
      bridge: "Jahrmarkt",
      group: "everyday",
      article: "d",
      bridgeArticle: "der",
      source: "idiotikon",
      example: { target: "Am Samschtig gönd mer a d Chilbi.", bridge: "Am Samstag gehen wir auf den Jahrmarkt." },
    },
    {
      target: "Uf Widerluege",
      bridge: "Auf Wiedersehen",
      group: "greetings",
      example: { target: "Merci und uf Widerluege!", bridge: "Danke und auf Wiedersehen!" },
      source: "idiotikon",
    },
    { target: "Merci vilmal", bridge: "Vielen Dank", group: "greetings" },
    {
      target: "Gärn gscheh",
      bridge: "Gern geschehen",
      group: "greetings",
      example: { target: "Merci! – Gärn gscheh.", bridge: "Danke! – Gern geschehen." },
      source: "idiotikon",
    },
    {
      target: "Hoi zäme",
      bridge: "Hallo zusammen",
      group: "greetings",
      example: { target: "Hoi zäme, sind alli do?", bridge: "Hallo zusammen, sind alle da?" },
      source: "idiotikon",
    },
    {
      target: "pfuse",
      bridge: "schlafen",
      group: "slang",
      register: "casual",
      example: { target: "Ich gang go pfuse.", bridge: "Ich gehe schlafen." },
      source: "idiotikon",
    },
    {
      target: "bschiisse",
      bridge: "betrügen",
      group: "slang",
      register: "casual",
      example: { target: "Lass dich nöd bschiisse.", bridge: "Lass dich nicht betrügen." },
      source: "idiotikon",
    },
    {
      target: "Chabis",
      bridge: "Unsinn",
      group: "slang",
      register: "casual",
      example: { target: "Red kei Chabis!", bridge: "Rede keinen Unsinn!" },
      source: "idiotikon",
    },
    {
      target: "lässig",
      bridge: "toll",
      group: "slang",
      register: "casual",
      example: { target: "Das Konzärt isch lässig gsi.", bridge: "Das Konzert war toll." },
      source: "idiotikon",
    },
    {
      target: "Tubel",
      bridge: "Idiot",
      group: "slang",
      register: "rude",
      example: { target: "So en Tubel!", bridge: "So ein Idiot!" },
      source: "idiotikon",
    },
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
      /**
       * Rewritten 2026-09-26. The first version said the diminutive "often
       * means nothing small at all" and showed `es Bierli` as "a beer said
       * kindly" — an aphorism, not a rule, and George called it exactly that.
       *
       * What a German reader can actually USE is three facts: how the form is
       * built (-li, umlaut where the vowel allows it: Huus → Hüüsli, Brot →
       * Brötli, Chatz → Chätzli), that it is always neuter and unchanged in
       * the plural, and that a set of everyday words only exists in the -li
       * form — `Rüebli`, `Gipfeli`, `Weggli`, `Müesli`, `Meitli`, `Zältli` —
       * so there is nothing small about them. The formation is described in
       * Weber's Zürichdeutsche Grammatik (the pack's grammar reference); each
       * lexicalised word here is in the vocabulary with its own gloss.
       *
       * The examples: a feminine noun whose diminutive is neuter, a plural
       * that does not change, and two words that are simply the normal word.
       */
      id: "diminutive-li",
      band: "marks",
      note: "a noun ending in -li: how it is formed (umlaut, always neuter s/es, plural unchanged), or a word like Rüebli, Gipfeli, Weggli, Müesli or Meitli that is simply the normal word and was taken to mean something small",
      examples: [
        { target: "D Chatz hät es Chätzli.", bridge: "Die Katze hat ein Kätzchen." },
        { target: "Zwei Brötli, bitte.", bridge: "Zwei Brötchen, bitte." },
        { target: "Es Müesli und es Rüebli.", bridge: "Ein Müsli und eine Karotte." },
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
    /**
     * THE SEVEN TOPICS ADDED 2026-09-26, asked for as "maybe there could be a
     * little bit more rules". Each is something a German reader meets at the
     * first lunch table and that none of the twelve above explains. The forms
     * follow Weber's Zürichdeutsche Grammatik and Gallmann's Zürichdeutsches
     * Wörterbuch, the two Zurich references in `lib/research/sources.ts`; the
     * participle rule (ge- → g-, lost before a stop) and the verb order
     * (`wölle cho`, not `kommen wollen`) are also stated in the Alemannic
     * grammar summary on de.wikipedia, which is where they were cross-checked.
     * Every example passes the pack's own gate (grammar.test.ts). Like the
     * rest of the pack, they still await a native Zurich reviewer.
     */
    {
      /**
       * The Konjunktiv II is alive — far more alive than in spoken German —
       * and one vowel separates it from the indicative: `hät` is "hat",
       * `hett` is "hätte". A reader who hears the first where the second was
       * said turns a wish into a fact. That is why it is `blocks`.
       *
       * The forms are given without the final -i (`hett`, `wär`, `chönnt`);
       * `hetti`, `wäri` are heard too, and the rule says so rather than
       * pretending there is one form.
       */
      id: "subjunctive",
      band: "blocks",
      note: "a wish, a polite request or something hypothetical — hett, wär, chönnt, sött, wett, würd — and especially hett (hätte) heard or written as hät (hat), or wett read as a bet",
      examples: [
        { target: "Ich hett gern es Kafi.", bridge: "Ich hätte gern einen Kaffee." },
        { target: "Chönnted Sie mir hälfe?", bridge: "Könnten Sie mir helfen?" },
        { target: "Ich würd cho, wänn ich Ziit hett.", bridge: "Ich würde kommen, wenn ich Zeit hätte." },
      ],
    },
    {
      /**
       * The unstressed pronouns, which shrink to something that looks like an
       * article: `en` is "ihn", not "einen"; `em` is "ihm", not "dem". A
       * reader who has just learned the indefinite article `en` parses
       * "Ich han en gsee" as a noun phrase missing its noun.
       *
       * `han` before the vowel is the pack's existing spelling (`han ich
       * gmeint` in modal-particles); `Wie gaht s ere?` is already published by
       * the care pack.
       */
      id: "pronoun-clitics",
      band: "blocks",
      note: "a short unstressed pronoun — en (ihn), em (ihm), ere (ihr), s (es) — especially one read as an article, as in «Ich han en gsee» or «Säg em»",
      examples: [
        { target: "Ich han en geschter gsee.", bridge: "Ich habe ihn gestern gesehen." },
        { target: "Säg em, er söll cho.", bridge: "Sag ihm, er soll kommen." },
        { target: "Wie gaht s ere?", bridge: "Wie geht es ihr?" },
      ],
    },
    {
      /**
       * The partner of `no-preterite`. With no simple past, every past runs on
       * a participle — and the most common ones do not look like German ones.
       * `ge-` shrinks to `g-` (gmacht, gseit, gsi, gha) and disappears in front
       * of a k/ch, p, t or g: `cho` (gekommen), `kauft` (gekauft, g + ch fuse into k), `trunke`
       * (getrunken), `gange` (gegangen). A reader hunting for "ge-" finds
       * nothing to hold on to.
       */
      id: "participles",
      band: "blocks",
      note: "a past participle that does not look German — gsi, gha, cho, gange, kauft, trunke — or somebody asking where the ge- went",
      examples: [
        { target: "Ich ha kei Ziit gha.", bridge: "Ich hatte keine Zeit." },
        { target: "Er isch geschter cho.", bridge: "Er ist gestern gekommen." },
        { target: "Häsch s Billett scho kauft?", bridge: "Hast du die Fahrkarte schon gekauft?" },
      ],
    },
    {
      /**
       * Which auxiliary the perfect takes. Mostly what a German reader
       * expects, which is why the exceptions hurt: position verbs take `si`
       * here (`isch ghocket`, `isch gstande`), as in southern German and
       * Swiss Standard German, where the north says `hat gesessen`. The
       * auxiliary question drills it across every verb's `past` row.
       */
      id: "perfect-auxiliary",
      band: "marks",
      note: "the auxiliary of a perfect — isch gange against hät gmacht, or somebody who said ha ghocket because German in Germany says hat gesessen",
      examples: [
        { target: "Ich bi im Tram ghocket.", bridge: "Ich bin im Tram gesessen." },
        { target: "Mir sind uf Bern gfahre.", bridge: "Wir sind nach Bern gefahren." },
        { target: "Si hät lang gschlafe.", bridge: "Sie hat lange geschlafen." },
      ],
    },
    {
      /**
       * When verbs pile up at the end, the order is the mirror of German's:
       * `ha … chönne cho` where German has `habe … kommen können`. The
       * Alemannic grammar summary gives `är het wölle cho` against the eastern
       * `er hot kommə wellə`. Understood without trouble, produced wrongly by
       * nearly every German speaker — `marks`.
       */
      id: "verb-order",
      band: "marks",
      note: "two or three verbs at the end of a clause — ha nöd chönne cho, hät müesse schaffe, lah flicke — or somebody who put them in German order (kommen können)",
      examples: [
        { target: "Ich ha nöd chönne cho.", bridge: "Ich habe nicht kommen können." },
        { target: "Si hät müesse schaffe.", bridge: "Sie hat arbeiten müssen." },
        { target: "Mir händ s Velo lah flicke.", bridge: "Wir haben das Fahrrad flicken lassen." },
      ],
    },
    {
      /**
       * The modals, as forms rather than as order. `verb-order` is about where
       * they stand in the past; this is the present, where `wott` and `wänd`
       * share nothing a German reader can hold on to and `cha` has lost the
       * n. Every form here is also a row in the vocabulary's paradigms.
       */
      id: "modals",
      band: "blocks",
      words: ["chönne", "müesse", "wele", "dörfe", "sölle"],
      note: "a modal verb — cha, mues, wott, darf, söll, sött, or the plurals chönd, müend, wänd — or somebody reaching for kann, muss or will",
      examples: [
        { target: "Ich cha hüt nöd cho.", bridge: "Ich kann heute nicht kommen." },
        { target: "Mir müend no poschte.", bridge: "Wir müssen noch einkaufen." },
        { target: "Wänd Sie no öppis trinke?", bridge: "Wollen Sie noch etwas trinken?" },
      ],
    },
    {
      /**
       * The direction words. German says `hinein` or `herein` depending on
       * where the speaker stands; Zurich German says `ine` for both, and the
       * same for `use`, `ufe`, `abe`, `ume`. The article on Zurich German in
       * de.wikipedia glosses `ufe` as "herauf, hinauf" and `abe` as "herunter,
       * hinunter" for the same reason.
       */
      id: "directions",
      band: "marks",
      note: "a direction word — ine, use, ufe, abe, ume, zrugg — or somebody trying to choose between hin- and her-, which this variety does not distinguish",
      examples: [
        { target: "Chömed Sie ine!", bridge: "Kommen Sie herein!" },
        { target: "Ich gang schnäll abe.", bridge: "Ich gehe schnell hinunter." },
        { target: "Bringsch de Güsel use?", bridge: "Bringst du den Abfall hinaus?" },
      ],
    },
    {
      /**
       * First names take the article, always and neutrally. The pack has
       * shown it since the start (`Em Peter sis Auto`, `De Anna ihri
       * Schwöschter`) and never said so. A German reader from the north hears
       * it as careless or as slightly rude; here, leaving it out is what
       * sounds odd.
       */
      id: "names-article",
      band: "marks",
      note: "a first name with an article — de Peter, d Anna, em Luca — or somebody who thinks the article before a name is rude or careless",
      examples: [
        { target: "Das isch d Anna.", bridge: "Das ist Anna." },
        { target: "Häsch de Peter gsee?", bridge: "Hast du Peter gesehen?" },
        { target: "Ich säg s em Luca.", bridge: "Ich sage es Luca." },
      ],
    },
    {
      /**
       * Telling the time, which is where an appointment is lost. `am` is
       * "um", `ab` is "nach", `halbi drüü` is half past two exactly as in
       * German, and the full hour usually takes an -i (`am vieri`, `am
       * achti`). `blocks`, because the number arrives inside three words that
       * each mean something else in German.
       */
      id: "clock-time",
      band: "blocks",
      note: "a time of day — am vieri, halbi drüü, viertel ab achti, viertel vor zwölfi — or somebody who read am as «am» and ab as «ab» and missed the appointment",
      examples: [
        { target: "Mir träffed eus am halbi drüü.", bridge: "Wir treffen uns um halb drei." },
        { target: "De Zug fahrt am viertel ab achti.", bridge: "Der Zug fährt um Viertel nach acht." },
        { target: "Chunnsch am vieri?", bridge: "Kommst du um vier?" },
      ],
    },
  ],

  rules: [
    /**
     * HOUSE STYLE, not regional claims. Each of these is a real form inside
     * the canton of Zurich or a spelling variant, so it is `dispreferred`:
     * Heidi's own copy says Züridütsch, hät, nöd, gaht, staht (tests hold our
     * copy to it), but nothing here tells a reader the form comes from
     * somewhere else. Several were once labelled regional and were wrong:
     * SDS 3/48 has «het» at 13 Zurich points; SDS 3/57 has o-forms of «geht»
     * at 28; SDS 4/167 has «nid» as the majority form nearly everywhere,
     * Zurich included; and DWDS treats Schwyzerdütsch/Schwyzertütsch as one
     * word with a varying spelling of the same consonant — which is why
     * «Züritüütsch» is a spelling we do not use, not an eastern form.
     */
    {
      match: /(?<!\p{L})(?:züri|hoch|schwiizer|schwizer)?t(?:üü|ü|u)tsch\p{L}*/giu,
      display: "(Züri-/Hoch-)tüütsch",
      severity: "dispreferred",
      reason: "House spelling is Dütsch: Züridütsch, Hochdütsch, Schwiizerdütsch",
      suggest: "Dütsch",
    },
    { match: "het", severity: "dispreferred", reason: "House form is hät (Zurich city, SDS 3/48)", suggest: "hät" },
    // Same verb, second person. Heidi wrote «Hesch öppis anders welle wüsse?» live on 2026-10-06.
    { match: "hesch", severity: "dispreferred", reason: "House form is häsch, like hät (SDS 3/48)", suggest: "häsch" },
    { match: "goht", severity: "dispreferred", reason: "House form is gaht (SDS 3/57)", suggest: "gaht" },
    { match: "stoht", severity: "dispreferred", reason: "House form is staht", suggest: "staht" },
    { match: "nid", severity: "dispreferred", reason: "House form is nöd (Zurich city, SDS 4/167)", suggest: "nöd" },
    { match: "nit", severity: "dispreferred", reason: "House form is nöd (Zurich city, SDS 4/167)", suggest: "nöd" },

    /**
     * REGIONAL FORMS, each one a whole word no Zurich survey point uses, each
     * citing where it is described. The SDS map is named in the reason
     * (volume/map; the digital edition at sprachatlas.ch). A form shared by
     * several areas is filed under the area where the atlas has most of it,
     * and the reason names the rest. A test refuses a regional rule with no
     * source, because the wrong ones above had none.
     */
    { match: "ig", severity: "foreign", origin: "Bern", reason: "Bern (also Solothurn): «iig» for ich, SDS 3/195", suggest: "ich", sources: ["sds-atlas"] },
    { match: "iig", severity: "foreign", origin: "Bern", reason: "Bern (also Solothurn): «iig» for ich, SDS 3/195", suggest: "ich", sources: ["sds-atlas"] },
    { match: "wosch", severity: "foreign", origin: "Bern", reason: "Bern, Fribourg, Luzern: «wosch» for willst, SDS 3/112", suggest: "wotsch", sources: ["sds-atlas"] },
    { match: "geisch", severity: "foreign", origin: "Bern", reason: "Bern, Wallis, Solothurn: «geisch» for gehst, SDS 3/57", suggest: "gaasch", sources: ["sds-atlas"] },
    { match: "geit", severity: "foreign", origin: "Bern", reason: "Bern, Wallis, Solothurn: «geit» for geht, SDS 3/57", suggest: "gaat", sources: ["sds-atlas"] },
    { match: "Grüessech", severity: "foreign", origin: "Bern", reason: "Bern greeting «Grüess ech», SDS 5/112 — Zurich says Grüezi", suggest: "Grüezi", sources: ["sds-atlas"] },
    { match: "Miuch", severity: "foreign", origin: "Bern", reason: "l-vocalisation (Bern, Luzern, Solothurn, Aargau), SDS 1/165", suggest: "Milch", sources: ["sds-atlas"] },
    { match: "Meitschi", severity: "foreign", origin: "Bern", reason: "Bern, Luzern, Solothurn: «Meitschi» for Mädchen, SDS 4/146", suggest: "Meitli", sources: ["sds-atlas"] },
    { match: "Hung", severity: "foreign", origin: "Bern", reason: "nd as ng (Bern, Solothurn), SDS 2/120", suggest: "Hund", sources: ["sds-atlas"] },
    // The Bernese plural of stah/gah. Heidi's chat wrote «wo mir grad stöh» on
    // 2026-10-02 and the gate let it through; this pack's own conjugation
    // tables give Zurich's forms (mir stönd, mir gönd).
    { match: "stöh", severity: "foreign", origin: "Bern", reason: "Bern-type plural of stehen («mir stöh») — Zurich says «mir stönd»", suggest: "stönd", sources: ["sds-atlas"] },
    { match: "göh", severity: "foreign", origin: "Bern", reason: "Bern-type plural of gehen («mir göh») — Zurich says «mir gönd»", suggest: "gönd", sources: ["sds-atlas"] },
    /*
     * Two articles on one noun: the Swiss «d'» in front of a word that already
     * carries its own article («d'Le Bilan», «d'La Poste»). Heidi's chat wrote it
     * three times in one conversation. Not a regional form — a grammar slip — but
     * it is exactly as invisible to a learner, so it is held to the same gate.
     */
    {
      match: /(?<!\p{L})[ds]['’]\s?(?:Le|La|Les|L['’]|The|Der|Die|Das|El|Il|Lo)(?!\p{L})/gu,
      display: "d'Le …",
      severity: "unattested",
      reason: "Two articles on one noun: drop «d'» in front of a name that already has its own («Le Bilan», not «d'Le Bilan»)",
    },
    {
      match: /\p{L}*öu\p{L}*/giu,
      display: "…öu…",
      severity: "foreign",
      origin: "Bern",
      reason: "l-vocalisation after ö (Bern and neighbours), SDS 1/165 — Zurich keeps the l",
      sources: ["sds-atlas"],
    },
    { match: "Drämmli", severity: "foreign", origin: "Basel", reason: "Basel's name for the tram", suggest: "Tram", sources: ["wikipedia-strassenbahn-basel"] },
    { match: "Kuchi", severity: "foreign", origin: "Basel", reason: "Basel city keeps the k (Khind, Kueche)", suggest: "Chuchi", sources: ["wikipedia-baseldeutsch"] },
    { match: "Gumel", severity: "foreign", origin: "Innerschweiz", reason: "Schwyz, Uri, Zug: «Gumel» for Kartoffel, SDS 6/202", suggest: "Härdöpfel", sources: ["sds-atlas"] },
    { match: "Gumeli", severity: "foreign", origin: "Innerschweiz", reason: "Schwyz, Uri, Zug: «Gumeli» for Kartoffel, SDS 6/202", suggest: "Härdöpfel", sources: ["sds-atlas"] },
    { match: "Eiker", severity: "foreign", origin: "Innerschweiz", reason: "Luzern, Zug: «Eiker» for Eichhörnchen, SDS 6/257", suggest: "Eichhörnli", sources: ["sds-atlas"] },
    { match: "Eikerli", severity: "foreign", origin: "Innerschweiz", reason: "Luzern, Zug: «Eikerli» for Eichhörnchen, SDS 6/257", suggest: "Eichhörnli", sources: ["sds-atlas"] },
    { match: "näbis", severity: "foreign", origin: "Ostschweiz", reason: "Appenzell, St. Gallen (Toggenburg): «näbis» for etwas, SDS 3/226", suggest: "öppis", sources: ["sds-atlas", "wikipedia-ostschweizer-dialekt"] },
    { match: "schüü", severity: "foreign", origin: "Glarus", reason: "Glarus (also St. Gallen, Graubünden): «schüü» for schön, SDS 1/102", suggest: "schön", sources: ["sds-atlas"] },
    { match: "gùgge", severity: "foreign", origin: "Sense", reason: "Senslerdeutsch «gùgge» for schauen — Zurich says luege", suggest: "luege", sources: ["wikipedia-senslerdeutsch"] },
    { match: "eswas", severity: "foreign", origin: "Graubünden", reason: "Walser (Graubünden, Wallis): «eswas» for etwas, SDS 3/226", suggest: "öppis", sources: ["sds-atlas"] },
    { match: "appas", severity: "foreign", origin: "Wallis", reason: "Wallis: «appas» for etwas, SDS 3/226", suggest: "öppis", sources: ["sds-atlas"] },
    { match: "wier", severity: "foreign", origin: "Wallis", reason: "Wallis, Walser, Bernese Oberland: «wier» for wir, SDS 3/203", suggest: "mir", sources: ["sds-atlas"] },
    { match: "wilt", severity: "foreign", origin: "Wallis", reason: "Wallis, Bernese Oberland: «wilt» for willst, SDS 3/112", suggest: "wotsch", sources: ["sds-atlas"] },
    { match: "Häärpfel", severity: "foreign", origin: "Wallis", reason: "Wallis: «Häärpfel» for Kartoffel, SDS 6/202", suggest: "Härdöpfel", sources: ["sds-atlas"] },
    { match: "Aache", severity: "foreign", origin: "Wallis", reason: "Wallis, Fribourg: «Aache» for Butter, SDS 5/179", suggest: "Anke", sources: ["sds-atlas"] },
    { match: "güet", severity: "foreign", origin: "Wallis", reason: "ü-diphthong in «guet» (Wallis, Uri), SDS 1/142", suggest: "guet", sources: ["sds-atlas"] },
    {
      match: /ß/gu,
      display: "ß",
      severity: "unattested",
      reason: "ß is not used anywhere in Switzerland — write ss",
      suggest: "ss",
    },
  ],

  leaks: [
    ...STANDARD_ONLY.map(
      ([standard, zurich]): VarietyRule => ({
        match: standard,
        severity: "foreign",
        origin: "Standard German",
        reason: `Standard German. Zurich German says «${zurich}».`,
        suggest: zurich,
      }),
    ),
    {
      /**
       * Standard German «-ung» is Zurich «-ig»: Üebig, Wohnig, Ziitig,
       * Umleitig. Capitalised and with a letter before it, so «jung» and
       * «Zunge» stay out. «Achtung» and «Entschuldigung» the dialect uses
       * whole, and «Sprung» and «Schwung» are not the suffix at all.
       */
      match: /(?<!\p{L})(?!(?:Achtung|Entschuldigung)(?!\p{L}))\p{Lu}\p{Ll}+(?<![Ss]pr|[Ss]chw)ung(?:en)?(?!\p{L})/gu,
      display: "-ung",
      severity: "foreign",
      origin: "Standard German",
      reason: "Standard German «-ung». Zurich German says «-ig»: Üebig, Wohnig, Ziitig.",
      suggest: "-ig",
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
