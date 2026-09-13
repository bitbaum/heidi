import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { NumberedList, PageHeader, Section, Shell } from "../_components/page-shell";
import { RuleCheck } from "../_components/rule-check";
import { DISPLAY } from "@/lib/variety/display";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.method.title, description: dict.method.lead };
}

export default async function MethodPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.method;

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.method} title={t.title} lead={t.lead} />

      <Section>
        <NumberedList items={t.sections} />
      </Section>

      {/* The evidence for "a fixed list decides, not the model". It was a page
          of its own, second in the nav, and it asked the visitor to paste
          Zurich German — which is the one thing Heidi's learner cannot yet
          produce. As proof it works; as a task it never did. */}
      <Section title={dict.check.whyTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{dict.check.whyBody}</p>

        <ul className="mt-6 flex flex-col gap-2 rounded-control border border-border-subtle bg-surface-raised p-4 font-mono text-sm">
          {DISPLAY.rules.map((rule) => (
            <li key={rule.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-fg-primary">{rule.label}</span>
              {rule.origin && (
                <span className="text-[11px] uppercase tracking-caps text-fg-muted">{rule.origin}</span>
              )}
              {rule.suggest && <span className="text-ok">→ {rule.suggest}</span>}
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-measure text-base leading-relaxed text-fg-secondary">{dict.check.intro}</p>
        <div className="mt-4">
          <RuleCheck t={dict.check} />
        </div>

        <p className="mt-8 max-w-measure text-sm leading-relaxed text-fg-muted">{dict.check.noteBody}</p>
      </Section>

      <Section title={t.loopTitle}>
        <ol className="flex flex-col gap-0">
          {t.loopSteps.map((step, i) => (
            <li key={step} className="flex gap-4 border-b border-border-subtle py-4 last:border-b-0">
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-caps text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="max-w-measure text-base leading-relaxed text-fg-secondary">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-measure border-l-2 border-accent pl-4 text-base leading-relaxed text-fg-primary">
          {t.loopNote}
        </p>
      </Section>

      <Section>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href={href(locale, "research")}
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            {dict.home.researchLink}
          </Link>
          <Link
            href={href(locale, "")}
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            {dict.nav.home}
          </Link>
        </div>
      </Section>
    </Shell>
  );
}
