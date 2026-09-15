import { isLocale } from "./locales.ts";

/**
 * What the locale root shows.
 *
 * Signed out it is the marketing page, statically rendered. Signed in it is
 * the dashboard — the same address, a different page.
 *
 * THAT DISTINCTION IS THE WHOLE POINT, and this file exists because the first
 * attempt got it wrong. It REDIRECTED a signed-in visitor to `/chat`, which
 * meant pressing a nav link labelled "Start" landed you somewhere that was not
 * the start page. One of seven nav items became a lie, and it was the one
 * people press when they are lost.
 *
 * A rewrite has none of that problem: the address bar still says `/de`, the
 * nav item is still correct, and "Start" means what it says — your start,
 * which for somebody with an account is their own dashboard rather than the
 * pitch for a product they already use.
 *
 * It also has to be a rewrite for a second reason. Calling `auth()` inside
 * `app/[locale]/page.tsx` reads a cookie, which opts that route into dynamic
 * rendering for EVERY visitor — and it is the `priority: 1` page a search
 * engine fetches. Deciding here keeps the signed-out page static. Crawlers are
 * always signed out, so they always get the marketing page.
 *
 * Pure, because the middleware around it cannot be tested — `next/server` is
 * not importable outside a bundler, so a test of the wiring would only assert
 * that a stub agrees with itself.
 */

/**
 * Auth.js's session cookie, under both names it uses — the `__Secure-` prefix
 * appears over HTTPS and the bare name on a local http run.
 *
 * Only PRESENCE is ever read, and nothing is authorised on the strength of it.
 * Choosing which page to render is not an authorisation decision: the page
 * itself calls `auth()` properly, so a forged or stale cookie gets a dashboard
 * that correctly shows them signed out, and never anybody else's data.
 */
export const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"] as const;

/** The dashboard's own path, which is also reachable directly. */
export const DASHBOARD_SEGMENT = "portal";

/**
 * The path to render for this request, or null to render what was asked for.
 *
 * Only the locale ROOT is ever redirected inward. Someone opening `/de/method`
 * asked for the method, and a rule that matched one path too many would rewrite
 * `/de/portal` onto itself — which is the loop this returns null to prevent.
 */
export function landingFor(pathname: string, signedIn: boolean): string | null {
  if (!signedIn) return null;

  const [, first, ...rest] = pathname.split("/");
  // `filter(Boolean)` so a trailing slash is still the locale root.
  if (!isLocale(first) || rest.filter(Boolean).length > 0) return null;

  return `/${first}/${DASHBOARD_SEGMENT}`;
}
