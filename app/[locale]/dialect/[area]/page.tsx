import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { DISPLAY } from "@/lib/variety/display";
import { SOURCES, citation, type SourceId } from "@/lib/research/sources";
import { Shell } from "../../_components/page-shell";

/**
 * Every area, in every language, at build time. There are eleven of them and
 * they change when a pack changes, which is to say almost never.
 */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => DISPLAY.areas.map((area) => ({ locale, area: area.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; area: string }>;
}): Promise<Metadata> {
  const { locale: raw, area: id } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  const area = DISPLAY.areas.find((a) => a.id === id);
  if (!area) return { title: dict.dialect.title };

  return {
    // The endonym is the page's subject and is not translated, so it leads.
    title: `${area.endonym} — ${dict.dialect.title}`,
    description: `${area.endonym}: ${area.cantons.join(", ")}`,
  };
}

/**
 * One dialect area.
 *
 * NO PROSE, and that is the design rather than a gap. Eleven areas of
 * translated description would be seventy-seven blocks nobody on this project
 * can check, and a machine-translated claim about where a form is spoken is
 * exactly how a reference page ends up confidently wrong in six languages at
 * once. What is here instead is data: the name speakers use, the cantons, the
 * town, the forms the checker can actually tell apart, and the atlas that
 * vouches for the area existing.
 *
 * The marks are READ from the gate. A page cannot show a form the checker does
 * not enforce, and an area with no rules yet says so — which is the honest
 * state of "we have not written those rules", and far better than the
 * plausible-looking forms a model would supply if asked.
 */
export default async function AreaPage({ params }: { params: Promise<{ locale: string; area: string }> }) {
  const { locale: raw, area: id } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.dialect;

  const area = DISPLAY.areas.find((a) => a.id === id);
  if (!area) notFound();

  // From the projection, not the pack. A page reaching for `VARIETY` is what
  // `display.test.ts` refuses, and rightly: the projection exists so a
  // component cannot accidentally render a field of English prose.
  const sources = area.sources.filter((s): s is SourceId => s in SOURCES);

  return (
    <Shell>
      <header className="-mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
        <Link
          href={href(locale, "dialect")}
          className="font-mono text-caption uppercase tracking-caps text-link hover:text-accent"
        >
          ← {t.backToAll}
        </Link>
        <h1
          lang={DISPLAY.tag}
          className="mt-3 font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary"
        >
          {area.endonym}
        </h1>
        <p className="mt-3 font-mono text-caption uppercase tracking-caps text-fg-muted">
          {t.cantons}: {area.cantons.join(" · ")} · {area.town}
        </p>
        {area.taught && (
          <p className="mt-3 inline-block rounded-control bg-accent px-3 py-1 text-sm font-medium text-on-accent">
            {t.taught}
          </p>
        )}
      </header>

      <section aria-labelledby="marks" className="border-t border-border-subtle pt-10">
        <h2
          id="marks"
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {t.marksTitle}
        </h2>

        {area.marks.length === 0 ? (
          <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.marksNone}</p>
        ) : (
          <>
            <p className="mb-5 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.marksLead}</p>
            <ul className="flex flex-col gap-2">
              {area.marks.map((mark) => (
                <li
                  key={mark.theirs}
                  className="grid items-baseline gap-1 rounded-control border border-border-subtle p-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4"
                >
                  <span lang={DISPLAY.tag} className="text-base font-medium leading-relaxed text-dialect">
                    {mark.theirs}
                  </span>
                  <span aria-hidden="true" className="font-mono text-sm text-fg-muted">
                    →
                  </span>
                  <span lang={DISPLAY.tag} className="text-base leading-relaxed text-fg-secondary">
                    {mark.ours}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {sources.length > 0 && (
        <section aria-labelledby="sources" className="mt-12 border-t border-border-subtle pt-8">
          <h2 id="sources" className="font-mono text-caption uppercase tracking-caps text-fg-muted">
            {t.sourcesTitle}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {sources.map((sourceId) => (
              <li key={sourceId} className="text-sm leading-relaxed text-fg-secondary">
                <a
                  href={SOURCES[sourceId].url}
                  className="text-link underline underline-offset-4 hover:text-accent"
                  rel="noreferrer"
                >
                  {citation(sourceId)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  );
}
