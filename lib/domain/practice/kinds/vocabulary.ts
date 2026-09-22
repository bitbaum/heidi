import type { VarietyPack } from "../../../variety/pack.ts";
import { ARTICLES, MATCH_SIZE, MIN_FORMS_TO_ASK, type ArticleItem, type FormItem, type MatchItem } from "../types.ts";
import type { ExerciseKind, Material } from "./kind.ts";

/**
 * The three kinds the word list can ask, in one module.
 *
 * TOGETHER RATHER THAN THREE FILES, and the rule is worth stating because the
 * registry makes one-file-per-kind cheap enough to overdo: these three read
 * the SAME field of the SAME entries, and a change to what a vocabulary entry
 * is touches all three at once. Splitting them would mean three files that can
 * only ever be edited together, which is the copy-paste failure wearing the
 * costume of modularity. `pair` is separate because it reads the RULES, and
 * `cloze` because it reads the grammar examples.
 */

/**
 * Which article a noun takes.
 *
 * OBJECTIVE, and one of only two kinds that can be: the answer set is closed
 * at three and the answer itself is a field in the pack, so nothing is
 * inferred. It is also the error a German reader is least able to avoid —
 * gender is carried by a word they never had to learn, so *der Velo* survives
 * a hundred correct readings of the noun.
 *
 * Only for entries that actually declare one. A noun whose gender nobody has
 * checked produces no item rather than a guess.
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
      source: { kind: "word", word: entry.target, group: entry.group },
    });
  }

  return items;
}

/**
 * Which form of the verb goes with this person.
 *
 * OBJECTIVE, and the distractors are what make it so: they are the SAME verb's
 * other forms, taken from the pack. A learner choosing between `bi`, `bisch`
 * and `isch` is doing the thing a paradigm is for — nothing is invented to
 * distract them, which is where a generated drill would otherwise start
 * writing the language.
 *
 * One item per form, so a verb with four forms is four questions rather than
 * one: the paradigm is the thing being learned, and asking only about its
 * first row teaches the first row.
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
        subject: pack.subjects?.[form.label],
        options,
        answer: index,
        source: { kind: "word", word: entry.target, group: entry.group },
      });
    }
  }

  return items;
}

/**
 * Four words and four meanings, joined up.
 *
 * WHICH FOUR, and it is decided rather than sampled. The vocabulary is already
 * grouped by what kind of word each one is, and a grid drawn from ONE group is
 * a better question than a grid drawn from all of them: four function words
 * next to each other force an actual discrimination, while `nöd` beside
 * `Rüebli` is answered by the shape of the word. So each group is cut into
 * consecutive fours, in pack order, and a remainder of one to three is simply
 * not asked — a grid of two is a coin toss with extra steps.
 *
 * THE SHUFFLE IS A ROTATION, which is the trick that keeps this pure. A random
 * permutation would make the board irreproducible, and an unshuffled one puts
 * every answer on the diagonal. Rotating by a non-zero amount is guaranteed to
 * leave NO pair in its own row — a derangement, for free, with no rejection
 * loop — and the amount is derived from the content.
 *
 * Entries whose two halves are the same string are skipped before the cut: a
 * row reading `Frau → Frau` is not a question. So are multi-word targets,
 * which in this pack are example sentences promoted into the list.
 */
export function matchItems(pack: VarietyPack): MatchItem[] {
  const items: MatchItem[] = [];
  const groups = new Map<string, { target: string; bridge: string }[]>();

  for (const entry of pack.vocabulary ?? []) {
    const target = entry.target.trim();
    const bridge = entry.bridge.trim();
    if (!target || !bridge || target.toLowerCase() === bridge.toLowerCase()) continue;
    if (/\s/.test(target)) continue;
    const bucket = groups.get(entry.group) ?? [];
    bucket.push({ target, bridge });
    groups.set(entry.group, bucket);
  }

  for (const [group, entries] of groups) {
    for (let start = 0; start + MATCH_SIZE <= entries.length; start += MATCH_SIZE) {
      const four = entries.slice(start, start + MATCH_SIZE);
      const targets = four.map((e) => e.target);
      const meanings = four.map((e) => e.bridge);

      // 1, 2 or 3 — never 0, which would put every answer on the diagonal.
      const shift = 1 + (targets.join("").length % (MATCH_SIZE - 1));
      const bridges = meanings.map((_, j) => meanings[(j + shift) % MATCH_SIZE]);
      const answer = meanings.map((_, i) => (i - shift + MATCH_SIZE) % MATCH_SIZE);

      items.push({
        id: `match:${group}:${start / MATCH_SIZE}`,
        kind: "match",
        marking: "objective",
        targets,
        bridges,
        answer,
        source: { kind: "word", word: targets[0], group },
      });
    }
  }

  return items;
}

export const ARTICLE: ExerciseKind = {
  id: "article",
  answering: "tap",
  decisions: "one",
  marking: "objective",
  fromPack: true,
  generate: (material: Material) => articleItems(material.pack),
};

export const FORM: ExerciseKind = {
  id: "form",
  answering: "tap",
  decisions: "one",
  marking: "objective",
  fromPack: true,
  generate: (material: Material) => formItems(material.pack),
};

export const MATCH: ExerciseKind = {
  id: "match",
  answering: "tap",
  decisions: "several",
  marking: "objective",
  fromPack: true,
  generate: (material: Material) => matchItems(material.pack),
};
