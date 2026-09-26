"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href, navGroups, NAV_SECTIONS, type NavGroup } from "@/lib/i18n/routes";
import { LanguageSwitcher } from "./language-switcher";
import { CowMark } from "./cow-mark";
import { NavIcon } from "./nav-icon";
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

  /**
   * ONE PANEL FOR THE WHOLE BAR, not a popover per button.
   *
   * The three groups used to open three small boxes of bare links, anchored
   * to their buttons, with nothing to say what is behind each page. Now the
   * bar opens one full-width panel under itself: every page a card with an
   * icon and a line saying what is there, a dimmed page behind so "tap
   * outside to close" is obvious, and moving to another trigger while it is
   * open swaps the contents in place instead of closing and reopening.
   */
  const [mega, setMega] = useState<NavGroup | null>(null);
  const closeMega = useCallback(() => setMega(null), []);
  useDismiss({ open: mega !== null, onDismiss: closeMega, containerRef: bar });

  // The page behind a full-screen phone menu must not scroll under it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const groupLabel = (group: NavGroup) =>
    group === "use"
      ? dict.nav.groupUse
      : group === "learn"
        ? dict.nav.groupLearn
        : group === "practise"
          ? dict.nav.groupPractise
          : dict.nav.groupAbout;

  const isCurrent = (segment: string) => {
    const target = href(locale, segment);
    return segment === "" ? pathname === target : pathname.startsWith(target);
  };

  return (
    <header
      ref={bar}
      /* The height is `--header-height` (globals.css) rather than whatever the
         tallest child happens to make it, because three other things have to
         clear this bar and were each guessing. Content is 44px + py-3, so the
         token is the height it already had — now by construction. */
      className="sticky top-0 z-30 h-[var(--header-height)] border-b border-border-strong bg-surface-page"
    >
      <div className="mx-auto flex w-full max-w-shell items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href={href(locale, "")}
          /* `min-h-11` rather than the mark's own 30px: the link back to the
             start page is on every page, and was the most-missed target on
             the site — one finding per page in the responsive audit. The
             row does not get taller; the header's padding already exceeds
             it. Only the hit area grows. */
          className="inline-flex min-h-11 min-w-11 items-center gap-2.5 whitespace-nowrap text-fg-primary"
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
                    /* `min-h-11 min-w-11`: rule 3 of the fleet's navigation
                       contract. These were 16-20px tall — measured at 1440px,
                       the one width this repo's audit never rendered. The bar
                       does not grow; the header is a fixed token height and
                       44px fits inside it. Only the hit area does. */
                    className={`inline-flex min-h-11 min-w-11 items-center justify-center whitespace-nowrap text-sm transition-colors ${
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

          {/* The material, what you do with it, and why it works this way. */}
          {(["learn", "practise", "about"] as const).map((group) => {
            const isOpen = mega === group;
            const current = groups.some((g) => g.group === group && g.routes.some((r) => isCurrent(r.segment)));
            return (
              <button
                key={group}
                type="button"
                aria-expanded={isOpen}
                aria-controls="mega-menu"
                onClick={() => setMega(isOpen ? null : group)}
                onPointerEnter={() => mega !== null && setMega(group)}
                className={`mx-1.5 inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap px-1.5 text-sm transition-colors ${
                  current || isOpen
                    ? "font-semibold text-fg-primary underline decoration-accent decoration-2 underline-offset-8"
                    : "text-fg-secondary hover:text-fg-primary"
                }`}
              >
                {groupLabel(group)}
                <svg
                  aria-hidden="true"
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  <path d="M2 4.5 6 8.5 10 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            );
          })}
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
            aria-label={open ? dict.nav.closeMenu : undefined}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-border-strong px-3 font-mono text-caption uppercase tracking-caps text-fg-primary lg:hidden"
          >
            {open ? "✕" : dict.nav.menu}
          </button>
        </div>
      </div>

      {mega && (
        <>
          {/* The dimmed page: pressing it closes the panel. */}
          <div
            aria-hidden="true"
            onClick={closeMega}
            className="fixed inset-x-0 bottom-0 top-[var(--header-height)] z-20 hidden bg-fg-primary/20 lg:block"
          />
          <div
            id="mega-menu"
            className="absolute inset-x-0 top-full z-30 hidden border-b border-border-strong bg-surface-page shadow-lg lg:block"
          >
            <nav aria-label={groupLabel(mega)} className="mx-auto w-full max-w-shell px-8 py-7">
              <MegaGroup group={mega} locale={locale} dict={dict} isCurrent={isCurrent} onPick={closeMega} />
            </nav>
          </div>
        </>
      )}

      {open && (
        <div
          id="site-menu"
          className="fixed inset-x-0 bottom-0 top-[var(--header-height)] z-50 overflow-y-auto overscroll-contain bg-surface-page lg:hidden"
        >
          <nav aria-label={dict.nav.menu} className="mx-auto w-full max-w-shell px-5 pb-10 pt-5 sm:px-8">
            {/* The two things people open the menu for, as buttons. */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={href(locale, "chat")}
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-control bg-action px-3 text-center font-medium text-on-action"
              >
                <NavIcon route="chat" />
                {dict.nav.quickChat}
              </Link>
              <Link
                href={href(locale, "practice")}
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-control border border-border-strong px-3 text-center font-medium text-fg-primary"
              >
                <NavIcon route="practice" />
                {dict.nav.quickPractice}
              </Link>
            </div>

            {groups
              .filter(({ group }) => group !== "use")
              .map(({ group, routes }) => (
                <section key={group} className="mt-7">
                  <h2 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{groupLabel(group)}</h2>
                  <ul className="mt-3 grid grid-cols-safe gap-2 xs:grid-cols-2">
                    {routes.map((route) => (
                      <li key={route.key} className="min-w-0">
                        <Link
                          href={href(locale, route.segment)}
                          prefetch={false}
                          onClick={() => setOpen(false)}
                          aria-current={isCurrent(route.segment) ? "page" : undefined}
                          className={`flex min-h-12 items-center gap-2.5 rounded-control border px-3 py-2 text-base ${
                            isCurrent(route.segment)
                              ? "border-border-strong font-semibold text-fg-primary"
                              : "border-border-subtle text-fg-secondary"
                          }`}
                        >
                          <NavIcon route={route.key} className="text-fg-muted" />
                          <span className="min-w-0 wrap-anywhere">{dict.nav[route.key]}</span>
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
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-5">
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
/**
 * A panel that is just its group's routes.
 *
 * No heading inside it: the trigger the reader just pressed already says
 * «Üben», and repeating it one line below is the menu explaining itself to
 * somebody who is looking at the answer.
 */
/**
 * One group's pages as cards — icon, name, and what is behind it — with the
 * dialect areas under "learn" and the project pages under "about" in their
 * headed columns. `onPick` closes the panel when a card is followed.
 */
function MegaGroup({
  group,
  locale,
  dict,
  isCurrent,
  onPick,
}: {
  group: NavGroup;
  locale: Locale;
  dict: Dictionary;
  isCurrent: (segment: string) => boolean;
  onPick: () => void;
}) {
  const routes = navGroups().find((g) => g.group === group)?.routes ?? [];
  const blurbs = dict.nav.blurbs as Record<string, string>;

  const card = (route: (typeof routes)[number]) => (
    <li key={route.key} className="min-w-0">
      <Link
        href={href(locale, route.segment)}
        prefetch={false}
        onClick={onPick}
        aria-current={isCurrent(route.segment) ? "page" : undefined}
        className={`group flex h-full gap-3 rounded-control border p-4 transition-colors hover:border-border-strong hover:bg-surface-raised ${
          isCurrent(route.segment) ? "border-border-strong" : "border-border-subtle"
        }`}
      >
        <NavIcon route={route.key} className="mt-0.5 text-fg-muted group-hover:text-accent" />
        <span className="min-w-0">
          <span className="block font-medium text-fg-primary">{dict.nav[route.key]}</span>
          {blurbs[route.key] && (
            <span className="mt-0.5 block text-sm leading-snug text-fg-secondary">{blurbs[route.key]}</span>
          )}
        </span>
      </Link>
    </li>
  );

  if (group === "about") {
    return (
      <div className="grid grid-cols-3 gap-6">
        {NAV_SECTIONS.map((section) => {
          const inSection = routes.filter((route) => route.section === section);
          if (inSection.length === 0) return null;
          return (
            <div key={section}>
              <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{dict.nav.sections[section]}</h3>
              <ul className="mt-3 flex flex-col gap-2">{inSection.map(card)}</ul>
            </div>
          );
        })}
        {routes.some((route) => route.section === undefined) && (
          <ul className="flex flex-col gap-2">{routes.filter((r) => r.section === undefined).map(card)}</ul>
        )}
      </div>
    );
  }

  return (
    <div>
      <ul className={`grid gap-3 ${routes.length >= 4 ? "grid-cols-4" : "grid-cols-3"}`}>{routes.map(card)}</ul>
      {group === "learn" && (
        <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border-subtle pt-4">
          <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{dict.dialect.areasTitle}</span>
          {DISPLAY.areas.map((area) => (
            <Link
              key={area.id}
              href={`${href(locale, "dialect")}/${area.id}`}
              prefetch={false}
              onClick={onPick}
              lang={DISPLAY.tag}
              title={area.taught ? dict.dialect.taught : undefined}
              className={`whitespace-nowrap text-sm ${
                area.taught ? "font-semibold text-dialect hover:text-accent" : "text-fg-secondary hover:text-fg-primary"
              }`}
            >
              {area.endonym}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
