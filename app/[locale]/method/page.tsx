import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { NumberedList, PageHeader, Section, Shell } from "../_components/page-shell";
import { RuleCheck } from "../_components/rule-check";
import { DISPLAY } from "@/lib/variety/display";
import { SOURCES, type SourceId } from "@/lib/research/sources";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.method.title, description: dict.method.lead };
}

/**
 * One evidence claim, and the paper it rests on.
 *
 * The comment that used to sit here said "the source line is the point — an
 * unsourced claim here would be the thing this page exists to avoid", directly
 * above code that printed an author and a year in grey and linked to nothing.
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
                /* A reference is English wherever it is printed — translating
                   a paper title would make it unfindable — so the markup says
                   so. A screen reader then pronounces it as English instead
                   of as broken German, and `audit:language` stops reading a
                   bibliography as a leak. */
                lang="en"
                // The full reference, not a bare "[1]": someone deciding
                // whether to click deserves to know the venue and the year
                // before they leave the page.
                className="font-mono text-caption leading-relaxed text-fg-muted underline decoration-border-subtle underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
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

/** A heading with its confidence label beside it, which is the point of the split. */
function Graded({ title, note, tone }: { title: string; note: string; tone: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4">
      <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
        {title}
      </h2>
      <p className={`font-mono text-caption uppercase tracking-caps ${tone}`}>{note}</p>
    </div>
  );
}

/**
 * How Heidi works, and what that rests on — one page.
 *
 * It was two. "Method" said what we do, "Research" said why we believe it, and
 * a reader met them as peers in a menu with no way to tell which was which.
 * They are not peers: the evidence is the argument FOR the method, which is
 * also why the dialect checker already lives here rather than in a page of its
 * own.
 *
 * The three-way split — established / hypothesis / decision — is the part worth
 * protecting in the merge. It is what stops a product like this accumulating
 * pseudoscience, and it earned its keep once already: a claim that could not be
 * verified moved from the first bucket to the second rather than being quietly
 * dressed up.
 */
export default async function MethodPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.method;
  const r = dict.research;

  // Anchors, in page order. `#facts`, `#hypotheses`, `#decisions` and
  // `#honesty` keep the ids they had as a separate page, so links already in
  // the world still land in the right place.
  const contents = [
    { id: "approach", label: t.title },
    { id: "gate", label: dict.check.whyTitle },
    { id: "loop", label: t.loopTitle },
    { id: "facts", label: r.factTitle },
    { id: "hypotheses", label: r.hypothesisTitle },
    { id: "decisions", label: r.decisionTitle },
    { id: "honesty", label: r.honestyTitle },
  ];

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.method} title={t.title} lead={t.lead} />

      {/* The page is long because it carries the whole argument. A contents
          list is the cheapest thing that keeps it navigable, and it is how
          someone arriving from a citation finds the bucket they were sent to. */}
      <nav aria-label={t.contents} className="border-b border-border-subtle py-5">
        <h2 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.contents}</h2>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {contents.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-flex min-h-11 items-center text-base text-link underline decoration-border-subtle underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="approach">
        <NumberedList items={t.sections} />
      </Section>

      {/* The evidence for "a fixed list decides, not the model". It was a page
          of its own, second in the nav, and it asked the visitor to paste
          Zurich German — which is the one thing Heidi's learner cannot yet
          produce. As proof it works; as a task it never did. */}
      <Section id="gate" title={dict.check.whyTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{dict.check.whyBody}</p>

        <ul className="mt-6 flex flex-col gap-2 rounded-control border border-border-subtle bg-surface-raised p-4 font-mono text-sm">
          {DISPLAY.rules.map((rule) => (
            <li key={rule.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-fg-primary">{rule.label}</span>
              {rule.origin && (
                <span className="text-caption uppercase tracking-caps text-fg-muted">{rule.origin}</span>
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

      <Section id="loop" title={t.loopTitle}>
        <ol className="flex flex-col gap-0">
          {t.loopSteps.map((step, i) => (
            <li key={step} className="flex gap-4 border-b border-border-subtle py-4 last:border-b-0">
              <span className="shrink-0 font-mono text-caption uppercase tracking-caps text-accent">
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

      {/* Everything below was the research page. The lead that introduced it is
          kept, because "we keep three things apart" is the sentence that makes
          the three headings mean anything. */}
      <Section id="evidence" title={r.title}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{r.lead}</p>
      </Section>

      <Section id="facts">
        <Graded title={r.factTitle} note={r.factNote} tone="text-ok" />
        <ul className="mt-4">
          {r.facts.map((f) => (
            <Claim key={f.claim} {...f} />
          ))}
        </ul>
      </Section>

      <Section id="hypotheses">
        <Graded title={r.hypothesisTitle} note={r.hypothesisNote} tone="text-accent" />
        <ul className="mt-4">
          {r.hypotheses.map((h) => (
            <Claim key={h.claim} {...h} />
          ))}
        </ul>
      </Section>

      <Section id="decisions">
        <Graded title={r.decisionTitle} note={r.decisionNote} tone="text-link" />
        <ul className="mt-4 flex flex-col">
          {r.decisions.map((d) => (
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
            {r.honestyTitle}
          </h2>
          <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{r.honestyBody}</p>
        </div>
      </Section>

      <Section>
        <Link
          href={href(locale, "")}
          className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
        >
          {dict.nav.home}
        </Link>
      </Section>
    </Shell>
  );
}
