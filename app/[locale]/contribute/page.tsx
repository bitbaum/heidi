import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { CONTACT_EMAIL } from "@/lib/config/site";
import { PageHeader, Section, Shell } from "../_components/page-shell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.contribute.title, description: dict.contribute.lead };
}

export default async function ContributePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  const t = dict.contribute;

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.contribute} title={t.title} lead={t.lead} />

      <Section title={t.whyTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.whyBody}</p>
      </Section>

      <Section title={t.needTitle}>
        <ul className="flex flex-col">
          {t.needList.map((item) => (
            <li key={item} className="flex gap-4 border-b border-border-subtle py-3 last:border-b-0">
              <span aria-hidden="true" className="text-accent">
                ·
              </span>
              <span className="max-w-measure text-base leading-relaxed text-fg-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.consentTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.consentBody}</p>
      </Section>

      <Section>
        <div className="border-l-2 border-accent bg-surface-raised px-5 py-6">
          <h2 className="font-heading text-xl font-semibold leading-tight tracking-display text-fg-primary">
            {t.ctaTitle}
          </h2>
          <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.ctaBody}</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-5 inline-flex min-h-11 items-center rounded-control bg-accent px-6 font-medium text-on-accent hover:opacity-90"
          >
            {t.ctaButton}
          </a>
          <p className="mt-3 font-mono text-caption text-fg-muted">{CONTACT_EMAIL}</p>
        </div>
      </Section>
    </Shell>
  );
}
