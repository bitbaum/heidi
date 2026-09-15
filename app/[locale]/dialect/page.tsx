import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { DISPLAY } from "@/lib/variety/display";
import { Shell } from "../_components/page-shell";
import { DialectFigure } from "../_components/dialect-figure";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.dialect.title, description: dict.dialect.lead };
}

/**
 * What Swiss German is, and where each dialect is spoken.
 *
 * Three facts carry the page, and each is one a German speaker gets wrong
 * before somebody tells them: it is spoken rather than written, it has no
 * correct spelling, and it is not one language. All three are already load-
 * bearing elsewhere in the product — the orthography note is why the checker
 * never says "wrong", and the diglossia is why Heidi produces Swiss Standard
 * German at all — so this page states them once where a reader can find them
 * rather than leaving them implicit in the behaviour.
 *
 * Below that, the map and every area, each linking to its own page.
 */
export default async function DialectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.dialect;

  // Taught first, then the roadmap, then the rest — the same ordering the map
  // draws, so the list and the picture agree.
  const areas = [...DISPLAY.areas].sort(
    (a, b) => Number(b.taught) - Number(a.taught) || a.town.localeCompare(b.town),
  );

  return (
    <Shell>
      <header className="-mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
        <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
          {t.title}
        </h1>
        <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.lead}</p>
      </header>

      {/* Three columns only once there is room for three measures. At `sm` they
          were four words wide and read as a poem. */}
      <div className="grid gap-8 border-t border-border-subtle pt-10 lg:grid-cols-3 lg:gap-10">
        {[
          { title: t.spokenTitle, body: t.spokenBody },
          { title: t.noStandardTitle, body: t.noStandardBody },
          { title: t.notOneTitle, body: t.notOneBody },
        ].map((fact) => (
          <section key={fact.title}>
            <h2 className="font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">
              {fact.title}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-fg-secondary">{fact.body}</p>
          </section>
        ))}
      </div>

      <section aria-labelledby="areas" className="mt-14 border-t border-border-subtle pt-10">
        <h2
          id="areas"
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {t.areasTitle}
        </h2>
        <p className="mb-6 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.areasLead}</p>

        <div className="mb-8">
          <DialectFigure plannedLabel={dict.home.dialectPlanned} othersLabel={dict.home.dialectOthers} />
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <li key={area.id}>
              <Link
                href={`${href(locale, "dialect")}/${area.id}`}
                className={`flex h-full flex-col gap-1 rounded-control border p-4 transition-colors hover:border-accent ${
                  // The one taught here is marked in the list exactly as it is
                  // on the map, so the two say the same thing.
                  area.taught ? "border-border-strong bg-surface-raised" : "border-border-subtle"
                }`}
              >
                <span
                  lang={DISPLAY.tag}
                  className="font-heading text-lg font-semibold leading-snug tracking-display text-dialect"
                >
                  {area.endonym}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
                  {area.cantons.join(" · ")}
                </span>
                {area.taught && (
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-caps text-accent">{t.taught}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
