import type { SavedWord } from "../../saved/types.ts";
import { sentenceFor } from "../../saved/context.ts";
import type { RecallItem } from "../types.ts";
import type { ExerciseKind, Material } from "./kind.ts";

/**
 * A kept word, asked in the direction the learner will meet it.
 *
 * Dialect form first, meaning revealed second — recognition before production,
 * which is the order §1 argues and the direction a message actually arrives
 * in.
 *
 * THE ONE KIND THE SERVER CANNOT GENERATE, and `fromPack: false` is where that
 * is said once rather than remembered in three places. These words live in the
 * learner's browser and have never been sent anywhere; `published.ts` builds
 * the server half by skipping exactly the kinds that say so, and the practice
 * component generates these on the other side of the wire from storage.
 */
export function recallItems(saved: readonly SavedWord[]): RecallItem[] {
  return saved
    .filter((word) => word.target.trim() && word.bridge.trim())
    .map((word) => ({
      id: `recall:${word.target.trim().toLocaleLowerCase()}`,
      kind: "recall" as const,
      marking: "self" as const,
      prompt: word.target.trim(),
      answer: word.bridge.trim(),
      ...(sentenceFor(word) ? { context: sentenceFor(word) } : {}),
      source: { kind: "saved" as const },
    }));
}

export const RECALL: ExerciseKind = {
  id: "recall",
  answering: "card",
  decisions: "one",
  marking: "self",
  fromPack: false,
  generate: (material: Material) => recallItems(material.saved),
};
