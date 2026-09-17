/**
 * The anchor a word gets on the vocabulary page.
 *
 * Its own module because two places must agree on it and neither owns the
 * other: the vocabulary list stamps the id, and a practice item links to it.
 * Computed from the word rather than stored, so there is no second list to
 * keep in step — but computed IDENTICALLY, which is what a shared function is
 * for and what two "obvious" inline expressions are not.
 *
 * Diacritics survive. `ö` is a letter of this variety and stripping it would
 * make `Schwöschter` and a hypothetical `Schwoschter` the same anchor — the
 * kind of collision that silently sends a learner to the wrong row. A URL
 * fragment is allowed to carry them; browsers percent-encode on the wire and
 * show the letter to the reader.
 */
export function wordSlug(word: string): string {
  return `w-${word.trim().toLocaleLowerCase().replace(/\s+/g, "-")}`;
}
