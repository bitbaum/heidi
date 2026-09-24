import type { SituationPack } from "../../../situations/pack.ts";
import type { VarietyPack } from "../../../variety/pack.ts";
import type { ClozeItem } from "../types.ts";
import { blank, blankable } from "./text.ts";
import type { ExerciseKind, Material } from "./kind.ts";

/**
 * One word missing from a sentence, with the German beside it.
 *
 * Self-marked, and that is a principle rather than laziness: Zurich German has
 * no standard orthography, so marking a typed answer means deciding whether a
 * near-miss counts — and getting that wrong tells a learner they were wrong
 * when they were not, in a variety where nobody can tell them otherwise.
 *
 * TWO SOURCES, ONE SHAPE. The pack's grammar examples were written to
 * demonstrate a rule; the situation lines are the same structures as they
 * actually occur. Both make the same kind of question, they share the same
 * blanking rule (`blankable`, in `text.ts`), and keeping them in one module is
 * what stops a second copy of that rule from existing.
 */
export function clozeItems(pack: VarietyPack): ClozeItem[] {
  const items: ClozeItem[] = [];

  for (const topic of pack.grammar ?? []) {
    for (const [index, example] of topic.examples.entries()) {
      const answer = blankable(example.target, example.bridge);
      if (!answer) continue;

      items.push({
        /**
         * THE POSITION IS IN THE ID, and leaving it out was a real bug.
         *
         * Two examples of one topic can blank to the same word — `articles`
         * has two sentences that both come down to `Huus` — and the id was
         * `cloze:<topic>:<word>`, so the two items were indistinguishable.
         * Ids key the seen-history and the requeue, so answering one marked
         * the other as asked, and one of the two was never served again. It
         * was invisible: both items exist, both are correct, and the only
         * symptom is a question that quietly stops appearing.
         */
        id: `cloze:${topic.id}:${index}:${answer.toLowerCase()}`,
        kind: "cloze",
        marking: "self",
        prompt: blank(example.target, answer),
        answer,
        bridge: example.bridge,
        source: { kind: "grammar", topic: topic.id },
      });
    }
  }

  return items;
}

/**
 * The same blank, cut into a line from a scene.
 *
 * ONLY THE LINES THE LEARNER HEARS. A `say` line is something they may need to
 * produce, and asking them to produce a word from it is a reasonable exercise
 * for a different product. This one puts comprehension first, and an item that
 * drills production of a sentence nobody has learned to recognise is the order
 * reversed.
 */
export function situationItems(packs: readonly SituationPack[]): ClozeItem[] {
  const items: ClozeItem[] = [];

  for (const pack of packs) {
    for (const scene of pack.situations) {
      for (const [index, phrase] of scene.phrases.entries()) {
        if (phrase.direction !== "hear") continue;

        const answer = blankable(phrase.target, phrase.bridge);
        if (!answer) continue;

        items.push({
          // Positional, for the reason above: `pain` has two heard lines that
          // both blank to `nüme`, and without the index they were one item.
          id: `cloze:${scene.id}:${index}:${answer.toLowerCase()}`,
          kind: "cloze",
          marking: "self",
          prompt: blank(phrase.target, answer),
          answer,
          bridge: phrase.bridge,
          source: {
            kind: "situation",
            scene: scene.id,
            line: index,
            ...(phrase.grammar ? { topic: phrase.grammar } : {}),
          },
        });
      }
    }
  }

  return items;
}

export const CLOZE: ExerciseKind = {
  id: "cloze",
  answering: "card",
  decisions: "one",
  marking: "self",
  fromPack: true,
  generate: (material: Material) => [...clozeItems(material.pack), ...situationItems(material.situations)],
};
