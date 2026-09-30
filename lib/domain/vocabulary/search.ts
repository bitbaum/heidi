/**
 * Finding a word in a variety with no settled spelling.
 *
 * Both sides, substring, and blind to accents and case: somebody three letters
 * into `schwö` expects `Schwöschter`, somebody typing `nod` on an English
 * keyboard means `nöd`, and somebody who met the German word first types
 * «Karotte» and expects `Rüebli`. The Zurich `ä`/`e` and `ie`/`i` spellings
 * are folded too, since writers use both for the same sound.
 */
export function searchKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .replace(/ie/g, "i")
    .replace(/(.)\1+/g, "$1");
}

export function matchesQuery(word: { target: string; bridge: string }, query: string): boolean {
  const needle = searchKey(query.trim());
  if (!needle) return true;
  return searchKey(word.target).includes(needle) || searchKey(word.bridge).includes(needle);
}
