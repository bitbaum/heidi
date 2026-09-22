import type { PracticeItem } from "../types.ts";
import type { ExerciseKind, Material } from "./kind.ts";
import { PAIR } from "./pair.ts";
import { ARTICLE, FORM, MATCH } from "./vocabulary.ts";
import { CLOZE } from "./cloze.ts";
import { GAPTEXT } from "./gaptext.ts";
import { PICK } from "./pick.ts";
import { RECALL } from "./recall.ts";
import { TRANSLATE } from "./translate.ts";
import { CARD } from "./card.ts";

/**
 * Every exercise kind there is. The single source of truth.
 *
 * ADDING A KIND IS THIS LINE AND ONE FILE. Before this list existed it was
 * five edits — the item union, a generator, the `allItems` array, a chain of
 * `item.kind ===` in the renderer, and a keyboard handler whose fallthrough
 * silently answered the new kind correctly the moment it appeared. Three of
 * those five were invisible until something went wrong.
 *
 * THE ORDER IS THE ROUND-ROBIN ORDER a session draws in, so it is not
 * arbitrary. Objective kinds first, self-marked last: a sitting that opens
 * with "did you know it?" asks the learner to judge themselves before it has
 * shown them it can judge anything, and the two markings feel different enough
 * that leading with the provable one sets the right expectation.
 */
export const KINDS: readonly ExerciseKind[] = [
  PAIR,
  PICK,
  ARTICLE,
  FORM,
  MATCH,
  GAPTEXT,
  CLOZE,
  CARD,
  TRANSLATE,
  RECALL,
];

/** By id, for the places that hold an item and need its rules. */
export const KIND_BY_ID = new Map(KINDS.map((kind) => [kind.id, kind]));

/** Whether this product may tell a learner they are wrong about this item. */
export function isObjective(item: PracticeItem): boolean {
  return KIND_BY_ID.get(item.kind)?.marking === "objective";
}

/**
 * Everything that could be asked, from the material given.
 *
 * `which` narrows the kinds — `published.ts` passes the server-side ones,
 * because the learner's kept words live in their browser and the server has
 * none. Generation stays pure: same material, same items, same order.
 */
export function generateAll(material: Material, which: readonly ExerciseKind[] = KINDS): PracticeItem[] {
  return which.flatMap((kind) => kind.generate(material));
}

/** The kinds a server can build. See `ExerciseKind.fromPack`. */
export const PACK_KINDS = KINDS.filter((kind) => kind.fromPack);
