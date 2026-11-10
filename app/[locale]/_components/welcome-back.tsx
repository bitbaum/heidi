"use client";

import Link from "next/link";
import { useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { focusScope } from "@/lib/domain/practice/focus";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { plural } from "@/lib/i18n/plural";
import { focusStore } from "./focus-store";
import { SessionLink } from "./session/links";
import { streakStore } from "./streak-store";

/**
 * The home page for somebody who has been here before, signed out.
 *
 * Their practice lives in this browser, so the server cannot tell them from a
 * stranger and used to send the whole introduction again — ten thousand
 * pixels of "what is Heidi" to somebody on day six. This card appears only
 * when the browser holds practice (it renders NOTHING for a first visit, so
 * there is no flash either way), and puts their next step above everything:
 * carry on, or keep it on every device with an account.
 */
export function WelcomeBack({
  locale,
  t,
  streakT,
  signUpHref,
}: {
  locale: Locale;
  t: Dictionary["mySituations"];
  streakT: Dictionary["streak"];
  /** Null when this deployment has no accounts. */
  signUpHref: string | null;
}) {
  const ready = useStorageReady();
  const streak = useBrowserStore(streakStore);
  const focus = useBrowserStore(focusStore);
  if (!ready || (!streak?.lastDay && !focus?.scenes.length)) return null;

  return (
    <section
      aria-labelledby="welcome-back"
      className="mt-6 rounded-control border border-border-strong bg-surface-raised p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6"
    >
      <div className="min-w-0">
        {streak && streak.current > 0 && (
          <p className="mb-1 font-mono text-caption uppercase tracking-caps text-fg-muted">
            {plural(streakT.days, streak.current, locale)}
          </p>
        )}
        <h2 id="welcome-back" className="font-heading text-xl font-semibold tracking-display text-fg-primary">
          {t.welcome}
        </h2>
        <p className="mb-0 mt-1 max-w-measure text-base leading-relaxed text-fg-secondary">{t.welcomeLead}</p>
      </div>
      <div className={`mt-4 grid shrink-0 gap-3 sm:mt-0 ${signUpHref ? "grid-cols-2" : "grid-cols-1"}`}>
        <SessionLink
          locale={locale}
          scope={focusScope(focus)}
          className="inline-flex min-h-12 items-center justify-center rounded-control bg-action px-3 text-center font-medium text-on-action hover:opacity-90"
        >
          {t.cont}
        </SessionLink>
        {signUpHref && (
          <Link
            href={signUpHref}
            prefetch={false}
            className="inline-flex min-h-12 items-center justify-center rounded-control border border-border-strong px-3 text-center font-medium text-fg-primary hover:bg-surface-page"
          >
            {t.keep}
          </Link>
        )}
      </div>
    </section>
  );
}
