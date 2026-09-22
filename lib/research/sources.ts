/**
 * Every paper this product claims to rest on, with a link you can follow.
 *
 * The research page carried author-and-year strings and nothing else — no
 * link, no DOI, no way for a reader to check a single number. On the one page
 * whose entire subject is not overclaiming, that is decoration wearing the
 * costume of evidence. Its own renderer said so in a comment ("the source line
 * is the point — an unsourced claim here would be the thing this page exists
 * to avoid") while printing grey text.
 *
 * WHY THE CITATIONS ARE NOT IN THE DICTIONARIES
 *
 * They were, in all seven. A DOI is not translatable, and the proof is what
 * happened: someone dutifully localised the author list, so the same corpus is
 * credited to "University of Bern", "Universität Bern" and "Университет
 * Берна". Seven copies of a reference are seven chances for one of them to be
 * quietly wrong about what the paper says.
 *
 * So a dictionary now carries only what genuinely translates — the claim and
 * its explanation — and names a source by id. The authors, year, venue and
 * link live here once.
 *
 * EVERY URL BELOW WAS OPENED AND CHECKED against the claim it supports. Where
 * the check failed, the claim moved rather than the citation being dressed up:
 * see `gooskens-2007`.
 */

/**
 * What kind of thing is being cited, because the test for "is this a real
 * citation" is genuinely different for each.
 *
 * An ARTICLE has a DOI, and anything without one is a PDF on somebody's
 * homepage wearing a reference's clothes. A REFERENCE work — a dialect atlas,
 * a standing dictionary — has no DOI and never will; its stable identifier is
 * its publisher's record. Widening the article rule to admit them would have
 * thrown away the check that makes it worth having, so the two are named apart
 * instead.
 */
export type SourceKind = "article" | "reference";

export type Source = {
  authors: string;
  year: number;
  title: string;
  /** Journal, volume and pages, as you would write it in a reference list. */
  venue: string;
  /** DOI-resolved where one exists, otherwise a stable catalogue record. */
  url: string;
  /** Absent means `article`, which is what all of these were to begin with. */
  kind?: SourceKind;
};

export const SOURCES = {
  /**
   * DIALECTOLOGY, as opposed to the acquisition research above.
   *
   * These support claims about where a form is spoken, which is a different
   * kind of assertion from "spacing improves retention" and needs a different
   * kind of source. Every dialect claim on the site names one of these, and a
   * test refuses a claim that names none — because "there will be a lot of
   * info and we need to ensure it is all correct" is not solved by being
   * careful, it is solved by making carelessness fail the build.
   *
   * The Idiotikon is here for a different KIND of claim than the two atlases:
   * an atlas maps where a form is spoken and says nothing about what it means,
   * so a gloss cites the dictionary. It was deliberately held out until the
   * vocabulary page existed, because the test below refuses a source nothing
   * cites — correctly.
   */
  /**
   * WHY SWITZERLAND SOUNDS LIKE THIS, as opposed to where a form is spoken.
   *
   * A third kind of claim again: not "Bern says `gäu`" and not "spacing
   * improves retention", but an assertion about how a language situation came
   * to be. The essays make those, so the essays cite these — and where the
   * causal story is genuinely contested, the essay says so rather than
   * pointing at a source that does not carry the weight.
   */
  /**
   * THE ECONOMICS PAPER THIS PRODUCT'S PREMISE IS, and it is not decoration.
   *
   * §2 of the specification says a learner cannot audit the variety they are
   * being sold — the thing that makes them a buyer is the thing that stops
   * them judging the purchase. That is Akerlof's asymmetric-information
   * market, stated for a language course instead of a used car, and the white
   * paper opens with it. Citing the original rather than paraphrasing it is
   * the same discipline every dialect claim on this site is held to: the
   * reader can go and check whether the analogy survives contact with the
   * paper.
   */
  akerlof: {
    authors: "Akerlof",
    year: 1970,
    title: "The Market for «Lemons»: Quality Uncertainty and the Market Mechanism",
    venue:
      "The Quarterly Journal of Economics 84(3), 488–500. Asymmetric information: when the buyer cannot judge quality before buying, the market itself degrades",
    url: "https://doi.org/10.2307/1879431",
  },
  "ferguson-1959": {
    authors: "Ferguson",
    year: 1959,
    title: "Diglossia",
    venue:
      "Word 15(2), 325–340. The paper that named the pattern, built on four defining cases — one of them German-speaking Switzerland",
    url: "https://doi.org/10.1080/00437956.1959.11659702",
  },
  "hls-mehrsprachigkeit": {
    kind: "reference",
    authors: "Lüdi",
    year: 2008,
    title: "Mehrsprachigkeit",
    venue:
      "Historisches Lexikon der Schweiz. The standing national reference work; this article describes the media diglossia between the spoken dialects and written Standard German",
    url: "https://hls-dhs-dss.ch/de/articles/024596/",
  },
  "hls-landesverteidigung": {
    kind: "reference",
    authors: "Jorio",
    year: 2006,
    title: "Geistige Landesverteidigung",
    venue:
      "Historisches Lexikon der Schweiz. The cultural-political movement of the 1930s to 1960s, and its use of radio and film",
    url: "https://hls-dhs-dss.ch/de/articles/017426/",
  },
  "idiotikon": {
    kind: "reference",
    authors: "Antiquarische Gesellschaft in Zürich",
    year: 1881,
    title: "Schweizerisches Idiotikon: Wörterbuch der schweizerdeutschen Sprache",
    venue: "Sixteen volumes, published from 1881 onwards and still in progress; the reference dictionary of Swiss German",
    url: "https://www.idiotikon.ch/",
  },
  "sds-atlas": {
    kind: "reference",
    authors: "Hotzenköcherle, Schläpfer, Trüb, Zinsli (eds.)",
    year: 1997,
    title: "Sprachatlas der deutschen Schweiz (SDS)",
    venue: "Francke, Bern. Eight volumes, 1962–1997; over 1,500 maps from fieldwork carried out 1939–1958, covering the Alemannic dialects of Switzerland and the Walser dialects of northern Italy",
    url: "https://de.wikipedia.org/wiki/Sprachatlas_der_deutschen_Schweiz",
  },
  "kleiner-sprachatlas": {
    kind: "reference",
    authors: "Christen, Glaser & Friedli (eds.)",
    year: 2010,
    title: "Kleiner Sprachatlas der deutschen Schweiz",
    venue: "Huber, Frauenfeld. The condensed, general-readership edition of the SDS",
    url: "https://www.schwabe.ch/produkt/kleiner-sprachatlas-der-deutschen-schweiz-9783796554001-t-13488",
  },

  "gooskens-2018": {
    authors: "Gooskens, van Heuven, Golubović, Schüppert, Swarte & Voigt",
    year: 2018,
    title: "Mutual intelligibility between closely related languages in Europe",
    venue: "International Journal of Multilingualism 15(2), 169–193",
    url: "https://doi.org/10.1080/14790718.2017.1350185",
  },

  /**
   * Cited for a claim we could NOT confirm.
   *
   * The page asserted "consonant rules predict intelligibility far better than
   * vowel rules, r ≈ −.74 against −.29" as established. The paper is real and
   * does show phonetic distance predicting intelligibility better than lexical
   * distance — but those two coefficients appear in nothing we could open, and
   * a precise number is exactly the kind of thing that must not be stated on
   * trust. The claim is now a hypothesis, which is what this page's own
   * three-way split is for.
   */
  "gooskens-2007": {
    authors: "Gooskens",
    year: 2007,
    title: "The contribution of linguistic factors to the intelligibility of closely related languages",
    venue: "Journal of Multilingual and Multicultural Development 28(6), 445–467",
    url: "https://doi.org/10.2167/jmmd511.0",
  },

  /**
   * The talker-variability finding is part II (1993), not the 1991 first
   * report the page cited. The 1991 paper established that training works at
   * all; 1993 is the one that isolated MANY VOICES as the ingredient that
   * transfers. Citing the wrong one of a numbered series is a small error that
   * makes the claim unverifiable for anyone who goes to check it.
   */
  "lively-1993": {
    authors: "Lively, Logan & Pisoni",
    year: 1993,
    title:
      "Training Japanese listeners to identify English /r/ and /l/. II: The role of phonetic environment and talker variability",
    venue: "Journal of the Acoustical Society of America 94(3), 1242–1255",
    url: "https://pubmed.ncbi.nlm.nih.gov/8408964/",
  },
  "clopper-2004": {
    authors: "Clopper & Pisoni",
    year: 2004,
    title: "Effects of talker variability on perceptual learning of dialects",
    venue: "Language and Speech 47(3), 207–239",
    url: "https://doi.org/10.1177/00238309040470030101",
  },
  "pederson-2010": {
    authors: "Pederson & Guion-Anderson",
    year: 2010,
    title: "Orienting attention during phonetic training facilitates learning",
    venue: "Journal of the Acoustical Society of America 127(2), EL54–EL59",
    url: "https://doi.org/10.1121/1.3292286",
  },
  /**
   * HOW AN EXERCISE IS SHAPED, as opposed to when it is scheduled.
   *
   * `yang-2021` and `kim-webb-2022` below already carry the two decisions the
   * schedule rests on — space it, and ask rather than show. These four are
   * about the sitting itself: what a question should do when the answer is
   * wrong, which direction to ask a word in, and whether mixing the kinds up
   * actually helps. Every one of them is cited on `/practice`, where the
   * learner can check the claim rather than take it.
   *
   * `brunmair-richter-2019` is here as the counterweight and is deliberately
   * not summarised as "interleaving works". It does not always; the moderator
   * is how similar the material is. Citing a meta-analysis and then ignoring
   * what it moderates on would be the same failure as citing nothing.
   */
  "rawson-dunlosky-2011": {
    authors: "Rawson & Dunlosky",
    year: 2011,
    title: "Optimizing schedules of retrieval practice for durable and efficient learning: How much is enough?",
    venue: "Journal of Experimental Psychology: General 140(3), 283–302",
    url: "https://doi.org/10.1037/a0023956",
  },
  "butler-roediger-2008": {
    authors: "Butler & Roediger",
    year: 2008,
    title: "Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing",
    venue: "Memory & Cognition 36(3), 604–616",
    url: "https://doi.org/10.3758/MC.36.3.604",
  },
  "bertsch-2007": {
    authors: "Bertsch, Pesta, Wiscott & McDaniel",
    year: 2007,
    title: "The generation effect: A meta-analytic review",
    venue: "Memory & Cognition 35(2), 201–210",
    url: "https://doi.org/10.3758/BF03193441",
  },
  "brunmair-richter-2019": {
    authors: "Brunmair & Richter",
    year: 2019,
    title: "Similarity matters: A meta-analysis of interleaved learning and its moderators",
    venue: "Psychological Bulletin 145(11), 1029–1052",
    url: "https://doi.org/10.1037/bul0000209",
  },
  "yang-2021": {
    authors: "Yang, Luo, Vadillo, Yu & Shanks",
    year: 2021,
    title: "Testing (quizzing) boosts classroom learning: a systematic and meta-analytic review",
    venue: "Psychological Bulletin 147(4), 399–435",
    url: "https://doi.org/10.1037/bul0000309",
  },
  "kim-webb-2022": {
    authors: "Kim & Webb",
    year: 2022,
    title: "The effects of spaced practice on second language learning: a meta-analysis",
    venue: "Language Learning 72(2), 269–319",
    url: "https://doi.org/10.1111/lang.12479",
  },
  "montero-perez-2013": {
    authors: "Montero Perez, Van Den Noortgate & Desmet",
    year: 2013,
    title: "Captioned video for L2 listening and vocabulary learning: a meta-analysis",
    venue: "System 41(3), 720–739",
    url: "https://doi.org/10.1016/j.system.2013.07.013",
  },
  "sakai-moorman-2018": {
    authors: "Sakai & Moorman",
    year: 2018,
    title: "Can perception training improve the production of second language phonemes?",
    venue: "Applied Psycholinguistics 39(1), 187–224",
    url: "https://doi.org/10.1017/S0142716417000418",
  },
  /**
   * The corpus that shows dialect writing is digitally normal here — and, in
   * the same breath, why Heidi records its own speakers: it is free for
   * academic NON-COMMERCIAL research, like every other Swiss German corpus we
   * found. That licence is the reason `capabilities.licensedAudio` is false.
   */
  "whatsup-uzh": {
    authors: "Stark et al., University of Zurich",
    year: 2020,
    title: "What's up, Switzerland? — a corpus of Swiss WhatsApp messages",
    venue: "617 chats, 944 consenting participants, 5.1M tokens",
    url: "https://whatsup.linguistik.uzh.ch/",
  },
  "bergsma-2014": {
    authors: "Bergsma, Swarte & Gooskens",
    year: 2014,
    title: "Does instruction about phonological correspondences contribute to the intelligibility of a closely related language?",
    venue: "Dutch Journal of Applied Linguistics 3(1), 45–61",
    url: "https://doi.org/10.1075/dujal.3.1.03ber",
  },
  /**
   * SWISS GERMAN LANGUAGE TECHNOLOGY — a third kind of claim again.
   *
   * The acquisition papers above support "this is how people learn"; the
   * atlases support "this form is spoken there". These support "this is what a
   * computer can currently do with this language", which is the subject of the
   * technology page and the evidence behind §8's refusal to claim dialect
   * transcription.
   *
   * Almost none of them have a DOI, and that is not a quality signal: this
   * field publishes at ACL and its workshops, where the Anthology record IS
   * the permanent citable identifier — more stable than most DOIs, and free to
   * read. The reachability test widened to admit those records rather than
   * pretending an arXiv link is a journal.
   *
   * EVERY FIGURE QUOTED FROM THESE ON THE SITE WAS READ FROM THE PAPER, not
   * from its abstract. Where a paper and its distribution page disagree — the
   * exact META-SHARE variant on STT4SG-350 — the site says the general thing
   * both support rather than picking one.
   */
  "archimob": {
    authors: "Samardžić, Scherrer & Glaser",
    year: 2016,
    title: "ArchiMob — A Corpus of Spoken Swiss German",
    venue: "Proceedings of LREC 2016, 4061–4066, Portorož",
    url: "https://aclanthology.org/L16-1641/",
  },
  "swiss-parliaments": {
    authors: "Plüss, Neukom, Scheller & Vogel",
    year: 2021,
    title: "Swiss Parliaments Corpus, an Automatically Aligned Swiss German Speech to Standard German Text Corpus",
    venue: "Proceedings of the Swiss Text Analytics Conference 2021, CEUR-WS Vol-2957",
    url: "https://ceur-ws.org/Vol-2957/",
  },
  "swissdial": {
    authors: "Dogan-Schönberger, Mäder & Hofmann",
    year: 2021,
    // Named as a preprint on purpose: it has no venue, and citing it as a
    // conference paper would be a claim about peer review that is not true.
    title: "SwissDial: Parallel Multidialectal Corpus of Spoken Swiss German",
    venue: "arXiv preprint 2103.11401 — not peer-reviewed",
    url: "https://doi.org/10.48550/arXiv.2103.11401",
  },
  "sds-200": {
    authors: "Plüss, Hürlimann, Cuny, Stöckli, Kapotis, Hartmann, Ulasik, Scheller, Schraner, Jain, Deriu, Cieliebak & Vogel",
    year: 2022,
    title: "SDS-200: A Swiss German Speech to Standard German Text Corpus",
    venue: "Proceedings of LREC 2022, 3250–3256, Marseille",
    url: "https://aclanthology.org/2022.lrec-1.347/",
  },
  "stt4sg-350": {
    authors: "Plüss, Deriu, Schraner, Paonessa, Hartmann, Schmidt, Scheller, Hürlimann, Samardžić, Vogel & Cieliebak",
    year: 2023,
    title: "STT4SG-350: A Speech Corpus for All Swiss German Dialect Regions",
    venue: "Proceedings of ACL 2023 (Short Papers), 1763–1772, Toronto",
    url: "https://doi.org/10.18653/v1/2023.acl-short.150",
  },
  "whisper-gsw": {
    authors: "Dolev, Lutz & Aepli",
    year: 2024,
    title: "Does Whisper Understand Swiss German? An Automatic, Qualitative and Human Evaluation",
    venue: "Proceedings of VarDial 2024, 28–40, Mexico City",
    url: "https://doi.org/10.18653/v1/2024.vardial-1.3",
  },
  "whisper-finetune": {
    authors: "Timmel, Paonessa, Vogel, Perruchoud & Kakooee",
    year: 2025,
    title: "Fine-tuning Whisper on Low-Resource Languages for Real-World Applications",
    venue: "Proceedings of the Swiss Text Analytics Conference 2025",
    url: "https://aclanthology.org/2025.swisstext-1.5/",
  },
  "swissbert": {
    authors: "Vamvas, Graën & Sennrich",
    year: 2023,
    title: "SwissBERT: The Multilingual Language Model for Switzerland",
    venue: "Proceedings of the Swiss Text Analytics Conference 2023, 54–69",
    url: "https://aclanthology.org/2023.swisstext-1.6/",
  },
  "swissbert-gsw": {
    authors: "Vamvas, Aepli & Sennrich",
    year: 2024,
    title: "Modular Adaptation of Multilingual Encoders to Written Swiss German Dialect",
    venue: "Proceedings of the 1st Workshop on Modular and Open Multilingual NLP, 16–23, St Julians",
    url: "https://doi.org/10.18653/v1/2024.moomin-1.3",
  },
  "vardial-2019": {
    authors: "Zampieri, Malmasi, Scherrer, Samardžić, Tyers, Silfverberg, Klyueva, Pan, Huang, Ionescu, Butnaru & Jauhiainen",
    year: 2019,
    title: "A Report on the Third VarDial Evaluation Campaign",
    venue: "Proceedings of VarDial 2019, 1–16, Ann Arbor. Best macro F1 on four Swiss German dialect areas: 0.76",
    url: "https://aclanthology.org/W19-1401/",
  },
  "tts-comparison": {
    authors: "Bollinger, Deriu & Vogel",
    year: 2023,
    title: "Text-to-Speech Pipeline for Swiss German — A Comparison",
    venue: "arXiv preprint 2305.19750 — not peer-reviewed",
    url: "https://doi.org/10.21256/zhaw-30250",
  },
  "tts-voice-adaptation": {
    authors: "Stucki, Deriu & Cieliebak",
    year: 2025,
    title: "Voice Adaptation for Swiss German",
    venue: "arXiv preprint 2505.22054 — submitted, not yet accepted",
    url: "https://doi.org/10.48550/arXiv.2505.22054",
  },
  "apertus": {
    authors: "Project Apertus (EPFL, ETH Zurich & CSCS)",
    year: 2025,
    title: "Apertus: Democratizing Open and Compliant LLMs for Global Language Environments",
    venue: "arXiv preprint 2509.14233. Swiss German appears as 6,000 post-training instruction examples; no dialect evaluation is reported",
    url: "https://doi.org/10.48550/arXiv.2509.14233",
  },
  /**
   * The spelling convention — a REFERENCE, and a proposal rather than a
   * standard.
   *
   * It matters that this is filed as a reference work and described as
   * recommendations: the single most tempting wrong sentence about Swiss
   * German is that it has a standard spelling called Dieth. It does not. The
   * corpora that use it say so in the same breath as reporting that their own
   * transcribers applied it inconsistently.
   */
  "dieth": {
    kind: "reference",
    authors: "Dieth",
    year: 1986,
    title: "Schwyzertütschi Dialäktschrift",
    venue:
      "2nd edition, Sauerländer, Aarau; first published 1938 as recommendations of a commission of the Neue Helvetische Gesellschaft. Widely used in dialectology, applied inconsistently even within one corpus, and unknown to most writers — a proposal, not an orthographic standard",
    // The same kind of record this file already accepts for the SDS atlas: a
    // standing reference work with no DOI, described where a reader can check
    // the claim. A library catalogue was tried first and redirected away.
    url: "https://de.wikipedia.org/wiki/Dieth-Schreibung",
  },
  "clarke-garrett-2004": {
    authors: "Clarke & Garrett",
    year: 2004,
    title: "Rapid adaptation to foreign-accented English",
    venue: "Journal of the Acoustical Society of America 116(6), 3647–3658",
    url: "https://doi.org/10.1121/1.1815131",
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

/** The reference as a reader expects to see it: authors, year, venue. */
export function citation(id: SourceId): string {
  const s = SOURCES[id];
  return `${s.authors} ${s.year}. ${s.title}. ${s.venue}.`;
}

/** Short form for a dense list — "Clopper & Pisoni 2004". */
export function shortCitation(id: SourceId): string {
  const s = SOURCES[id];
  return `${s.authors} ${s.year}`;
}
