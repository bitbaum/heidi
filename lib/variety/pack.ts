/**
 * A Variety Pack — everything that makes this app teach ONE language variety.
 *
 * Why this type exists, and why it is shaped like this:
 *
 * Heidi teaches Zurich German to people who already have Standard German.
 * That is one instance of a general problem: an adult is surrounded by a
 * target variety T, already commands a related bridge variety B, and cannot
 * understand T. Ukrainian-for-Russian-speakers is the same problem with
 * different letters. So the engine must not know which variety it serves —
 * the variety is DATA, and the app is the engine plus one pack.
 *
 * The rule that keeps it honest: nothing outside `lib/variety/packs/` may
 * name a Zurich form, a German word, or a Swiss fact. If swapping the pack
 * would not swap the product, something leaked.
 *
 * Scope discipline: this type carries only what the product uses today or
 * what decides near-term architecture. Learner models, corpus schemas and
 * register taxonomies are deliberately absent until a surface needs them —
 * a field nobody reads is a field that drifts.
 */

import type { Place as GeoPlace, RegionId as GeoRegionId } from "../geo/region.ts";
import type { Recognition } from "../speech/evidence.ts";

/** BCP-47 where one exists. Zurich German is `gsw-u-sd-chzh`; Ukrainian is `uk`. */
export type VarietyTag = string;

/** The four things a learner can be bad at, separately. */
export type Skill = "listening" | "reading" | "texting" | "speaking";

/**
 * Who this variety's learners are and WHICH SKILL IS ACTUALLY BROKEN.
 *
 * This field exists because assuming the answer is the mistake that would
 * have sunk the second pack. Heidi's learner has Standard German and cannot
 * understand the spoken vernacular: the gap is comprehension, so listening
 * is the front door. A Russian-speaking Ukrainian has understood Ukrainian
 * since school and is fluent at receiving it; what they lack is confident
 * production free of Russian interference. Porting "listening first" to
 * Ukrainian would drill a skill that population already has, and skip the
 * one they came for.
 *
 * So the engine never hardcodes which surface is the front door. It reads
 * `priority[0]`.
 */
export type LearnerProfile = {
  /** The typical learner, in one sentence. */
  who: string;
  /** Skills ordered by how badly THIS variety's learners need them. */
  priority: readonly Skill[];
  /** The sociolinguistic fact that produces that order. */
  because: string;
};

/**
 * How a bridge variety relates to the target — and therefore what it is FOR.
 *
 * `sibling`   close enough that systematic correspondences carry the learner
 *             a long way (Standard German -> Zurich German; Russian -> Ukrainian).
 *             Correspondence cues are only meaningful for a sibling.
 * `roof`      the standardised variety that covers the target in a diglossic
 *             society, used in writing where the target is spoken. Swiss
 *             Standard German roofs Zurich German. Ukrainian has no roof —
 *             it IS the standard — so this is the field that must be allowed
 *             to be absent rather than faked.
 * `gloss`     unrelated; useful only to explain meaning (English for both).
 */
export type BridgeRelation = "sibling" | "roof" | "gloss";

export type Bridge = {
  tag: VarietyTag;
  /** Shown to the learner, in English. */
  name: string;
  relation: BridgeRelation;
  /**
   * A gate over text claiming to be THIS bridge, not the target.
   *
   * Zurich is diglossic, and pretending otherwise teaches half the
   * competence: dialect is what is spoken and written informally, Swiss
   * Standard German is what an email to a landlord, a doctor or an employer
   * is written in. A product that only ever produces dialect quietly sets
   * people up to send a chat message to an insurance company.
   *
   * So Heidi offers Swiss Standard German too — and the moment it does, it
   * needs to be checkable, because "Swiss Standard German" from a model is
   * overwhelmingly likely to be Germany's German with nothing Swiss about it.
   * That is precisely the failure the target gate exists for, one variety
   * over: fluent, grammatical, and undetectable by the learner, who cannot
   * know that asking for a *Fahrrad* marks them as foreign.
   *
   * Absent for a bridge we make no claim to produce.
   */
  rules?: readonly VarietyRule[];
};

/**
 * One systematic bridge->target sound/spelling correspondence.
 *
 * These are ATTENTIONAL CUES, not a syllabus. A 50-minute lecture on
 * correspondences produced no measurable intelligibility gain (Bergsma,
 * Swarte & Gooskens 2014, Dutch->Frisian) — but cueing a listener to attend
 * to a specific contrast during training is what separated learning from no
 * learning (Pederson & Guion-Anderson 2010). So a correspondence earns its
 * place next to a clip the learner is about to hear again, never as a lesson
 * they sit through first. `cue` is that sentence.
 */
export type Correspondence = {
  /** The form in the bridge variety. */
  bridge: string;
  /** The same word in the target variety. */
  target: string;
  /** The regularity, in the shortest form that is still true. */
  rule: string;
  /** What to tell a listener to attend to, right before they hear it again. */
  cue: string;
};

/**
 * One point of grammar, as DATA rather than as a lesson.
 *
 * WHERE THE WORDS LIVE, and why they are not here.
 *
 * A pack is English-source and the site speaks seven languages, so an
 * explanation written in this file could only ever be shown to an English
 * reader — and `DISPLAY` exists precisely to stop English prose leaking out of
 * a pack into a page. So the split is the same one `lib/research/sources.ts`
 * already makes: what is NOT in any language lives here, and what has to be
 * translated is keyed by `id` in the dictionaries.
 *
 * What is not in any language: the forms themselves. `Ich bi gange` is Zurich
 * German whoever is reading the page, and the Standard German beside it is the
 * comparison that makes it legible. Those are the part a learner actually
 * looks at.
 *
 * A topic is deliberately SMALL. The evidence this repo already cites is that
 * correspondences work as attentional cues next to something you are about to
 * meet again, and fail as a lecture you sit through first (Bergsma 2014 found
 * no intelligibility gain from 50 minutes of them; Pederson & Guion-Anderson
 * 2010 found cueing attention to one contrast is what separated learning from
 * none). So: a pair of forms, a sentence of rule, and the thing that trips
 * people. Not a chapter.
 */
/**
 * What a topic DOES to a reader of the bridge — the two bands.
 *
 * The grammar page's own lead has made this distinction in prose since it
 * shipped: "first what makes a sentence fail completely, then what you
 * understand but would never say yourself". That is a real division and it was
 * carried entirely by the ORDER of the list, which is to say by nothing a
 * reader could see and nothing a test could hold.
 *
 * `blocks`  the sentence does not survive. A German reader waits for a
 *           preterite that never comes, reads `wo` as "where", or loses the
 *           subject because `mir` looks like a dative. These are the ones
 *           worth reading before anything else, because without them the
 *           listening does not start.
 * `marks`   the sentence survives and the speaker does not. You follow
 *           `am schaffe` and `go poschte` perfectly well; never producing them
 *           is what keeps somebody sounding like Standard German with Zurich
 *           words in it.
 *
 * A pack for another variety declares its own assignment. The bands are the
 * shape, not the content — and a variety whose gap is production rather than
 * comprehension will put most of its topics in the second one.
 */
export type GrammarBand = "blocks" | "marks";

export type GrammarTopic = {
  /**
   * Stable, lowercase, hyphenated. It is a URL fragment and the argument of a
   * `grammar` move, so renaming one breaks links an answer has already given
   * out — treat it as permanent.
   */
  id: string;
  /**
   * Which band this belongs to. Required: a topic that has not been decided
   * either way is a topic nobody has thought about, and the index would have
   * to invent a home for it.
   */
  band: GrammarBand;
  /**
   * The contrast, target beside bridge. Two or three: one example is an
   * anecdote and five is a drill.
   */
  examples: readonly { target: string; bridge: string }[];
  /**
   * One line, in the SOURCE language, saying when this topic is the right one.
   *
   * FOR THE MODEL, never for a reader — which is why it is called `note` and
   * why `display.ts` drops it along with every other source-language field.
   *
   * The prompt lists these ids so that an answer can offer a button to the
   * page instead of explaining the same structure for the fourth time this
   * week. Listed bare, the model has to guess what `articles` or
   * `am-progressive` covers from the slug alone, and the button it picks is
   * only as good as that guess. One line each is the difference between "send
   * them to the right place" and "send them somewhere plausible".
   */
  note?: string;
};

/**
 * The words that buy the most comprehension, grouped by what kind of word they
 * are.
 *
 * WHICH WORDS. Not a phrasebook. A German reader already recognises most Swiss
 * German content words, because they are cognate and the correspondences carry
 * them — `Chind` is transparently `Kind` once you know `k → ch`. What actually
 * stops them is the short, constant words no correspondence rescues: `nöd`,
 * `öppis`, `mir` meaning *wir*, and the handful of verbs that appear in every
 * other sentence. Those are worth a page; "hello" and "thank you" are not the
 * reason anybody cannot follow a lunch table.
 *
 * THE DIRECTION IS TARGET → BRIDGE, which resolves what looks like a
 * contradiction with the Swiss Standard German gate. This page says *Velo*
 * means *Fahrrad* — and that gate flags *Fahrrad* as Germany's word. Both are
 * right, because they face opposite ways: understanding what somebody said,
 * versus writing something to send. Comprehension first is the whole product.
 */
export type VocabularyGroup = "function" | "verbs" | "everyday" | "greetings" | "helvetisms" | "slang";

/**
 * The article a learner would actually SAY, as a closed set.
 *
 * Zurich German has three, and they are not the German three: `de Maa`,
 * `d Frau`, `s Chind`. A learner who has read the noun a hundred times in
 * German still says *der Velo* the first time, because gender is carried by a
 * word they never had to learn.
 *
 * Closed rather than a free string, and that is the point: `"der"` in this
 * field would be a German article presented as a Zurich one, which is exactly
 * the invisible error §2 describes. A test refuses anything outside the three.
 *
 * A pack for another variety declares its own — this type is the shape, not
 * the content, and Ukrainian will not have three of anything.
 */
export type Article = "de" | "d" | "s";

/**
 * Which form of a word this is.
 *
 * A CLOSED VOCABULARY for the same reason the follow-up moves are: the label
 * is rendered in seven languages, so it has to be a key the dictionary can
 * translate rather than a string somebody typed. "du-Form" in a Russian
 * interface is not a translation, it is German leaking.
 *
 * Person labels use the pronoun a paradigm is usually printed with. `plural`
 * is for nouns; `past` is the participle, which in this variety is the only
 * past there is — §9's `no-preterite` topic is about precisely that.
 */
export type FormLabel = "ich" | "du" | "er" | "mir" | "ihr" | "si" | "plural" | "past";

export type WordForm = {
  label: FormLabel;
  /** The form in the taught variety. */
  target: string;
  /** The same form in the bridge language, so the contrast is visible. */
  bridge: string;
};

export type VocabularyEntry = {
  /** The form in the taught variety. */
  target: string;
  /** What a reader of the bridge language recognises. */
  bridge: string;
  group: VocabularyGroup;
  /**
   * The article, for a noun. Absent for everything else, and absent for a noun
   * whose gender nobody here has checked — an absent article is honest, and a
   * guessed one is a confident falsehood aimed at somebody who cannot detect it.
   */
  article?: Article;
  /**
   * The forms worth knowing, for a word whose forms are the difficulty.
   *
   * Not a full paradigm for its own sake. `si` and `ha` earn one because they
   * carry every compound past in the language; a noun earns a plural when the
   * plural is not what a German reader would produce.
   */
  forms?: readonly WordForm[];
  /**
   * One sentence the word lives in.
   *
   * WRITTEN FOR THIS PRODUCT, never lifted from a dictionary or a corpus. The
   * open resources for this variety are overwhelmingly research-licensed or
   * non-commercial, so copying an example sentence would be a licence problem
   * wearing the costume of a teaching aid — and the repo would have no way to
   * tell later which sentences were safe.
   */
  example?: { target: string; bridge: string };
  /**
   * The meaning a bridge reader will ASSUME, and be wrong about.
   *
   * THE ONE KIND OF WORD THE LIST COULD NOT EXPRESS. Every other row here
   * works because the two halves look different: `aalüte` is visibly not
   * `anrufen`, so a reader knows they have met something new. The dangerous
   * words are the opposite — `Peperoni`, `Eschtrich`, `schmöcke` — where a
   * German reader recognises the word, is certain they know it, and is wrong.
   * Nothing warns them, because there is nothing to notice.
   *
   * That is §2's problem in a single word. A learner cannot audit a word they
   * are sure of; the error is invisible from the inside and stays invisible
   * until it costs something — ordering `Peperoni` and getting a bell pepper
   * is funny, reading `Eschtrich` in a tenancy agreement is not.
   *
   * So the row carries three things rather than two: the Zurich word, what it
   * MEANS (`bridge`), and what a reader would have taken it to mean. It is in
   * the bridge language, like `bridge` itself, and it is required to name a
   * source for the same reason everything else here is — it is a claim about
   * two languages at once.
   *
   * Absent on most entries, including most of this group. `Trottoir` is not a
   * false friend: a German reader simply does not know it, which is a
   * different and much safer kind of gap.
   */
  mistakenFor?: string;
  /**
   * How a word lands, when it is not neutral. A CLOSED SET — the label is
   * rendered in seven languages from a key, never typed.
   *
   *   casual   among friends, at work with colleagues; odd in a letter.
   *   rude     among friends it is warmth, to a stranger or a boss it is an
   *            insult. `huere`, `Löli`, `Schnure`.
   *
   * WHY THIS IS NOT OPTIONAL FOR SLANG. Asked for: slang, "stuff like this".
   * The meaning of `huere` is the easy half. The half a learner cannot audit —
   * §2 again — is that saying it to the landlord is a different act from
   * saying it at the Stammtisch, and nothing in the word itself tells them.
   * A test refuses a `slang` entry without a register.
   */
  register?: "casual" | "rude";
  /**
   * Who vouches for the detail above.
   *
   * Required by a test for any entry carrying an `article`, `forms`, an
   * `example` or a `mistakenFor`: those are claims about the language, and
   * this repo does not publish a claim about the language that names nobody. A
   * bare target/bridge pair inherits the pack's `vocabularySources` as before.
   */
  source?: string;
};

/** How confident we are that a flagged form is actually wrong. */
export type Severity =
  /** Belongs to an identifiable OTHER variety. The learner cannot detect this; we must. */
  | "foreign"
  /** Not a form of the target at all. */
  | "unattested"
  /** Real in the target, but house style prefers another form. Not an error. */
  | "dispreferred"
  /** Legitimate spelling variation. Informational only, never shown as a mistake. */
  | "variant";

/**
 * Ranked by HOW CERTAINLY WRONG, so a gate can say "reject at or above X".
 *
 * `unattested` outranks `foreign` deliberately: a Bernese form is a real word
 * that a real person says, just not here, so the judgement is regional and
 * arguable. A ß in Swiss text — or a Russian ы in Ukrainian — is not a form of
 * the language at all, and no reviewer will overturn it. Ordering these the
 * other way round let both through the generation gate, which is exactly the
 * class of error this module exists to stop.
 */
export const SEVERITY_RANK: Record<Severity, number> = {
  unattested: 3,
  foreign: 2,
  dispreferred: 1,
  variant: 0,
};

export type VarietyRule = {
  /**
   * What to match. A string is matched as a whole word, Unicode-aware and
   * case-insensitively — which is the common case and keeps packs readable.
   * Use a RegExp only for patterns a word list cannot express.
   */
  match: string | RegExp;
  severity: Severity;
  /**
   * How to show this rule to a human. Required for a RegExp, because the
   * alternative is a page that prints `(?<!\p{L})tüü?tsch(?!\p{L})` at a
   * learner — which is what it did before this field existed.
   */
  display?: string;
  /** Why it is flagged, in English, for a learner. */
  reason: string;
  /** The variety it actually belongs to, when known. */
  origin?: string;
  /** The target-variety form to use instead. */
  suggest?: string;
};

/**
 * Orthography policy. The single biggest structural difference between the
 * cases we know about: Zurich German has NO standard spelling, so the same
 * word spelled two ways is variation, not error. Ukrainian has a state
 * orthography, so it is error. A checker that cannot express this difference
 * would either nag Swiss users or wave through Ukrainian mistakes.
 */
export type Orthography = {
  /** Is there a recognised standard spelling for this variety? */
  standardised: boolean;
  /** Name of the standard or house convention, for citing to the user. */
  convention: string;
  /**
   * What to say when our spelling differs from the learner's. With no
   * standard, the honest line is "we write it this way", not "you are wrong".
   */
  note: string;
};

/**
 * What language technology actually exists for this variety — which decides
 * which product surfaces can exist at all, rather than crashing when they
 * are opened.
 *
 * This is not a nice-to-have field. Zurich German has no usable dialect ASR
 * or TTS, so pronunciation feedback and auto-aligned transcripts are simply
 * not buildable and every clip needs a human transcript. Ukrainian has both,
 * so the same surfaces are buildable on day one. The engine reads this and
 * enables or hides; it never assumes.
 */
export type Capabilities = {
  /**
   * What recognition does to the TARGET variety.
   *
   * Replaced a bare `asr: boolean`, because a boolean cannot express the fact
   * that decides the whole speaking surface: a recogniser may exist, work
   * well, and still answer in a DIFFERENT variety from the one that was
   * spoken. Swiss German recognition transcribes dialect into Standard German
   * — so `available` is true and `returnsSpokenVariety` is false, and the two
   * together are what `lib/speech/evidence.ts` reads to decide whether a
   * transcript may be judged as the learner's own words.
   *
   * With one flag those two cases were indistinguishable, and the safe reading
   * was to call ASR unavailable — which was wrong in the other direction,
   * because Heidi CAN understand dialect speech, she simply cannot write it
   * down faithfully.
   */
  recognition: Recognition;
  /**
   * The same question about the BRIDGE variety, which has a different answer
   * and is the reason the speaking surface can exist at all today.
   *
   * Zurich is diglossic: the German somebody needs at a doctor's desk is Swiss
   * Standard German, recognition for it returns what was said, and §9 already
   * makes producing it a product output. Absent for a pack with no sibling
   * bridge.
   */
  bridgeRecognition?: Recognition;
  /** Speech synthesis good enough to put in front of a learner. */
  tts: boolean;
  /** Commercially licensed recorded audio exists; if false, we record it. */
  licensedAudio: boolean;
};

/**
 * The linguistic facts the speech engine needs, supplied rather than assumed.
 *
 * `lib/speech/` measures syllables, counts hesitations and asks a grammar
 * service for findings, and NOT ONE of those files may know what language it
 * is working on — the same house rule §4 states for the gate and the prompt.
 * Before this existed the syllable rule lived in a test, the filler words
 * lived in a test, and `SPEECH_LANG = "de-CH"` was a constant in the voice
 * module: swapping the pack to Ukrainian would have kept asking the
 * synthesiser for Swiss German.
 */
export type SpeechProfile = {
  /**
   * The BCP-47 tag to ask a synthesiser for.
   *
   * Not the same as the pack's `tag`: Zurich German is requested as `de-CH`
   * because no platform has a `gsw` voice, and asking for one gets silence.
   */
  lang: string;
  /** Letters that can be a syllable nucleus. */
  vowels: string;
  /**
   * Do adjacent vowel LETTERS form one nucleus, or one each?
   *
   * The field the second pack forced into existence. German writes diphthongs
   * as adjacent vowels, so `Haus` is one syllable and merging is right.
   * Ukrainian has no diphthongs — `дякую` is дя-ку-ю — so merging reports two
   * where a speaker says three, and nothing anywhere fails. A rate wrong by a
   * third, in a language nobody here reads, is exactly the kind of error a
   * contract test over every pack exists to catch.
   */
  adjacentVowelsMerge: boolean;
  /**
   * What this language hesitates with — `äh`, `ähm`.
   *
   * Counted and never judged: native speakers produce them constantly, and a
   * product that flags them teaches somebody to talk like a document.
   */
  fillers: readonly string[];
  /**
   * The LanguageTool language code, or null where the variety has no checker.
   *
   * Null for Zurich German and that is correct rather than a gap: LanguageTool
   * has no Swiss German, and it would be worse if it did — a checker built for
   * a standard would flag every dialect form as an error. The bridge has one.
   */
  grammarCode: string | null;
  /** The grammar code for the bridge variety, where the checker does exist. */
  bridgeGrammarCode?: string | null;
  /**
   * The commonest words that tell the target and the bridge apart.
   *
   * Used to settle, from a real response, the one question a vendor's sales
   * page cannot: did the recogniser answer in the variety that was SPOKEN, or
   * translate it into the bridge? See `lib/speech/dialect-marker.ts`.
   *
   * FUNCTION WORDS, deliberately. Content words are cognate across these two
   * varieties and carry the correspondences that make them mutually legible;
   * what separates them reliably is the handful of words in every sentence —
   * which also means a ten-second clip is enough to decide.
   */
  markers?: {
    target: readonly string[];
    bridge: readonly string[];
  };
};

/**
 * The wider variety this pack is one dialect OF.
 *
 * Heidi teaches Swiss German and starts with Zurich, rather than teaching
 * "Zurich German" as if the rest did not exist. That distinction is not
 * marketing: the deterministic gate rejects Bernese forms *because* we are
 * currently teaching Zurich, not because Bernese is wrong. Naming the family
 * is what makes that coherent — and what makes a Bern pack, which will reject
 * Zurich forms, obviously the same kind of object rather than a contradiction.
 */
export type Family = {
  /** English name of the wider variety, e.g. "Swiss German". */
  name: string;
  /** What speakers call it, e.g. "Schwiizerdütsch". */
  endonym: string;
  /**
   * The roadmap: dialects we intend to add, in order, as `DialectArea` ids.
   *
   * IDS, NOT NAMES. It held display names — "Aargau", "Wallis" — and the areas
   * they refer to are called Aarau and Brig after the towns the dialects are
   * named for. Two hand-written lists matched by string, and they did not
   * match: both showed on the map as "not on the roadmap" when they were on
   * it. An id is checkable, and `family.test.ts` checks it.
   */
  planned: readonly string[];
  /**
   * Where these dialects are actually spoken, so the family can be drawn as a
   * map rather than asserted as a list.
   *
   * Optional: a pack without it simply gets no map, and the site renders the
   * names on their own. A family whose dialects do not sit inside one tidy
   * region should leave this out rather than invent a box for them.
   */
  atlas?: Atlas;
  /**
   * Every dialect area of the family, whether or not Heidi teaches it or can
   * detect it.
   *
   * Deliberately separate from `planned`, which is a ROADMAP — the dialects we
   * intend to add, in order. Conflating the two is what made the map answer
   * "where is Swiss German spoken?" with a product decision, and left a reader
   * wondering why Graubünden was missing from a map of Switzerland.
   */
  areas?: readonly DialectArea[];
  /**
   * The branches those areas fall into, where the field has established some.
   *
   * Absent for a family with no settled internal division — which is a fact
   * about the family, not a gap in this file, and the page renders the areas
   * as a flat list rather than inventing headings for them.
   */
  dialectGroups?: readonly DialectGroup[];
};

/**
 * The family, placed.
 *
 * A pack states coordinates and nothing about drawing — the outline, the
 * projection and the viewBox belong to `lib/geo`, which knows about maps and
 * nothing about dialects. `region` names which outline to draw them on.
 *
 * The earlier version of the dialect figure argued, in its own comment,
 * against drawing Switzerland at all: a recognisable silhouette would be a
 * cartographic claim, and the patches were not where those dialects are. The
 * conclusion was wrong even though the worry was right. The fix for "this map
 * would be inaccurate" is an accurate map — real cities at real coordinates,
 * marking where a dialect is spoken rather than drawing a boundary around it.
 * Isoglosses genuinely do not follow cantonal borders, so we draw no borders;
 * Bernese genuinely is spoken at Bern, so we can point at Bern.
 */
/**
 * One dialect area of the family, as a place on the map and a claim we can back.
 *
 * WHY AREAS AND NOT CANTONS. A canton is an administrative boundary and a
 * dialect is not: isoglosses cross cantonal borders and always have, which is
 * why `DialectFigure` draws points and refuses to draw territories. Central
 * Switzerland is one dialect area across six cantons; Basel-Stadt and
 * Basel-Landschaft are one across two. Listing `cantons` gives a reader the
 * handle they actually have — they know which canton they are in — without
 * asserting that the dialect stops at the line.
 *
 * WHY THERE IS NO PROSE HERE. The same split the grammar topics use: an
 * endonym and a town are not in any language, an explanation is, and a pack is
 * English-source. The words live in the dictionaries, keyed by `id`.
 *
 * WHY THERE ARE NO EXAMPLE FORMS EITHER. They would be a second copy of what
 * the gate already knows. An area names a `ruleOrigin` instead, and its
 * distinguishing forms are READ OUT of `pack.rules` — so the page can never
 * claim a form the checker does not enforce, and adding a rule improves the
 * page for free. An area with no rules yet shows none and says so, which is
 * the honest state of "Heidi cannot tell this apart yet".
 */
/**
 * A branch of the dialect family, as the field established it.
 *
 * WHY THIS IS IN THE PACK AND NOT THE PAGE. "Swiss German is not one
 * language" is the third fact the dialect page leads with, and until now the
 * page proved it with a list of eleven names — which reads as eleven flavours
 * of one thing. The structure is the interesting part and it is not ours: the
 * Alemannic dialects divide into Low, High and Highest, the divisions are
 * drawn by specific sound changes, and an area belongs to one because of where
 * it falls relative to those lines. That is a claim about language, so it
 * lives with the language data and names the atlas that vouches for it.
 *
 * NOTHING HERE IS PROSE. `id` keys the name and the explanation in the
 * dictionaries, exactly as a grammar topic does, and `diagnostic` is a pair of
 * FORMS rather than a sentence about them — `Kind` inside the Low Alemannic
 * line, `Chind` outside it. A pair of forms is the same in seven languages and
 * is the kind of thing this product can actually be held to.
 *
 * Generic on purpose: nothing here says Alemannic. A pack for another family
 * declares its own groups, or declares none.
 */
export type DialectGroup = {
  /** Stable id, keying the name and explanation in the dictionaries. */
  id: string;
  /**
   * The contrast that draws the boundary, as forms rather than as a
   * description of forms. `inside` is what you hear within the group,
   * `outside` what you hear beyond it, and `standard` the bridge form both are
   * versions of — so a reader can see the line rather than be told about it.
   */
  diagnostic?: { inside: string; outside: string; standard: string };
  /** Ids from `lib/research/sources.ts`. A group with none fails the build. */
  sources: readonly string[];
};

export type DialectArea = {
  /** Stable, lowercase, hyphenated. A URL segment; renaming one breaks links. */
  id: string;
  /**
   * Which `pack.dialectGroups` entry it belongs to.
   *
   * ABSENT IS A REAL ANSWER and the reason this is optional. Innerschwyzer-
   * tütsch as drawn here spans Lucerne, which is High Alemannic, and Uri and
   * Unterwalden, which are Highest; Bündnerdütsch covers Chur and the Walser
   * settlements, which are likewise on two sides of the line. Assigning either
   * one a single branch would be a tidier page and a false claim, so they
   * carry none and the page says the area spans more than one.
   */
  group?: string;
  /** What speakers call it. A name, so it is not translated. */
  endonym: string;
  /**
   * Canton codes this covers. Reach, not a boundary — see above.
   */
  cantons: readonly string[];
  /** The town the dialect is named after in practice, and the map point. */
  town: string;
  place: GeoPlace;
  /**
   * The `origin` value its rules carry in `pack.rules`, when the gate can
   * already place this variety. Absent means we cannot yet, and the page says
   * so rather than inventing something.
   */
  ruleOrigin?: string;
  /**
   * Who vouches for this being a distinct area. Ids from
   * `lib/research/sources.ts`. A test refuses an area that names none —
   * correctness at this scale is not a matter of being careful, it is a matter
   * of making carelessness fail the build.
   */
  sources: readonly string[];
};

export type Atlas = {
  /** Which outline to place these on. See `lib/geo/regions`. */
  region: GeoRegionId;
  /** Where the taught variety is spoken. */
  home: GeoPlace;
};

export type VarietyPack = {
  tag: VarietyTag;
  /** English name, e.g. "Zurich German". */
  name: string;
  /** What speakers call it, e.g. "Züritüütsch". */
  endonym: string;
  /** Where it is spoken, for the learner's orientation. */
  region: string;
  /** The wider variety this is a dialect of, when it is one. */
  family?: Family;
  /** Ranked: the first `sibling` is the default correspondence source. */
  bridges: readonly Bridge[];
  learner: LearnerProfile;
  correspondences: readonly Correspondence[];
  /**
   * The handful of structural facts that make this variety hard to follow for
   * somebody who already reads the bridge. Empty for a pack that has not
   * written them yet — the page simply does not appear.
   */
  grammar?: readonly GrammarTopic[];
  /**
   * The words worth knowing first. Empty for a pack that has not chosen them
   * yet — the page simply does not appear.
   */
  vocabulary?: readonly VocabularyEntry[];
  /**
   * The subject pronoun this variety puts in front of each person's verb form.
   *
   * WHY THIS IS DATA AND NOT A LABEL. A conjugation drill used to print the
   * person in the READER's language — «мы ___», «we ___», «wir ___» — and ask
   * which Zurich form belongs to it. That is the product translating the thing
   * it is teaching. A learner who answers it correctly has still never seen
   * `mir chömed`, which is the only string any of this was for, and a Russian
   * reader was being shown a Russian pronoun on a page whose entire claim is
   * that you learn the variety by meeting it.
   *
   * So the prompt is built from HERE, in the taught variety, and the reader's
   * pronoun moves underneath it as a gloss — the same shape every other
   * exercise already uses: the dialect leads, the bridge supports.
   *
   * PARTIAL ON PURPOSE. `plural` and `past` are grammatical categories rather
   * than persons and have no subject to print; they keep the dictionary label,
   * because "past tense" is a fact about the reader's understanding and not a
   * word of the variety. A pack that has not written these prints labels the
   * old way and loses nothing but the improvement.
   */
  subjects?: Partial<Record<FormLabel, string>>;
  /**
   * Which grammar topic explains a question generated from the word list.
   *
   * THE GAP THIS CLOSES. A practice item says where it came from, and a
   * vocabulary item came from a WORD — so when somebody got `d Huus` wrong,
   * the panel could offer the word list and nothing else. But "which article"
   * is not a fact about `Huus`; it is a fact about this variety having three
   * articles that do not line up with the German ones, and there is a page
   * that says so. Twenty-four of the pack's questions are article questions,
   * and every one of them was being explained by a link to a glossary.
   *
   * IN THE PACK BECAUSE IT IS A FACT ABOUT THE VARIETY. `articles` is the
   * Zurich topic id; another variety's article question is explained by
   * another topic, or by none. A map in the generator would be a Swiss fact
   * living in `lib/domain`, which is the leak AGENTS.md is about.
   *
   * Checked against `grammar` by a test, so a renamed topic is a build
   * failure rather than a silently missing explanation.
   */
  explains?: {
    /** The topic behind "which article does this noun take". */
    article?: string;
    /** The topic behind "which form goes with this person". */
    form?: string;
  };
  /**
   * Who vouches for the vocabulary. Ids from `lib/research/sources.ts`.
   *
   * Separate from a dialect area's sources because it is a different KIND of
   * claim needing a different authority: an atlas maps where a form is spoken
   * and says nothing about what it means. Citing the SDS for a gloss would be
   * a reference that looks right and does not support the sentence above it.
   */
  vocabularySources?: readonly string[];
  /**
   * One line of the target variety that a speaker of the bridge language
   * cannot parse — the hero shows it, then answers it. Optional: a pack
   * without one simply gets a hero with no demonstration.
   *
   * Pick a sentence that FAILS honestly. "Chunnsch" and "hüt Abig" are opaque
   * to a Standard German reader; a sentence they can half-guess proves nothing
   * and quietly tells them they do not need this.
   */
  showcase?: { line: string };
  rules: readonly VarietyRule[];
  orthography: Orthography;
  capabilities: Capabilities;
  /**
   * What the speech engine needs to work on this language. See `SpeechProfile`.
   */
  speech: SpeechProfile;
};

/** The surface this pack opens on — never assumed, always read. */
export function frontDoor(pack: VarietyPack): Skill {
  return pack.learner.priority[0];
}

/** What to print for a rule. Literal matches show themselves. */
export function ruleLabel(rule: VarietyRule): string {
  if (rule.display) return rule.display;
  return typeof rule.match === "string" ? rule.match : rule.match.source;
}

/** The sibling bridge a pack teaches from, if it has one. */
export function siblingOf(pack: VarietyPack): Bridge | undefined {
  return pack.bridges.find((b) => b.relation === "sibling");
}
