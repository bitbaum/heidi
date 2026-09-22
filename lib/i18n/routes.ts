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
  | "speaking"
  | "practice"
  | "listen"
  | "dialect"
  | "essays"
  | "vocabulary"
  | "situations"
  | "grammar"
  | "method"
  | "technology"
  | "contribute"
  | "about"
  | "portal"
  | "settings"
  | "privacy"
  | "impressum"
  | "organisations"
  | "investors";

/**
 * `use`       the two things always on the bar: your start, and the chat.
 * `learn`     the material — situations, grammar, words, dialects.
 * `practise`  the things you DO with it — exercises, speaking, listening.
 * `about`     why it works this way, who is doing it, and the writing.
 *
 * WHAT THIS REPLACED, and why the old cut was wrong. It was `use` (start,
 * chat, speaking, practice, listen), `reference` (grammar, dialects, words,
 * situations), `why` and `project`.
 *
 * Two faults, both reported by a reader rather than found here. «Nachschlagen»
 * — "look up" — was the label on what had quietly become the entire teaching
 * material: eleven grammar topics, eighty-three words, fourteen scenes. It
 * described the section as a dictionary at the point where it stopped being
 * one. And `practice` sat under `use`, one panel away from the material it
 * practises, so the loop the product is built on was split across two menus.
 *
 * The new cut is the honest one: **what there is to learn**, **what you do
 * with it**, and **the two doors that are always open**. `why` and `project`
 * merged because the header already drew them as one panel — the split existed
 * only in this file.
 */
export type NavGroup = "use" | "learn" | "practise" | "about";

export const NAV_GROUPS: readonly NavGroup[] = ["use", "learn", "practise", "about"];

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
  // Named in the bar rather than left as a wordmark nobody realises is a link.
  // Signed in this is the dashboard, NOT the chat — see the note on the page.
  { key: "home", segment: "", group: "use", indexed: true, priority: 1 },
  // ALWAYS ON THE BAR, never inside a panel. The chat is how most people use
  // this product, and a door you have to open a menu to find is a door most
  // people do not open. Indexed, because "Swiss German chat" is a real search
  // — but an individual thread at /chat/<id> is not a route and carries its
  // own noindex.
  { key: "chat", segment: "chat", group: "use", indexed: true, priority: 0.9 },
  // Speaking, listening and the exercises are one group, because they are the
  // same act on different channels. Indexed: a scheduled conversation group is
  // a public thing, and somebody searching for one in Zurich wants this page.
  { key: "speaking", segment: "speaking", group: "practise", indexed: true, priority: 0.85 },
  // The centre of `practise`, and it sits one menu away from `learn` on
  // purpose: the material and the drill are two halves of one loop, and every
  // page in `learn` now links into this one scoped to itself.
  //
  // Indexed, and not shy about it: "Schweizerdeutsch üben" is a real search
  // with a bad answer everywhere else — a quiz that scores you out of ten on a
  // language whose spelling is not settled. The page is useful signed out,
  // because the pack's own items need no account.
  { key: "practice", segment: "practice", group: "practise", indexed: true, priority: 0.85 },
  // Somewhere you GO and spend twenty minutes, not something you look up
  // mid-sentence. Indexed and high, because "Swiss German podcasts" is a real
  // search whose unanswered half is which programmes are actually dialect.
  { key: "listen", segment: "listen", group: "practise", indexed: true, priority: 0.85 },
  // FIRST in `learn`, above grammar and the word list, because it is the one
  // that answers "what will actually be said to me" rather than "what is this
  // language like". The scene is the material; the DOING is `/practice`, which
  // every scene links into, scoped to itself.
  //
  // Indexed and above the rest of the group: "Schweizerdeutsch Pflege" is
  // a real search by a real person with a shift tomorrow, and it currently has
  // no good answer anywhere.
  { key: "situations", segment: "situations", group: "learn", indexed: true, priority: 0.75 },
  // `learn` is the material itself. You reach for these mid-conversation when
  // an answer turned on something you did not know, AND you read them straight
  // through — which is why "look up" was the wrong word for the whole group.
  { key: "grammar", segment: "grammar", group: "learn", indexed: true, priority: 0.7 },
  { key: "dialect", segment: "dialect", group: "learn", indexed: true, priority: 0.7 },
  { key: "vocabulary", segment: "vocabulary", group: "learn", indexed: true, priority: 0.7 },
  // `why`, beside the method: both answer "why does it work like this", and an
  // essay about how the dialect landscape came to be is the long form of the
  // sentence the dialect page states in a paragraph. Indexed and high: "warum
  // spricht die Schweiz Dialekt" is a real search with a lot of bad answers.
  { key: "essays", segment: "essays", group: "about", indexed: true, priority: 0.75 },
  { key: "method", segment: "method", group: "about", indexed: true, priority: 0.8 },
  // Beside the method, not inside it. `/method` argues how Heidi teaches; this
  // reports what a computer can currently do with this language at all — a
  // different kind of claim, and the public form of §8's refusal to say Heidi
  // transcribes dialect. Indexed, because somebody searching for "Swiss German
  // speech recognition" is looking for exactly this and will otherwise find a
  // vendor selling them Swiss Standard German.
  { key: "technology", segment: "technology", group: "about", indexed: true, priority: 0.65 },
  { key: "contribute", segment: "contribute", group: "about", indexed: true, priority: 0.6 },
  { key: "about", segment: "about", group: "about", indexed: true, priority: 0.5 },
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
  // NO `group`, so it stays out of the header — and that is a measurement
  // rather than a preference. Added under `project` first, it made an eleventh
  // nav item and the French header overflowed at 1024px: the page scrolled
  // sideways, which is the exact headroom the note above this list warns about.
  //
  // It is also the right answer on its own terms. A care-home director is not
  // on the learning path, and a sales page in the row a learner reads is the
  // nav answering a question nobody browsing asked. Indexed and in the sitemap,
  // linked from the footer beside privacy and the Impressum — which is where
  // an institution already looks.
  { key: "organisations", segment: "organisations", indexed: true, priority: 0.6 },
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
/**
 * `portal` left this list when the dashboard moved back to the locale root.
 *
 * It pointed at a second address for the page the wordmark already opens, so
 * the menu offered "my space" to somebody standing in it. The route still
 * exists and redirects, for the bookmarks; the MENU entry was the part that
 * was misleading.
 */
export const ACCOUNT_MENU_KEYS = ["settings"] as const;
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
