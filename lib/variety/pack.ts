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
  /** Speech recognition INTO this variety's own script (not translated away). */
  asr: boolean;
  /** Speech synthesis good enough to put in front of a learner. */
  tts: boolean;
  /** Commercially licensed recorded audio exists; if false, we record it. */
  licensedAudio: boolean;
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
   * Sibling dialects inside the family that we do not teach yet, in the order
   * we expect to add them. Shown to the learner so the scope is honest: this
   * is what Heidi does not cover today.
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
export type Atlas = {
  /** Which outline to place these on. See `lib/geo/regions`. */
  region: GeoRegionId;
  /** Where the taught variety is spoken. */
  home: GeoPlace;
  /**
   * Where each `planned` dialect is spoken, keyed by its name in `planned`.
   *
   * Keyed rather than a parallel array so the names stay declared once: a test
   * asserts every planned dialect has a place and that no place is orphaned,
   * which a second list would let drift silently.
   */
  places: Readonly<Record<string, GeoPlace>>;
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
