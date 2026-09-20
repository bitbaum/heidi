import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { SECTORS, sectorLocale } from "@/lib/config/sectors";
import { PageHeader, Section, Shell } from "../_components/page-shell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.organisations.title, description: dict.organisations.lead };
}

/**
 * The places where this is somebody else's problem to solve.
 *
 * Every learner Heidi has is one person solving their own. These are the
 * settings where the SAME problem is an operating risk, a training budget or a
 * legal duty — and where the person who suffers it is not the person who can
 * buy the fix. A care assistant does not procure software; a Heimleitung does.
 *
 * WHAT THIS PAGE REFUSES TO DO, and it is the whole design.
 *
 * There are no customers, no pilots, no case studies and no logos, because
 * there are none of those things. So the page does the one honest thing
 * available to a product in that position — which is also, as it happens, the
 * thing that actually opens a conversation with an institution: describe the
 * MOMENT their problem happens in enough detail that a reader who lives it
 * recognises the room, then ask whether we have it right.
 *
 * `unknown` on every row is not modesty. It is the question that turns a page
 * into a meeting, and a test asserts each one is a real question rather than a
 * hedge. A second test forbids the words this kind of page writes by itself —
 * customers, case study, trusted by, proven — in either language.
 *
 * WHY THE ARGUMENT IS NOT IN SEVEN LANGUAGES while the chrome is. The site is
 * seven because its readers are learners from everywhere; the reader here is a
 * Swiss institution, and Swiss institutions run in German, with English as the
 * second language of every HR department in Zurich. Seven machine-checked
 * translations of an unreviewed sales argument would be six liabilities. The
 * data room made the same call for the same reason.
 */
export default async function OrganisationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.organisations;
  const lang = sectorLocale(locale);

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.organisations} title={t.title} lead={t.lead} />

      <Section>
        {/* First, not last. A reader who finds out on the way down that there
            are no customers has been managed; a reader told at the top is
            being levelled with, and everything below reads differently. */}
        <p className="max-w-measure rounded-control border border-border-subtle bg-surface-raised p-4 text-sm leading-relaxed text-fg-secondary">
          {t.noCustomers}
        </p>

        <ul className="mt-8 grid grid-cols-safe gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle">
          {SECTORS.map((sector) => (
            <li key={sector.id} className="bg-surface-page p-5 sm:p-6">
              <h2 className="font-heading text-section leading-tight tracking-display text-fg-primary">
                {sector.name[lang]}
              </h2>

              {/* The scene carries the page, so it is set as the largest thing
                  in the row rather than as one field among four. */}
              <p className="mt-3 max-w-measure text-lead leading-relaxed text-fg-primary">{sector.moment[lang]}</p>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.stakeLabel}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-fg-secondary">{sector.stake[lang]}</dd>
                </div>
                <div>
                  <dt className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.offerLabel}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-fg-secondary">{sector.offer[lang]}</dd>
                </div>
              </dl>

              {/* Set apart and in the accent, because it is the only thing on
                  the row addressed AT the reader rather than about them. */}
              <div className="mt-5 border-t border-border-subtle pt-4">
                <p className="font-mono text-caption uppercase tracking-caps text-accent">{t.unknownLabel}</p>
                <p className="mt-1 max-w-measure text-sm leading-relaxed text-fg-secondary">{sector.unknown[lang]}</p>
              </div>

              {sector.fact && (
                <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">
                  {sector.fact.text[lang]}{" "}
                  <a
                    href={sector.fact.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-fg-primary"
                  >
                    {new URL(sector.fact.source).hostname}
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>

        {/* The door. A page that describes somebody's problem and then offers
            no way to answer has wasted the recognition it just earned. */}
        <p className="mt-8">
          <a
            href="mailto:cato@orangecat.ch"
            className="inline-flex min-h-12 items-center rounded-control bg-accent px-5 text-base font-semibold text-on-accent"
          >
            {t.talk}
          </a>
        </p>
      </Section>
    </Shell>
  );
}
