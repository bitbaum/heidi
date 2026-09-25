import type { PracticeItem } from "./types.ts";
import { sceneById, scenesSayingWord, type DisplayPhrase } from "../../situations/display.ts";
import { DISPLAY } from "../../variety/display.ts";

/**
 * What can honestly be said about a question once it has been answered.
 *
 * WHY THIS EXISTS. Reported after a translate item: "when i answer questions,
 * i need to see explanations and be able to practice it. this is not an
 * explanation for that exercise." It was not. The only explanation in the
 * practice UI was one line — a grammar topic's title and rule — and it lived
 * inside the multiple-choice verdict. Translate, reveal and card never rendered
 * it at all, so the reporter, having typed a sentence about modal particles,
 * was told only that Zurich German has no fixed spelling.
 *
 * So the decision "what explains this item" is made here, once, as a pure
 * function over the item and the published packs — and every view renders
 * whatever it returns. Six render sites cannot drift from each other when
 * none of them decides anything.
 *
 * EVERYTHING HERE IS PACK DATA OR POINTS AT IT. Synonyms, opposites, other
 * ways to say a thing and a short text using a word were asked for too, and
 * none of them are in the packs — both packs are still `nativeReviewed:
 * false`, and inventing forty synonyms per word would be unreviewed content
 * presented as reference. Those go to Heidi on one tap instead, where the
 * answer arrives in the chat as the model's, not as the product's.
 */
export type Explanation = {
  /** A grammar topic id that explains the item. */
  topic?: string;
  /** The situation the item came from, and the line in its conversation. */
  scene?: {
    id: string;
    line?: number;
    before?: DisplayPhrase;
    phrase?: DisplayPhrase;
    after?: DisplayPhrase;
  };
  /** The vocabulary entry for the word the item is about, when there is one. */
  word?: (typeof DISPLAY.vocabulary)[number];
  /** Other situations the word is said in — its life outside this question. */
  saidIn: string[];
  /** The whole dialect sentence, un-blanked, when the item has one. */
  sentence?: string;
  /** The single word in focus, when the item has one. */
  term?: string;
};

const GAP = /_{2,}/;

function fold(s: string): string {
  return s.trim().toLocaleLowerCase();
}

/**
 * Which grammar topic explains this item.
 *
 * Source first, because it is the more specific claim: a cloze cut from
 * `am-progressive` is about `am-progressive`, whatever kind it is. An article
 * question came from a noun, but what explains it is the article system, which
 * the kind carries as `explains`.
 */
export function topicOf(item: PracticeItem): string | undefined {
  const source = item.source;
  if (source.kind === "grammar") return source.topic;
  if (source.kind === "situation") return source.topic;
  if (item.kind === "article") return item.explains;
  return undefined;
}

/** The word this item is about, if it is about one word. */
function termOf(item: PracticeItem): string | undefined {
  if (item.source.kind === "word") return item.source.word;
  switch (item.kind) {
    case "cloze":
      return item.answer;
    case "card":
      return item.prompt;
    case "article":
      return item.noun;
    case "form":
      return item.word;
    case "pick":
      return item.options[item.answer];
    case "pair":
      // Asked either way round: "which is the Zurich form" or "which is the
      // Standard German one". The dialect word is the answer in the first case
      // and the OTHER option in the second — both are about the same word.
      return item.variety === "target" ? item.options[item.answer] : item.options[item.answer === 0 ? 1 : 0];
    default:
      return undefined;
  }
}

/** The full dialect sentence, with any gap filled back in. */
function sentenceOf(item: PracticeItem, phrase: DisplayPhrase | undefined): string | undefined {
  if (phrase) return phrase.target;
  switch (item.kind) {
    case "cloze":
      return GAP.test(item.prompt) ? item.prompt.replace(GAP, item.answer) : item.prompt;
    case "translate":
      return item.answer;
    case "recall":
      return item.prompt;
    default:
      return undefined;
  }
}

export function explanationFor(item: PracticeItem): Explanation {
  const out: Explanation = { saidIn: [] };

  const topic = topicOf(item);
  if (topic) out.topic = topic;

  let phrase: DisplayPhrase | undefined;
  if (item.source.kind === "situation") {
    const scene = sceneById(item.source.scene);
    if (scene) {
      const line = item.source.line;
      out.scene = { id: scene.id };
      if (line !== undefined && scene.phrases[line]) {
        phrase = scene.phrases[line];
        out.scene = {
          id: scene.id,
          line,
          before: scene.phrases[line - 1],
          phrase,
          after: scene.phrases[line + 1],
        };
      }
    }
  }

  const sentence = sentenceOf(item, phrase);
  if (sentence) out.sentence = sentence;

  const term = termOf(item);
  if (term && term.trim()) {
    out.term = term.trim();
    const entry = DISPLAY.vocabulary.find((w) => fold(w.target) === fold(term));
    if (entry) out.word = entry;
    out.saidIn = scenesSayingWord(term)
      .map((s) => s.id)
      .filter((id) => id !== out.scene?.id)
      .slice(0, 3);
  }

  return out;
}

/** True when there is nothing at all to show — the case this exists to end. */
export function isEmpty(e: Explanation): boolean {
  return !e.topic && !e.scene && !e.word && !e.sentence && !e.term;
}
