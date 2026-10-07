import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PROBLEM_SCALES, problemHref, problemLinkLabel } from "@/lib/config/problems";

/**
 * "What Heidi solves", on the signed-out home page: one person's moments
 * first, then the ones a whole city has. Each card is the problem, then what
 * Heidi does about it today, then the page that does it.
 *
 * The order and the links live in `lib/config/problems.ts`; the words in the
 * dictionaries, by id. The link label is never a third wording: it is the nav
 * label of a route or the title of a scene, read from where those pages read
 * it themselves.
 *
 * LAYOUT, per AGENTS.md. `grid-cols-safe` under the base column, `min-w-0` on
 * every card and `wrap-anywhere` on the link, because a scene title in
 * Romansh or a quoted dialect line is a long unbroken run nobody here wrote
 * for 320px. The cards are not links themselves: the problem and the answer
 * are text to read, and the one thing to press is the 44px row at the bottom.
 */
export function ProblemsSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.problems;

  return (
    <section className="border-t border-border-subtle py-10 sm:py-14" aria-labelledby="problems">
      <h2 id="problems" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
        {t.title}
      </h2>
      <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary sm:text-lg">{t.sub}</p>

      {PROBLEM_SCALES.map((scale) => {
        const words = t.scales[scale.id];
        const headingId = `problems-${scale.id}`;
        return (
          <div key={scale.id} className="mt-8 sm:mt-10">
            <h3 id={headingId} className="font-heading text-xl font-semibold tracking-display text-fg-primary">
              {words.title}
            </h3>
            <p className="mt-1 text-base text-fg-secondary">{words.sub}</p>
            <ul aria-labelledby={headingId} className="mt-5 grid grid-cols-safe gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {scale.items.map((item) => {
                const card = t.items[item.id];
                return (
                  <li
                    key={item.id}
                    className="flex h-full min-w-0 flex-col rounded-control border border-border-subtle p-5"
                  >
                    <p className="font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">
                      {card.problem}
                    </p>
                    <p className="mt-3 flex-1 text-base leading-relaxed text-fg-secondary">{card.solution}</p>
                    <Link
                      href={problemHref(locale, item.link)}
                      className="mt-4 inline-flex min-h-11 items-center self-start text-sm font-medium text-fg-primary underline underline-offset-4 wrap-anywhere hover:text-accent"
                    >
                      {problemLinkLabel(dict, item.link)} →
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <div className="mt-10 flex flex-col gap-4 rounded-control bg-surface-raised p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-measure text-base leading-relaxed text-fg-primary sm:text-lg">{t.closing}</p>
        <Link
          href={href(locale, "chat")}
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90"
        >
          {t.closingCta} →
        </Link>
      </div>
    </section>
  );
}
