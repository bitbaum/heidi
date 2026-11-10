/**
 * Which language a 404 answers in, when there is no layout to ask.
 *
 * The URL's own first segment wins if it names one of our languages (a typo
 * under `/fr/` is a French reader's typo); else the browser's languages in
 * order; else German, the site's default.
 */
export function notFoundLocale(known: readonly string[], path: string, browser: readonly string[], fallback = "de"): string {
  const first = path.split("/")[1] ?? "";
  if (known.includes(first)) return first;
  for (const tag of browser) {
    const base = tag.toLowerCase().split("-")[0] ?? "";
    if (known.includes(base)) return base;
  }
  return fallback;
}
