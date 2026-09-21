import type { SavedWord } from "../../saved/types.ts";
import type { SituationPack } from "../../../situations/pack.ts";
import type { VarietyPack } from "../../../variety/pack.ts";
import type { PracticeItem } from "../types.ts";

/**
 * Everything an exercise kind is allowed to be built from.
 *
 * ONE ARGUMENT, NOT THREE, and it is the reason this type exists. The
 * generators used to take whatever each happened to need — `(pack)`,
 * `(saved)`, `(situations)` — so every new kind changed the signature of
 * `allItems`, every caller of `allItems`, and the two tests that build a
 * session by hand. A kind that wants the situation packs should not be an
 * event in the life of the practice page.
 *
 * NOTHING HERE IS A SERVICE. It is data: a pack, some situation packs, and
 * whatever the learner has kept. Generation stays pure — same material, same
 * items, same order — which is what lets `published.ts` freeze the result at
 * module load and lets a test assert exactly what a learner sees.
 */
export type Material = {
  pack: VarietyPack;
  /** Empty on a deployment with no domain packs. Never undefined. */
  situations: readonly SituationPack[];
  /** Empty on the server, which is what it means for the server to have none. */
  saved: readonly SavedWord[];
};

/**
 * One kind of question, as a module.
 *
 * WHY A REGISTRY RATHER THAN A SWITCH. Adding `match` touched five places: the
 * item union, the generator file, the `allItems` list, the renderer's `kind ===`
 * chain, and the keyboard handler that silently answered it correctly because
 * it fell through to the self-marked branch. Four of those five were invisible
 * until something went wrong, and the fifth was a bug that shipped in the same
 * commit as the feature.
 *
 * With this, a kind is a file and a line in `registry.ts`. The renderer side
 * has its own registry keyed by the same ids, and a test refuses a key present
 * in one and missing from the other — the same join-with-a-test discipline the
 * grammar topics and the dictionaries already use.
 *
 * `marking` lives here rather than only on each generated item because it is a
 * property of the KIND, not of an instance: it decides whether this product
 * may tell somebody they are wrong. A fixed rule in the pack may; a guess at
 * whether a typed answer counts, in a variety with no settled orthography, may
 * not. Stating it once per kind is what stops the two from drifting.
 */
export type ExerciseKind = {
  /** Matches `PracticeItem["kind"]`, and is the key on both registries. */
  id: PracticeItem["kind"];
  /**
   * `objective` — the item has a right answer this product can prove, because
   *   a rule or a field in the pack defines it. No model is asked.
   * `self` — the learner says whether they knew it. Everything involving
   *   spelling or free production is marked this way.
   */
  marking: "objective" | "self";
  /**
   * Whether this kind's items come from the SERVER's material.
   *
   * False for `recall` alone, and the exception is a privacy property rather
   * than a technicality: a learner's kept words live in their browser and have
   * never been sent anywhere, so the server cannot generate questions about
   * them and must not try. `published.ts` builds the server half by skipping
   * exactly these.
   */
  fromPack: boolean;
  /** Every item of this kind the material can support. Pure. */
  generate(material: Material): PracticeItem[];
};
