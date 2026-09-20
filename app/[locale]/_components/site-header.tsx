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
  accountSheet,
}: {
  locale: Locale;
  dict: Dictionary;
  /** Rendered on the server (it reads the session) and passed in as a slot,
   *  because a client component cannot render a server component as a child. */
  account?: React.ReactNode;
  /** The same control, for the mobile menu sheet. See `account-control.tsx`. */
  accountSheet?: React.ReactNode;
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
          /* `min-h-11` rather than the mark's own 30px: the link back to the
             start page is on every page, and was the most-missed target on
             the site — one finding per page in the responsive audit. The
             row does not get taller; the header's padding already exceeds
             it. Only the hit area grows. */
          className="inline-flex min-h-11 items-center gap-2.5 whitespace-nowrap text-fg-primary"
        >
          <CowMark size={30} title="Heidi" />
          {/*
            THE WORDMARK STANDS DOWN UNDER 380px, and the mark stays.

            Adding the avatar to the bar bought the one control people look for
            without being told where it is, and it cost 60px the narrowest
            phones did not have: at 320px in Russian the row measured 342px
            inside 320 — brand, avatar, language, «Меню». Something had to give
            and the word "Heidi" is the cheapest of them, because the cow is
            still there and the link still announces itself. The alternative
            was a hamburger icon in place of the menu's word, which trades a
            label everybody reads for a glyph some people guess at.

            `xs` is a project breakpoint, not a Tailwind default — see the
            theme. It exists because 320 and 390 genuinely want different
            headers and `sm` at 640 is far too late to decide that.
          */}
          <span className="hidden font-heading text-xl font-bold tracking-display xs:inline sm:text-2xl">Heidi</span>
        </Link>

        {/*
          THE BAR NAMES WHAT YOU DO; EVERYTHING ELSE IS BEHIND TWO PANELS.

          It was ten targets in a row — five verbs, a panel, and four pages
          about the project — and it had stopped fitting. At 1024px in French
          the nav was 836px, against roughly 930px of usable width once the
          brand and the account controls are paid for. Adding `practice` is
          what spent the headroom the previous note here recorded.

          After: 648px, which fits with about 80px to spare. See the note below
          on why that margin needed the nav's own spacing tightened too.

          So the pages ABOUT the project fold together the way the reference
          pages already had. `why` and `project` stay distinct inside the panel
          — two headed columns, because "why it works this way" and "who is
          doing this" really are different questions — but they cost one slot
          between them instead of four.

          What is left in the bar is the product: the chat, practice, listening,
          speaking rounds. That is the right thing to have spent the width on.
        */}
        <nav aria-label={dict.nav.menu} className="hidden lg:flex lg:items-center">
          {/*
            Things you DO, named in full.

            `gap-4` and `mx-3` below, not `gap-5` and `mx-4`, and the four
            pixels are load-bearing. Folding the project pages into a panel cut
            the nav from 836px to 648px, which was not quite enough: measured on
            the deployed site at 1024px in French, SIGNED OUT, the real account
            control is 226px — `Se connecter` plus the language button, which a
            dev server without auth configured never renders and which I had
            therefore estimated at 124px. 96 + 648 + 226 + two 16px gaps + 64px
            of padding is 1066 in a 1024 box, and the page scrolled sideways by
            10px.

            Tightening the nav's own spacing gives back 32px, so it fits with
            room rather than by a pixel. Measured in all seven languages.
          */}
          <ul className="flex items-center gap-4">
            {groups
              .filter(({ group }) => group === "use")
              .flatMap(({ routes }) => routes)
              .map((route) => (
                /*
                  `Start` steps out between 1024 and 1280, and only there.

                  Tightening the spacing was not enough on its own: measured
                  per language, the nav still wanted 616px in French, 618 in
                  Romansh and 629 in Russian against a 606px budget at 1024
                  once the real 226px account controls are paid for. Three of
                  seven languages scrolling sideways is a broken header, not a
                  tight one.

                  This is the item to drop because it is the only one whose
                  destination is already on screen — the wordmark to its left
                  is the same link. The note above the nav defends NAMING it,
                  against a wordmark nobody realises is clickable, and that
                  argument still holds at 1280 where it still appears. It just
                  stops outranking a language that does not fit.
                */
                <li key={route.key} className={route.key === "home" ? "hidden xl:block" : undefined}>
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

          <span aria-hidden="true" className="mx-3 h-4 w-px bg-border-subtle" />

          {/* Things you look up mid-conversation. */}
          <NavPanel
            label={groupLabel("reference")}
            current={groups.some(({ group, routes }) => group === "reference" && routes.some((r) => isCurrent(r.segment)))}
          >
            <ReferencePanel locale={locale} dict={dict} isCurrent={isCurrent} />
          </NavPanel>

          <span aria-hidden="true" className="mx-3 h-4 w-px bg-border-subtle" />

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
                    <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{groupLabel(group)}</p>
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

        {/* `relative` is the anchor every control in this row hangs its panel
            from. Without it a dropdown anchors to its own button, which is
            correct only for the last control in the row — see the note in
            `account-menu.tsx` for what that cost. */}
        <div className="relative flex items-center gap-2">
          {/* On a phone the bar was brand · gear · Anmelden · DE · MENÜ —
              five controls in 390px, each in its own box, none of them the
              thing anyone came for, so all of it moved into the sheet.
              That was right for the signed-OUT bar and wrong for the signed-in
              one: an avatar is 44px, it fits, and "log out" is the control
              people look for in the corner without being told. The slot no
              longer hides itself — `AccountControl` decides what belongs here
              at which width, because only it knows whether there is a session. */}
          <div className="flex items-center gap-2">{account}</div>
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

            {/* Signed out only: the sign-in button and the gear, which do not
                fit in the bar beside everything else. Signed in this renders
                nothing at all, so the dropdown exists once in the document. */}
            {accountSheet && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-5">
                {accountSheet}
              </div>
            )}
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
        <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{dict.dialect.areasTitle}</p>
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {DISPLAY.areas.map((area) => (
            <li key={area.id}>
              <Link
                href={`${href(locale, "dialect")}/${area.id}`}
                prefetch={false}
                lang={DISPLAY.tag}
                title={area.taught ? dict.dialect.taught : undefined}
                className={`whitespace-nowrap text-nav ${
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
