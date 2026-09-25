import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { Shell } from "./_components/page-shell";

/**
 * A not-found inside a dynamic segment cannot read the locale param, so this
 * answers in the default language. Better than guessing wrong, and middleware
 * means a visitor who has chosen a language still sees their own chrome
 * around it.
 */
export default function NotFound() {
  const dict = getDictionary(DEFAULT_LOCALE);
  return (
    <Shell>
      <div className="py-20 sm:py-28">
        <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">404</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-display text-fg-primary sm:text-5xl">
          {dict.errors.notFoundTitle}
        </h1>
        <p className="mt-4 max-w-measure text-lg leading-relaxed text-fg-secondary">{dict.errors.notFoundBody}</p>
        <Link
          href={href(DEFAULT_LOCALE, "")}
          className="mt-8 inline-flex min-h-11 items-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90"
        >
          {dict.errors.backHome}
        </Link>
      </div>
    </Shell>
  );
}
