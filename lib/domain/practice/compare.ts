import { distance } from "../saved/patterns.ts";

/**
 * Which words of the pack's line are missing from what the learner typed.
 *
 * NOT A SPELLING CHECK, and it must never become one. §6: Zurich German has no
 * official orthography, so this product never tells anybody their spelling is
 * wrong — and a word-level comparison is the easiest way to break that
 * promise by accident, because «Ebe» and «Äbe» are different strings.
 *
 * So two words count as the same word when they are close: case and
 * diacritics folded away, then within a small edit distance scaled to the
 * word's length. «Ebe» against «Äbe» is one edit — the same word. What is
 * left is what was genuinely not there: the reporter wrote «Ebe, das han ich
 * gmeint» against «Äbe, gnau das han ich gmeint», was told only that spelling
 * is free, and was never shown that «gnau» was missing. That is content, not
 * spelling, and the learner is entitled to see it.
 *
 * Reuses `distance` from `lib/domain/saved/patterns.ts` rather than a second
 * edit-distance function.
 */
const WORD = /[\p{L}']+/gu;

function fold(w: string): string {
  return w.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();
}

/** How far apart two words may be and still be one word spelled two ways. */
function tolerance(word: string): number {
  return Math.max(1, Math.floor(word.length / 3));
}

export function missingWords(typed: string, target: string): string[] {
  const mine = (typed.match(WORD) ?? []).map(fold);
  if (mine.length === 0) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const word of target.match(WORD) ?? []) {
    const f = fold(word);
    if (f.length < 2 || seen.has(f)) continue;
    seen.add(f);
    if (!mine.some((m) => distance(m, f) <= tolerance(f))) out.push(word);
  }
  return out;
}
