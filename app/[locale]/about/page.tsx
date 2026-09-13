import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { DISPLAY } from "@/lib/variety/display";
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

      <Section title={dict.vision.title} id="vision">
        <p className="max-w-measure text-lg leading-relaxed text-fg-secondary">{dict.vision.lead}</p>
        <div className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {dict.vision.points.map((p, i) => (
            <article key={p.title}>
              <div className="mb-3 font-mono text-[11px] uppercase tracking-caps text-accent">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-heading text-xl font-semibold leading-tight tracking-display text-fg-primary">
                {p.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-fg-secondary">{p.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-measure border-l-2 border-accent pl-4 text-base leading-relaxed text-fg-primary">
          {dict.vision.closing}
        </p>
      </Section>

      <Section title={t.stateTitle}>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {[
            [DISPLAY.name, DISPLAY.endonym],
            [dict.nav.language, DISPLAY.region],
            [dict.check.title, DISPLAY.orthography.convention],
          ].map(([term, value]) => (
            <div key={term} className="border-b border-border-subtle pb-3">
              <dt className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{term}</dt>
              <dd className="mt-1 text-base text-fg-primary">{value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href={href(locale, "contribute")}
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            {dict.nav.contribute}
          </Link>
          <Link
            href={href(locale, "method")}
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            {dict.nav.method}
          </Link>
        </div>
      </Section>
    </Shell>
  );
}
