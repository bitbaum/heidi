/**
 * Putting a word into a sentence the dictionary already wrote.
 *
 * WHY THIS EXISTS NOW AND NOT BEFORE. Every string in the dictionaries used to
 * be whole, and where a number had to appear it was concatenated at the call
 * site — `{n} {t.due}`. That works for a count tacked onto a noun and breaks
 * the moment the variable belongs in the MIDDLE of a sentence, which is
 * exactly where it lands in the seven languages here:
 *
 *   de   Zeigen Sie mir «Velo» in zwei Sätzen.
 *   fr   Montrez-moi « Velo » dans deux phrases.
 *   ru   Покажите «Velo» в двух предложениях.
 *
 * Concatenation cannot express that without the German word order becoming
 * the French one. A placeholder can, and it keeps the whole sentence — word
 * order, quotation marks and all — inside the file the translator edits.
 *
 * DELIBERATELY TINY. No plurals, no gender, no number formatting, no ICU. This
 * repo has one substitution to make and adding a message-format dependency for
 * it would be the second UI dependency in a project that has none. When a real
 * plural rule turns up, that is the moment to reach for a library — not now,
 * on the strength of one word.
 */

/**
 * Replace every `{name}` with its value.
 *
 * An unknown placeholder is left ALONE rather than blanked. A template that
 * says `{word}` when the caller passed `{term}` then renders visibly wrong in
 * front of a reader, which someone fixes; blanking it produces a sentence that
 * is merely slightly odd — «» in zwei Sätzen — and survives for months.
 */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? values[name] : whole,
  );
}
