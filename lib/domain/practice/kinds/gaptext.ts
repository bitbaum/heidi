import type { SituationPack } from "../../../situations/pack.ts";
import { PASSAGE_GAPS, PASSAGE_LINES, type GapTextItem } from "../types.ts";
import { blank, blankable, words } from "./text.ts";
import { saysWord } from "../../../text/words.ts";
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
 *
 * ONE WORD TOO MANY. With three words for three gaps the last gap fills
 * itself: whatever is left goes in, read or not. So the bank carries a fourth
 * word that belongs nowhere — taken out of a line of ANOTHER passage of the
 * same domain, so it is the same register and the same kind of word (the last
 * word German does not give away). It is refused if the passage says it, if it
 * is one of the answers, or if the German of its own line shares a content
 * word with the German of a gapped line: a word that might mean what an answer
 * means is not a wrong answer. A passage with no such word is dropped.
 *
 * THE GERMAN UNDER EACH LINE IS WHAT MAKES IT OBJECTIVE, as it is for `pick`.
 * «Ich cha das ____» takes `sälber` and would take `nüme` just as well; only
 * «Ich kann das selber» says which. Measured on the generated passages before
 * deciding: without the German, two of the three answers are often
 * interchangeable too («Mir tuet de ____ weh» / «Es zieht mer im ____»). So
 * the view may not hide it while the gaps are open.
 */
export function gapTextItems(packs: readonly SituationPack[]): GapTextItem[] {
  const items: GapTextItem[] = [];

  for (const pack of packs) {
    // Every word this domain's heard lines would give up, with the German of
    // the line it came from: where the extra word is drawn from.
    const spare: { word: string; bridge: string; scene: string }[] = [];
    for (const scene of pack.situations) {
      for (const phrase of scene.phrases) {
        if (phrase.direction !== "hear") continue;
        const word = blankable(phrase.target, phrase.bridge);
        if (word) spare.push({ word, bridge: phrase.bridge, scene: scene.id });
      }
    }

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
        const rotated = removed.map((_, i) => removed[(i + shift) % PASSAGE_GAPS]!);
        const key = removed.map((_, gap) => (gap - shift + PASSAGE_GAPS) % PASSAGE_GAPS);

        const extra = extraWord(spare, scene.id, window, cut, removed.join("").length);
        if (!extra) continue;

        // Where the extra word sits is decided by the content too: the first
        // slot, from a point that moves with the passage, that leaves no word
        // at its own gap. Every answer at or after the slot moves one along;
        // the last slot moves none, so there always is one.
        let bank: string[] = [];
        let answer: number[] = [];
        for (let turn = 0; turn <= PASSAGE_GAPS; turn++) {
          const slot = (removed.join("").length + start + turn) % (PASSAGE_GAPS + 1);
          bank = [...rotated.slice(0, slot), extra, ...rotated.slice(slot)];
          answer = key.map((index) => (index >= slot ? index + 1 : index));
          if (answer.every((bankIndex, gap) => bankIndex !== gap)) break;
        }

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

const content = (sentence: string) =>
  words(sentence)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length >= 4);

/**
 * The word that belongs in no gap — see "ONE WORD TOO MANY" above.
 *
 * Walks the domain's spare words from a point that moves with the passage, so
 * neighbouring passages do not all get the same one.
 */
function extraWord(
  spare: readonly { word: string; bridge: string; scene: string }[],
  scene: string,
  window: readonly { target: string; bridge: string }[],
  cut: readonly { index: number; word: string }[],
  seed: number,
): string | undefined {
  const answers = new Set(cut.map((c) => c.word.toLowerCase()));
  const gapped = new Set(cut.flatMap((c) => content(window[c.index]!.bridge)));
  for (let step = 0; step < spare.length; step++) {
    const candidate = spare[(seed * 7 + step) % spare.length]!;
    if (candidate.scene === scene) continue;
    if (answers.has(candidate.word.toLowerCase())) continue;
    if (window.some((line) => saysWord(line.target, candidate.word))) continue;
    if (content(candidate.bridge).some((w) => gapped.has(w))) continue;
    return candidate.word;
  }
  return undefined;
}

export const GAPTEXT: ExerciseKind = {
  id: "gaptext",
  answering: "tap",
  decisions: "several",
  marking: "objective",
  fromPack: true,
  generate: (material: Material) => gapTextItems(material.situations),
};
