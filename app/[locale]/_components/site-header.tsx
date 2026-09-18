"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href, navGroups, type NavGroup } from "@/lib/i18n/routes";
import { LanguageSwitcher } from "./language-switcher";
import { CowMark } from "./cow-mark";
import { NavPanel } from "./nav-panel";
import { useDismiss } from "./use-dismiss";
import { DISPLAY } from "@/lib/variety/display";

/**
 * The site header: brand, navigation, language, account.
 *
 * The navigation was five peers in a row — Methode · Forschung · Dialekt-Check
 * · Mitmachen · Über uns — which told a reader nothing about what any of them
 * was. You had to already know the product to tell a tool from an essay.
 *
 * Now the menu has shape: things you DO, why it works this way, and who is
 * doing it. Grouping is the cheapest possible fix and it is honest — those
 * really are three different kinds of page. On a phone the groups are headed
 * sections; on a wide screen they are clusters with a rule between them, which
 * is enough structure for six links and less machinery than a dropdown.
 */
export function SiteHeader({
  locale,
  dict,
  account,
}: {
  locale: Locale;
  dict: Dictionary;
  /** Rendered on the server (it reads the session) and passed in as a slot,
   *  because a client component cannot render a server component as a child. */
  account?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const groups = navGroups();
  const bar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  /**
   * The mobile menu could not be dismissed.
   *
   * It had `aria-expanded` and no way to close short of pressing the button
   * again or following a link: Escape did nothing, a tap on the page behind it
   * did nothing, and a browser Back left it hanging open over the new page.
   * The two dropdowns in this same header both handled all three. Found by the
   * test that asserts every `aria-expanded` control uses this hook.
   */
  const dismiss = useCallback(() => setOpen(false), []);
  useDismiss({ open, onDismiss: dismiss, containerRef: bar, focusRef: menuButton });

  const groupLabel = (group: NavGroup) =>
    group === "use"
      ? dict.nav.groupUse
      : group === "reference"
        ? dict.nav.groupReference
        : group === "why"
          ? dict.nav.groupWhy
          : dict.nav.groupProject;

  const isCurrent = (segment: string) => {
    const target = href(locale, segment);
    return segment === "" ? pathname === target : pathname.startsWith(target);
  };

  return (
    <header ref={bar} className="sticky top-0 z-30 border-b border-border-strong bg-surface-page">
      {/* `min-w-0` on the row and `flex-wrap` on the nav.
          MEASURED, not precautionary: at 1024px in French the header was 1087px
          wide and every page scrolled sideways — the twenty pixels of headroom
          the note below predicted, spent by the `use` group growing to five
          items. Without `min-w-0` a flex child refuses to shrink below its
          content and pushes the row wider instead; with it, the nav wraps to a
          second line on the few widths where it must. A two-line header at one
          breakpoint is a far smaller cost than a site that scrolls sideways. */}
      <div className="mx-auto flex w-full max-w-shell items-center justify-between gap-4 px-5 py-3 sm:px-8">
        {/* `min-h-11` rather than the mark's own 30px: this is the link back
            to the start page, it is on every page, and it was the most-missed
            target on the site — one finding per page in the responsive audit.
            The row's height does not change, because the header's own padding
            already exceeds it; only the hit area grows. */}
        <Link
          href={href(locale, "")}
          className="inline-flex min-h-11 items-center gap-2.5 whitespace-nowrap text-fg-primary"
        >
          <CowMark size={30} title="Heidi" />
          <span className="font-heading text-xl font-bold tracking-display sm:text-2xl">Heidi</span>
        </Link>

        <nav aria-label={dict.nav.menu} className="hidden min-w-0 lg:flex lg:flex-wrap lg:items-center lg:justify-end lg:gap-y-1">
          {groups.map(({ group, routes }, i) => (
            <div key={group} className="flex items-center">
              {i > 0 && <span aria-hidden="true" className="mx-4 h-4 w-px bg-border-subtle" />}

              {/* The reference pages fold into one item. Flat, they were three
                  of eight peers and the bar had twenty pixels of headroom at
                  1024px in French — measured, with the account control. The
                  dialect areas are the other half of the reason: eleven pages
                  that were reachable only by opening /dialect first. */}
              {group === "reference" ? (
                <NavPanel label={groupLabel(group)} current={routes.some((r) => isCurrent(r.segment))}>
                  <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
                    <ul className="flex shrink-0 flex-col gap-2">
                      {routes.map((route) => (
                        <li key={route.key}>
                          <Link
                            href={href(locale, route.segment)}
                            prefetch={false}
                            aria-current={isCurrent(route.segment) ? "page" : undefined}
                            className={`text-base ${
                              isCurrent(route.segment)
                                ? "font-semibold text-fg-primary"
                                : "text-fg-secondary hover:text-fg-primary"
                            }`}
                          >
                            {dict.nav[route.key]}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {/* Every dialect, one tap from anywhere. This is the part
                        that makes it a panel rather than a dropdown. */}
                    <div className="border-t border-border-subtle pt-4 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                        {dict.dialect.areasTitle}
                      </p>
                      <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
                        {DISPLAY.areas.map((area) => (
                          <li key={area.id}>
                            <Link
                              href={`${href(locale, "dialect")}/${area.id}`}
                              prefetch={false}
                              lang={DISPLAY.tag}
                              className="whitespace-nowrap text-sm text-fg-secondary hover:text-accent"
                            >
                              {area.endonym}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </NavPanel>
              ) : (
              <ul className="flex items-center gap-5">
                {routes.map((route) => (
                  <li key={route.key}>
                    <Link
                      href={href(locale, route.segment)}
                      /* Prefetch on INTENT, not on arrival. Next prefetches
                         every visible Link, so six nav routes (plus settings)
                         fired 13 requests before the page a visitor actually
                         opened had finished — measured at 1.1–1.9s each on a
                         real slow connection. prefetch={false} keeps the
                         hover/touch prefetch, so anyone moving toward a link
                         still gets it instantly; a reader who never aims at
                         one pays nothing. */
                      prefetch={false}
                      aria-current={isCurrent(route.segment) ? "page" : undefined}
                      className={`whitespace-nowrap text-sm transition-colors ${
                        isCurrent(route.segment)
                          ? "font-semibold text-fg-primary underline decoration-accent decoration-2 underline-offset-8"
                          : "text-fg-secondary hover:text-fg-primary"
                      }`}
                    >
                      {dict.nav[route.key]}
                    </Link>
                  </li>
                ))}
              </ul>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* On a phone the bar was brand · gear · Anmelden · DE · MENÜ —
              five controls in 390px, each in its own box, none of them the
              thing anyone came for. The account controls move into the menu
              sheet below, leaving the bar with the two controls that must be
              reachable in one tap: what language this is, and where else to
              go. Rendered in both places and shown in one, because the server
              cannot know the viewport and CSS can. */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">{account}</div>
          <LanguageSwitcher
            current={locale}
            label={dict.nav.language}
            groupLabels={{ national: dict.nav.langNational, dialect: dict.nav.langDialect, other: dict.nav.langOther }}
          />
          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-3 font-mono text-caption uppercase tracking-caps text-fg-primary lg:hidden"
          >
            {dict.nav.menu}
          </button>
        </div>
      </div>

      {open && (
        <div id="site-menu" className="border-t border-border-subtle bg-surface-raised lg:hidden">
          <nav aria-label={dict.nav.menu} className="mx-auto w-full max-w-shell px-5 py-4 sm:px-8">
            {groups.map(({ group, routes }) => (
              <section key={group} className="mb-4 last:mb-0">
                <h2 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{groupLabel(group)}</h2>
                <ul className="mt-1 flex flex-col">
                  {routes.map((route) => (
                    <li key={route.key}>
                      <Link
                        href={href(locale, route.segment)}
                        prefetch={false}
                        onClick={() => setOpen(false)}
                        aria-current={isCurrent(route.segment) ? "page" : undefined}
                        className={`flex min-h-12 items-center border-b border-border-subtle text-base ${
                          isCurrent(route.segment) ? "font-semibold text-fg-primary" : "text-fg-secondary"
                        }`}
                      >
                        {dict.nav[route.key]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {/* The account controls the bar no longer has room for. */}
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-5">{account}</div>
          </nav>
        </div>
      )}
    </header>
  );
}
