/**
 * The languages the SITE speaks. Not the language it teaches.
 *
 * These are two different axes, and keeping them apart is the whole reason the
 * variety pack works:
 *
 *   VARIETY  what you are learning — Zurich German. One per deployment.
 *   locale   what Heidi speaks to YOU while you learn it. Five.
 *
 * A French speaker in Zürich is learning exactly the same Züritüütsch as a
 * German one; only the scaffolding language differs. Conflating the two would
 * mean a Lesya deployment had to re-translate the site as well as swap the
 * pack, which is precisely the coupling the pack exists to prevent.
 *
 * Why these five: German is the language of the place and therefore the
 * default. French, Italian and Romansh are the other national languages, and a
 * product about belonging in Switzerland that speaks only one of them is
 * making a statement it does not mean to make. English is here because a very
 * large share of the people with this exact problem are expats.
 */

export const LOCALES = ["de", "gsw", "fr", "it", "rm", "en", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * German, not English. The site is about living in a German-speaking city;
 * defaulting to English would quietly agree that you never really arrive.
 */
export const DEFAULT_LOCALE: Locale = "de";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Endonyms — a language picker that names languages in the reader's language is useless. */
export const LOCALE_NAMES: Record<Locale, string> = {
  de: "Deutsch",
  gsw: "Züritüütsch",
  fr: "Français",
  it: "Italiano",
  rm: "Rumantsch",
  en: "English",
  ru: "Русский",
};

/** Short label for the compact switcher. */
export const LOCALE_SHORT: Record<Locale, string> = {
  de: "DE",
  gsw: "ZH",
  fr: "FR",
  it: "IT",
  rm: "RM",
  en: "EN",
  ru: "RU",
};

/** BCP-47 for <html lang> and hreflang. Swiss variants where they exist. */
export const LOCALE_TAGS: Record<Locale, string> = {
  de: "de-CH",
  gsw: "gsw-CH",
  fr: "fr-CH",
  it: "it-CH",
  rm: "rm-CH",
  en: "en",
  ru: "ru",
};

/**
 * What the assistant should explain in, named so a model recognises it.
 *
 * Romansh is low-resource enough that a model asked to explain in it will
 * produce something unreliable, aimed at roughly 40,000 speakers who would
 * immediately see it was wrong. So Romansh readers get German explanations
 * from the assistant while the site around it stays Romansh, and the interface
 * says so rather than pretending.
 */
export const EXPLANATION_LANGUAGE: Record<Locale, string> = {
  de: "German",
  // The site can speak what it teaches. The model writes this variety all
  // day; here it writes the explanations in it too — and the deterministic
  // gate checks those exactly like any other generated line.
  gsw: "Zurich German (Züritüütsch)",
  fr: "French",
  it: "Italian",
  rm: "German",
  en: "English",
  ru: "Russian",
};

/**
 * The switcher groups languages rather than listing six abbreviations in a row.
 *
 * Six inline codes in a header is not a choice, it is a wall — and it silently
 * claims all six are the same kind of thing. They are not: four are the
 * national languages of the country this product is about, and two are here
 * because a lot of the people with this problem arrived speaking them.
 */
export type LocaleGroup = "national" | "other";

export const LOCALE_GROUP: Record<Locale, LocaleGroup> = {
  de: "national",
  gsw: "national",
  fr: "national",
  it: "national",
  rm: "national",
  en: "other",
  ru: "other",
};

export const GROUP_ORDER: readonly LocaleGroup[] = ["national", "other"];

export function localesInGroup(group: LocaleGroup): Locale[] {
  return LOCALES.filter((l) => LOCALE_GROUP[l] === group);
}

/** Locales whose assistant output is deliberately not in the site's own language. */
export const EXPLANATION_FALLBACK: Partial<Record<Locale, Locale>> = { rm: "de" };

/** Best match for an Accept-Language header, else the default. */
export function negotiate(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
