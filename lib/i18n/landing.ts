import { isLocale } from "./locales.ts";

/**
 * Where a visitor lands, decided before any page runs.
 *
 * Pure, and tested on its own, because the middleware around it cannot be:
 * `next/server` is not importable outside a bundler, so a test of the wiring
 * would be a test of a stub agreeing with itself. The decision is the part
 * that can be wrong — a rule that matched one path too many would bounce
 * `/de/chat` to itself forever, and a browser reports that as a site refusing
 * to load rather than as our bug.
 */

/**
 * Auth.js's session cookie, under both names it uses — the `__Secure-` prefix
 * appears over HTTPS and the bare name on a local http run.
 *
 * Only PRESENCE is ever read. Choosing a landing page is not an authorisation
 * decision, so the cookie is not opened, not verified and not trusted for
 * anything: a stale one lands somebody on a `/chat` that correctly shows them
 * signed out.
 */
export const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"] as const;

/**
 * The chat, for somebody who has an account — or null to leave them alone.
 *
 * Only the locale ROOT moves. Someone with an account arriving at `/de` wants
 * the tool, not the pitch for it; someone opening `/de/method` asked for the
 * method.
 *
 * This lives in middleware rather than in the page so the home page stays
 * statically rendered for everyone else: calling `auth()` in `page.tsx` reads
 * a cookie, which opts the route into dynamic rendering for every visitor —
 * and that is the `priority: 1` page a search engine fetches. Crawlers are
 * always signed out, so they always get the marketing page.
 */
export function landingFor(pathname: string, signedIn: boolean): string | null {
  if (!signedIn) return null;

  const [, first, ...rest] = pathname.split("/");
  // `filter(Boolean)` so a trailing slash is still the locale root.
  if (!isLocale(first) || rest.filter(Boolean).length > 0) return null;

  return `/${first}/chat`;
}
