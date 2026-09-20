import { ESSAYS } from "../../content/essays/index.ts";
import { DEFAULT_LOCALE, type Locale } from "../i18n/locales.ts";
import type { Essay, EssayText } from "./types.ts";

export { ESSAYS };

/**
 * An essay as this reader will actually get it.
 *
 * `asked` is what they asked for; `got` is what they are being shown. When the
 * two differ the page says so — a reader who clicked a German title and landed
 * on English prose with no explanation assumes the site is broken, and one who
 * is told "this has not been translated yet, here it is in German" has simply
 * been told the truth.
 */
export type Served = { essay: Essay; text: EssayText; asked: Locale; got: Locale };

/**
 * The fallback order, and it is not alphabetical.
 *
 * German first, because this site is about a German-speaking place and every
 * essay here will be written in German before it is written in anything else.
 * English second, as the language most readers have some of. A reader gets the
 * version that exists rather than a stub apologising for the one that does not.
 */
const FALLBACKS: readonly Locale[] = [DEFAULT_LOCALE, "en"];

function textFor(essay: Essay, locale: Locale): { text: EssayText; got: Locale } | null {
  const own = essay.text[locale];
  if (own) return { text: own, got: locale };

  for (const fallback of FALLBACKS) {
    const text = essay.text[fallback];
    if (text) return { text, got: fallback };
  }
  return null;
}

/** Newest first. An essay with no text in any language is not published. */
export function essaysFor(locale: Locale): Served[] {
  return [...ESSAYS]
    .sort((a, b) => b.published.localeCompare(a.published))
    .flatMap((essay) => {
      const found = textFor(essay, locale);
      return found ? [{ essay, text: found.text, asked: locale, got: found.got }] : [];
    });
}

export function essayBySlug(slug: string, locale: Locale): Served | null {
  const essay = ESSAYS.find((e) => e.slug === slug);
  if (!essay) return null;
  const found = textFor(essay, locale);
  return found ? { essay, text: found.text, asked: locale, got: found.got } : null;
}

/** Every essay about a given dialect area, so that area's page can offer them. */
export function essaysAbout(areaId: string, locale: Locale): Served[] {
  return essaysFor(locale).filter((served) => served.essay.areas?.includes(areaId));
}
