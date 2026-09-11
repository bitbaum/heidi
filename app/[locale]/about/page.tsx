import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { VARIETY } from "@/lib/variety/active";
import { NumberedList, PageHeader, Section, Shell } from "../_components/page-shell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.about.title, description: dict.about.lead };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.about;

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.about} title={t.title} lead={t.lead} />

      <Section>
        <NumberedList items={t.sections} />
      </Section>

      <Section title={t.stateTitle}>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {[
            [VARIETY.name, VARIETY.endonym],
            [dict.nav.language, VARIETY.region],
            [dict.check.title, VARIETY.orthography.convention],
          ].map(([term, value]) => (
            <div key={term} className="border-b border-border-subtle pb-3">
              <dt className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{term}</dt>
              <dd className="mt-1 text-base text-fg-primary">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-measure text-base leading-relaxed text-fg-secondary">{VARIETY.learner.because}</p>
      </Section>

      <Section>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href={href(locale, "contribute")}
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            {dict.nav.contribute}
          </Link>
          <a
            href="https://orangecat.ch"
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            orangecat.ch
          </a>
        </div>
      </Section>
    </Shell>
  );
}
