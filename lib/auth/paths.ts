import { DEFAULT_LOCALE, LOCALES, type Locale } from "../i18n/locales.ts";

/**
 * The sign-in page for a return path. The return path may itself be a route
 * that applies the saved language first (`/api/account/language?next=/de/…`),
 * so the language of the sign-in page is read from the innermost path.
 */
export function signInPath(returnTo: string): string {
  return `/${localeIn(returnTo)}/sign-in?next=${encodeURIComponent(safeReturn(returnTo))}`;
}

export function localeIn(path: string): Locale {
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    // keep it as written
  }
  const match = decoded.match(/\/([a-z]{2,3})(?:\/|$|\?)/g) ?? [];
  for (const m of match) {
    const code = m.replace(/[/?]/g, "");
    if ((LOCALES as readonly string[]).includes(code)) return code as Locale;
  }
  return DEFAULT_LOCALE;
}

/** A path on this site, or the home page: a sign-in link must never be an open redirect. */
export function safeReturn(value: string | null | undefined, fallback = "/de"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
