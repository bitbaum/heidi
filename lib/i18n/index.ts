import { de, type Dictionary } from "./dictionaries/de.ts";
import { en } from "./dictionaries/en.ts";
import { fr } from "./dictionaries/fr.ts";
import { gsw } from "./dictionaries/gsw.ts";
import { it } from "./dictionaries/it.ts";
import { rm } from "./dictionaries/rm.ts";
import { ru } from "./dictionaries/ru.ts";
import { DEFAULT_LOCALE, type Locale } from "./locales.ts";

/**
 * Every dictionary is loaded statically. There are five of a few kilobytes
 * each and they are needed at render time on the server — an async loader
 * would buy nothing here and cost a suspense boundary on every page.
 */
const DICTIONARIES: Record<Locale, Dictionary> = { de, gsw, en, fr, it, rm, ru };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

export type { Dictionary };
export * from "./locales.ts";
