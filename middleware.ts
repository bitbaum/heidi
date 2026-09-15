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
    // Somebody with an account lands in the tool, not on the pitch. The
    // decision is in `landingFor`, which is pure and tested; only the cookie
    // read is here, and it reads presence alone.
    const signedIn = SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
    const landing = landingFor(pathname, signedIn);
    if (landing) {
      const chat = request.nextUrl.clone();
      chat.pathname = landing;
      // 307, not 308: this is true of this visitor right now, and a browser
      // that cached it as permanent would strand them on /chat after signing
      // out, with no way back to the home page but clearing site data.
      return NextResponse.redirect(chat, 307);
    }

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
