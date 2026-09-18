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
      <div className="mx-auto flex w-full max-w-shell items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href={href(locale, "")}
          className="inline-flex items-center gap-2.5 whitespace-nowrap text-fg-primary"
        >
          <CowMark size={30} title="Heidi" />
          <span className="font-heading text-xl font-bold tracking-display sm:text-2xl">Heidi</span>
        </Link>

        {/*
          THE BAR NAMES WHAT YOU DO; EVERYTHING ELSE IS BEHIND TWO PANELS.

          It was ten targets in a row — five verbs, a panel, and four pages
          about the project — and it had stopped fitting. Measured at 1024px in
          French: the nav was 836px wide and left 16px before the language
          control while signed OUT. A signed-in account control is another
          124px, so that row overflowed. Adding `practice` is what spent the
          headroom the previous note here recorded.

          After: the nav is 648px, and 16px of headroom is what is left SIGNED
          IN — the margin the old note recorded for signed out.

          So the pages ABOUT the project fold together the way the reference
          pages already had. `why` and `project` stay distinct inside the panel
          — two headed columns, because "why it works this way" and "who is
          doing this" really are different questions — but they cost one slot
          between them instead of four.

          What is left in the bar is the product: the chat, practice, listening,
          speaking rounds. That is the right thing to have spent the width on.
        */}
        <nav aria-label={dict.nav.menu} className="hidden lg:flex lg:items-center">
          {/* Things you DO, named in full. */}
          <ul className="flex items-center gap-5">
            {groups
              .filter(({ group }) => group === "use")
              .flatMap(({ routes }) => routes)
              .map((route) => (
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

          <span aria-hidden="true" className="mx-4 h-4 w-px bg-border-subtle" />

          {/* Things you look up mid-conversation. */}
          <NavPanel
            label={groupLabel("reference")}
            current={groups.some(({ group, routes }) => group === "reference" && routes.some((r) => isCurrent(r.segment)))}
          >
            <ReferencePanel locale={locale} dict={dict} isCurrent={isCurrent} />
          </NavPanel>

          <span aria-hidden="true" className="mx-4 h-4 w-px bg-border-subtle" />

          {/* Why it works this way, and who is doing it. */}
          <NavPanel
            label={dict.nav.groupAbout}
            current={groups.some(
              ({ group, routes }) => (group === "why" || group === "project") && routes.some((r) => isCurrent(r.segment)),
            )}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:gap-10">
              {groups
                .filter(({ group }) => group === "why" || group === "project")
                .map(({ group, routes }) => (
                  <div key={group}>
                    <p className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{groupLabel(group)}</p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {routes.map((route) => (
                        <li key={route.key}>
                          <Link
                            href={href(locale, route.segment)}
                            prefetch={false}
                            aria-current={isCurrent(route.segment) ? "page" : undefined}
                            className={`whitespace-nowrap text-base ${
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
                  </div>
                ))}
            </div>
          </NavPanel>
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

/**
 * The reference panel, with the weight the right way up.
 *
 * WHAT WAS WRONG. Three pages sat in a narrow left column and eleven dialect
 * endonyms filled a two-column grid beside them, so four fifths of the panel
 * was the part that matters least — sub-pages of one of the three links next
 * to them. A reader opening "look things up" met a wall of names for dialects
 * this product does not teach yet, and the three pages that ARE the reference
 * section read as a caption to it.
 *
 * WHAT IT IS NOW. The three pages lead, at reading size. The dialects follow
 * underneath as one quiet wrapped line, which is a list you scan rather than a
 * grid you read — and the one Heidi actually teaches is marked, because
 * "eleven areas exist, we teach this one" is the true shape and the grid said
 * all eleven were equal.
 *
 * Every dialect is still one tap from anywhere, which is why they were put
 * here in the first place. Nothing was removed; the hierarchy was.
 */
function ReferencePanel({
  locale,
  dict,
  isCurrent,
}: {
  locale: Locale;
  dict: Dictionary;
  isCurrent: (segment: string) => boolean;
}) {
  const reference = navGroups().find((g) => g.group === "reference")?.routes ?? [];

  return (
    /*
      Held to a fixed, modest width. `NavPanel` sizes to its content, and a
      wrapped list of eleven endonyms will happily take 42rem — which made the
      panel wider than it was before, defeating the point. Narrow, the same
      names wrap to three quiet lines and the panel stops covering the
      headline behind it.
    */
    <div className="flex w-[22rem] max-w-full flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {reference.map((route) => (
          <li key={route.key}>
            <Link
              href={href(locale, route.segment)}
              prefetch={false}
              aria-current={isCurrent(route.segment) ? "page" : undefined}
              className={`whitespace-nowrap text-base ${
                isCurrent(route.segment) ? "font-semibold text-fg-primary" : "text-fg-secondary hover:text-fg-primary"
              }`}
            >
              {dict.nav[route.key]}
            </Link>
          </li>
        ))}
      </ul>

      <div className="border-t border-border-subtle pt-3">
        <p className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{dict.dialect.areasTitle}</p>
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {DISPLAY.areas.map((area) => (
            <li key={area.id}>
              <Link
                href={`${href(locale, "dialect")}/${area.id}`}
                prefetch={false}
                lang={DISPLAY.tag}
                title={area.taught ? dict.dialect.taught : undefined}
                className={`whitespace-nowrap text-[13px] ${
                  area.taught ? "font-semibold text-dialect hover:text-accent" : "text-fg-muted hover:text-fg-primary"
                }`}
              >
                {area.endonym}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
