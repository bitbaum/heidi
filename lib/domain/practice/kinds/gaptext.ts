import type { SituationPack } from "../../../situations/pack.ts";
import { PASSAGE_GAPS, PASSAGE_LINES, type GapTextItem } from "../types.ts";
import { blank, blankable } from "./text.ts";
import type { ExerciseKind, Material } from "./kind.ts";

/**
 * A passage from a scene, with words taken out and offered back.
 *
 * WHERE THE PASSAGES COME FROM. Consecutive lines of a scene, in the order the
 * moment unfolds — which is the one property the situation packs have that
 * nothing else here does. A handover's four lines refer to each other; four
 * grammar examples do not refer to anything, so this kind is generated from
 * the scenes only. `cloze` remains what the grammar examples produce.
 *
 * WHICH LINES. Only the ones the learner HEARS, for the same reason `cloze`
 * filters them: production is not what this product asks for first. A scene is
 * cut into consecutive windows of four such lines, so a ten-line scene yields
 * two passages and no line appears in two of them.
 *
 * WHICH WORDS. `blankable` — the same rule every gapped exercise here uses,
 * living in `text.ts` precisely so a second copy cannot drift. The first three
 * lines that yield one get a gap; a window where fewer than three do is
 * dropped rather than shipped with two, because two gaps is a cloze with extra
 * steps.
 *
 * A REPEATED WORD DISQUALIFIES THE WINDOW. If two gaps would take the same
 * word out, the bank has that word once and both holes accept it — so the
 * answer key would mark one of two identical correct placements wrong. Cheaper
 * to skip the window than to explain that to somebody.
 */
export function gapTextItems(packs: readonly SituationPack[]): GapTextItem[] {
  const items: GapTextItem[] = [];

  for (const pack of packs) {
    for (const scene of pack.situations) {
      const heard = scene.phrases.filter((phrase) => phrase.direction === "hear");

      for (let start = 0; start + PASSAGE_LINES <= heard.length; start += PASSAGE_LINES) {
        const window = heard.slice(start, start + PASSAGE_LINES);

        const cut: { index: number; word: string }[] = [];
        for (const [index, phrase] of window.entries()) {
          if (cut.length >= PASSAGE_GAPS) break;
          const word = blankable(phrase.target, phrase.bridge);
          if (!word) continue;
          // Case-folded, because the bank shows one button and the passage
          // would accept it in either hole.
          if (cut.some((c) => c.word.toLowerCase() === word.toLowerCase())) continue;
          cut.push({ index, word });
        }

        if (cut.length < PASSAGE_GAPS) continue;

        const gapAt = new Map(cut.map((c, gap) => [c.index, { gap, word: c.word }]));
        const lines = window.map((phrase, index) => {
          const hole = gapAt.get(index);
          return hole
            ? { prompt: blank(phrase.target, hole.word), bridge: phrase.bridge, gap: hole.gap }
            : { prompt: phrase.target, bridge: phrase.bridge };
        });

        /**
         * The bank is a rotation of the removed words, never their order.
         *
         * Unrotated, the first button is always the first gap's answer and the
         * exercise is solved by reading downwards. A rotation by a non-zero
         * amount guarantees no word sits at its own gap's index, is derived
         * from the content so the board is reproducible, and needs no random
         * source — the same trick the matching grid uses.
         */
        const removed = cut.map((c) => c.word);
        const shift = 1 + (removed.join("").length % (PASSAGE_GAPS - 1));
        const bank = removed.map((_, i) => removed[(i + shift) % PASSAGE_GAPS]);
        const answer = removed.map((_, gap) => (gap - shift + PASSAGE_GAPS) % PASSAGE_GAPS);

        items.push({
          id: `gaptext:${scene.id}:${start / PASSAGE_LINES}`,
          kind: "gaptext",
          marking: "objective",
          lines,
          bank,
          answer,
          source: { kind: "situation", scene: scene.id },
        });
      }
    }
  }

  return items;
}

export const GAPTEXT: ExerciseKind = {
  id: "gaptext",
  marking: "objective",
  fromPack: true,
  generate: (material: Material) => gapTextItems(material.situations),
};
