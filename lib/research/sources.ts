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

export type Source = {
  authors: string;
  year: number;
  title: string;
  /** Journal, volume and pages, as you would write it in a reference list. */
  venue: string;
  /** DOI-resolved where one exists, otherwise a stable catalogue record. */
  url: string;
};

export const SOURCES = {
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
