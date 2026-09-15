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
 * NO, THE LOCALE ROOT IS NOT REDIRECTED FOR SIGNED-IN VISITORS.
 *
 * It was, briefly, sending them to `/chat` on the theory that somebody with an
 * account wants the tool rather than the pitch. The theory is fine and the
 * implementation was wrong: "Start" is a link in the navigation, and a person
 * who presses a link labelled Start expects the start page. Silently landing
 * them somewhere else makes one of the seven nav items a lie — and the one
 * that reads as "take me back to the beginning", which is what people press
 * when they are lost.
 *
 * The right version of the idea is a different page at the same address, not a
 * different address: signed in, `/` IS your dashboard. That needs the
 * dashboard to exist, and it arrives with it.
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
