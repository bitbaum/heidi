import type { SituationPack } from "../../../situations/pack.ts";
import type { VarietyPack, VocabularyEntry } from "../../../variety/pack.ts";
import { PICK_OPTIONS, PICK_PER_WORD, type PickItem } from "../types.ts";
import { blank } from "./text.ts";
import type { ExerciseKind, Material } from "./kind.ts";

/**
 * Which word is missing — asked with four real words and a German line that
 * settles it.
 *
 * WHY THIS KIND EXISTS, as a measurement rather than a hunch. The pack's
 * twenty-six function words produced six questions between them: they carry no
 * article and no paradigm, so the only generator that could see them was the
 * matching grid, and a grid asks four words at a time. `nöd`, `grad`, `äbe`,
 * `gäng` — the words the vocabulary page argues buy the most comprehension —
 * were the least practised material in the product.
 *
 * WHAT MAKES IT MARKABLE. Several options will produce a grammatical sentence;
 * that is unavoidable with function words and is not a flaw. The question is
 * not "which word fits" but "which word makes this mean the German underneath"
 * — and the German is printed, so the learner can check the verdict against
 * the evidence rather than take it. That is the same standard the rest of the
 * objective kinds meet: no model is asked, and the answer key is data.
 *
 * NOTHING IS INVENTED. The sentences are lines the packs already publish and
 * the gate already passed; the options are words from the pack's own list.
 */

/** Every sentence pair the material holds, wherever it lives. */
function corpus(pack: VarietyPack, situations: readonly SituationPack[]): { target: string; bridge: string }[] {
  const out: { target: string; bridge: string }[] = [];

  // Scene lines first: they are the most numerous and the most real.
  for (const domain of situations) {
    for (const scene of domain.situations) {
      for (const phrase of scene.phrases) out.push({ target: phrase.target, bridge: phrase.bridge });
    }
  }
  for (const topic of pack.grammar ?? []) {
    for (const example of topic.examples) out.push({ target: example.target, bridge: example.bridge });
  }
  for (const entry of pack.vocabulary ?? []) {
    if (entry.example) out.push({ target: entry.example.target, bridge: entry.example.bridge });
  }

  return out;
}

/** Unicode-aware whole-word test — `si` must not match inside `isch`. */
function says(sentence: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, "iu").test(sentence);
}

/**
 * Whether a word can be offered as a wrong answer against this German line.
 *
 * THE RULE THAT KEEPS THE KEY HONEST, and the generator is wrong without it.
 * `nüme` glosses "nicht mehr"; offered against a German sentence that says
 * "nicht mehr", it is a defensible answer marked wrong — which is the one
 * thing an objective item may never do. So a distractor's own gloss must not
 * appear in the bridge at all.
 *
 * It over-refuses: `au` ("auch") is excluded from any line whose German
 * happens to contain "auch" somewhere else. That is the right direction to
 * fail in — a distractor lost costs nothing, and a distractor that is secretly
 * correct costs the learner's trust in every verdict after it.
 */
function safeDistractor(candidate: VocabularyEntry, bridge: string): boolean {
  const gloss = candidate.bridge.trim().toLowerCase();
  if (!gloss) return false;
  return !bridge.toLowerCase().includes(gloss);
}

export function pickItems(pack: VarietyPack, situations: readonly SituationPack[]): PickItem[] {
  const items: PickItem[] = [];
  const sentences = corpus(pack, situations);

  /**
   * FUNCTION WORDS ONLY, and that is a scope rather than a limitation.
   *
   * The nouns already have the article drill, the verbs have their paradigms,
   * and the greetings are not what stops anybody following a sentence. This
   * kind exists for the group that had nothing, and pointing it at the whole
   * vocabulary would dilute it back into a general word quiz.
   */
  const pool = (pack.vocabulary ?? []).filter((entry) => entry.group === "function" && !/\s/.test(entry.target));

  for (const entry of pool) {
    const word = entry.target.trim();
    const gloss = entry.bridge.trim().toLowerCase();
    let made = 0;

    for (const sentence of sentences) {
      if (made >= PICK_PER_WORD) break;
      if (!says(sentence.target, word)) continue;

      /**
       * The gloss must be visible in the German, or the blank is unanswerable.
       *
       * `nöd` in a line whose translation renders the negation some other way
       * gives the learner nothing to decide on — and the verdict would then
       * rest on our translation choices rather than on the language.
       */
      if (!sentence.bridge.toLowerCase().includes(gloss)) continue;

      const distractors = pool
        .filter((other) => other.target !== entry.target)
        .filter((other) => !says(sentence.target, other.target))
        .filter((other) => safeDistractor(other, sentence.bridge))
        .slice(0, PICK_OPTIONS - 1)
        .map((other) => other.target.trim());

      // Three real alternatives or none: a two-option pick is a coin toss.
      if (distractors.length < PICK_OPTIONS - 1) continue;

      // Position decided by content, so the board is reproducible and the
      // answer does not sit in the same slot twice running.
      const answer = (word.length + sentence.target.length) % PICK_OPTIONS;
      const options = [...distractors];
      options.splice(answer, 0, word);

      items.push({
        id: `pick:${word.toLowerCase()}:${made}`,
        kind: "pick",
        marking: "objective",
        prompt: blank(sentence.target, word),
        bridge: sentence.bridge,
        options,
        answer,
        source: { kind: "word", word, group: entry.group },
      });
      made += 1;
    }
  }

  return items;
}

export const PICK: ExerciseKind = {
  id: "pick",
  answering: "tap",
  decisions: "one",
  marking: "objective",
  fromPack: true,
  generate: (material: Material) => pickItems(material.pack, material.situations),
};
