import type { SituationPack } from "../../../situations/pack.ts";
import type { VarietyPack } from "../../../variety/pack.ts";
import type { TranslateItem } from "../types.ts";
import type { ExerciseKind, Material } from "./kind.ts";

/**
 * Say it in Zurich German. Type it, then look.
 *
 * WHY THIS EXISTS, WHEN THE FILE NEXT DOOR ARGUES AGAINST IT. `pick.ts` says
 * in as many words that printing the German first "makes the exercise
 * 'translate this', which is a different skill and one this product does not
 * claim to mark". That sentence is still true and this kind does not
 * contradict it — it accepts it. This IS the different skill, asked
 * deliberately, in its own mode, and MARKED BY THE LEARNER rather than by us.
 * What `pick` refuses is smuggling production into a question that claims to
 * be objective. Nothing here claims to be objective.
 *
 * WHY IT IS WORTH ASKING AT ALL, given §1 puts listening first. Because
 * "listening first" orders the skills, it does not delete the second one. A
 * learner who has read `Chunnsch hüt Abig?` forty times still cannot produce
 * it, and the gap between the two is exactly what the generation effect closes
 * (Bertsch 2007, already cited on `/method`): the work happens in the seconds
 * before the answer appears, and nothing else in this product makes that
 * moment happen for a whole sentence.
 *
 * NOTHING GRADES THE TYPING. §6 — this variety has no settled orthography, so
 * a machine comparing what somebody wrote to what the pack says would
 * eventually tell a person their spelling is wrong when it is not, in a
 * language where they cannot argue back. The two strings are shown one above
 * the other and the learner says whether they had it. That is not a weaker
 * question; it is the same question with the false authority removed.
 *
 * THREE SOURCES, IN THIS ORDER, and the order is the pedagogy. A situation
 * line is a real sentence somebody says on a real shift; a grammar example was
 * written to demonstrate a structure; a vocabulary example is one word's worth
 * of context. All three are whole sentences the pack already vouches for, and
 * none of them is generated here — this kind rearranges checked material, like
 * every other one.
 */
export function translateItems(pack: VarietyPack, packs: readonly SituationPack[]): TranslateItem[] {
  const items: TranslateItem[] = [];
  const seen = new Set<string>();

  /**
   * A sentence is worth asking ONCE, whichever shelf it came from.
   *
   * The same line can be a scene's `say` phrase and a grammar topic's example,
   * and two items differing only in their provenance would look to a learner
   * like the product asking them the same thing twice in one sitting — the
   * exact complaint that started this whole rebuild. Keyed on the bridge
   * rather than the target, because a duplicate bridge is the thing that
   * actually reads as a repeat: the prompt is what they see.
   */
  function add(item: TranslateItem, bridge: string): void {
    const key = bridge.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    items.push(item);
  }

  /**
   * The `say` lines first, because they are the ones production is FOR.
   *
   * A scene marks a line `say` when the alternative in that moment is silence
   * rather than Standard German — a two-word reassurance to a frightened
   * person is not a sentence you get to compose first. Those are precisely the
   * sentences worth being able to write from memory, and until this kind
   * existed they generated NOTHING: `cloze` deliberately skips them, so
   * fifty-seven checked `say` lines sat in the packs unasked.
   */
  for (const situation of packs) {
    for (const scene of situation.situations) {
      for (const [index, phrase] of scene.phrases.entries()) {
        if (phrase.direction !== "say") continue;
        add(
          {
            id: `translate:scene:${scene.id}:${index}`,
            kind: "translate",
            marking: "self",
            prompt: phrase.bridge,
            answer: phrase.target,
            source: {
              kind: "situation",
              scene: scene.id,
              ...(phrase.grammar ? { topic: phrase.grammar } : {}),
            },
          },
          phrase.bridge,
        );
      }
    }
  }

  for (const topic of pack.grammar ?? []) {
    for (const [index, example] of topic.examples.entries()) {
      add(
        {
          id: `translate:grammar:${topic.id}:${index}`,
          kind: "translate",
          marking: "self",
          prompt: example.bridge,
          answer: example.target,
          source: { kind: "grammar", topic: topic.id },
        },
        example.bridge,
      );
    }
  }

  for (const entry of pack.vocabulary ?? []) {
    const example = entry.example;
    if (!example) continue;
    add(
      {
        id: `translate:word:${entry.target.toLowerCase()}`,
        kind: "translate",
        marking: "self",
        prompt: example.bridge,
        answer: example.target,
        source: { kind: "word", word: entry.target, group: entry.group },
      },
      example.bridge,
    );
  }

  /**
   * And the `hear` lines last, which is a compromise stated rather than hidden.
   *
   * Asking somebody to PRODUCE a line that was written to be heard is the
   * order §1 warns about, and if these were the only source this kind would be
   * wrong. They are the last source, after the material that was written for
   * production — so a short run never reaches them, and a learner who works
   * through the whole mode gets them at the point where the recognition is
   * already there. The alternative is a mode with sixty items in it, which is
   * the repetition complaint again.
   */
  for (const situation of packs) {
    for (const scene of situation.situations) {
      for (const [index, phrase] of scene.phrases.entries()) {
        if (phrase.direction !== "hear") continue;
        add(
          {
            id: `translate:heard:${scene.id}:${index}`,
            kind: "translate",
            marking: "self",
            prompt: phrase.bridge,
            answer: phrase.target,
            source: {
              kind: "situation",
              scene: scene.id,
              ...(phrase.grammar ? { topic: phrase.grammar } : {}),
            },
          },
          phrase.bridge,
        );
      }
    }
  }

  return items;
}

export const TRANSLATE: ExerciseKind = {
  id: "translate",
  answering: "write",
  decisions: "one",
  marking: "self",
  fromPack: true,
  generate: (material: Material) => translateItems(material.pack, material.situations),
};
