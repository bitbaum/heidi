import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { HOW_IT_STARTS, SECTORS, sectorLocale, type Sector, type SectorLocale } from "@/lib/config/sectors";
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
 * WHAT WAS WRONG WITH IT, AND WHAT CHANGED. The argument was right and the
 * page was unusable: six long cards in one column, no way to reach yours, and
 * a single mail link at the bottom of all six. Reported as "not helpful or
 * actionable — hard to navigate long pages like this", and both halves were
 * fair.
 *
 *   — A reader now PICKS their sector first, from six names. That is the whole
 *     navigation, it is one URL parameter, and `?sector=care` is a link
 *     somebody can send to a colleague who runs a care home.
 *   — Unpicked, the six are an INDEX — name and the one line that makes
 *     somebody recognise their own room — rather than six full cards. Picked,
 *     the one they chose is complete and the others stay one tap away.
 *   — The way to answer is ON EVERY SECTOR, with that sector in the subject
 *     line, instead of once at the end.
 *   — And "what happens if I write" is answered before it is asked, because a
 *     mail link to a product with no customers is otherwise a leap.
 *
 * NO LIBRARY FOR THE FILTER, DELIBERATELY. The fleet has `listkit` and it was
 * the first thing checked, which is the rule. But the register describes 0.1.0
 * — a headless URL codec — and npm now serves 5.0.1, a React list view with
 * data adapters, pagination and an export dialog. That is the right tool for a
 * thousand rows behind a filter sidebar and the wrong one for six cards and
 * one parameter. Written down here so the next person does not re-run the
 * check.
 *
 * WHY THE ARGUMENT IS NOT IN SEVEN LANGUAGES while the chrome is. The site is
 * seven because its readers are learners from everywhere; the reader here is a
 * Swiss institution, and Swiss institutions run in German, with English as the
 * second language of every HR department in Zurich. Seven machine-checked
 * translations of an unreviewed sales argument would be six liabilities. The
 * data room made the same call for the same reason.
 */
export default async function OrganisationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.organisations;
  const lang = sectorLocale(locale);

  /**
   * Which sector, from the URL.
   *
   * An id nothing recognises is no selection rather than an error — a
   * hand-edited or truncated link should show the index, which is a page, not
   * a 404 about a query parameter.
   */
  const query = await searchParams;
  const asked = (Array.isArray(query.sector) ? query.sector[0] : query.sector)?.trim();
  const chosen = SECTORS.find((sector) => sector.id === asked);

  const base = href(locale, "organisations");

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

        {/*
          THE WAY IN. Six names, and the one you are reading is marked.

          Links rather than a control, so a sector is shareable and the back
          button works — and so this page still navigates with no JavaScript,
          which matters more here than anywhere else on the site: the reader is
          often on a locked-down machine in an institution.
        */}
        <nav aria-label={t.chooseSector} className="mt-8">
          <h2 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.chooseSector}</h2>
          <ul className="grid-cols-safe mt-3 flex flex-wrap gap-2">
            {SECTORS.map((sector) => {
              const current = sector.id === chosen?.id;
              return (
                <li key={sector.id} className="min-w-0">
                  <Link
                    href={`${base}?sector=${sector.id}`}
                    aria-current={current ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-control border px-4 text-sm font-medium ${
                      current
                        ? "border-accent bg-accent text-on-accent"
                        : "border-border-strong text-fg-primary hover:bg-surface-raised"
                    }`}
                  >
                    {sector.name[lang]}
                  </Link>
                </li>
              );
            })}
            {chosen && (
              <li className="min-w-0">
                <Link
                  href={base}
                  className="inline-flex min-h-11 items-center px-3 text-sm text-link underline underline-offset-4 hover:text-accent"
                >
                  {t.allSectors}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {chosen ? (
          <div className="mt-10">
            <SectorFull sector={chosen} lang={lang} t={t} locale={locale} />
          </div>
        ) : (
          /*
            THE INDEX. Name, and the sentence that makes somebody recognise
            their own room — which is `moment`, always, because that is the
            field this page is built on. Not `offer`: what we do is only
            interesting to a reader who has already seen themselves.
          */
          <ul className="grid-cols-safe mt-10 grid gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle sm:grid-cols-2">
            {SECTORS.map((sector) => (
              <li key={sector.id} className="bg-surface-page p-5 sm:p-6">
                <h2 className="font-heading text-section leading-tight tracking-display text-fg-primary">
                  {sector.name[lang]}
                </h2>
                <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{sector.moment[lang]}</p>
                <Link
                  href={`${base}?sector=${sector.id}`}
                  className="mt-4 inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
                >
                  {t.readMore} →
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/*
          WHAT HAPPENS IF YOU WRITE, answered before it is asked.

          A mail link to a product with no customers is a leap, and the page
          was asking for it with nothing said about where it lands. Three
          steps, two of which cost nothing — see `HOW_IT_STARTS`.
        */}
        <section aria-labelledby="start" className="mt-14 border-t border-border-subtle pt-10">
          <h2
            id="start"
            className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
          >
            {t.startTitle}
          </h2>
          <ol className="mt-6 flex flex-col gap-6">
            {HOW_IT_STARTS.map((entry, index) => (
              <li key={entry.step[lang]} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 font-mono text-caption uppercase tracking-caps text-fg-muted"
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">
                    {entry.step[lang]}
                  </h3>
                  <p className="mt-1 max-w-measure text-base leading-relaxed text-fg-secondary">{entry.detail[lang]}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-8">
            <MailLink t={t} subject={chosen ? chosen.name[lang] : undefined} />
          </p>
        </section>
      </Section>
    </Shell>
  );
}

/**
 * One sector, in full — the same four fields the page always had.
 *
 * Its own component now because it is rendered on its own rather than six at a
 * time, and because the index above needs the sector's shape without any of
 * this. Splitting them is what lets the index be an index.
 */
function SectorFull({
  sector,
  lang,
  t,
  locale,
}: {
  sector: Sector;
  lang: SectorLocale;
  t: ReturnType<typeof getDictionary>["organisations"];
  locale: Locale;
}) {
  return (
    <article className="rounded-control border border-border-subtle bg-surface-page p-5 sm:p-6">
      <h2 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
        {sector.name[lang]}
      </h2>

      {/* The scene carries the page, so it is set as the largest thing in the
          row rather than as one field among four. */}
      <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-primary">{sector.moment[lang]}</p>

      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.stakeLabel}</dt>
          <dd className="mt-1 text-sm leading-relaxed text-fg-secondary">{sector.stake[lang]}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.offerLabel}</dt>
          <dd className="mt-1 text-sm leading-relaxed text-fg-secondary">{sector.offer[lang]}</dd>
          {/* The proof, where there is any. A row without one shows no link,
              and that asymmetry is deliberate: it is how a reader tells which
              of these six we have actually built for. */}
          {sector.proof && (
            <dd className="mt-2 text-sm leading-relaxed">
              <Link
                href={href(locale, sector.proof.segment)}
                className="text-link underline underline-offset-4 hover:text-accent"
              >
                {sector.proof.label[lang]} →
              </Link>
            </dd>
          )}
        </div>
      </dl>

      {/* Set apart and in the accent, because it is the only thing here
          addressed AT the reader rather than about them. */}
      <div className="mt-6 border-t border-border-subtle pt-4">
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

      {/* The door, HERE, on the sector the reader actually came for — and
          carrying its name, so the mail that arrives says which room it is
          about and the reply can be about that room. */}
      <div className="mt-6 border-t border-border-subtle pt-5">
        <MailLink t={t} subject={sector.name[lang]} />
      </div>
    </article>
  );
}

/**
 * The mail link, with the sector in the subject when there is one.
 *
 * One component because it appears twice and the subject line is the only
 * difference — and because a second copy is how one of them ends up without
 * the subject, which is the whole point of it.
 */
function MailLink({ t, subject }: { t: ReturnType<typeof getDictionary>["organisations"]; subject?: string }) {
  const to = "cato@orangecat.ch";
  const href = subject ? `mailto:${to}?subject=${encodeURIComponent(`Heidi — ${subject}`)}` : `mailto:${to}`;

  return (
    <a
      href={href}
      className="inline-flex min-h-12 items-center rounded-control bg-accent px-5 text-base font-semibold text-on-accent"
    >
      {t.talk}
    </a>
  );
}
