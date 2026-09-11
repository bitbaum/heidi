"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { NAV_ROUTES, href } from "@/lib/i18n/routes";
import { LanguageSwitcher } from "./language-switcher";

/**
 * The site header: brand, navigation, language.
 *
 * A client component only because of the mobile disclosure. The links
 * themselves are ordinary anchors, so navigation works with JavaScript off and
 * the menu simply starts open-able rather than broken.
 */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isCurrent = (segment: string) => {
    const target = href(locale, segment);
    return segment === "" ? pathname === target : pathname.startsWith(target);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface-page/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-shell items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href={href(locale, "")}
          className="whitespace-nowrap font-heading text-xl font-semibold tracking-display text-fg-primary sm:text-2xl"
        >
          Heidi
        </Link>

        <nav aria-label={dict.nav.menu} className="hidden lg:flex lg:items-center lg:gap-6">
          {NAV_ROUTES.map((route) => (
            <Link
              key={route.key}
              href={href(locale, route.segment)}
              aria-current={isCurrent(route.segment) ? "page" : undefined}
              className={`whitespace-nowrap text-sm transition-colors ${
                isCurrent(route.segment)
                  ? "font-medium text-fg-primary"
                  : "text-fg-secondary hover:text-fg-primary"
              }`}
            >
              {dict.nav[route.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
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
            className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-3 font-mono text-[11px] uppercase tracking-caps text-fg-secondary lg:hidden"
          >
            {dict.nav.menu}
          </button>
        </div>
      </div>

      {open && (
        <div id="site-menu" className="border-t border-border-subtle bg-surface-raised lg:hidden">
          <nav aria-label={dict.nav.menu} className="mx-auto w-full max-w-shell px-5 py-3 sm:px-8">
            <ul className="flex flex-col">
              {NAV_ROUTES.map((route) => (
                <li key={route.key}>
                  <Link
                    href={href(locale, route.segment)}
                    onClick={() => setOpen(false)}
                    aria-current={isCurrent(route.segment) ? "page" : undefined}
                    className={`flex min-h-12 items-center border-b border-border-subtle text-base ${
                      isCurrent(route.segment) ? "font-medium text-fg-primary" : "text-fg-secondary"
                    }`}
                  >
                    {dict.nav[route.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
