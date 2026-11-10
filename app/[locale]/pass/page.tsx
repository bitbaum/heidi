import type { Metadata } from "next";
import Link from "next/link";
import { isActive } from "@bitbaum/paykit/checkout";
import { auth, authEnabled } from "@/lib/auth";
import { signInPath } from "@/lib/auth/paths";
import { paymentsConfig } from "@/lib/config/payments";
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

// The payee's state is read from OrangeCat and the pass from the database.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  // Out of the index until there is something to buy.
  return pageMetadata(raw, "pass", { title: dict.pass.title, description: dict.pass.lead, noindex: !paymentsConfig() });
}

/**
 * The pass: what it is, what it costs, and the button that pays for it.
 *
 * THE BUTTON IS ONLY EVER TRUE. It can be pressed when payments are
 * configured AND OrangeCat shows somewhere for the money to land. In every
 * other state the page says which thing is missing, in a sentence, where the
 * button would be: an offer nobody can take is worse than no offer.
 */
export default async function PassPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDictionary(locale).pass;

  const payments = await paymentsState();
  const session = authEnabled ? await auth() : null;
  const actorId = session?.actorId ?? null;
  const pass = payments.state !== "off" && actorId ? await entitlementOf(actorId).catch(() => null) : null;
  const number = new Intl.NumberFormat(LOCALE_TAGS[locale]);

  const unavailable =
    payments.state === "off" ? t.off : payments.state === "no-wallet" ? t.noWallet : payments.state === "unknown" ? t.unknown : null;

  return (
    <Shell>
      <PageHeader title={t.title} lead={t.lead} />

      <Section title={t.howTitle}>
        <p className="max-w-measure leading-relaxed text-fg-secondary">{t.how}</p>

        {isActive(pass) && pass && (
          <p className="mt-6 max-w-measure border-l-2 border-border-strong pl-4 leading-relaxed text-fg-primary">
            {fill(t.active, { date: formatDate(pass.expiresAt, locale) })} <span className="text-fg-secondary">{t.extend}</span>
          </p>
        )}

        {payments.state === "off" ? (
          <p role="status" className="mt-8 max-w-measure rounded-control border border-border-subtle bg-surface-sunk p-4 text-fg-secondary">
            {t.off}
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-safe gap-4 sm:grid-cols-2">
            {payments.config.plans.map((plan) => (
              <li key={plan.id} className="flex min-w-0 flex-col gap-4 rounded-control border border-border-subtle p-5">
                <div>
                  <p className="font-heading text-2xl font-semibold text-fg-primary">{fill(t.days, { days: String(plan.days) })}</p>
                  <p className="mt-1 font-mono text-fg-secondary">{fill(t.sats, { sats: number.format(plan.price.amount) })}</p>
                </div>
                {unavailable ? (
                  <p role="status" className="text-sm leading-relaxed text-fg-secondary">
                    {unavailable}
                  </p>
                ) : actorId ? (
                  <BuyPass plan={plan.id} locale={locale} label={t.buy} failed={t.failed} />
                ) : (
                  <Link
                    href={signInPath(href(locale, "pass"))}
                    className="inline-flex min-h-11 items-center justify-center rounded-control bg-action px-5 text-center font-medium text-on-action hover:opacity-90"
                  >
                    {t.signIn}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}

        {payments.state !== "off" && payments.payee && (
          <p className="mt-8 max-w-measure text-sm leading-relaxed text-fg-secondary">
            <a href={payments.payee.url} rel="noopener" className="underline underline-offset-4 hover:text-fg-primary">
              {t.payee}
            </a>
            . {t.payeeNote}
          </p>
        )}
      </Section>
    </Shell>
  );
}
