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
  | "technology"
  | "contribute"
  | "about"
  | "portal"
  | "settings"
  | "privacy"
  | "impressum"
  | "investors";

/**
 * What a page is FOR, which is the thing a flat list of five links cannot say.
 *
 * The nav was Methode · Forschung · Dialekt-Check · Mitmachen · Über uns —
 * five peers, no shape, and a reader had to already know the product to tell
 * a tool from an essay. Grouping is the cheapest possible fix and it is honest:
 * these really are three different kinds of page.
 *
 * `use`       things you do — the chat
 * `reference`  things you look up mid-conversation — grammar, dialects, words
 * `why`        why it works this way — the method, the evidence
 * `project`    who is doing this and how to join in
 *
 * `reference` split off from `use` when the reference section grew: measured
 * at 1024px in French, with the account control, the flat nav had twenty
 * pixels of headroom. Eight peers in a row is also the shapeless list this
 * grouping was introduced to fix, arrived at again from the other direction.
 */
export type NavGroup = "use" | "reference" | "why" | "project";

export const NAV_GROUPS: readonly NavGroup[] = ["use", "reference", "why", "project"];

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
  // `reference`, not `why`: you reach for these mid-conversation when an answer
  // turned on something you did not know. An essay about how the product works
  // is a different kind of page and sits under `why`.
  { key: "grammar", segment: "grammar", group: "reference", indexed: true, priority: 0.7 },
  { key: "dialect", segment: "dialect", group: "reference", indexed: true, priority: 0.7 },
  { key: "vocabulary", segment: "vocabulary", group: "reference", indexed: true, priority: 0.7 },
  { key: "method", segment: "method", group: "why", indexed: true, priority: 0.8 },
  // Beside the method, not inside it. `/method` argues how Heidi teaches; this
  // reports what a computer can currently do with this language at all — a
  // different kind of claim, and the public form of §8's refusal to say Heidi
  // transcribes dialect. Indexed, because somebody searching for "Swiss German
  // speech recognition" is looking for exactly this and will otherwise find a
  // vendor selling them Swiss Standard German.
  { key: "technology", segment: "technology", group: "why", indexed: true, priority: 0.65 },
  { key: "contribute", segment: "contribute", group: "project", indexed: true, priority: 0.6 },
  { key: "about", segment: "about", group: "project", indexed: true, priority: 0.5 },
  // Reached from the account control, not the menu: a personal space listed in
  // the nav of a site you are not signed in to reads as a locked door.
  { key: "portal", segment: "portal", indexed: false, priority: 0.3 },
  { key: "settings", segment: "settings", indexed: false, priority: 0.3 },
  // Reached from the footer rather than the menu. INDEXED, unlike the personal
  // pages: an institution checking whether this is a serious project looks for
  // exactly these two, and a privacy page a search engine cannot see is a
  // privacy page nobody finds when it matters.
  { key: "privacy", segment: "privacy", indexed: true, priority: 0.4 },
  { key: "impressum", segment: "impressum", indexed: true, priority: 0.4 },
  // Not indexed and not in the sitemap: it is a password-gated room, and a
  // sitemap entry advertising it would contradict its own robots meta — the
  // disagreement search engines treat as a reason to distrust both signals.
  { key: "investors", segment: "investors", indexed: false, priority: 0.1 },
];

/**
 * What the avatar menu in the header offers, in order.
 *
 * HERE rather than in the component, for the reason this whole file exists:
 * these are pages, and a menu that names a page the site does not have is the
 * same defect as a nav item missing from the sitemap. Typed as a tuple of
 * `RouteKey` so an entry that is not a real route is a build error, and so the
 * dictionary can carry one description per entry and no more.
 *
 * Both are `indexed: false` personal routes, which is why they are not in
 * `navGroups()` — a personal space listed in the nav of a site you are not
 * signed in to reads as a locked door. The account control is the door.
 */
export const ACCOUNT_MENU_KEYS = ["portal", "settings"] as const;
export type AccountMenuKey = (typeof ACCOUNT_MENU_KEYS)[number];

/** The account menu, resolved to routes. Throws at build if one goes missing. */
export function accountMenu(): { key: AccountMenuKey; segment: string }[] {
  return ACCOUNT_MENU_KEYS.map((key) => {
    const route = ROUTES.find((r) => r.key === key);
    // Not a soft failure: a menu that silently drops an entry when a route is
    // renamed is how the only link to settings disappears without a test
    // noticing. This runs at render on the server, so it fails loudly and early.
    if (!route) throw new Error(`account menu names a route that does not exist: ${key}`);
    return { key, segment: route.segment };
  });
}

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
