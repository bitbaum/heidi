import type { VarietyPack } from "../../variety/pack.ts";
import type { SituationPack } from "../../situations/pack.ts";
import type { SavedWord } from "../saved/types.ts";
import { generateAll, KINDS, PACK_KINDS } from "./kinds/registry.ts";
import type { PracticeItem } from "./types.ts";

/**
 * Turning material into things to be asked.
 *
 * NOTHING HERE INVENTS LANGUAGE. Every item is assembled from material the
 * pack already vouches for — a rule the gate enforces, an example a grammar
 * topic carries, a line from a checked scene, a word the learner kept. That
 * constraint is what lets practice exist at all in a product that refuses to
 * let a model be the authority on dialect: the exercises are a rearrangement
 * of checked content, not new content.
 *
 * It also means practice grows exactly as fast as the material does, which is
 * the honest coupling. A pack with four grammar topics cannot produce forty
 * distinct grammar questions, and generating forty by paraphrase would be
 * inventing forms at the one person who cannot tell.
 *
 * WHAT THIS FILE IS NOW. A façade. The generators moved into `kinds/`, one
 * module per kind, because this file had become the place where every kind was
 * written, every kind was listed, and every shared text helper lived — three
 * jobs and no seam between them. What stays here is the call every caller
 * already makes, so that move cost nobody an import.
 *
 * Adding a kind is a file in `kinds/` and a line in `kinds/registry.ts`.
 */
export { pairItems } from "./kinds/pair.ts";
export { articleItems, formItems, matchItems } from "./kinds/vocabulary.ts";
export { clozeItems, situationItems } from "./kinds/cloze.ts";
export { gapTextItems } from "./kinds/gaptext.ts";
export { recallItems } from "./kinds/recall.ts";

/**
 * Everything that could be asked, before a session decides what to ask.
 *
 * The three arguments stay positional and optional because every existing
 * caller passes them that way; inside, they become one `Material`, which is
 * what a kind actually receives. A new kind that needs something none of these
 * carries adds a field there rather than a parameter here.
 */
export function allItems(
  pack: VarietyPack,
  saved: readonly SavedWord[],
  situations: readonly SituationPack[] = [],
): PracticeItem[] {
  return generateAll({ pack, saved, situations }, KINDS);
}

/**
 * The half a server can build: everything except the learner's own words.
 *
 * Derived from the registry rather than by listing the kinds again, so a new
 * server-side kind reaches `/practice` by existing. `recall` is excluded
 * because those words live in the browser and have never been sent anywhere —
 * see `ExerciseKind.fromPack`.
 */
export function packItems(pack: VarietyPack, situations: readonly SituationPack[] = []): PracticeItem[] {
  return generateAll({ pack, saved: [], situations }, PACK_KINDS);
}
