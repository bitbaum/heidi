import { distance } from "../saved/patterns.ts";

/**
 * Which words of the pack's line are missing from what the learner typed, and
 * which were typed as a different form rather than a different spelling.
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
/**
 * Letters only: an apostrophe separates words. «D'Chatz» is the article and
 * the noun, and read as one word it made «Chatz» look missing from an answer
 * that had it.
 */
const WORD = /\p{L}+/gu;

function fold(w: string): string {
  return w.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();
}

/**
 * The same word written another way collapses to one key: «ä» and «e»
 * («Äbe»/«Ebe»), «sch» and «sh», «ie», «y» and «i», doubled letters
 * («gsii»/«gsi»). What still differs after this is a different vowel or a
 * missing ending — «schlof» against «schlaft» — which is a different FORM,
 * and the learner asked to be shown those.
 */
function spellingKey(w: string): string {
  return fold(w.toLocaleLowerCase().replace(/ä/g, "e"))
    .replace(/sch/g, "sh")
    .replace(/ie/g, "i")
    .replace(/y/g, "i")
    .replace(/ck/g, "k")
    .replace(/(.)\1+/g, "$1");
}

/** How far apart two words may be and still be one word spelled two ways. */
function tolerance(word: string): number {
  return Math.max(1, Math.floor(word.length / 3));
}

export interface WordComparison {
  /** Words of the pack's line that nothing typed comes near. */
  missing: string[];
  /** Words typed close to one of the pack's but not just respelled: [typed, pack]. */
  differs: [string, string][];
}

export function compareWords(typed: string, target: string): WordComparison {
  const mine = typed.match(WORD) ?? [];
  if (mine.length === 0) return { missing: [], differs: [] };
  const keys = mine.map(spellingKey);
  const folded = mine.map(fold);
  const out: WordComparison = { missing: [], differs: [] };
  const seen = new Set<string>();
  for (const word of target.match(WORD) ?? []) {
    const f = fold(word);
    if (f.length < 2 || seen.has(f)) continue;
    seen.add(f);
    if (keys.includes(spellingKey(word))) continue;
    const near = folded.findIndex((m) => distance(m, f) <= tolerance(f));
    if (near < 0) out.missing.push(word);
    else out.differs.push([mine[near], word]);
  }
  return out;
}

export function missingWords(typed: string, target: string): string[] {
  return compareWords(typed, target).missing;
}
