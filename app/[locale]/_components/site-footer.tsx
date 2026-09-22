import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n/locales";
import { href, navGroups, type NavGroup } from "@/lib/i18n/routes";
import { DISPLAY } from "@/lib/variety/display";

/**
 * The footer, rebuilt around the structure the site already had.
 *
 * WHAT WAS WRONG WITH IT, reported as "disorganised and not helpful" and
 * accurate on both counts:
 *
 *   1. It listed every navigable page in ONE flat column of fifteen. The
 *      header has grouped those pages into four named groups since the
 *      navigation was reorganised — use it, learn, practise, about — and the
 *      footer ignored that and re-flattened them. Two navigation models for
 *      one site, and the footer's was the one with no shape.
 *
 *   2. Its fourth column was a heap: a paragraph about open source followed
 *      by About, Settings, Privacy, For organisations and the Impressum, all
 *      in one `flex-wrap` row, wrapping raggedly and in no order anybody
 *      could name. Those are three different KINDS of link — a product page,
 *      an account page, and two legal pages — and putting them in a row
 *      together is what made it read as a pile.
 *
 * THE FIX IS MOSTLY DELETION OF A SECOND MODEL. The page columns are now
 * `navGroups()`, the same function the header calls, so the footer cannot
 * drift from the menu and a new route appears in both by existing. The legal
 * and account links move to the bottom bar, where people look for them. The
 * one link that is neither — "for organisations" — is promoted out of the
 * heap, because a school or an agency arriving on any page of this site
 * should not have to hunt for the page written for them.
 *
 * NO SHARED PACKAGE DOES THIS. Worth stating plainly rather than leaving as an
 * implied excuse: the fleet's `sitekit` renders marketing sections from a
 * config and does not own a footer, and nothing else in the register does
 * either. This being hand-written is correct; its having been hand-written
 * BADLY is what the complaint was about.
 *
 * A server component: nothing here reacts to anything.
 */
export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  const groups = navGroups();

  /** The heading each group is announced under — the header's own words. */
  const groupTitle: Record<NavGroup, string> = {
    use: dict.nav.groupUse,
    learn: dict.nav.groupLearn,
    practise: dict.nav.groupPractise,
    about: dict.nav.groupAbout,
  };

  return (
    <footer className="border-t border-border-subtle bg-surface-raised">
      <div className="mx-auto w-full max-w-shell px-5 py-12 sm:px-8 sm:py-16">
        {/*
          THE PITCH ROW, above the columns rather than beside them.

          It used to be the first of four equal columns, which made the name
          of the product the same visual weight as a list of language names.
          Full width, it reads as what it is.
        */}
        <div className="flex flex-col gap-6 border-b border-border-subtle pb-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="font-heading text-xl font-semibold tracking-display text-fg-primary">Heidi</div>
            <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">{dict.footer.tagline}</p>
            <p className="mt-3 font-mono text-caption uppercase tracking-caps text-fg-muted">
              {DISPLAY.endonym} · {DISPLAY.region}
            </p>
          </div>

          {/*
            THE ONE LINK THAT IS NOT LIKE THE OTHERS.

            A school, an agency or a care home arriving on any page of this
            site is the reader this whole section exists for, and the page
            written for them was the fourth item in a wrapped row of five. It
            is a door, so it looks like one.
          */}
          <Link
            href={href(locale, "organisations")}
            prefetch={false}
            className="inline-flex min-h-11 shrink-0 items-center rounded-control border border-border-strong px-4 font-medium text-fg-primary hover:bg-surface-page"
          >
            {dict.nav.organisations} →
          </Link>
        </div>

        {/*
          THE PAGES, IN THE SITE'S OWN GROUPS — and TWO COLUMNS ON A PHONE, NOT ONE, and it is a fix rather than taste.

          Stacked one per row, the four groups plus the languages made the
          footer 1,863 pixels tall on a 390px screen — more than a third of
          every page on the site, below content that is the reason anybody
          came. `grid-cols-2` here is `repeat(2, minmax(0, 1fr))`, which is
          already the `grid-cols-safe` guarantee: a long French label wraps
          instead of widening the page. See AGENTS.md.
        */}
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
          {groups.map(({ group, routes }) => (
            <nav key={group} aria-labelledby={`footer-${group}`} className="min-w-0">
              <h2 id={`footer-${group}`} className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                {groupTitle[group]}
              </h2>
              <ul className="mt-3 flex flex-col gap-1">
                {routes.map((route) => (
                  <li key={route.key}>
                    {/* No prefetch down here. Next prefetches every visible
                        Link, and the header already prefetched these exact
                        routes — so the footer bought a second copy of each.
                        On a slow connection that is a round trip per link
                        nobody has aimed at yet. */}
                    <Link
                      href={href(locale, route.segment)}
                      prefetch={false}
                      className="inline-flex min-h-11 items-center wrap-anywhere text-sm text-fg-secondary hover:text-fg-primary"
                    >
                      {dict.nav[route.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-labelledby="footer-languages" className="min-w-0">
            <h2 id="footer-languages" className="font-mono text-caption uppercase tracking-caps text-fg-muted">
              {dict.footer.languageTitle}
            </h2>
            {/* TWO COLUMNS OF ITS OWN. Seven languages at a 44px tap target
                is 300px of footer for a switch the header already carries —
                and it was the single tallest thing down here. */}
            <ul className="mt-3 grid grid-cols-2 gap-x-4 lg:grid-cols-1">
              {LOCALES.map((l) => (
                <li key={l}>
                  {/* Seven languages, seven prefetched copies of the home
                      page — for a switch almost nobody touches, and never
                      before they have read anything. */}
                  <Link
                    href={href(l, "")}
                    hrefLang={l}
                    prefetch={false}
                    aria-current={l === locale ? "true" : undefined}
                    className={`inline-flex min-h-11 items-center wrap-anywhere text-sm hover:text-fg-primary ${
                      l === locale ? "font-medium text-fg-primary" : "text-fg-secondary"
                    }`}
                  >
                    {LOCALE_NAMES[l]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/*
          THE BOTTOM BAR: the things a footer is actually for.

          Settings, privacy, the Impressum and the copyright — the four items
          people go to a footer looking for, together, in one row, instead of
          mixed into a column about the project. Settings in particular has a
          reason to be here that is not taste: signed in, it lives inside the
          avatar menu, which is a client component — so with JavaScript off or
          still loading, a signed-in reader had no route to their own settings
          at all. A footer link costs one line and always works.
        */}
        <div className="mt-12 flex flex-col gap-4 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label={dict.footer.projectTitle} className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {/*
              `investors` is here because it was reachable from NOWHERE — not
              a menu, not a footer, not a link on any page. A password-gated,
              noindex room nobody can find is not discreet, it is lost.

              Last in the row, small, next to the legal pages: that is where a
              reader looks for it and where it stops competing with anything a
              learner came for. The gate still does the gating.
            */}
            {(["settings", "privacy", "impressum", "investors"] as const).map((key) => (
              <Link
                key={key}
                href={href(locale, key)}
                prefetch={false}
                className="inline-flex min-h-11 items-center text-sm text-fg-secondary underline underline-offset-4 hover:text-fg-primary"
              >
                {dict.nav[key]}
              </Link>
            ))}
          </nav>

          <p className="font-mono text-caption text-fg-muted">
            © {year} · {dict.footer.rights} · {dict.footer.builtOn}
          </p>
        </div>

        {/*
          The open-source line, last and small.

          It was a paragraph at the top of a column, which gave a sentence
          about how we work the same weight as the navigation. It is a good
          sentence and it is not why anybody came.
        */}
        <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">
          <span className="font-medium text-fg-secondary">{dict.footer.openSource}</span> — {dict.footer.openSourceNote}
        </p>
      </div>
    </footer>
  );
}
