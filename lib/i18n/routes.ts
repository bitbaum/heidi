import type { Dictionary } from "./dictionaries/de.ts";
import type { Locale } from "./locales.ts";

/**
 * Every page of the site, once. Navigation, footer and sitemap all read this,
 * so a page cannot exist in the menu and be missing from the sitemap — which
 * is the usual way a site quietly stops being crawlable.
 *
 * The path segments stay in English across all locales (`/fr/method`, not
 * `/fr/methode`). Translating URLs multiplies the routing surface by five,
 * breaks every link anyone has ever shared the moment a translation is
 * reworded, and buys approximately nothing: nobody reads a URL to decide
 * whether to click it.
 */
export type RouteKey = "home" | "method" | "research" | "check" | "contribute" | "about";

export type Route = {
  key: RouteKey;
  /** Path below the locale segment. Empty string is the locale root. */
  segment: string;
  /** Shown in the primary navigation bar. */
  inNav: boolean;
  /** Relative weight for the sitemap, highest first. */
  priority: number;
};

export const ROUTES: readonly Route[] = [
  { key: "home", segment: "", inNav: false, priority: 1 },
  { key: "method", segment: "method", inNav: true, priority: 0.8 },
  { key: "research", segment: "research", inNav: true, priority: 0.8 },
  { key: "check", segment: "check", inNav: true, priority: 0.7 },
  { key: "contribute", segment: "contribute", inNav: true, priority: 0.6 },
  { key: "about", segment: "about", inNav: true, priority: 0.5 },
];

/** `/de`, `/fr/method`. Never a trailing slash, so links and canonicals agree. */
export function href(locale: Locale, segment: string): string {
  return segment ? `/${locale}/${segment}` : `/${locale}`;
}

/** The label for a route in the reader's language. */
export function label(dict: Dictionary, key: RouteKey): string {
  return dict.nav[key];
}

export const NAV_ROUTES = ROUTES.filter((r) => r.inNav);
