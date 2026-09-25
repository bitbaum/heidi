import { LOCALE_TAGS, type Locale } from "./locales.ts";
import { fill } from "./fill.ts";

/**
 * A count, worded correctly in each of the seven languages.
 *
 * NEW WITH THE STREAK, because it is the first copy here that counts days. A
 * singular and a plural are not enough: Russian has three forms (1 день,
 * 2 дня, 5 дней), and even German broke at one — "Bestwert: 1 Tage". So each
 * locale supplies all four CLDR categories, and `Intl.PluralRules` — built
 * into every browser and Node — picks. A language without `few`/`many` repeats
 * `other`, which keeps every dictionary the same shape (they are all typed
 * against `de.ts`).
 */
export type Plural = { one: string; few: string; many: string; other: string };

export function plural(forms: Plural, n: number, locale: Locale, values: Record<string, string> = {}): string {
  const cat = new Intl.PluralRules(LOCALE_TAGS[locale]).select(n);
  const form = cat === "one" || cat === "few" || cat === "many" ? forms[cat] : forms.other;
  return fill(form, { n: String(n), ...values });
}
