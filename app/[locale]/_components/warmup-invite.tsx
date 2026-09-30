"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { warmupStore } from "./warmup-store";

/**
 * The door to the warm-up, where a newcomer already is.
 *
 * `hero` (home page): always there, because a first-time visitor is who the
 * home page is for. Once done it becomes the way back to the result rather
 * than disappearing, so nothing on the fold jumps.
 *
 * `card` (dashboard) and `line` (practice): only until it has been done. A
 * standing invitation to something you finished is clutter. They wait for
 * storage before rendering anything, so somebody who already did it never
 * sees the card flash and vanish.
 *
 * Never a gate: every page works without it, and nothing asks twice.
 */
export function WarmupInvite({
  t,
  locale,
  variant,
}: {
  t: Dictionary["warmup"];
  locale: Locale;
  variant: "hero" | "card" | "line";
}) {
  const ready = useStorageReady();
  const done = useBrowserStore(warmupStore) !== null;
  const to = href(locale, "warmup");

  if (variant === "hero") {
    return (
      <Link
        href={to}
        className="group mt-5 flex max-w-measure items-center justify-between gap-4 rounded-control border border-border-subtle px-4 py-3 transition-colors hover:border-border-strong"
      >
        <span className="min-w-0">
          <span className="block font-medium text-fg-primary">{t.inviteTitle}</span>
          <span className="block text-sm text-fg-secondary">{t.inviteBody}</span>
        </span>
        <span className="shrink-0 text-sm font-medium text-fg-primary underline underline-offset-4 group-hover:text-accent">
          {ready && done ? t.inviteResult : t.inviteCta} →
        </span>
      </Link>
    );
  }

  if (!ready || done) return null;

  if (variant === "line") {
    return (
      <p className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-control border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-fg-secondary">
        <span>
          <span className="font-medium text-fg-primary">{t.inviteTitle}</span> {t.inviteBody}
        </span>
        <Link href={to} className="text-link underline underline-offset-4 hover:text-accent">
          {t.inviteCta} →
        </Link>
      </p>
    );
  }

  return (
    <section className="mb-8 flex flex-col gap-4 rounded-control border border-accent bg-surface-raised p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <h2 className="font-heading text-xl font-semibold tracking-display text-fg-primary">{t.inviteTitle}</h2>
        <p className="mt-1 text-base leading-relaxed text-fg-secondary">{t.inviteBody}</p>
      </div>
      <Link
        href={to}
        className="inline-flex min-h-11 shrink-0 items-center rounded-control bg-action px-5 font-medium text-on-action hover:opacity-90"
      >
        {t.inviteCta} →
      </Link>
    </section>
  );
}
