/**
 * Whole-word matching, once, for a language written with umlauts.
 *
 * FIVE COPIES, THREE OF THEM BYTE-IDENTICAL. `saysWord` in
 * `lib/situations/display.ts`, `says` in `lib/domain/practice/kinds/pick.ts`
 * and `demonstrates` in `lib/domain/saved/example.ts` were the same two lines
 * under three names; `wordPattern` in `lib/variety/check.ts` and `blank` in
 * `lib/domain/practice/kinds/text.ts` were the same idea with their own
 * private `escape`.
 *
 * The copies were not accidental, which is the interesting part.
 * `display.ts` says so in its own comment — "Same pattern the variety gate
 * uses, and for the same reason" — so the author knew they were writing the
 * second one and wrote it anyway, because there was nowhere to put it. That
 * is what a missing module looks like from the inside. `text.ts` opens by
 * arguing that these operations belong "in one place" and then keeps a fifth
 * private escape.
 *
 * WHY `\p{L}` AND NOT `\w`. `\w` is `[A-Za-z0-9_]`. Half the words in this
 * language carry an umlaut, so a `\w` boundary treats «grüezi» as ending at
 * the «r» and matches the fragment inside a longer word. `si` matching inside
 * «isch» is the concrete failure every one of the five copies was written to
 * avoid.
 *
 * WHY CASE-INSENSITIVE. A word at the start of a sentence is the same word.
 * `text.ts` records the bug that proved it: `pick` located «Mir» in
 * «Mir händ …» case-insensitively, asked `blank` to remove it case-sensitively,
 * and shipped an item that claimed to have a gap while printing the answer.
 *
 * Pure, no DOM, no product types — so every layer can import it and a test can
 * call it directly.
 */

/**
 * A literal string, safe to paste into a pattern.
 *
 * Packs and vocabulary carry literal forms, not patterns. Without this a stray
 * `.` in a stored form matches any character, and a form containing `(` throws
 * at construction — on data a contributor typed, not on anything we control.
 */
export function escapeLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * A pattern matching `word` only where it stands as a whole word.
 *
 * `flags` is the caller's, because the callers genuinely differ: a test wants
 * one match and a replacement wants `g`. `i` and `u` are forced on — they are
 * the two decisions this module exists to make, and a caller that could turn
 * them off would be a caller that could reintroduce the «Mir» bug.
 */
export function wordPattern(word: string, flags = ""): RegExp {
  const forced = `iu${flags.replace(/[iu]/g, "")}`;
  return new RegExp(`(?<!\\p{L})${escapeLiteral(word)}(?!\\p{L})`, forced);
}

/** Whether `sentence` actually says `word` — not merely contains its letters. */
export function saysWord(sentence: string, word: string): boolean {
  return wordPattern(word).test(sentence);
}

/** Replace every whole-word occurrence of `word`, for gapped exercises. */
export function replaceWord(sentence: string, word: string, with_: string): string {
  return sentence.replace(wordPattern(word, "g"), with_);
}
