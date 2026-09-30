import { DEFAULT_LOCALE, isLocale, type Locale } from "../../i18n/locales.ts";

/**
 * The site language, following the person rather than the browser.
 *
 * The `heidi_locale` cookie remembers a choice per browser, which is why a
 * learner who reads Heidi in Züridütsch got Hochdeutsch again on every new
 * phone. Signing in is the one moment we know it is the same person, so that
 * is the moment the choice comes back: every sign-in returns through
 * `LANGUAGE_ROUTE`, which puts the saved language into the address before
 * sending them on. A shared link is never rewritten — only the page somebody
 * lands on straight after signing in.
 *
 * German stays the default for everybody else. That is a statement about the
 * city, not about who is reading; see `DEFAULT_LOCALE`.
 */

export const LANGUAGE_ROUTE = "/api/account/language";

/** Where a sign-in should return to, so the saved language can be applied. */
export function afterSignIn(path: string): string {
  return `${LANGUAGE_ROUTE}?next=${encodeURIComponent(path)}`;
}

/**
 * The return path, or null when it is not one of ours.
 *
 * `next` arrives in a query string anybody can write, so this is the open
 * redirect guard: a path on this site only. `//evil.example` and `/\evil`
 * are protocol-relative to a browser and are refused, as is anything with a
 * control character a header could be split on.
 */
export function safeNext(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith("/")) return null;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return null;
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;
  return raw;
}

/** The same page in another language: the locale segment swapped, or added. */
export function inLocale(path: string, locale: Locale): string {
  const cut = path.search(/[?#]/);
  const pathname = cut === -1 ? path : path.slice(0, cut);
  const tail = cut === -1 ? "" : path.slice(cut);
  const parts = pathname.split("/");
  if (isLocale(parts[1] ?? "")) parts[1] = locale;
  else parts.splice(1, 0, locale);
  return parts.join("/").replace(/\/$/, "") + tail;
}

/** The locale a path is in, if it names one. */
export function localeOf(path: string): Locale | null {
  const first = path.split(/[/?#]/)[1] ?? "";
  return isLocale(first) ? first : null;
}

/**
 * What to remember when somebody signs in and nothing is saved yet.
 *
 * Being on the German page says nothing — it is where everybody starts. Being
 * on any other language is a choice (or at least the browser's), and the
 * person who picked Züridütsch before they had an account should not have to
 * pick it a second time to make it stick.
 */
export function worthSeeding(locale: Locale | null): locale is Locale {
  return locale !== null && locale !== DEFAULT_LOCALE;
}
