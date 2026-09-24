/**
 * A date in the reader's own language, formatted once.
 *
 * THREE IMPLEMENTATIONS, AND ALL THREE COMMENTS SAID THE SAME THING.
 * `essays/page.tsx` and `_components/saved-words.tsx` both opened with "the
 * reader's own date format, never a hardcoded one" — the same sentence, near
 * enough, above two functions that then disagreed about the month (`long` vs
 * `short`) and about what to print when the date will not parse
 * (`iso.slice(0, 10)` vs `d.toISOString().slice(0, 10)`). `chat/workspace.tsx`
 * wrote a third inline.
 *
 * THE ONE THAT WAS RIGHT WAS THE INLINE ONE. `workspace.tsx` passed
 * `LOCALE_TAGS[locale]`; the two named functions passed the bare locale code.
 * That is what `LOCALE_TAGS` is for and the difference is real, if currently
 * invisible: with month names every locale renders identically either way, but
 * `Intl` on bare `fr` is FRANCE, and Swiss French writes a numeric date
 * `24.09.2026` where France writes `24/09/2026`. Nobody sees it today because
 * both call sites ask for a month name. It would appear the first time someone
 * asks for a numeric date, in one of the two places, and not the other.
 *
 * So: the tag comes from `LOCALE_TAGS`, and no caller can pass a bare code.
 *
 * WHY A `style` ARGUMENT RATHER THAN ONE FORMAT. Because the difference was a
 * real decision, not drift: an essay index has room for "24. September 2026",
 * and a saved word in a list does not. Both are now named, in one place, and a
 * third caller has to pick one rather than invent a fourth.
 */

import { LOCALE_TAGS, type Locale } from "./locales.ts";

export type DateStyle = "long" | "short" | "numeric";

const OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  /** «24. September 2026» — for a page with room for it. */
  long: { day: "numeric", month: "long", year: "numeric" },
  /** «24. Sep. 2026» — for a row in a list. */
  short: { day: "numeric", month: "short", year: "numeric" },
  /**
   * «24.09.2026» — the locale's own numeric form, for a dense control.
   *
   * This is the style where the Swiss tag stops being cosmetic: `fr-CH`
   * renders `24.09.2026` and bare `fr` renders `24/09/2026`. An empty options
   * object is `Intl`'s default date, which is what `toLocaleDateString()` with
   * no arguments gives — the behaviour the chat workspace already had.
   */
  numeric: {},
};

/**
 * A date-only string is anchored at NOON UTC, not midnight.
 *
 * THE BUG THIS EXISTS TO STOP, which the changelog page had already found and
 * this module then shipped without. `new Date("2026-09-22")` is midnight UTC.
 * Formatted in any zone behind UTC it is the 21st:
 *
 *     TZ=America/New_York  "2026-09-22" -> 21. September 2026
 *     with the noon anchor              -> 22. September 2026
 *
 * Essays carry `published: "2026-09-20"` and changelog entries carry
 * `date: "2026-09-22"` — both date-only, both rendered to a reader. Noon is
 * twelve hours from either edge, so no real timezone can push it across a day
 * boundary.
 *
 * A full timestamp is left exactly as given: it names an instant, and moving
 * it would be inventing a different one.
 */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function parse(iso: string): Date | undefined {
  const date = new Date(DATE_ONLY.test(iso) ? `${iso}T12:00:00Z` : iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * An `Intl` formatter for this reader, for callers whose options are their own.
 *
 * `round-list.tsx` needs a weekday, a time and a timezone name — a set no
 * shared `style` should try to cover — and it was building its own formatter
 * with the BARE locale, which is the mistake this module was written to end.
 * It now takes its options here and the tag is not its problem.
 *
 * Everything that turns a `Locale` into an `Intl` argument goes through this
 * file; `dates.test.ts` fails the build on a formatter built anywhere else
 * from anything but a literal.
 */
export function intlDate(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], options);
}

/**
 * Format an ISO date for `locale`, or return "" if it will not parse.
 *
 * EMPTY, NOT "Invalid Date". `workspace.tsx` had already learned this and
 * wrote it down — a stored draft can predate the field, and rendering
 * "Invalid Date" at somebody is the usual way this goes wrong. A caller that
 * wants a placeholder can test for "" and choose its own.
 */
export function formatDate(iso: string, locale: Locale, style: DateStyle = "long"): string {
  const date = parse(iso);
  if (!date) return "";
  try {
    return intlDate(locale, OPTIONS[style]).format(date);
  } catch {
    // An environment without the locale data. The ISO prefix is wrong for
    // nobody and unreadable to no one, which is the right failure here.
    return iso.slice(0, 10);
  }
}
