import type { Dictionary } from "../i18n/dictionaries/de.ts";
import type { Locale } from "../i18n/locales.ts";
import { ROUTES, href, type RouteKey } from "../i18n/routes.ts";

/**
 * "What Heidi solves" on the public home page: concrete moments, one person's
 * first, then the ones a whole city has.
 *
 * STRUCTURE HERE, WORDS IN THE DICTIONARIES, paired by `id` — the split the
 * situations and grammar topics already make. A link is the same in seven
 * languages; a sentence about the doctor is not.
 *
 * THE LINK IS NEVER A STRING. It is a route key or a scene id, and the card's
 * label is read from the same place the rest of the site reads it — the nav
 * label for a route, the scene's own title for a scene. So a card cannot point
 * at a page that does not exist, or call it something the page does not call
 * itself; `problems.test.ts` holds both.
 *
 * THE HONESTY RULE: every `solution` in the dictionaries describes something
 * that works on the site today. A roadmap item does not belong on this list,
 * and neither does a promise about how fluent anybody becomes (HEIDI.md §8).
 */

type Problems = Dictionary["home"]["problems"];
export type ProblemId = keyof Problems["items"];
export type ProblemScaleId = keyof Problems["scales"];
export type SceneId = keyof Dictionary["situations"]["scenes"];

export type ProblemLink =
  | { kind: "route"; route: RouteKey; hash?: string }
  | { kind: "scene"; scene: SceneId };

export type ProblemScale = {
  id: ProblemScaleId;
  items: readonly { id: ProblemId; link: ProblemLink }[];
};

export const PROBLEM_SCALES: readonly ProblemScale[] = [
  {
    id: "people",
    items: [
      { id: "message", link: { kind: "route", route: "chat" } },
      { id: "lunchTable", link: { kind: "scene", scene: "small-talk" } },
      { id: "kindergarten", link: { kind: "scene", scene: "school-parents" } },
      { id: "doctor", link: { kind: "scene", scene: "doctor" } },
      { id: "gemeinde", link: { kind: "scene", scene: "municipality" } },
      { id: "indirectNo", link: { kind: "scene", scene: "indirect-no" } },
    ],
  },
  {
    id: "society",
    items: [
      { id: "theSwitch", link: { kind: "route", route: "warmup" } },
      { id: "care", link: { kind: "scene", scene: "handover" } },
      { id: "work", link: { kind: "route", route: "organisations" } },
      { id: "media", link: { kind: "route", route: "listen" } },
      { id: "trust", link: { kind: "route", route: "method", hash: "gate" } },
    ],
  },
];

/** Where a card goes. Scene pages live below `/situations`, like everywhere else. */
export function problemHref(locale: Locale, link: ProblemLink): string {
  if (link.kind === "scene") return href(locale, `situations/${link.scene}`);
  const path = href(locale, segmentOf(link.route));
  return link.hash ? `${path}#${link.hash}` : path;
}

/** What a card's link says: the page's own name, never a second wording of it. */
export function problemLinkLabel(dict: Dictionary, link: ProblemLink): string {
  return link.kind === "scene" ? dict.situations.scenes[link.scene].title : dict.nav[link.route];
}

/** The segment from the route table, so a renamed route follows here. */
function segmentOf(key: RouteKey): string {
  const route = ROUTES.find((r) => r.key === key);
  if (!route) throw new Error(`a home-page problem links to a route that does not exist: ${key}`);
  return route.segment;
}
