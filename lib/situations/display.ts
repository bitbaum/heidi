import { SITUATIONS } from "./active.ts";
import { topicsOf, type Direction, type DomainId } from "./pack.ts";
import { saysWord } from "../text/words.ts";

/**
 * Everything a page may see of the situation packs.
 *
 * THE SAME RULE `lib/variety/display.ts` MAKES, APPLIED BEFORE IT IS NEEDED.
 *
 * That file exists because English prose written for maintainers reached
 * readers in all seven locales three separate times, and the fix that finally
 * ended it was structural: components import the projection, a test fails the
 * build if one reaches past it, and a walk over the projection asserts the
 * forbidden fields are gone.
 *
 * A situation pack has no such field TODAY — `target`, `bridge`, a direction,
 * two ids and a source, none of it English prose. So this projection is very
 * nearly the identity function, and that is a slightly odd-looking module to
 * write on purpose.
 *
 * It is written anyway, because the thing being prevented is not the current
 * state of the data. It is the entirely reasonable pull request six weeks from
 * now that adds a `note` to `Situation` explaining when the scene applies —
 * exactly the field `GrammarTopic` already has, for exactly that reason, in
 * English. On the day that lands, this projection drops it and the test says
 * so. Without this file, it renders.
 *
 * The prose a READER needs — what the scene is called, what happens in it —
 * lives in the seven dictionaries keyed by id, which is the same split the
 * grammar topics make and for the same reason: a pair of forms is the same in
 * seven languages, and a sentence about care is not.
 */

export type DisplayPhrase = {
  target: string;
  bridge: string;
  direction: Direction;
  /** A grammar topic id, so a scene can link into the grammar section. */
  grammar?: string;
  /** An id into `lib/research/sources.ts` — a key, not prose. */
  source: string;
};

export type DisplayScene = {
  id: string;
  /** Which domain it belongs to, so the index can group without a second list. */
  domain: DomainId;
  phrases: readonly DisplayPhrase[];
  /** The grammar topics it touches, in first-appearance order. */
  topics: readonly string[];
  /** How many lines are said TO the learner rather than BY them. */
  heard: number;
};

export type DisplayDomain = {
  id: DomainId;
  scenes: readonly DisplayScene[];
  /**
   * Whether a speaker of the taught variety has read this pack.
   *
   * Projected rather than left in the pack for the page to fetch, because the
   * page MUST render it: content nobody has checked, presented with nothing
   * saying so, is the §8 failure this field exists to make impossible.
   */
  nativeReviewed: boolean;
  /** Who read it, when somebody has. A name or a role — never an empty claim. */
  reviewedBy?: string;
};

export const DOMAINS: readonly DisplayDomain[] = SITUATIONS.map((pack) => ({
  id: pack.id,
  nativeReviewed: pack.provenance.nativeReviewed,
  ...(pack.provenance.by ? { reviewedBy: pack.provenance.by } : {}),
  scenes: pack.situations.map((situation) => ({
    id: situation.id,
    domain: pack.id,
    topics: topicsOf(situation),
    heard: situation.phrases.filter((p) => p.direction === "hear").length,
    phrases: situation.phrases.map((phrase) => ({
      target: phrase.target,
      bridge: phrase.bridge,
      direction: phrase.direction,
      ...(phrase.grammar ? { grammar: phrase.grammar } : {}),
      source: phrase.source,
    })),
  })),
}));

/** Every scene, flattened — what the index page iterates. */
export const SCENES: readonly DisplayScene[] = DOMAINS.flatMap((d) => d.scenes);

/** One scene by its id, or undefined so a route can answer 404 honestly. */
export function sceneById(id: string): DisplayScene | undefined {
  return SCENES.find((scene) => scene.id === id);
}

/** The domain a scene belongs to. Present whenever the scene is. */
export function domainOf(scene: DisplayScene): DisplayDomain | undefined {
  return DOMAINS.find((d) => d.id === scene.domain);
}

/**
 * The scenes where a grammar topic actually occurs.
 *
 * THE JOIN READ BACKWARDS, and it is the cheapest content this product has.
 * Every situation line already declares the topic it turns on, so the grammar
 * section can ask the reverse question — *where does this happen?* — without
 * anybody writing a second list, and the answer improves on its own every time
 * a scene is added.
 *
 * It is also the answer to the complaint a reference page always earns. A
 * topic page can explain `am-progressive` perfectly and still leave a reader
 * with no reason to believe it matters; three real lines from a shift, each
 * linking to the moment it is said in, is a different kind of argument.
 */
export function scenesUsingTopic(topic: string): DisplayScene[] {
  return SCENES.filter((scene) => scene.topics.includes(topic));
}

/**
 * The scenes where a vocabulary word is actually said.
 *
 * What turns the word list from a list into something with somewhere to go: a
 * reader who has just met `nöd` can see it in four sentences people say, which
 * is the difference between a gloss and a memory. Empty is a real answer and
 * the page shows nothing rather than a heading over an empty list — most of
 * the pack's words are not in a care shift, and pretending otherwise would be
 * the join lying to make a section look full.
 */
export function scenesSayingWord(word: string): DisplayScene[] {
  const needle = word.trim();
  if (!needle) return [];
  return SCENES.filter((scene) => scene.phrases.some((phrase) => saysWord(phrase.target, needle)));
}
