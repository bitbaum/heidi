import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { actorOfToken } from "@/lib/mail/unsubscribe";
import { PageHeader, Shell } from "../_components/page-shell";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string; done?: string }>;
};

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Where the footer link of a reminder lands. One page, three honest states:
 * the question (with ONE button that does it), done, and "this link is not
 * valid". It never signs anybody in and never asks for anything but the tap.
 *
 * The button is a form POST rather than the link doing it, because a mail
 * scanner opens every URL in a message and must not be able to unsubscribe
 * people by looking.
 */
export default async function UnsubscribePage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const query = await searchParams;
  const t = getDictionary(locale).mailPrefs;
  const token = query.t ?? "";
  const valid = actorOfToken(token) !== null;
  const done = query.done === "1";

  return (
    <Shell>
      <PageHeader title={done ? t.doneTitle : t.title} lead={done ? t.doneBody : valid ? t.body : t.invalid} />
      <div className="max-w-md py-10 sm:py-14">
        {!done && valid && (
          <form method="post" action={`/api/mail/unsubscribe?t=${encodeURIComponent(token)}&next=${encodeURIComponent(href(locale, "unsubscribe"))}`}>
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-action px-6 font-medium text-on-action transition-opacity hover:opacity-90"
            >
              {t.button}
            </button>
          </form>
        )}
        <p className="mt-6 text-sm leading-relaxed text-fg-secondary">
          <Link href={href(locale, "settings")} className="underline underline-offset-4">
            {t.settings}
          </Link>
        </p>
      </div>
    </Shell>
  );
}
