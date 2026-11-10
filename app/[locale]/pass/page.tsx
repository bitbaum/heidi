import type { Metadata } from "next";
import { payee } from "@/lib/config/payments";
import { pageMetadata } from "@/lib/config/seo";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { PageHeader, Section, Shell } from "../_components/page-shell";

// The payee is read from the environment of the running server, not of the build.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return pageMetadata(raw, "pass", { title: dict.pass.title, description: dict.pass.lead });
}

/**
 * How Heidi is paid: one button, to Heidi's public page on OrangeCat.
 *
 * WHAT THIS PAGE DOES NOT CLAIM. A payment there reaches Heidi, and nothing
 * here grants anything for it yet: OrangeCat's page knows no Heidi account,
 * so a payment cannot be matched to one. The page says that in as many words
 * rather than selling a pass it cannot hand over.
 *
 * The address comes from `lib/config/payments.ts`. No component writes it.
 */
export default async function PassPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDictionary(locale).pass;
  const { url } = payee();

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

      <Section title={t.notYetTitle}>
        <p className="max-w-measure leading-relaxed text-fg-secondary">{t.notYet}</p>
      </Section>
    </Shell>
  );
}
