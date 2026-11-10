import type { Metadata } from "next";
import { getDictionary } from "../i18n/index.ts";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, isLocale, type Locale } from "../i18n/locales.ts";
import { ASSISTANT_NAME, SITE_URL } from "./site.ts";

/**
 * The head tags that depend on WHICH page this is: canonical, og:url, hreflang
 * and the share image.
 *
 * They were written once, in the locale layout, which cannot know the path
 * below it. So `/en/practice` declared `/en` as its canonical and its og:url,
 * every hreflang pointed at a locale home, and no page had an og:image at all:
 * the layout's `openGraph` object replaces the one Next builds from
 * `app/opengraph-image.tsx` rather than merging with it. Metadata merges
 * shallowly, so whoever sets `openGraph` has to set all of it. This does.
 */

/** The product name, from the one place it is written (`site.ts`). */
const BRAND = ASSISTANT_NAME;

/** Absolute, because a crawler reading a share card resolves nothing. */
export const OG_IMAGE = {
  url: `${SITE_URL}/opengraph-image`,
  width: 1200,
  height: 630,
  type: "image/png",
} as const;

export type PageMeta = {
  /** The page's own title, without the brand. Omitted: the site title. */
  title?: string;
  /** Omitted: the site description. */
  description?: string;
  /** A personal or gated page: self-canonical, no hreflang, out of every index. */
  noindex?: boolean;
  /** The languages the page really exists in, when that is not all of them. */
  locales?: readonly Locale[];
  /** The language actually served, when it is a fallback for the one asked for. */
  canonicalLocale?: Locale;
};

/** `path` is what follows the locale: "" for the home, "practice", "grammar/perfekt". */
export function pageUrl(locale: Locale, path: string): string {
  return path ? `${SITE_URL}/${locale}/${path}` : `${SITE_URL}/${locale}`;
}

/**
 * `path: null` is a page whose address is itself private (a conversation, an
 * invitation token, a certificate): no canonical and no og:url, so the address
 * is written nowhere a preview or a crawler would copy it from.
 */
export function pageMetadata(rawLocale: string, path: string | null, meta: PageMeta = {}): Metadata {
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const url = path === null ? undefined : pageUrl(meta.canonicalLocale ?? locale, path);
  const description = meta.description ?? dict.meta.description;
  const shareTitle = meta.title ? `${meta.title} · ${BRAND}` : dict.meta.title;

  const served = meta.locales ?? LOCALES;
  const xDefault = served.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : served[0];
  const noindex = meta.noindex || path === null;
  const languages = noindex || path === null
    ? undefined
    : {
        ...Object.fromEntries(served.map((l) => [LOCALE_TAGS[l], pageUrl(l, path)])),
        ...(xDefault ? { "x-default": pageUrl(xDefault, path) } : {}),
      };

  return {
    ...(meta.title ? { title: meta.title } : {}),
    description,
    // Always set, even when empty: an absent key would inherit the layout's
    // canonical, which is the locale home.
    alternates: url ? { canonical: url, ...(languages ? { languages } : {}) } : {},
    openGraph: {
      siteName: BRAND,
      type: "website",
      locale: LOCALE_TAGS[locale],
      title: shareTitle,
      description,
      ...(url ? { url } : {}),
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: [OG_IMAGE.url] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
