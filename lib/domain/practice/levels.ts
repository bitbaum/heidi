import type { SituationPack } from "../../situations/pack.ts";
import type { VarietyPack } from "../../variety/pack.ts";
import { closenessOf, levelOf, sentenceLevel, type Level } from "../vocabulary/distance.ts";
import type { PracticeItem } from "./types.ts";

/**
 * Every generated item's LEVEL — how far its Zurich German is from German
 * (`vocabulary/distance.ts`) — from the most specific evidence it has:
 *
 *   a word          the word's own closeness (`Chind` 2, `nöd` 3, `Estrich` 3)
 *   a scene line    the share of the line's words German does not give away
 *   a sound rule    2: by definition free once the rule is known
 *   a grammar topic the sentence it shows, when it shows one; otherwise the
 *                   topic's own band — "blocks" understanding (3) or only
 *                   "marks" a speaker (2). A topic never ranks 1: it exists
 *                   because it differs from German.
 *
 * Server-side, once, so the browser never needs the pack to know a level.
 */
export function withLevels(items: readonly PracticeItem[], pack: VarietyPack, situations: readonly SituationPack[]): PracticeItem[] {
  const rules = pack.correspondences;
  const words = new Map((pack.vocabulary ?? []).map((w) => [w.target, levelOf(closenessOf(w, rules))]));
  const topics = new Map((pack.grammar ?? []).map((t) => [t.id, (t.band === "blocks" ? 3 : 2) as Level]));
  const scenes = new Map(situations.flatMap((p) => p.situations).map((s) => [s.id, s]));

  const levelFor = (item: PracticeItem): Level | undefined => {
    const source = item.source;
    switch (source.kind) {
      case "word":
        return words.get(source.word);
      case "situation": {
        const phrase = source.line === undefined ? undefined : scenes.get(source.scene)?.phrases[source.line];
        if (phrase) return sentenceLevel(phrase.target, phrase.bridge, rules);
        // A passage is as hard as its hardest line.
        if (item.kind === "gaptext") {
          return Math.max(...item.lines.map((line) => sentenceLevel(line.prompt, line.bridge, rules))) as Level;
        }
        // A time or a price: the words around the number, against what they mean.
        if ("listen" in item && item.listen && item.said) return sentenceLevel(item.said, item.listen.means, rules);
        return undefined;
      }
      case "rule":
        return 2;
      case "grammar": {
        const pair = sentencesOf(item);
        if (pair) return Math.max(2, sentenceLevel(pair[0], pair[1], rules)) as Level;
        return topics.get(source.topic);
      }
      case "saved":
        return undefined;
    }
  };

  return items.map((item) => {
    const level = levelFor(item);
    return level ? ({ ...item, source: { ...item.source, level } } as PracticeItem) : item;
  });
}

/** The Zurich sentence and its German, where the item carries both. */
function sentencesOf(item: PracticeItem): [string, string] | null {
  switch (item.kind) {
    case "translate":
    case "build":
      return [item.answer, item.prompt];
    default:
      return null;
  }
}
