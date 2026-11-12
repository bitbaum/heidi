import type { VarietyPack } from "../../../variety/pack.ts";
import type { SituationPack } from "../../../situations/pack.ts";
import { saysWord } from "../../../text/words.ts";
import type { CardItem } from "../types.ts";
import type { ExerciseKind, Material } from "./kind.ts";

/**
 * A word on one side, what it means on the other.
 *
 * THE MOST ORDINARY WAY ANYBODY LEARNS VOCABULARY, and it was the one thing
 * this product did not have. `recall` reveals a word the same way, but only
 * ever the learner's OWN kept words — so a new account had no cards at all,
 * and the eighty-three words the pack vouches for, with their articles and
 * their example sentences, were available only on a page you read.
 *
 * WHY A CARD IS WORTH ITS OWN KIND rather than being a nicer `recall`. Because
 * the two differ in the thing that matters: where the material comes from, and
 * therefore who can use it. `recall` is private — those words live in the
 * browser and the server has never seen them, which is why its kind says
 * `fromPack: false`. This one is the pack, so it is on the page the first time
 * anybody opens it. Merging them would mean one kind with two provenances and
 * two privacy stories, which is how a privacy claim stops being checkable.
 *
 * BOTH DIRECTIONS, RECOGNITION FIRST. §1 orders the skills: the direction a
 * message actually arrives in is dialect → meaning, and that is the direction
 * generated first, so a short run is all recognition. Production cards follow.
 * Neither is typed — a card is turned over, which is the whole appeal: it is
 * the fastest thing here, and somebody waiting for a tram can do thirty.
 *
 * THE ARTICLE IS PART OF THE WORD. `Huus` without `s` is half a fact, and the
 * half that is missing is the one a German reader gets wrong for years. An
 * entry with no checked article shows none — an absent article is honest and a
 * guessed one is a confident falsehood aimed at somebody who cannot detect it.
 *
 * THE WORDS HEARD MOST COME FIRST. Each card carries where its word stands by
 * how many lines of the situation scenes say it — the same count the
 * vocabulary page shows as "heard often". A word in seventeen of those lines
 * is met in the first week; a word in none may never be needed, and it used to
 * be as likely to be the first card as any other. Words no scene says keep the
 * order the pack lists them in.
 */
export function cardItems(pack: VarietyPack, situations: readonly SituationPack[] = []): CardItem[] {
  const recognise: CardItem[] = [];
  const produce: CardItem[] = [];

  const lines = situations.flatMap((domain) =>
    domain.situations.flatMap((scene) => scene.phrases.map((phrase) => phrase.target)),
  );
  const heard = (word: string) => lines.filter((line) => saysWord(line, word)).length;
  const standing = new Map(
    (pack.vocabulary ?? [])
      .map((entry, index) => ({ target: entry.target, index, heard: heard(entry.target.trim()) }))
      .sort((a, b) => b.heard - a.heard || a.index - b.index)
      .map((row, order) => [row.target, order]),
  );

  for (const entry of pack.vocabulary ?? []) {
    const target = entry.target.trim();
    const bridge = entry.bridge.trim();
    if (!target || !bridge) continue;

    /**
     * A card whose two sides are the same string is not a card.
     *
     * `Velo` glosses as `Velo` — it is the Swiss word, used on both sides of
     * the bridge, which is a genuinely useful thing to know and a completely
     * empty thing to be asked. The vocabulary page already makes that point in
     * prose, where it belongs.
     */
    if (target.toLowerCase() === bridge.toLowerCase()) continue;

    /**
     * Multi-word entries are example sentences promoted into the word list,
     * and a sentence on a flashcard is a different exercise — `translate` is
     * that exercise, and it asks the question properly.
     */
    if (target.includes(" ")) continue;

    const shared = {
      ...(entry.article ? { article: entry.article } : {}),
      ...(entry.example ? { example: entry.example } : {}),
      order: standing.get(entry.target) ?? 0,
      source: { kind: "word" as const, word: entry.target, group: entry.group },
    };

    recognise.push({
      id: `card:see:${target.toLowerCase()}`,
      kind: "card",
      marking: "self",
      direction: "recognise",
      prompt: target,
      answer: bridge,
      ...shared,
    });

    produce.push({
      id: `card:say:${target.toLowerCase()}`,
      kind: "card",
      marking: "self",
      direction: "produce",
      prompt: bridge,
      answer: target,
      ...shared,
    });
  }

  // Recognition before production, across the whole list rather than word by
  // word: interleaving them would put `Huus → house` next to `house → Huus`,
  // and the second one is then free.
  return [...recognise, ...produce];
}

export const CARD: ExerciseKind = {
  id: "card",
  answering: "card",
  decisions: "one",
  marking: "self",
  fromPack: true,
  generate: (material: Material) => cardItems(material.pack, material.situations),
};
