import type { Metadata } from "next";
import Link from "next/link";
import { isActive } from "@bitbaum/paykit/checkout";
import { auth, authEnabled } from "@/lib/auth";
import { signInPath } from "@/lib/auth/paths";
import { payee } from "@/lib/config/payments";
import { pageMetadata } from "@/lib/config/seo";
import { getDictionary } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n/dates";
import { fill } from "@/lib/i18n/fill";
import { DEFAULT_LOCALE, LOCALE_TAGS, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { paymentsState } from "@/lib/pay/service";
import { entitlementOf } from "@/lib/pay/store";
import { PageHeader, Section, Shell } from "../_components/page-shell";
import { BuyPass } from "./buy-pass";

// The payee and the prices are read from the environment of the running
// server, and the learner's pass from the database.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return pageMetadata(raw, "pass", { title: dict.pass.title, description: dict.pass.lead });
}

/**
 * How Heidi is paid.
 *
 * ALWAYS: one button to Heidi's public page on OrangeCat. A payment there
 * reaches Heidi and grants nothing here, because OrangeCat's page knows no
 * Heidi account; the page says so.
 *
 * WHEN SWITCHED ON: passes. Heidi asks OrangeCat for an invoice itself, so it
 * knows whose it is, and the pass starts when the payment settles. Until the
 * prices are configured that section says, in one sentence, that it is not
 * switched on — an offer nobody can take is worse than no offer.
 *
 * The address comes from `lib/config/payments.ts`. No component writes it.
 */
export default async function PassPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDictionary(locale).pass;
  const a = t.auto;
  const { url } = payee();

  const payments = paymentsState();
  const session = payments.state === "on" && authEnabled ? await auth() : null;
  const actorId = session?.actorId ?? null;
  const pass = actorId ? await entitlementOf(actorId).catch(() => null) : null;
  const number = new Intl.NumberFormat(LOCALE_TAGS[locale]);

  return (
    <Shell>
      <PageHeader title={t.title} lead={t.lead}>
        <a
          href={url}
          rel="noopener"
          data-pay="orangecat"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-control bg-action px-6 text-center font-medium text-on-action hover:opacity-90"
        >
          {t.button}
        </a>
      </PageHeader>

      <Section title={t.howTitle}>
        <p className="max-w-measure leading-relaxed text-fg-secondary">{t.how}</p>
      </Section>

      <Section title={a.title} lead={a.lead}>
        {payments.state === "off" ? (
          <>
            <p
              role="status"
              data-pass="off"
              className="max-w-measure rounded-control border border-border-subtle bg-surface-sunk p-4 text-fg-secondary"
            >
              {a.off}
            </p>
            <p className="mt-4 max-w-measure leading-relaxed text-fg-secondary">{t.notYet}</p>
          </>
        ) : (
          <>
            <p className="max-w-measure leading-relaxed text-fg-secondary">{a.how}</p>

            {isActive(pass) && pass && (
              <p className="mt-6 max-w-measure border-l-2 border-border-strong pl-4 leading-relaxed text-fg-primary">
                {fill(a.active, { date: formatDate(pass.expiresAt, locale) })}{" "}
                <span className="text-fg-secondary">{a.extend}</span>
              </p>
            )}

            <ul className="mt-8 grid grid-cols-safe gap-4 sm:grid-cols-2">
              {payments.config.plans.map((plan) => (
                <li key={plan.id} className="flex min-w-0 flex-col gap-4 rounded-control border border-border-subtle p-5">
                  <div>
                    <p className="font-heading text-2xl font-semibold text-fg-primary">
                      {fill(a.days, { days: String(plan.days) })}
                    </p>
                    <p className="mt-1 font-mono text-fg-secondary">{fill(a.sats, { sats: number.format(plan.price.amount) })}</p>
                  </div>
                  {actorId ? (
                    <BuyPass plan={plan.id} locale={locale} label={a.buy} failed={a.failed} />
                  ) : (
                    <Link
                      href={signInPath(href(locale, "pass"))}
                      className="inline-flex min-h-11 items-center justify-center rounded-control bg-action px-5 text-center font-medium text-on-action hover:opacity-90"
                    >
                      {a.signIn}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-8 max-w-measure text-sm leading-relaxed text-fg-secondary">{a.payeeNote}</p>
          </>
        )}
      </Section>
    </Shell>
  );
}
