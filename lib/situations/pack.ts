/**
 * Situations — the third axis, after the variety and the locale.
 *
 * `VARIETY` is what you learn and there is one per deployment. `locale` is
 * what Heidi speaks to you while you learn it, and there are seven. Neither
 * answers the question a care assistant actually arrives with, which is not
 * "what is Zurich German" but "what is said to me at half past six in the
 * morning, and what do I say back".
 *
 * WHY THIS IS NOT MORE VOCABULARY. The pack's word list is organised by what
 * KIND of word each one is — function words, verbs, everyday nouns — and that
 * organisation is correct for its own argument: those are the words no sound
 * correspondence rescues, and they are worth a page for exactly that reason.
 * It is the wrong organisation for a shift. Nobody walks into a handover
 * needing "the twelve commonest particles"; they walk into it needing to
 * follow four sentences about who slept badly.
 *
 * So a situation is a SCENE plus the lines that occur in it, and the lines are
 * whole sentences rather than words, because the unit a learner fails at is
 * the sentence. That is the one idea taken from the self-study literature for
 * this variety — arrange by the moment, not by the paradigm — and everything
 * below is our own.
 *
 * WHY IT IS A SEPARATE MODULE FROM `lib/variety`. The variety pack answers
 * "what is this language"; a situation pack answers "where does this learner
 * need it". They vary independently: a Lesya deployment needs its own care
 * pack, and a Zurich deployment will want a clinic pack that says nothing new
 * about Zurich German. Folding situations into the variety pack would make
 * every new domain an edit to the file that defines the language.
 *
 * WHAT KEEPS IT HONEST. Three things, and none of them is care:
 *
 *   1. Every phrase passes the deterministic variety gate, at the same
 *      threshold the generation gate uses. A contract test runs it. A Bernese
 *      form in a care phrase is caught by the machine, not by a reviewer.
 *   2. Every phrase names a source for its lexis, the way a vocabulary entry
 *      carrying a claim does.
 *   3. A pack declares whether a native speaker has read it, and the page
 *      prints that answer either way. See `Provenance`.
 *
 * The third is the one that matters most and it is the one a product is most
 * tempted to skip. §2's argument is that this learner cannot audit what we
 * sell them — they are buying Zurich German precisely because they do not have
 * it. That is true of a greeting and it is far more true of a sentence
 * somebody will say to a frightened person at six in the morning.
 */

import type { GrammarTopic, VarietyTag } from "../variety/pack.ts";

/**
 * A domain, as a stable id.
 *
 * It is a URL segment and the key its prose is looked up by in the seven
 * dictionaries, so renaming one breaks links and drops the words at the same
 * time. Treat it as permanent.
 */
export type DomainId = string;

/**
 * Which way a phrase travels.
 *
 * THIS IS NOT DECORATION, and it is the field that keeps the module inside
 * the product's own thesis. §1 puts listening first and speaking last on
 * purpose: understanding dialect and replying in Standard German is a complete
 * and respected way to take part. A situation that presented every line as
 * something the learner must produce would quietly reverse that.
 *
 * `hear` — said TO the learner. The default, and most of every pack.
 * `say`  — worth being able to produce, because the alternative in this
 *          particular moment is silence rather than Standard German: a
 *          two-word reassurance to somebody who is frightened is not a
 *          sentence you get to compose first.
 *
 * A pack that is all `say` has misunderstood the product. A test refuses one.
 */
export type Direction = "hear" | "say";

export type Phrase = {
  /** What is actually said, in the taught variety, in the house spelling. */
  target: string;
  /** The same line in the bridge, so a reader of German can anchor it. */
  bridge: string;
  direction: Direction;
  /**
   * The grammar topic this line turns on, when one of the pack's topics does.
   *
   * Checked against `VARIETY.grammar` by a contract test, so a typo here is a
   * build failure rather than a dead link on a page. It is what makes a
   * situation a way INTO the grammar section rather than a list beside it: a
   * learner who has just failed to follow "Si isch am warte" has a reason to
   * read `am-progressive` that no reference page can manufacture.
   */
  grammar?: string;
  /**
   * Who vouches for the dialect words in this line.
   *
   * An id from `lib/research/sources.ts`, required on every phrase — unlike a
   * vocabulary entry, where a bare pair may inherit the pack's default. A
   * sentence is a bigger claim than a gloss and this module publishes nothing
   * but sentences.
   *
   * WHAT THE SOURCE DOES AND DOES NOT COVER, because the distinction is the
   * whole of the honesty here. It vouches for the LEXIS — that these are
   * Zurich German words meaning what the bridge says they mean. It does not
   * vouch for the sentence, because the sentence is ours: the variety pack
   * requires example sentences to be written for this product rather than
   * lifted, since the open resources for this variety are research-licensed or
   * non-commercial and a copied line would be a licence problem wearing the
   * costume of a teaching aid. So the words are cited and the arrangement is
   * ours, and `Provenance` is where we say who has checked the arrangement.
   */
  source: string;
};

/**
 * Whether a human who speaks this variety has read the pack.
 *
 * A BOOLEAN THAT IS ALLOWED TO BE FALSE, and the page prints it either way.
 *
 * The alternative is the one thing §8 exists to prevent: shipping content that
 * reads as authoritative because nothing on the page says otherwise. Romansh
 * is already handled this way sitewide — unreviewed by a native speaker, and
 * it says so — and this is the same rule applied to the material with the
 * highest cost of being wrong.
 *
 * `false` is not a placeholder to be flipped when somebody feels ready. It is
 * flipped when a named person has read the pack, and `by` records who.
 */
export type Provenance = {
  /** Has a speaker of the taught variety read every line? */
  nativeReviewed: boolean;
  /** Who, when one has. A name or a role — never a claim without one. */
  by?: string;
};

export type Situation = {
  /**
   * Stable, lowercase, hyphenated. A URL segment and a dictionary key.
   * Permanent, for both reasons at once.
   */
  id: string;
  /**
   * The lines, in the order the moment unfolds.
   *
   * ORDER IS CONTENT HERE. A handover starts with who slept and ends with what
   * you are being asked to do; sorting these alphabetically would throw away
   * the only structure a scene has.
   *
   * GROW A SCENE BY APPENDING, NEVER BY INSERTING. A line's position is its
   * identity to the learner model: practice ids and per-line strength are
   * keyed `scene:index` (`lineKey` in `lib/domain/practice/model.ts`), and
   * that record lives in the learner's browser where no migration reaches.
   * A line inserted in the middle would silently hand every later line's
   * progress to its neighbour. So a deepened scene gets a second beat after
   * the first — the till after the shelf, the handover's afterthoughts —
   * rather than lines threaded between the old ones.
   */
  phrases: readonly Phrase[];
};

export type SituationPack = {
  id: DomainId;
  /**
   * The variety these lines are in, as a tag.
   *
   * THE SEAM. `active.ts` serves only the packs whose tag matches the variety
   * this build teaches, so a Ukrainian deployment that inherited this folder
   * ships no Zurich sentences rather than shipping them to somebody learning
   * Ukrainian. Checked at module load, not hoped for.
   */
  variety: VarietyTag;
  situations: readonly Situation[];
  provenance: Provenance;
};

/** Every phrase in a pack, flattened — the unit most callers actually want. */
export function phrasesOf(pack: SituationPack): Phrase[] {
  return pack.situations.flatMap((situation) => situation.phrases);
}

/**
 * The grammar topics a situation touches, in first-appearance order.
 *
 * First-appearance rather than pack order, so the list reads as "what this
 * scene keeps doing to you" rather than as a second copy of the grammar page's
 * table of contents.
 */
export function topicsOf(situation: Situation): string[] {
  const seen: string[] = [];
  for (const phrase of situation.phrases) {
    if (phrase.grammar && !seen.includes(phrase.grammar)) seen.push(phrase.grammar);
  }
  return seen;
}

/** Whether a topic id names a topic the variety pack actually has. */
export function resolvesTo(topic: string, topics: readonly GrammarTopic[]): boolean {
  return topics.some((t) => t.id === topic);
}
