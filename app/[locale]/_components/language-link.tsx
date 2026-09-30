"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { LANGUAGE_ROUTE } from "@/lib/domain/preferences/language";
import type { Locale } from "@/lib/i18n/locales";

/**
 * A link to the site in another language that also tells the account, so a
 * signed-in learner's choice follows them to the next device they sign in on
 * (see `lib/domain/preferences/language.ts`).
 *
 * Still a plain link underneath: crawlable, works without JavaScript, opens
 * in a new tab. The save is fire-and-forget with `keepalive`, because the
 * navigation it rides along with must never wait on it, and a failed save
 * costs one device a language, not the click.
 *
 * It does not ask whether anyone is signed in. Knowing that here would mean
 * reading the session while rendering every page, and a second session read
 * in one render can spend OrangeCat's single-use refresh token twice. The
 * route answers a signed-out click with 204 and stores nothing.
 */
export function LanguageLink({
  language,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { language: Locale }) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        void fetch(LANGUAGE_ROUTE, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ locale: language }),
          keepalive: true,
        }).catch(() => {});
      }}
    />
  );
}
