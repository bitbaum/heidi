import type { SourceId } from "./sources.ts";

/**
 * What a computer can and cannot do with Swiss German, as data.
 *
 * WHY THIS IS A PAGE AT ALL. §8 of HEIDI.md is an overclaim register — a list
 * of things this product must not say. The strongest form of that discipline
 * is not a promise to be careful; it is publishing what the field can actually
 * do, with the numbers, so that a reader can check our claims against it. The
 * page this feeds is where "Heidi does not transcribe dialect" stops being our
 * word for it and becomes a citation.
 *
 * WHY THE NUMBERS ARE NOT IN THE DICTIONARIES. Exactly the reason the
 * citations are not: a figure is not translatable, and seven copies of "343
 * hours" are seven chances for one of them to become 340. The dialect area
 * pages already settled this — they carry DATA and no prose, because eleven
 * areas of translated description is seventy-seven blocks nobody here can
 * check. This file is the same decision for the same reason. The dictionary
 * carries the framing; every hour, every speaker count and every licence lives
 * here once.
 *
 * EVERY FIGURE BELOW WAS READ FROM THE PRIMARY SOURCE NAMED, not from an
 * abstract, a summary or a memory. Where two sources disagree the entry says
 * so rather than picking the tidier one — see `stt4sg-350`'s licence and
 * `swissdial`'s duration.
 */

/** A licence that is a sentence rather than a name, said in the reader's language. */
export type LicenceKey = "research" | "unpublished" | "textOnly";

/** What a corpus pairs with what. The whole subject turns on this. */
export type Direction =
  /** Dialect speech in, STANDARD GERMAN text out. Almost everything is this. */
  | "speech-to-standard"
  /** Dialect speech in, dialect text out. Vanishingly rare. */
  | "speech-to-dialect"
  /** Written dialect, no audio. */
  | "dialect-text"
  /** Text in, dialect speech out. */
  | "text-to-speech";

export type Corpus = {
  id: string;
  name: string;
  year: number;
  direction: Direction;
  /** Hours of audio, where the source states one. */
  hours?: number;
  speakers?: number;
  /** Dialect regions or areas covered, where the corpus is organised that way. */
  regions?: number;
  /**
   * A NAMED licence — MIT, CC BY-NC 4.0 — which is a proper noun and the same
   * in every language. The two cases that are not a name (research-only, and
   * nothing published at all) are `licenceKey` instead, so they can be said in
   * the reader's language.
   *
   * The split exists because "research/non-commercial" is prose: the paper and
   * the distribution page disagree about which META-SHARE variant STT4SG-350
   * ships under, so the site says the general thing both support rather than
   * naming the wrong one, and that sentence has to be translatable.
   */
  licence?: string;
  licenceKey?: LicenceKey;
  /**
   * What it actually is, in one line.
   *
   * SOURCE COPY FOR MAINTAINERS, IN ENGLISH, AND DELIBERATELY NOT RENDERED —
   * the same decision `lib/domain/model/providers.ts` records having made the
   * hard way, after its own `note` field leaked English into a German
   * dropdown. Everything a reader needs is carried by the localised badges:
   * the direction, the licence, whether weights are published, whether dialect
   * was evaluated. Per-row commentary in seven languages is a worthwhile
   * addition; machine-translating it into Romansh is not.
   */
  note: string;
  source: SourceId;
};

/**
 * The speech corpora, oldest first.
 *
 * Read down the `direction` column and the central fact of the field is
 * visible without a word of prose: almost every one of them pairs dialect
 * SPEECH with STANDARD GERMAN text. That is not an accident of collection. In
 * German-speaking Switzerland the spoken language is dialect and the written
 * language is the standard, so writing down what was said is a translation
 * task rather than a transcription one — which is why "Swiss German speech
 * recognition" almost always means "produces Standard German".
 */
export const CORPORA: readonly Corpus[] = [
  {
    id: "archimob",
    name: "ArchiMob",
    year: 2016,
    direction: "dialect-text",
    licence: "CC BY-NC-SA 4.0",
    licenceKey: "textOnly",
    note: "Oral-history interviews recorded 1999–2001. Release 2 has 43 transcribed interviews, 581,976 tokens, written in Dieth spelling with a normalisation layer.",
    source: "archimob",
  },
  {
    id: "spc",
    name: "Swiss Parliaments Corpus",
    year: 2021,
    direction: "speech-to-standard",
    hours: 293,
    speakers: 198,
    // The one permissive licence in the whole table, and worth saying so.
    licence: "MIT",
    note: "Bernese cantonal parliament video aligned to the official minutes. The minutes are Standard German, so the pairing is a translation, not a transcript. 460 h raw; 293 h in the largest training split.",
    source: "swiss-parliaments",
  },
  {
    id: "swissdial",
    name: "SwissDial",
    year: 2021,
    direction: "text-to-speech",
    regions: 8,
    licenceKey: "unpublished",
    note: "The same sentences recorded in 8 dialects plus a Standard German reference, one studio speaker per dialect — built for synthesis rather than recognition. 23,195 sentence recordings; the paper states no total duration, and the project page says about 3 hours per dialect.",
    source: "swissdial",
  },
  {
    id: "sds-200",
    name: "SDS-200",
    year: 2022,
    direction: "speech-to-standard",
    hours: 200,
    speakers: 3816,
    licenceKey: "research",
    note: "Collected by a web tool: read a Standard German sentence, say it in your own dialect, record. Many speakers, ordinary microphones.",
    source: "sds-200",
  },
  {
    id: "stt4sg-350",
    name: "STT4SG-350",
    year: 2023,
    direction: "speech-to-standard",
    hours: 343,
    speakers: 316,
    regions: 7,
    licenceKey: "research",
    note: "Deliberately balanced across 7 dialect regions — 44 to 53 hours each, so Valais and Grisons carry the same weight as Zurich. Its test set is the same 3,515 sentences recorded in every region, which is what makes dialects comparable at all.",
    source: "stt4sg-350",
  },
];

/**
 * Word error rate, on one corpus, so the numbers can be read against each
 * other.
 *
 * ALL OF THESE PRODUCE STANDARD GERMAN. A WER against a Standard German
 * reference measures how well a system translated what it heard — it says
 * nothing about writing dialect down, which is a different task that almost
 * nobody is doing.
 */
export type AsrResult = {
  /**
   * The model's NAME, and nothing else.
   *
   * It used to read "Whisper large-v3, no fine-tuning" — which is a proper
   * noun with an English sentence stapled to it, and that sentence would have
   * appeared untranslated on the Russian page. Whether it was fine-tuned is a
   * fact about the row, so it is a flag with a localised label.
   */
  system: string;
  /** False means the model was used as published, with no Swiss German training. */
  tuned: boolean;
  year: number;
  /** Word error rate on the STT4SG-350 test set, as a percentage. */
  wer: number;
  /** True when the model weights are published. */
  open: boolean;
  note: string;
  source: SourceId;
};

export const ASR_RESULTS: readonly AsrResult[] = [
  {
    system: "Whisper large-v3",
    tuned: false,
    year: 2024,
    wer: 23.0,
    open: true,
    note: "Out of the box, with no Swiss German training at all. The paper's conclusion is that this is usable — so long as Standard German output is what you wanted.",
    source: "whisper-gsw",
  },
  {
    system: "XLS-R 1B",
    tuned: true,
    year: 2023,
    wer: 14.0,
    open: true,
    note: "Trained on the balanced split of STT4SG-350 by the team that built the corpus.",
    source: "stt4sg-350",
  },
  {
    system: "Whisper large-v2",
    tuned: true,
    year: 2025,
    wer: 12.1,
    // The caveat that matters most to anyone hoping to use it.
    open: false,
    note: "The best published figure we could verify. The weights are not released, and it is trained partly on broadcast material nobody else can license.",
    source: "whisper-finetune",
  },
];

/**
 * Speaking, as opposed to listening — and the part where the marketplace is
 * actively misleading.
 *
 * Most voices sold as "Swiss German" are Swiss STANDARD German: the written
 * standard, read aloud with a Swiss accent. That is a different language from
 * the one spoken at the lunch table, and a learner buying one to hear dialect
 * has been sold the thing they already understand.
 */
export type SpeechSystem = {
  /**
   * Keyed rather than named, because three of these four have no proper noun —
   * "commercial de-CH voices" is a description, and a description belongs in
   * the dictionary. Only the ETH project has a name of its own, and it is
   * carried in the localised label too so the four read as one list.
   */
  id: SpeechSystemId;
  year?: number;
  /** True only when it produces DIALECT speech rather than the standard. */
  dialect: boolean;
  status: "research" | "service" | "closed";
  /**
   * Has anybody HERE listened to it, or tested it against real audio?
   *
   * The same discipline `lib/listening/sources.ts` applies to its programmes,
   * and for a sharper reason: §7 records that most "Swiss German" TTS on the
   * market is Standard German in a Swiss accent, so a vendor's own label is
   * the one thing that cannot settle the question. A row claiming dialect on
   * the strength of a marketing page is the lemons problem of §2 with us on
   * the wrong side of it.
   *
   * Claimed nowhere today, and a test enforces that. The day somebody spends
   * an afternoon with real Zurich audio, this flips and the copy changes with
   * it.
   */
  verified: boolean;
  note: string;
  source?: SourceId;
};

export type SpeechSystemId = "commercial" | "swissVendors" | "eth" | "vits" | "voiceCloning";

export const SPEAKING: readonly SpeechSystem[] = [
  {
    id: "commercial",
    dialect: false,
    status: "service",
    verified: false,
    note: "What the large cloud vendors sell as German (Switzerland). It is Swiss Standard German read aloud — the written language, not the spoken one. There is no dialect locale.",
  },
  {
    /**
     * The category that did not exist when this register was written, and the
     * one that would change the product most if it holds up.
     *
     * Swiss specialist vendors now sell dialect recognition and dialect
     * synthesis together, hosted in Switzerland, and at least one advertises
     * STT that returns DIALECT TEXT rather than translating into Standard
     * German. If that is true it is not an improvement in degree: it is the
     * thing `lib/speech/evidence.ts` says would make a transcript evidence
     * about a speaker's own forms — the difference between measuring
     * somebody's dialect and refusing to.
     *
     * WHY IT IS A ROW AND NOT A CAPABILITY FLIP. One vendor advertises "97.4%
     * dialect accuracy" with no test set named and no independent evaluation,
     * against a published honest baseline of 25.6% WER for the whole field.
     * That is a tenfold claim, unaudited, on a sales page. It may well be
     * real — but the numbers above it came from people who published their
     * method, and this one did not.
     *
     * THE EXPERIMENT THAT WOULD SETTLE IT is cheap and nobody has run it: take
     * the free trial credits, feed it real Zurich speech, and compare against a
     * transcript a Zurich speaker wrote. Until then `verified` stays false and
     * the pack keeps `returnsSpokenVariety: false`.
     */
    id: "swissVendors",
    year: 2026,
    dialect: true,
    status: "service",
    verified: false,
    note: "Swiss vendors selling dialect STT and TTS as a hosted API, some offering transcription that keeps dialect text rather than translating it into Standard German. Accuracy is advertised rather than published: no test set, no independent evaluation, and a figure far above the best peer-reviewed result for the field. Nobody here has fed one real Zurich audio.",
  },
  {
    id: "eth",
    dialect: true,
    status: "research",
    verified: false,
    note: "Standard German text translated to dialect text, then synthesised, across the 8 SwissDial dialects. The dataset was released; we could not confirm that any model or API is publicly available.",
    source: "swissdial",
  },
  {
    id: "vits",
    year: 2023,
    dialect: true,
    status: "research",
    verified: false,
    note: "Compared three training corpora and found a small, carefully transcribed one beat a large noisy one — best rated 4.1 of 5 by native listeners, against about 4.8 for real recordings.",
    source: "tts-comparison",
  },
  {
    id: "voiceCloning",
    year: 2025,
    dialect: true,
    status: "research",
    verified: false,
    note: "About 5,000 hours of Swiss podcast audio, automatically labelled, used to make Standard German text come out as dialect speech in a cloned voice. A preprint, submitted and not yet accepted.",
    source: "tts-voice-adaptation",
  },
];

/**
 * Whether a written-language model knows dialect at all.
 *
 * The pattern to watch for, and the reason this list exists: a Swiss model is
 * announced, the press release names Swiss German among its languages, and the
 * technical report turns out to contain no dialect evaluation whatsoever. The
 * `evaluated` field is the honest distinction — was the claim measured, or
 * merely made?
 */
export type TextModel = {
  name: string;
  year: number;
  /** Whether the model has any dialect-specific component at all. */
  dialect: boolean;
  /** Whether anyone published a measurement of its dialect ability. */
  evaluated: boolean;
  licence: string;
  note: string;
  source: SourceId;
};

export const TEXT_MODELS: readonly TextModel[] = [
  {
    name: "SwissBERT",
    year: 2023,
    dialect: false,
    evaluated: false,
    licence: "CC BY-NC 4.0",
    note: "An encoder for Switzerland's four national languages, trained on news: German, French, Italian, Romansh. No dialect — the paper says extending it to dialect is future work.",
    source: "swissbert",
  },
  {
    name: "SwissBERT + gsw",
    year: 2024,
    dialect: true,
    evaluated: true,
    licence: "CC BY-NC 4.0",
    note: "A dialect adapter added a year later, trained on 18 million tokens of web text and tweets. WRITTEN dialect in ad-hoc spellings, not speech and not Dieth.",
    source: "swissbert-gsw",
  },
  {
    name: "Apertus",
    year: 2025,
    dialect: true,
    // The point of the whole table.
    evaluated: false,
    licence: "Apache 2.0",
    note: "Switzerland's open LLM, and genuinely open. Its Swiss German component is 6,000 instruction examples in post-training; the report publishes no dialect evaluation. The serious low-resource effort in it is Romansh, which does get its own benchmark.",
    source: "apertus",
  },
];

/** Every source this page depends on, for the orphan check in sources.test.ts. */
export function techSources(): SourceId[] {
  const ids = new Set<SourceId>();
  for (const c of CORPORA) ids.add(c.source);
  for (const r of ASR_RESULTS) ids.add(r.source);
  for (const s of SPEAKING) if (s.source) ids.add(s.source);
  for (const m of TEXT_MODELS) ids.add(m.source);
  ids.add("dieth");
  ids.add("vardial-2019");
  return [...ids];
}
