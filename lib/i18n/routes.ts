import type { Dictionary } from "./dictionaries/de.ts";
import type { Locale } from "./locales.ts";

/**
 * Every page of the site, once. Navigation, footer and sitemap all read this,
 * so a page cannot exist in the menu and be missing from the sitemap — which
 * is the usual way a site quietly stops being crawlable.
 *
 * The path segments stay in English across all locales (`/fr/method`, not
 * `/fr/methode`). Translating URLs multiplies the routing surface by five,
 * breaks every link anyone has shared the moment a translation is reworded,
 * and buys approximately nothing: nobody reads a URL to decide whether to
 * click it.
 */
export type RouteKey =
  | "home"
  | "chat"
  | "dialect"
  | "vocabulary"
  | "grammar"
  | "method"
  | "contribute"
  | "about"
  | "portal"
  | "settings";

/**
 * What a page is FOR, which is the thing a flat list of five links cannot say.
 *
 * The nav was Methode · Forschung · Dialekt-Check · Mitmachen · Über uns —
 * five peers, no shape, and a reader had to already know the product to tell
 * a tool from an essay. Grouping is the cheapest possible fix and it is honest:
 * these really are three different kinds of page.
 *
 * `use`     things you do — the chat, the checker
 * `why`     why it works this way — the method, the evidence
 * `project` who is doing this and how to join in
 */
export type NavGroup = "use" | "why" | "project";

export const NAV_GROUPS: readonly NavGroup[] = ["use", "why", "project"];

export type Route = {
  key: RouteKey;
  /** Path below the locale segment. Empty string is the locale root. */
  segment: string;
  /** Which heading it sits under, or absent to stay out of the menu. */
  group?: NavGroup;
  /**
   * Belongs in the sitemap. A personal space is noindex, and a sitemap that
   * advertises it contradicts the page's own robots meta — a disagreement
   * search engines treat as a reason to distrust both signals.
   */
  indexed: boolean;
  /** Relative weight for the sitemap, highest first. */
  priority: number;
};

export const ROUTES: readonly Route[] = [
  // The chat IS the home page, so it is named in the menu under `use` rather
  // than left as a wordmark nobody realises is a link.
  { key: "home", segment: "", group: "use", indexed: true, priority: 1 },
  // The same conversation as the home page, with room to be one. Indexed,
  // because a person searching for "Swiss German chat" is looking for exactly
  // this — but an individual thread at /chat/<id> is not a route at all and
  // carries its own noindex.
  { key: "chat", segment: "chat", group: "use", indexed: true, priority: 0.9 },
  // Under `use`, not `why`: these are references you reach for mid-conversation
  // when an answer turned on something you did not know, not essays about how
  // the product works.
  { key: "grammar", segment: "grammar", group: "use", indexed: true, priority: 0.7 },
  { key: "dialect", segment: "dialect", group: "use", indexed: true, priority: 0.7 },
  { key: "vocabulary", segment: "vocabulary", group: "use", indexed: true, priority: 0.7 },
  { key: "method", segment: "method", group: "why", indexed: true, priority: 0.8 },
  { key: "contribute", segment: "contribute", group: "project", indexed: true, priority: 0.6 },
  { key: "about", segment: "about", group: "project", indexed: true, priority: 0.5 },
  // Reached from the account control, not the menu: a personal space listed in
  // the nav of a site you are not signed in to reads as a locked door.
  { key: "portal", segment: "portal", indexed: false, priority: 0.3 },
  { key: "settings", segment: "settings", indexed: false, priority: 0.3 },
];

/** `/de`, `/fr/method`. Never a trailing slash, so links and canonicals agree. */
export function href(locale: Locale, segment: string): string {
  return segment ? `/${locale}/${segment}` : `/${locale}`;
}

/** The label for a route in the reader's language. */
export function label(dict: Dictionary, key: RouteKey): string {
  return dict.nav[key];
}

export const NAV_ROUTES = ROUTES.filter((r) => r.group !== undefined);
export const INDEXED_ROUTES = ROUTES.filter((r) => r.indexed);

/** The menu, in reading order, with its headings. */
export function navGroups(): { group: NavGroup; routes: Route[] }[] {
  return NAV_GROUPS.map((group) => ({
    group,
    routes: ROUTES.filter((r) => r.group === group),
  }));
}
