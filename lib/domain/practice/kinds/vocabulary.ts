import { SAME_GENDER, type VarietyPack } from "../../../variety/pack.ts";
import {
  ARTICLES,
  AUXILIARY_SIZE,
  MATCH_SIZE,
  MIN_FORMS_TO_ASK,
  type ArticleItem,
  type AuxiliaryItem,
  type FormItem,
  type MatchItem,
} from "../types.ts";
import type { ExerciseKind, Material } from "./kind.ts";

/**
 * The four kinds the word list can ask, in one module.
 *
 * TOGETHER RATHER THAN FOUR FILES, and the rule is worth stating because the
 * registry makes one-file-per-kind cheap enough to overdo: these four read
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
 *
 * AND ONLY WHERE THE GERMAN DIFFERS. «Wele Artikel ghört dezue? ___ Ässe
 * (Essen)» was reported as a bad question, fairly: das Essen, so s Ässe, and
 * no Zurich German was needed. 32 of 37 nouns were like that. The mapping
 * der→de, die→d, das→s is the articles lesson; the drill is for s Tram, s
 * Billett, s Grosi, s Säckli and d Chilbi, where a German reader's instinct
 * is wrong.
 */
export function articleItems(pack: VarietyPack): ArticleItem[] {
  const items: ArticleItem[] = [];

  for (const entry of pack.vocabulary ?? []) {
    const article = entry.article;
    if (!article || !entry.bridgeArticle || SAME_GENDER[entry.bridgeArticle] === article) continue;

    const answer = ARTICLES.indexOf(article);
    if (answer < 0) continue;

    items.push({
      id: `article:${entry.target.toLowerCase()}`,
      kind: "article",
      marking: "objective",
      noun: entry.target,
      bridge: entry.bridge,
      ...(pack.explains?.article ? { explains: pack.explains.article } : {}),
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
 *
 * Each distinct form is offered once. `ich cha` and `er cha` are the same
 * string, and offering it twice would make one of two identical buttons wrong.
 * The `past` row is not asked here: «hät gmacht» beside four one-word present
 * forms is picked by its length, not by knowing the verb.
 */
export function formItems(pack: VarietyPack): FormItem[] {
  const items: FormItem[] = [];
  const topicOf = new Map((pack.grammar ?? []).flatMap((t) => (t.words ?? []).map((w) => [w, t.id] as const)));

  for (const entry of pack.vocabulary ?? []) {
    const explains = topicOf.get(entry.target);
    const forms = (entry.forms ?? []).filter((f) => f.label !== "past");
    const options = [...new Set(forms.map((f) => f.target))];
    // Two options is a coin toss and one is not a question.
    if (options.length < MIN_FORMS_TO_ASK) continue;

    for (const form of forms) {
      items.push({
        id: `form:${entry.target.toLowerCase()}:${form.label}`,
        kind: "form",
        marking: "objective",
        word: entry.target,
        bridge: entry.bridge,
        label: form.label,
        subject: pack.subjects?.[form.label],
        ...(explains ? { explains } : {}),
        options,
        answer: options.indexOf(form.target),
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

/**
 * Four verbs, each sorted into `isch` or `hät` — see `AuxiliaryItem`.
 *
 * The rows come from the `past` forms, which carry the auxiliary first
 * («isch gange»), so the answer key is a split of pack data.
 *
 * EVERY FOUR MIXES BOTH. Taken in pack order the fours would be mostly all
 * `hät`, because most verbs are, and a board with one right answer for every
 * row teaches nothing about the choice. So each four takes one or two verbs of
 * the rarer auxiliary (alternating) and fills up from the commoner one; the
 * rows are rotated by a content-derived amount so the rare one does not always
 * sit on top. Commoner verbs left over when the rarer list runs out are not
 * asked here — the form row in the vocabulary still shows them.
 */
export function auxiliaryItems(pack: VarietyPack): AuxiliaryItem[] {
  const byAux = new Map<string, { word: string; bridge: string; participle: string; group: string }[]>();
  for (const entry of pack.vocabulary ?? []) {
    const past = entry.forms?.find((f) => f.label === "past")?.target.trim();
    const space = past?.indexOf(" ") ?? -1;
    if (!past || space < 1) continue;
    const aux = past.slice(0, space);
    const list = byAux.get(aux) ?? [];
    list.push({ word: entry.target, bridge: entry.bridge, participle: past.slice(space + 1), group: entry.group });
    byAux.set(aux, list);
  }

  const options = [...byAux.keys()].sort((a, b) => a.localeCompare(b));
  if (options.length !== 2) return [];
  const [rare, common] = [...options].sort((a, b) => byAux.get(a)!.length - byAux.get(b)!.length);
  const rareVerbs = [...byAux.get(rare)!];
  const commonVerbs = [...byAux.get(common)!];

  const items: AuxiliaryItem[] = [];
  for (let n = 0; rareVerbs.length > 0; n++) {
    const take = Math.min(n % 2 === 0 ? 1 : 2, rareVerbs.length);
    if (commonVerbs.length < AUXILIARY_SIZE - take) break;
    const four = [
      ...rareVerbs.splice(0, take).map((v) => ({ ...v, aux: rare })),
      ...commonVerbs.splice(0, AUXILIARY_SIZE - take).map((v) => ({ ...v, aux: common })),
    ];
    const shift = four.map((v) => v.word).join("").length % AUXILIARY_SIZE;
    const rows = four.map((_, i) => four[(i + shift) % AUXILIARY_SIZE]);

    items.push({
      id: `auxiliary:${rows.map((v) => v.word.toLowerCase()).join("-")}`,
      kind: "auxiliary",
      marking: "objective",
      subject: pack.subjects?.er,
      verbs: rows.map(({ word, bridge, participle }) => ({ word, bridge, participle })),
      options,
      answer: rows.map((v) => options.indexOf(v.aux)),
      ...(pack.explains?.auxiliary ? { explains: pack.explains.auxiliary } : {}),
      source: { kind: "word", word: rows[0].word, group: rows[0].group },
    });
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

export const AUXILIARY: ExerciseKind = {
  id: "auxiliary",
  answering: "tap",
  decisions: "several",
  marking: "objective",
  fromPack: true,
  generate: (material: Material) => auxiliaryItems(material.pack),
};
