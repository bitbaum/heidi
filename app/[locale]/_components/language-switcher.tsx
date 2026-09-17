"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useDismiss } from "./use-dismiss";
import Link from "next/link";
import {
  GROUP_ORDER,
  LOCALE_NAMES,
  LOCALE_SHORT,
  isLocale,
  localesInGroup,
  type Locale,
  type LocaleGroup,
} from "@/lib/i18n/locales";

/**
 * One button that opens a grouped menu, not six abbreviations in a row.
 *
 * Six inline codes is not a choice, it is a wall, and it reads as noise next
 * to the navigation. It also flattens a real distinction: four of these are
 * the national languages of the country the product is about; two are here
 * because many of the people with this problem arrived speaking them.
 *
 * Still links underneath, so every language stays crawlable, works with
 * JavaScript off (the menu is simply always rendered then), and can be opened
 * in a new tab.
 */
export function LanguageSwitcher({
  current,
  label,
  groupLabels,
  align = "right",
}: {
  current: Locale;
  label: string;
  groupLabels: Record<LocaleGroup, string>;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // The path below the locale, so switching keeps you on the page you are
  // reading. Sending everyone to the home page is why people stop using these.
  const rest = (() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.length > 0 && isLocale(parts[0]) ? parts.slice(1).join("/") : parts.join("/");
  })();

  /**
   * Escape used to close this and leave focus nowhere — the panel unmounted
   * from under it and the next Tab restarted the page at the skip link. The
   * shared hook is the version that returns focus to the trigger.
   */
  const dismiss = useCallback(() => setOpen(false), []);
  useDismiss({ open, onDismiss: dismiss, containerRef: root, focusRef: button });

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={label}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-control border border-border-strong px-3 text-fg-secondary transition-colors hover:text-fg-primary"
      >
        <span aria-hidden="true" className="text-[13px]">
          🌐
        </span>
        <span className="font-mono text-[11px] uppercase tracking-caps">{LOCALE_SHORT[current]}</span>
        <span aria-hidden="true" className="text-[9px] leading-none text-fg-muted">
          ▼
        </span>
      </button>

      {open && (
        <div
          className={`absolute z-40 mt-1 w-56 overflow-hidden rounded-control border border-border-strong bg-surface-raised shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {GROUP_ORDER.map((group) => (
            <div key={group} className="border-b border-border-subtle last:border-b-0">
              <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-caps text-fg-muted">
                {groupLabels[group]}
              </p>
              <ul>
                {localesInGroup(group).map((locale) => {
                  const active = locale === current;
                  return (
                    <li key={locale}>
                      <Link
                        href={rest ? `/${locale}/${rest}` : `/${locale}`}
                        hrefLang={locale}
                        aria-current={active ? "true" : undefined}
                        onClick={() => setOpen(false)}
                        className={`flex min-h-11 items-center justify-between gap-3 px-3 transition-colors ${
                          active
                            ? "bg-surface-sunk font-medium text-fg-primary"
                            : "text-fg-secondary hover:bg-surface-sunk hover:text-fg-primary"
                        }`}
                      >
                        <span className="text-sm">{LOCALE_NAMES[locale]}</span>
                        <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">
                          {LOCALE_SHORT[locale]}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
