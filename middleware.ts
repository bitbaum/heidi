import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, isLocale, negotiate } from "./lib/i18n/locales";
import { SESSION_COOKIES, landingFor } from "./lib/i18n/landing";

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


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) {
    /**
     * Signed in, the locale root IS the dashboard — a REWRITE, so the address
     * stays `/de` and the nav item labelled "Start" still means start.
     *
     * A redirect here was the first attempt and was wrong: it sent people to
     * `/chat`, so pressing Start landed you somewhere that was not the start
     * page. See `lib/i18n/landing.ts` for the rest of the reasoning; only the
     * cookie read lives here, and it reads presence alone.
     */
    const signedIn = SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
    const landing = landingFor(pathname, signedIn);

    // Already localised. Remember it, so a later bare path lands here again.
    const target = request.nextUrl.clone();
    if (landing) target.pathname = landing;
    const response = landing ? NextResponse.rewrite(target) : NextResponse.next();
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
