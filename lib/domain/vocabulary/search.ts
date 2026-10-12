import { createSearch, type Range, type Searcher } from "@bitbaum/searchkit";

/**
 * Finding a word in a variety with no settled spelling.
 *
 * Matching is `@bitbaum/searchkit`'s, the fleet's one search: blind to case
 * and accents (`nod` on an English keyboard is `nöd`, `ruebli` is `Rüebli`),
 * the start of a word while typing (`schwö` is `Schwöschter`), and one slip
 * forgiven from four letters, two from eight (`schwöchter` still lands).
 * Both sides are searched: somebody who met the German word first types
 * «Karotte» and expects `Rüebli`.
 *
 * THE SPELLING RULE is the one thing that is ours. There is no orthography to
 * be right against, so two writers spell one sound two ways, and the list
 * itself does it: `vill` beside `Merci vilmal`; `Ziit`, `Huus` and `schriibe`
 * where many write `Zit`, `Hus`, `schribe`; `spile` where a German hand
 * writes `spiele`. Without the rule such a spelling plus one slip found its
 * word a quarter of the time (`search.test.ts` measures it); with it, nine
 * times in ten. It costs a little on short words — `gäll` read as `gal` is
 * three letters, too short for a typo — and the same test keeps that cost
 * in view.
 */
export function dialectSpelling(word: string): string {
  return word.replace(/ie/g, "i").replace(/(.)\1+/g, "$1");
}

export type SearchableWord = { target: string; bridge: string };

/**
 * Index the words once, in the order given. That order is the last tie-break:
 * between two equally good matches, the one worth learning first stays first.
 */
export function vocabularySearch<W extends SearchableWord>(words: readonly W[]): Searcher<W> {
  const order = new Map(words.map((word, i) => [word, i]));
  return createSearch(words, {
    fields: [
      { name: "target", get: (word) => word.target },
      { name: "bridge", get: (word) => word.bridge },
    ],
    rank: (word) => -(order.get(word) ?? 0),
    normalize: dialectSpelling,
  });
}

/** Where the query landed in one word, for marking it. */
export type WordMatch = { target?: readonly Range[]; bridge?: readonly Range[] };

/**
 * The words that match, best first, each with what to mark. A blank query
 * is no search at all: every word, in the order given, nothing marked.
 */
export function findWords<W extends SearchableWord>(
  searcher: Searcher<W>,
  words: readonly W[],
  query: string,
): Array<{ word: W; match: WordMatch | null }> {
  if (!query.trim()) return words.map((word) => ({ word, match: null }));
  return searcher.search(query).map((hit) => ({ word: hit.item, match: hit.matches }));
}
