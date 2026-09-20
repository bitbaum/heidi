import type { VarietyPack, VarietyRule } from "../../variety/pack.ts";
import { bridgeRules } from "../../variety/bridge.ts";
import type { SituationPack } from "../../situations/pack.ts";
import type { SavedWord } from "../saved/types.ts";
import {
  ARTICLES,
  MIN_FORMS_TO_ASK,
  type ArticleItem,
  type ClozeItem,
  type FormItem,
  type PairItem,
  type PracticeItem,
  type RecallItem,
} from "./types.ts";

/**
 * Turning a variety pack and a learner's own words into things to be asked.
 *
 * NOTHING HERE INVENTS LANGUAGE. Every item is assembled from material the pack
 * already vouches for — a rule the gate enforces, an example a grammar topic
 * carries, a word the learner kept. That constraint is what lets practice exist
 * at all in a product that refuses to let a model be the authority on dialect:
 * the exercises are a rearrangement of checked content, not new content.
 *
 * It also means practice grows exactly as fast as the pack does, which is the
 * honest coupling. A pack with four grammar topics cannot produce forty
 * distinct grammar questions, and generating forty by paraphrase would be
 * inventing forms at the one person who cannot tell.
 *
 * Pure and deterministic: the same inputs and the same seed give the same
 * session, so a test can assert what a learner sees.
 */

/**
 * Only rules that name BOTH halves can become a question.
 *
 * A rule that only says "this form is foreign" is useful to a checker and
 * useless here: an exercise needs the right answer, not just the wrong one. So
 * `suggest` is required, and the rules without it simply produce no items
 * rather than a question with one option.
 *
 * `match` must be a literal string too. A RegExp rule matches a pattern, and a
 * pattern cannot be shown to a learner as a word — `display` exists precisely
 * because a page once printed a lookahead assertion at somebody.
 */
export function pairItems(pack: VarietyPack): PairItem[] {
  return [
    ...fromRules(pack.rules, "target"),
    /**
     * The sibling's rules are the other half, and arguably the more useful.
     *
     * The pack says it best: somebody who writes a careful German email asking
     * about a *Fahrrad* "has written perfect German and marked themselves as
     * foreign in the first line, and no amount of care on their part would have
     * caught it". That is the definition of a thing worth drilling — an error
     * the learner cannot detect, with a right answer this product can prove.
     */
    ...fromRules(bridgeRules(pack), "bridge"),
  ];
}

function fromRules(rules: readonly VarietyRule[], variety: "target" | "bridge"): PairItem[] {
  const items: PairItem[] = [];

  for (const rule of rules) {
    if (typeof rule.match !== "string") continue;
    const wrong = rule.match.trim();
    const right = rule.suggest?.trim();
    if (!wrong || !right || wrong.toLowerCase() === right.toLowerCase()) continue;

    /**
     * The correct answer's position is decided by the CONTENT, not by a
     * random number: a shuffled position would make the session
     * non-reproducible and, worse, could put the answer on the same side
     * several times in a row by chance. Alternating on a stable property of
     * the pair keeps it unpredictable to a learner and fixed for a test.
     */
    const answer: 0 | 1 = right.length % 2 === 0 ? 0 : 1;
    const options: [string, string] = answer === 0 ? [right, wrong] : [wrong, right];

    items.push({
      id: `pair:${variety}:${wrong.toLowerCase()}`,
      kind: "pair",
      marking: "objective",
      variety,
      options,
      answer,
      ...(rule.origin ? { origin: rule.origin } : {}),
      source: { kind: "rule", rule: wrong },
    });
  }

  return items;
}

/**
 * A blank cut into a grammar example.
 *
 * WHICH WORD IS REMOVED is the whole difficulty. Blanking a random token
 * produces "Ich ___ geschter hei gange", which tests nothing the topic is
 * about. The word worth removing is the one that carries the contrast — and
 * the pack already encodes that contrast as a pair of sentences, so it can be
 * found rather than guessed: take the target words that do not appear in the
 * bridge sentence, and blank the last of them.
 *
 * The LAST rather than the first, because in a verb-final structure — which is
 * what most of these topics are about — the word that German readers wait for
 * and never get is at the end. `gange`, not `bi`.
 *
 * When no word is unique to the target the example teaches nothing by
 * contrast, and it produces no item instead of a bad one.
 */
export function clozeItems(pack: VarietyPack): ClozeItem[] {
  const items: ClozeItem[] = [];

  for (const topic of pack.grammar ?? []) {
    for (const example of topic.examples) {
      const bridgeWords = words(example.bridge).map((w) => w.toLowerCase());
      const unique = words(example.target).filter((w) => !giveaway(w, bridgeWords));
      const answer = unique[unique.length - 1];
      // A one-letter difference is a spelling variant, not a contrast worth
      // asking about.
      if (!answer || answer.length < 2) continue;

      items.push({
        id: `cloze:${topic.id}:${answer.toLowerCase()}`,
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
 * A blank cut into a line from a scene.
 *
 * THE SAME MACHINERY AS THE GRAMMAR CLOZE, deliberately — same `giveaway`
 * test, same "blank the last word the bridge does not hand you", same refusal
 * to produce an item when the contrast is not there. Writing a second,
 * subtly-different blanking rule for situations is how the two would drift
 * until one of them started printing answers next to its own questions.
 *
 * WHAT IS DIFFERENT IS WHICH LINES QUALIFY: only the ones the learner HEARS.
 * A `say` line is something they may need to produce, and asking them to
 * produce a word from it is a reasonable exercise for a different product.
 * This one puts comprehension first, and an item that drills production of a
 * sentence nobody has yet learned to recognise is the order reversed.
 *
 * It also keeps practice honest about its coupling: situations grow the number
 * of questions exactly as fast as somebody writes checked lines, which is the
 * same constraint the rest of this file already lives under.
 */
export function situationItems(packs: readonly SituationPack[]): ClozeItem[] {
  const items: ClozeItem[] = [];

  for (const pack of packs) {
    for (const scene of pack.situations) {
      for (const phrase of scene.phrases) {
        if (phrase.direction !== "hear") continue;

        const bridgeWords = words(phrase.bridge).map((w) => w.toLowerCase());
        const unique = words(phrase.target).filter((w) => !giveaway(w, bridgeWords));
        const answer = unique[unique.length - 1];
        if (!answer || answer.length < 2) continue;

        items.push({
          id: `cloze:${scene.id}:${answer.toLowerCase()}`,
          kind: "cloze",
          marking: "self",
          prompt: blank(phrase.target, answer),
          answer,
          bridge: phrase.bridge,
          source: { kind: "situation", scene: scene.id },
        });
      }
    }
  }

  return items;
}

/** The learner's own words, asked dialect-first. */
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

/**
 * Which article a noun takes.
 *
 * Only for entries that actually declare one. A noun whose gender nobody has
 * checked produces no item rather than a guess — the schema keeps `article`
 * optional precisely so that absence stays expressible, and an exercise that
 * quietly filled the gap would be the one place the product invents language.
 */
export function articleItems(pack: VarietyPack): ArticleItem[] {
  const items: ArticleItem[] = [];

  for (const entry of pack.vocabulary ?? []) {
    const article = entry.article;
    if (!article) continue;

    const answer = ARTICLES.indexOf(article);
    if (answer < 0) continue;

    items.push({
      id: `article:${entry.target.toLowerCase()}`,
      kind: "article",
      marking: "objective",
      noun: entry.target,
      bridge: entry.bridge,
      options: ARTICLES,
      answer: answer as 0 | 1 | 2,
      source: { kind: "word", word: entry.target },
    });
  }

  return items;
}

/**
 * Which form goes with which person.
 *
 * One item per form, so a verb with four forms is four questions rather than
 * one — the paradigm is the thing being learned, and asking about only its
 * first row teaches the first row.
 *
 * The distractors are the verb's own other forms. That is the whole reason
 * this can be marked objectively without inventing anything: a wrong option is
 * a real form of the same verb, sitting in the wrong row.
 */
export function formItems(pack: VarietyPack): FormItem[] {
  const items: FormItem[] = [];

  for (const entry of pack.vocabulary ?? []) {
    const forms = entry.forms ?? [];
    // Two options is a coin toss and one is not a question.
    if (forms.length < MIN_FORMS_TO_ASK) continue;

    const options = forms.map((f) => f.target);

    for (const [index, form] of forms.entries()) {
      items.push({
        id: `form:${entry.target.toLowerCase()}:${form.label}`,
        kind: "form",
        marking: "objective",
        word: entry.target,
        bridge: entry.bridge,
        label: form.label,
        options,
        answer: index,
        source: { kind: "word", word: entry.target },
      });
    }
  }

  return items;
}

/**
 * Everything that could be asked, before a session decides what to ask.
 *
 * `situations` is a parameter with a default rather than something read from
 * the active registry, for the reason the rest of this file is pure: the same
 * inputs give the same session, and a module that reached out to a singleton
 * for half its material would make that untestable. `published.ts` is the one
 * place that knows which packs this deployment carries, and it passes them.
 */
export function allItems(
  pack: VarietyPack,
  saved: readonly SavedWord[],
  situations: readonly SituationPack[] = [],
): PracticeItem[] {
  return [
    ...pairItems(pack),
    ...articleItems(pack),
    ...formItems(pack),
    ...clozeItems(pack),
    ...situationItems(situations),
    ...recallItems(saved),
  ];
}

/**
 * Whether the clue already hands the learner this word.
 *
 * Not just "does the bridge sentence contain it" — `ha` is absent from
 * "Die Frau, die ich gesehen habe" as a WORD and completely given away by
 * `habe`. A learner reading the clue produces it from the cognate without
 * knowing the structure the topic is about, which makes the item look answered
 * and teach nothing.
 *
 * AND THE TEST IS ASYMMETRIC, which took seeing the output to get right. The
 * first version refused a prefix match in either direction and killed the best
 * item in the pack: for `diminutive-li` it blanked the ARTICLE in
 * "Machsch es Bierli?" because `Bierli` extends the clue's `Bier` — which is
 * not a giveaway, it is the entire lesson.
 *
 *   the clue CONTAINS the answer   `habe` ⊃ `ha`      → refuse, it is readable
 *   the answer EXTENDS the clue    `Bierli` ⊃ `Bier`  → keep, that is the point
 *
 * So: refused whenever a bridge word CONTAINS the candidate, never when the
 * candidate contains the bridge word.
 *
 * `startsWith` was the first version of "contains" and it was too narrow.
 * German puts the giveaway in the middle as readily as at the front: the clue
 * "Sie ist schauen gegangen" hands a learner `gange` inside `gegangen`, where
 * no prefix test can see it. German participles take `ge-`, so this is not an
 * edge case but the normal shape of the language this product bridges from.
 *
 * It over-refuses on very short words — a two-letter candidate will hide
 * inside some unrelated German word sooner or later — and that is the right
 * direction to fail in. Over-refusing costs one item out of a pack with
 * plenty; under-refusing ships a question whose answer is printed underneath
 * it.
 */
function giveaway(word: string, bridgeWords: readonly string[]): boolean {
  const w = word.toLowerCase();
  return bridgeWords.some((b) => b.includes(w));
}

/**
 * Words, Unicode-aware, with punctuation dropped.
 *
 * `\p{L}` rather than `\w`: `\w` is ASCII, and half the words in this language
 * carry an umlaut. Apostrophes are kept inside a word so `z'spöt` stays one
 * token rather than becoming two, one of which is a letter.
 */
function words(sentence: string): string[] {
  return sentence.match(/[\p{L}’']+/gu) ?? [];
}

/** Replace one word with a blank, leaving the punctuation around it. */
/**
 * EVERY occurrence, not the first.
 *
 * Without the `g` this cut one blank into «Mir händ, ihr händ, si händ.» and
 * left the answer standing twice in the same line — an exercise that shows its
 * own answer, which is worse than no exercise because it reads as one.
 *
 * Blanking all of them is also the better question where a word repeats: the
 * unified plural is exactly the topic whose point is that one form serves
 * three persons, and «Mir ____, ihr ____, si ____» against «Wir haben, ihr
 * habt, sie haben» is that point in a single line.
 */
function blank(sentence: string, word: string): string {
  return sentence.replace(new RegExp(`(?<![\\p{L}])${escape(word)}(?![\\p{L}])`, "gu"), "____");
}

function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The sentence a word is shown in — a generated example first, falling back to
 * where it was found.
 *
 * Same rule the review panel uses, and for the same reason: a word met only
 * ever in one sentence is learned attached to that sentence.
 */
function sentenceFor(word: SavedWord): string | undefined {
  const examples = word.examples ?? [];
  if (examples.length > 0) {
    const seen = typeof word.step === "number" && Number.isFinite(word.step) ? Math.max(0, Math.trunc(word.step)) : 0;
    return examples[seen % examples.length];
  }
  return word.context;
}
