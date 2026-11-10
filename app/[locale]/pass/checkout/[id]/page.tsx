import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { renderSVG } from "uqr";
import { auth, authEnabled } from "@/lib/auth";
import { signInPath } from "@/lib/auth/paths";
import { passDays } from "@/lib/config/payments";
import { pageMetadata } from "@/lib/config/seo";
import { getDictionary } from "@/lib/i18n";
import { fill } from "@/lib/i18n/fill";
import { DEFAULT_LOCALE, LOCALE_TAGS, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { checkoutView } from "@/lib/pay/service";
import { Shell } from "../../../_components/page-shell";
import { CheckoutStatus } from "./checkout-status";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  // Somebody's own invoice: its address is written nowhere in the head.
  return pageMetadata(raw, null, { title: getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE).pass.auto.title });
}

/**
 * One invoice: the code to scan, the link that opens a wallet, and whether it
 * has been paid.
 *
 * Rendered on the server from the stored checkout, so the QR code is in the
 * HTML and needs no script to appear. Only the person it was made for can
 * open it; for anybody else it does not exist.
 */
export default async function CheckoutPage({ params }: { params: Params }) {
  const { locale: raw, id } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDictionary(locale).pass.auto;

  const session = authEnabled ? await auth() : null;
  if (!session?.actorId) redirect(signInPath(`/${locale}/pass/checkout/${id}`));

  const view = await checkoutView(id, session.actorId).catch(() => null);
  if (!view) notFound();

  const days = passDays(view.planId);
  const sats = new Intl.NumberFormat(LOCALE_TAGS[locale]).format(view.amount);
  // A wide quiet zone and black on white whatever the theme: a wallet's
  // camera reads contrast, not the brand.
  const qr = view.invoice ? renderSVG(view.invoice, { border: 2, ecc: "M" }) : null;

  return (
    <Shell>
      <div className="mx-auto max-w-md py-10 sm:py-14">
        <h1 className="font-heading text-3xl font-semibold tracking-display text-fg-primary">
          {fill(t.checkoutTitle, { sats })}
        </h1>
        {days !== null && <p className="mt-2 text-fg-secondary">{fill(t.days, { days: String(days) })}</p>}

        <CheckoutStatus
          id={view.id}
          locale={locale}
          initial={{ state: view.state, expiresAt: view.entitlement?.expiresAt ?? null }}
          invoice={view.invoice}
          payUrl={view.payUrl}
          words={{
            scan: t.scan,
            openWallet: t.openWallet,
            copy: t.copy,
            copied: t.copied,
            waiting: t.waiting,
            paid: t.paid,
            expired: t.expired,
            again: t.again,
            qrLabel: t.qrLabel,
          }}
          backHref={href(locale, "pass")}
        >
          {qr && (
            <div
              role="img"
              aria-label={t.qrLabel}
              className="mx-auto mt-6 w-full max-w-xs rounded-control border border-border-subtle bg-white p-2 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
          )}
        </CheckoutStatus>

        <p className="mt-8 text-sm leading-relaxed text-fg-secondary">{t.payeeNote}</p>
        <Link href={href(locale, "pass")} className="mt-4 inline-flex min-h-11 items-center underline underline-offset-4">
          {t.back}
        </Link>
      </div>
    </Shell>
  );
}
