import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { CONTACT_EMAIL } from "@/lib/config/site";
import { LEARNER_NOTE, ROLES, roleMailto } from "@/lib/config/roles";
import { sectorLocale } from "@/lib/config/sectors";
import { PageHeader, Section, Shell } from "../_components/page-shell";
import { OtherLanguage } from "../_components/other-language";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.contribute.title, description: dict.contribute.lead };
}

/**
 * The register: the ways to be part of this other than by learning from it.
 *
 * WHAT THIS PAGE WAS. One ask — record your voice — and a mail link. Which
 * made it a recruitment page for a single job, on a product whose social layer
 * was reported as missing entirely: "no one can register as a tutor or study
 * partner, the social aspect lacks entirely."
 *
 * Half of that was a build problem and half was this page. The machinery is
 * further along than the site ever said: study groups with invite links exist,
 * and speaking rounds with topics, sign-ups and attendance exist, in the
 * database, today. What never existed was a ROLE other than "learner", and
 * anywhere explaining what any of it was for.
 *
 * ORDERED BY COMMITMENT, SMALLEST FIRST — and the smallest is the one worth
 * most. Reading twenty lines over a coffee unblocks the first item on the
 * roadmap; "become a tutor" is a bigger ask with a smaller return, and the
 * person who reads lines once is the person who later does the next thing.
 *
 * EVERY ROLE STATES WHAT EXISTS TODAY, including the two that are "built and
 * empty" and the one that is "not built". A register describing four thriving
 * communities would be the exact lie `FORBIDDEN_CLAIMS` prevents on the sector
 * page, and it would be caught in one click by the first person who joined.
 */
export default async function ContributePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.contribute;
  const lang = sectorLocale(locale);

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.contribute} title={t.title} lead={t.lead} />

      <Section title={t.whyTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.whyBody}</p>
      </Section>

      <Section title={t.rolesTitle} id="roles">
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.rolesLead}</p>

        {/*
          SAID IN THE READER'S LANGUAGE WHEN THE ROLES ARE NOT.

          The roles are German and English only, on the same reasoning as the
          sector page: the person being recruited lives here, and Swiss
          natives and Swiss institutions run in German. But the page CHROME is
          translated into all seven, so a French reader met a French heading
          over English paragraphs with nothing saying why — which reads as
          broken rather than as a decision.

          The essays page settled this pattern already: somebody told "this
          has not been translated, here it is in German" has been levelled
          with; somebody who simply finds the wrong language assumes the site
          is broken.
        */}
        {sectorLocale(locale) !== locale && (
          <OtherLanguage asked={locale} got={lang} reason="byDesign" t={dict.language} />
        )}

        <div className="mb-8" />

        {/* The roles are German and English; the markup says so, which is
            what a screen reader needs and what keeps `audit:language` from
            reading a stated decision as a leak. */}
        <ul lang={lang} className="flex flex-col gap-10">
          {ROLES.map((role, index) => (
            <li key={role.id} id={role.id} className="min-w-0 scroll-mt-anchor">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span aria-hidden="true" className="font-mono text-caption text-fg-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-heading text-section leading-tight tracking-display text-fg-primary">
                  {role.name[lang]}
                </h3>
              </div>

              <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">{role.who[lang]}</p>
              <p className="mt-3 max-w-measure text-lead leading-relaxed text-fg-primary">{role.ask[lang]}</p>
              <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{role.why[lang]}</p>

              {/* WHAT EXISTS TODAY, set apart in the accent — the one line on
                  each row that keeps a register from becoming a promise. Two
                  of these say "built and empty" and one says "not built". */}
              <div className="mt-4 border-l-2 border-accent pl-4">
                <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.todayLabel}</p>
                <p className="mt-1 max-w-measure text-sm leading-relaxed text-fg-secondary">{role.today[lang]}</p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                <a
                  href={roleMailto(role, lang)}
                  className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-4 text-sm font-medium text-fg-primary hover:bg-surface-raised"
                >
                  {t.roleCta}
                </a>
                {role.segment !== undefined && (
                  <Link
                    href={href(locale, role.segment)}
                    className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
                  >
                    {t.roleSee} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* The learner side, last and short. The register is thin today, and a
          promise of "find a partner" would be the marketplace this page
          refuses to pretend to be. */}
      <Section title={t.learnerTitle}>
        <p lang={lang} className="max-w-measure text-base leading-relaxed text-fg-secondary">
          {LEARNER_NOTE[lang]}
        </p>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href={href(locale, "speaking")}
            className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
          >
            {dict.nav.speaking}
          </Link>
          <Link
            href={href(locale, "")}
            className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
          >
            {dict.auth.sections.groups}
          </Link>
        </p>
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
            className="mt-5 inline-flex min-h-11 items-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90"
          >
            {t.ctaButton}
          </a>
          <p className="mt-3 font-mono text-caption text-fg-muted">{CONTACT_EMAIL}</p>
        </div>
      </Section>
    </Shell>
  );
}
