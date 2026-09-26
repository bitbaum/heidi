import type { VarietyPack, VocabularyEntry } from "../../../variety/pack.ts";
import { saysWord } from "../../../text/words.ts";
import { QUESTION_OPTIONS, type QuestionItem } from "../types.ts";
import { clockItem, gistItem, place, replyItem, transformItem, type Library } from "../templates/template.ts";
import { REPLY } from "../templates/authored/reply.ts";
import { GIST } from "../templates/authored/gist.ts";
import { TRANSFORM } from "../templates/authored/transform.ts";
import { CLOCK } from "../templates/authored/clock.ts";
import { words } from "./text.ts";
import type { ExerciseKind, Material } from "./kind.ts";

/**
 * The five kinds built on `QuestionItem` — four authored through the template
 * layer, one generated from the vocabulary.
 *
 * They are separate kinds, not one, because the session's round-robin is per
 * kind: a sitting should meet a reply, a reading of a line and a time the way
 * it meets an article and a gapped passage, rather than one of the five at a
 * time. All five are tap-and-one-decision and objective, so all five can
 * appear in a test run too.
 */

function library(material: Material): Library {
  return { pack: material.pack, situations: material.situations };
}

function defined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export const REPLY_KIND: ExerciseKind = {
  id: "reply",
  answering: "tap",
  decisions: "one",
  marking: "objective",
  fromPack: true,
  generate: (m) => REPLY.map((t) => replyItem(t, library(m))).filter(defined),
};

export const GIST_KIND: ExerciseKind = {
  id: "gist",
  answering: "tap",
  decisions: "one",
  marking: "objective",
  fromPack: true,
  generate: (m) => GIST.map((t) => gistItem(t, library(m))).filter(defined),
};

export const TRANSFORM_KIND: ExerciseKind = {
  id: "transform",
  answering: "tap",
  decisions: "one",
  marking: "objective",
  fromPack: true,
  generate: (m) => TRANSFORM.map((t) => transformItem(t, library(m))).filter(defined),
};

export const CLOCK_KIND: ExerciseKind = {
  id: "clock",
  answering: "tap",
  decisions: "one",
  marking: "objective",
  fromPack: true,
  generate: (m) => CLOCK.map((t) => clockItem(t, library(m))).filter(defined),
};

/**
 * Whether two glosses could be the same answer.
 *
 * Shared words of three letters or more, either way round: `dänk` is glossed
 * «wohl, doch» and `äbe` would be ruled out beside anything glossed «doch».
 * It over-refuses, which is the right direction — a lost distractor costs
 * nothing, a distractor that is secretly correct costs every verdict after it.
 */
export function glossesOverlap(a: string, b: string): boolean {
  const left = words(a.toLowerCase()).filter((w) => w.length >= 3);
  const right = words(b.toLowerCase()).filter((w) => w.length >= 3);
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return true;
  // A shared word, or one word inside the other: `zuhören` against `hören`
  // is the same act for anybody choosing quickly, and `Mittagessen` against
  // `Essen` is a defensible answer marked wrong.
  return left.some((l) => right.some((r) => l === r || (Math.min(l.length, r.length) >= 4 && (l.includes(r) || r.includes(l)))));
}

/**
 * "What does this word mean?" — four German glosses, one of them the pack's.
 *
 * WHY, WHEN `card` AND `match` ALREADY ASK MEANINGS. A card is self-marked and
 * a grid asks four at once; neither can set a TRAP. For the words a German
 * reader is sure they know — `schmöcke`, `Finke`, `Eschtrich` — the pack
 * records the meaning they will wrongly reach for (`mistakenFor`), and that
 * meaning is offered as one of the options. Choosing it is the exact mistake
 * the word is on the list for, made safely, with the lesson on the next line.
 *
 * THE WORD IS SHOWN IN ITS SENTENCE when the pack has one, without the German
 * underneath — the German would print the answer. A word met in a sentence is
 * a word; a word met alone is a flashcard.
 *
 * Distractors are other words' glosses from the SAME group (verbs against
 * verbs), skipping any that could share an answer (`glossesOverlap`).
 */
export function meaningItems(pack: VarietyPack): QuestionItem[] {
  const vocabulary = pack.vocabulary ?? [];
  /**
   * NOT THE GREETINGS. «Ade», «Tschüss» and «Uf Widerluege» are glossed with
   * different German words that mean the same thing, and no rule over glosses
   * can tell a synonym from a distractor. Measured, not feared: the first run
   * offered «Tschüss» as a wrong answer for «Ade». The greetings stay in the
   * cards and the grid, which do not mark one gloss against another.
   */
  const eligible = vocabulary.filter((entry) => {
    if (entry.group === "greetings") return false;
    const target = entry.target.trim();
    const bridge = entry.bridge.trim();
    return target && bridge && !/\s/.test(target) && target.toLowerCase() !== bridge.toLowerCase();
  });

  const items: QuestionItem[] = [];
  for (const [index, entry] of eligible.entries()) {
    const trap = entry.mistakenFor?.trim();
    const group = eligible.filter((other) => other.group === entry.group && other !== entry);
    const chosen: string[] = trap ? [trap] : [];

    /**
     * Walk the group from a point that moves with the entry, so neighbours in
     * the list do not all get the same three distractors — twice: first only
     * glosses of the same KIND of word, then any.
     *
     * The same kind because a noun among verbs answers itself: offered
     * «Dachboden», «umziehen», «zuhören» and «Fussbodenbelag» for `Eschtrich`,
     * a reader discards the two verbs without reading the word. German writes
     * its nouns with a capital, so the gloss says which is which for free.
     *
     * A gloss with a comma in it — «wohl, doch», «eben, genau» — is a word
     * with several senses, and one of them may be the answer's. It can be an
     * answer; it is never offered as a wrong one.
     */
    const noun = (gloss: string) => /^\p{Lu}/u.test(gloss);
    for (const sameKind of [true, false]) {
      for (let step = 0; step < group.length && chosen.length < QUESTION_OPTIONS - 1; step++) {
        const other: VocabularyEntry = group[(index * 5 + step) % group.length]!;
        const gloss = other.bridge.trim();
        if (sameKind && noun(gloss) !== noun(entry.bridge.trim())) continue;
        if (gloss.includes(",")) continue;
        if (glossesOverlap(gloss, entry.bridge)) continue;
        if (chosen.some((c) => glossesOverlap(c, gloss))) continue;
        chosen.push(gloss);
      }
    }
    if (chosen.length < QUESTION_OPTIONS - 1) continue;

    const target = entry.target.trim();
    const id = `meaning:${target.toLowerCase()}`;
    const inSentence = entry.example && saysWord(entry.example.target, target) ? entry.example.target : undefined;

    items.push({
      id,
      kind: "meaning",
      marking: "objective",
      said: inSentence ?? target,
      focus: target,
      ...place(id, entry.bridge.trim(), chosen),
      optionsIn: "bridge",
      lesson: trap ? "false-friend" : "word",
      slots: { word: target, means: entry.bridge.trim(), ...(trap ? { trap } : {}) },
      source: { kind: "word", word: entry.target, group: entry.group },
    });
  }
  return items;
}

export const MEANING_KIND: ExerciseKind = {
  id: "meaning",
  answering: "tap",
  decisions: "one",
  marking: "objective",
  fromPack: true,
  generate: (m) => meaningItems(m.pack),
};
