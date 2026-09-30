import { SCENES } from "../../situations/display.ts";
import { DISPLAY } from "../../variety/display.ts";
import { saysWord } from "../../text/words.ts";
import { PACK_ITEMS } from "./published.ts";
import { itemsInScope, type Scope } from "./scope.ts";
import type { PracticeItem } from "./types.ts";

/**
 * The questions a sitting draws on: its scope, and — for a scene — the words
 * said in it.
 *
 * WHY A SCENE TAKES ITS WORDS. A scene's own items are its sentences: the gap,
 * the gist, the reply, the passage. The words those sentences are made of —
 * «nöd», «grad», «Znüni» — are vocabulary items with a group and no scene, so
 * "practise the handover" never asked what «grad» means, although it is said
 * three times in it. The join already exists (`scenesSayingWord`, the
 * vocabulary page's "said in"); this is that join read from the scene's side,
 * so a scene's sitting is words, sentences and expressions together.
 *
 * WHOLE WORDS, by the same rule as the vocabulary page: `si` is not said in
 * «isch».
 *
 * SERVER-SIDE ONLY. `scope.ts` travels to the browser with the chooser; the
 * packs must not travel with it.
 */
export function sittingPool(scope: Scope, items: readonly PracticeItem[] = PACK_ITEMS): PracticeItem[] {
  const own = itemsInScope(items, scope);
  if (scope.kind !== "scene") return own;
  const scene = SCENES.find((s) => s.id === scope.id);
  if (!scene) return own;

  const said = new Map<string, boolean>();
  const saidHere = (word: string) => {
    let hit = said.get(word);
    if (hit === undefined) {
      hit = scene.phrases.some((phrase) => saysWord(phrase.target, word));
      said.set(word, hit);
    }
    return hit;
  };
  return [...own, ...items.filter((item) => item.source.kind === "word" && saidHere(item.source.word))];
}

/**
 * The scenes and topics a sitting can be opened on, for the quick start: a
 * button that opened an empty sitting would be worse than one that opened
 * the general drill. Depends only on the packs, so it is computed once.
 */
export const PRACTISABLE: { scene: readonly string[]; topic: readonly string[] } = {
  scene: SCENES.filter((s) => sittingPool({ kind: "scene", id: s.id }).length > 0).map((s) => s.id),
  topic: DISPLAY.grammar
    .filter((t) => sittingPool({ kind: "topic", id: t.id }).length > 0)
    .map((t) => t.id),
};
