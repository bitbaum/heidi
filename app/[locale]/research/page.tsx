import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { PageHeader, Section, Shell } from "../_components/page-shell";
import { SOURCES, type SourceId } from "@/lib/research/sources";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.research.title, description: dict.research.lead };
}

/**
 * One evidence claim, and the paper it rests on.
 *
 * The comment that used to sit here said "the source line is the point — an
 * unsourced claim here would be the thing this page exists to avoid", directly
 * above code that printed an author and a year in grey and linked to nothing.
 * A reader could not check a single number on the page.
 *
 * Now every claim carries a resolvable link. That is the whole difference
 * between citing a paper and mentioning one.
 */
function Claim({ claim, detail, source }: { claim: string; detail: string; source: readonly SourceId[] }) {
  return (
    <li className="border-b border-border-subtle py-5 last:border-b-0">
      <p className="max-w-measure font-medium leading-snug text-fg-primary">{claim}</p>
      <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{detail}</p>
      <ul className="mt-3 flex flex-col gap-1">
        {source.map((id) => {
          const s = SOURCES[id];
          return (
            <li key={id}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                // The full reference, not a bare "[1]": someone deciding
                // whether to click deserves to know the venue and the year
                // before they leave the page.
                className="font-mono text-[11px] leading-relaxed text-fg-muted underline decoration-border-subtle underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {s.authors} {s.year}. {s.title}. <span className="not-italic">{s.venue}</span>.
              </a>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

export default async function ResearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.research;

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.research} title={t.title} lead={t.lead} />

      <Section id="facts">
        <div className="flex flex-wrap items-baseline gap-x-4">
          <h2 className="font-heading text-2xl font-semibold leading-tight tracking-display text-fg-primary sm:text-3xl">
            {t.factTitle}
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-caps text-ok">{t.factNote}</p>
        </div>
        <ul className="mt-4">
          {t.facts.map((f) => (
            <Claim key={f.claim} {...f} />
          ))}
        </ul>
      </Section>

      <Section id="hypotheses">
        <div className="flex flex-wrap items-baseline gap-x-4">
          <h2 className="font-heading text-2xl font-semibold leading-tight tracking-display text-fg-primary sm:text-3xl">
            {t.hypothesisTitle}
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-caps text-accent">{t.hypothesisNote}</p>
        </div>
        <ul className="mt-4">
          {t.hypotheses.map((h) => (
            <Claim key={h.claim} {...h} />
          ))}
        </ul>
      </Section>

      <Section id="decisions">
        <div className="flex flex-wrap items-baseline gap-x-4">
          <h2 className="font-heading text-2xl font-semibold leading-tight tracking-display text-fg-primary sm:text-3xl">
            {t.decisionTitle}
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-caps text-link">{t.decisionNote}</p>
        </div>
        <ul className="mt-4 flex flex-col">
          {t.decisions.map((d) => (
            <li
              key={d}
              className="max-w-measure border-b border-border-subtle py-3 text-base leading-relaxed text-fg-secondary last:border-b-0"
            >
              {d}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="honesty">
        <div className="border-l-2 border-accent bg-surface-raised px-5 py-5">
          <h2 className="font-heading text-xl font-semibold leading-tight tracking-display text-fg-primary">
            {t.honestyTitle}
          </h2>
          <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.honestyBody}</p>
        </div>
      </Section>
    </Shell>
  );
}
