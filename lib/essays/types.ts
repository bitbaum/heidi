import type { SourceId } from "../research/sources.ts";
import type { Locale } from "../i18n/locales.ts";

/**
 * Long-form writing, as data.
 *
 * WHY THIS EXISTS AT ALL. The dialect pages answer "which forms" and "where",
 * and they are deliberately made of data so that eleven areas do not become
 * seventy-seven blocks of unverifiable translated prose. But the question a
 * visitor actually arrives with — why does a country this small have this many
 * dialects, and why did the big neighbour lose its own? — is not a form and
 * not a map. It is an argument, with sources, and it needs somewhere to live
 * that is not a reference page.
 *
 * WHY NOT MARKDOWN. A parser is a dependency, and this repository has spent
 * real effort staying free of UI dependencies (see `overlays.test.ts` on why
 * there is no jsdom). More to the point, Markdown would let an essay render
 * anything at all, and the whole design system would be one stray `<div>` away
 * from not applying. Typed blocks render through components that already know
 * the type scale, the measure and the accent rule — and a block kind nobody
 * implemented is a build error rather than a page that looks wrong in
 * production.
 *
 * WHAT IS STILL ERGONOMIC. `inline.ts` gives the three things prose genuinely
 * needs inside a sentence — a link, emphasis, and a language form set in the
 * dialect face — in about forty lines of pure, tested code. Writing an essay is
 * therefore writing sentences, not building a tree.
 *
 * TRANSLATION IS NOT REQUIRED, and that is the point of `essayIn` below. A
 * dictionary must have every key in all seven languages or the build fails,
 * which is correct for interface copy and would make an essay impossible: two
 * thousand words is not something to machine-translate into Romansh and then
 * publish under our own name. An essay exists in the languages somebody wrote
 * it in, and a reader in a language it has not reached is told so and offered
 * the version that exists.
 */

export type Block =
  /** A paragraph. Inline syntax applies — see `inline.ts`. */
  | { kind: "p"; text: string }
  /** A section heading. Plain text; a heading with a link in it is a mistake. */
  | { kind: "h"; text: string }
  | { kind: "list"; items: readonly string[] }
  /**
   * One sentence, set large, for the line an essay turns on. At most one or
   * two per piece — a page of pull quotes is a page with no argument in it.
   */
  | { kind: "pull"; text: string }
  /**
   * A contrast table: the shape this subject keeps needing. `left` and `right`
   * are FORMS and are set in the dialect face; `note` is prose and is not.
   */
  | { kind: "contrast"; caption?: string; rows: readonly { left: string; right: string; note?: string }[] };

/** One essay in one language. */
export type EssayText = {
  title: string;
  /** The standfirst: one or two sentences, and the meta description. */
  lead: string;
  blocks: readonly Block[];
};

/** The essay itself: everything true of it in every language. */
export type Essay = {
  /** Stable, lowercase, hyphenated. A URL segment; renaming one breaks links. */
  slug: string;
  /** ISO date. Ordering, and the only date shown. */
  published: string;
  /**
   * What it rests on. Rendered at the foot exactly as a dialect area's are,
   * from `lib/research/sources.ts` — an essay making historical claims with no
   * sources is the thing `/method` exists to refuse.
   */
  sources: readonly SourceId[];
  /** Dialect area ids this is about, so those pages can link to it. */
  areas?: readonly string[];
  /** The text, in the languages it has actually been written in. */
  text: Partial<Record<Locale, EssayText>>;
};
