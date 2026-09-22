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
 * The three ways an answer can be given. See `ExerciseKind.answering`.
 *
 * A closed union rather than a string, because `mode.ts` turns each member
 * into a button the learner can press and a value that appears in a URL.
 */
export type Answering = "tap" | "write" | "card";

/**
 * How many decisions one item asks for.
 *
 * `one` — a single choice settles it. `several` — a grid of four pairs, a
 * passage with three gaps: the item is finished in pieces and marked on the
 * balance of them.
 *
 * It exists because a test run needs both properties and they are different
 * ones. A test asks only what can be marked outright (`marking`) AND only what
 * can be answered in one move (`decisions`), because a run of twenty is meant
 * to move quickly and a matching grid is thirty seconds of dragging attention
 * around a board. Naming the field after the test — `testable` — would have
 * tied a description of the KIND to the one feature that reads it today, and
 * the next feature that wants "quick items" would have added a second flag
 * meaning the same thing.
 */
export type Decisions = "one" | "several";

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
   * What the learner does with their hands to answer this kind.
   *
   * WHY THE KIND DECLARES IT. A practice mode is "no typing" or "typing only" or
   * "cards", and the obvious way to build that is a list of kind ids per mode in
   * the module that defines modes. That list is a second classification of every
   * kind, kept in a different file from the kind, and it goes stale the first
   * time somebody adds a kind without reading it — the exact failure the
   * registry exists to end. So the kind says it once, here, and `mode.ts`
   * derives every mode from the registry.
   *
   * `tap`   — choose from options already on the screen. One hand, no keyboard,
   *           and every one of these is objectively markable.
   * `write` — produce the answer and type it. Self-marked, always: §6.
   * `card`  — turn it over and say whether you had it. Self-marked, and the
   *           fastest of the three, because nothing has to be read but the word.
   */
  answering: Answering;
  /** One choice, or a board finished in pieces. See `Decisions`. */
  decisions: Decisions;
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
