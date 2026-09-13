"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href, navGroups, type NavGroup } from "@/lib/i18n/routes";
import { LanguageSwitcher } from "./language-switcher";
import { CowMark } from "./cow-mark";

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

  const groupLabel = (group: NavGroup) =>
    group === "use" ? dict.nav.groupUse : group === "why" ? dict.nav.groupWhy : dict.nav.groupProject;

  const isCurrent = (segment: string) => {
    const target = href(locale, segment);
    return segment === "" ? pathname === target : pathname.startsWith(target);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border-strong bg-surface-page">
      <div className="mx-auto flex w-full max-w-shell items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href={href(locale, "")}
          className="inline-flex items-center gap-2.5 whitespace-nowrap text-fg-primary"
        >
          <CowMark size={30} title="Heidi" />
          <span className="font-heading text-xl font-bold tracking-display sm:text-2xl">Heidi</span>
        </Link>

        <nav aria-label={dict.nav.menu} className="hidden lg:flex lg:items-center">
          {groups.map(({ group, routes }, i) => (
            <div key={group} className="flex items-center">
              {i > 0 && <span aria-hidden="true" className="mx-4 h-4 w-px bg-border-subtle" />}
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
            groupLabels={{ national: dict.nav.langNational, other: dict.nav.langOther }}
          />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-3 font-mono text-[11px] uppercase tracking-caps text-fg-primary lg:hidden"
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
                <h2 className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{groupLabel(group)}</h2>
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
