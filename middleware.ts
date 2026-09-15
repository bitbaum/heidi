import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, isLocale, negotiate } from "./lib/i18n/locales";

/**
 * Every page lives under a locale segment, so a bare path has to pick one.
 *
 * The choice is the visitor's browser preference, falling back to German —
 * which is the point: this is a site about a German-speaking city, and
 * defaulting to English would quietly concede that you never really arrive.
 *
 * A visitor who has chosen a language gets that choice remembered, so the
 * Italian reader who lands on a shared `/` link is not thrown back to German
 * on every visit.
 */

const COOKIE = "heidi_locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * NOTHING HERE REWRITES. Read this before adding one.
 *
 * A rewrite of the locale root to the dashboard for signed-in visitors took
 * the site down in production, and every test passed — including a production
 * build exercised in a browser, because the failure needs a real reverse proxy
 * to appear.
 *
 * `request.nextUrl.clone()` inherits the EXTERNAL protocol behind Caddy, so
 * the cloned URL reads `https://localhost:4025/...` while the app itself
 * listens on plain http at that port. Next sees an origin it does not consider
 * its own, treats the rewrite as an external proxy target, and dials TLS at an
 * http socket:
 *
 *   Failed to proxy https://localhost:4025/de/portal
 *   EPROTO ... tls_validate_record_header: wrong version number
 *
 * Every signed-out visitor was fine, which is why it reached production: the
 * rewrite only ran when a session cookie was present, and neither CI nor a
 * local `pnpm start` has a reverse proxy in front of it.
 *
 * "Show a different page at the same address" is still the right idea — it is
 * just a decision for the PAGE to make, where no URL is reconstructed and no
 * protocol is guessed.
 */


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) {
    // Already localised. Remember it, so a later bare path lands here again.
    const response = NextResponse.next();
    if (request.cookies.get(COOKIE)?.value !== first) {
      response.cookies.set(COOKIE, first, { maxAge: ONE_YEAR, sameSite: "lax", path: "/" });
    }
    return response;
  }

  const remembered = request.cookies.get(COOKIE)?.value;
  const locale =
    remembered && isLocale(remembered) ? remembered : negotiate(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  // 307: the right locale for the next visitor may differ, so this must never
  // be cached as permanent by a proxy or a browser.
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Everything except API routes, Next internals, and the crawler files that
  // must stay at the root — a redirected robots.txt is a robots.txt nobody reads.
  matcher: ["/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\..*).*)"],
};

export { LOCALES, DEFAULT_LOCALE };
