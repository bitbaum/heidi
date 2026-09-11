import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { VARIETY } from "@/lib/variety/active";
import { ruleLabel } from "@/lib/variety/pack";
import { PageHeader, Section, Shell } from "../_components/page-shell";
import { CheckForm } from "./check-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.check.title, description: dict.check.intro };
}

export default async function CheckPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  const t = dict.check;

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.check} title={t.title} lead={t.intro} />

      <Section>
        <CheckForm t={t} />
      </Section>

      <Section title={t.whyTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.whyBody}</p>
        <ul className="mt-6 flex flex-col gap-2 rounded-control border border-border-subtle bg-surface-raised p-4 font-mono text-sm">
          {VARIETY.rules.map((rule, i) => (
            <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-fg-primary">
                {ruleLabel(rule)}
              </span>
              {rule.origin && <span className="text-[11px] uppercase tracking-caps text-fg-muted">{rule.origin}</span>}
              {rule.suggest && <span className="text-ok">→ {rule.suggest}</span>}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.noteTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.noteBody}</p>
        <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{VARIETY.orthography.note}</p>
      </Section>
    </Shell>
  );
}
