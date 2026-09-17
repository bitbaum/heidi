import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { Shell } from "../../_components/page-shell";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Where Auth.js sends a failed sign-in.
 *
 * It deliberately does not print the provider's error code: the codes are
 * useless to a visitor and a gift to anyone probing the endpoint. The
 * operator's copy of the failure is in the server log, which is where a
 * forensic detail belongs.
 */
export default async function AuthErrorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <Shell>
      <div className="py-20 sm:py-28">
        <p className="font-mono text-caption uppercase tracking-caps text-accent">{dict.auth.signIn}</p>
        <h1 className="mt-3 max-w-[20ch] font-heading text-3xl font-semibold leading-tight tracking-display text-fg-primary sm:text-4xl">
          {dict.auth.errorTitle}
        </h1>
        <p className="mt-4 max-w-measure text-lg leading-relaxed text-fg-secondary">{dict.auth.errorBody}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={href(locale, "portal")}
            className="inline-flex min-h-11 items-center rounded-control bg-accent px-6 font-medium text-on-accent hover:opacity-90"
          >
            {dict.auth.tryAgain}
          </Link>
          <Link
            href={href(locale, "")}
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            {dict.errors.backHome}
          </Link>
        </div>
      </div>
    </Shell>
  );
}
