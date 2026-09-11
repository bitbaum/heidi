"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, isLocale, type Locale } from "@/lib/i18n/locales";

/**
 * Switching language keeps you on the page you were reading. Sending everyone
 * back to the home page is the standard failure of multilingual sites and it
 * is the reason people stop using the switcher at all.
 *
 * Rendered as links rather than a select so each language is crawlable, works
 * without JavaScript, and can be opened in a new tab.
 */
export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();

  const rest = (() => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0 && isLocale(parts[0])) return parts.slice(1).join("/");
    return parts.join("/");
  })();

  return (
    <nav aria-label={label} className="flex items-center gap-0.5">
      {LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={rest ? `/${locale}/${rest}` : `/${locale}`}
            hrefLang={locale}
            aria-current={active ? "true" : undefined}
            title={LOCALE_NAMES[locale]}
            className={`inline-flex min-h-9 items-center rounded-control px-1.5 font-mono text-[11px] uppercase tracking-caps transition-colors ${
              active ? "bg-surface-sunk font-semibold text-fg-primary" : "text-fg-muted hover:text-fg-primary"
            }`}
          >
            <span aria-hidden="true">{LOCALE_SHORT[locale]}</span>
            <span className="sr-only">{LOCALE_NAMES[locale]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
