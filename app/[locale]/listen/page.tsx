import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { byMedium, flow } from "@/lib/listening/flow";
import { dayCursor } from "@/lib/listening/today";
import { DISPLAY } from "@/lib/variety/display";
import { ListeningRow } from "../_components/listening-row";
import { Shell } from "../_components/page-shell";
import { SectionNav, SectionNavLayout } from "../_components/section-nav";

/**
 * Rebuilt hourly, so "three for today" is a promise the page keeps.
 *
 * The picks rotate on the day of the year. Prerendered once at build time that
 * number would freeze on the day it shipped, and the same three rows would be
 * "today's" for a month — the feature would look implemented and quietly not
 * be. An hour is far finer than the rotation it serves.
 */
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.listening.title, description: dict.listening.lead };
}

/**
 * Where a learner can actually hear this language today.
 *
 * The page is a register and not an essay for the same reason `/technology`
 * is: the useful thing is the per-row fact, and prose about Swiss media is
 * something anybody could have written without knowing any of it.
 *
 * What the prose at the top IS for is the one thing the rows cannot say on
 * their own — that half of this material is not dialect, that the split is
 * invisible to the person who needs it most, and that our own labels are
 * inferences until somebody sits down and listens.
 */
export default async function ListenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dictionary = getDictionary(locale);
  const t = dictionary.listening;
  const groups = byMedium();

  /**
   * Three to start with, rotating daily.
   *
   * WHY THE PAGE NEEDS THIS AS WELL AS THE LIST. Fifty-six rows is a
   * catalogue, and a catalogue answers "what is there" while the learner
   * standing in front of it is asking "what do I do now". `flow.ts` was built
   * to answer the second question and was rendered nowhere at all — the page
   * shipped as the half that was easy to show.
   *
   * `inSwitzerland: false` is the honest default for a reader we know nothing
   * about: everything offered here plays anywhere, because handing somebody a
   * link that answers "not available in your country" reads as the product
   * being broken rather than as a licensing fact.
   *
   * The cursor is the day of the year, so the three change tomorrow and are
   * the same for everyone today — which keeps the page cacheable and keeps
   * server and client from disagreeing about what today picked.
   */
  const today = flow({ inSwitzerland: false }, { take: 3, cursor: dayCursor() });
  // id -> endonym, built once, from the DISPLAY projection rather than the
  // pack. A page that imports `variety/active` pulls the whole pack — English
  // maintainer prose included — into what a reader is served, and there is a
  // test that refuses it. The projection is the reader-facing half.
  const areaNames = new Map(DISPLAY.areas.map((area) => [area.id, area.endonym]));

  return (
    <Shell>
      <header className="-mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
        <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
          {t.title}
        </h1>
        <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.lead}</p>
      </header>

      {/*
        A CONTENTS RAIL, because this page is a catalogue.

        Reported as "long page hard to navigate", and it is: the warning, what
        to watch today, and then one section per medium, each a list of links.
        A reader four screens into the podcasts had no way to see that films
        existed below or to get back to the top. The rail is built from the
        same groups the page renders, so a new medium appears in both.
      */}
      <SectionNavLayout
        nav={
          <SectionNav
            label={dictionary.nav.contents}
            sections={[
              { id: "diglossia", label: t.diglossiaTitle },
              ...(today.length > 0 ? [{ id: "today", label: t.todayTitle }] : []),
              ...groups.map((group) => ({ id: group.medium, label: t.medium[group.medium] })),
            ]}
          />
        }
      >
      <div className="border-t border-border-subtle pt-10">
        {/* The diglossia warning sits ABOVE the list, because a reader who
            scrolls straight to the links and picks the name they recognise
            picks the Tagesschau. */}
        <section id="diglossia" className="max-w-measure scroll-mt-anchor">
          <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {t.diglossiaTitle}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-fg-secondary">{t.diglossiaBody}</p>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">{t.basisNote}</p>
        </section>

        {/* After the warning and before the catalogue: the trap first, then
            what to do about it today, then everything there is. */}
        {today.length > 0 && (
          <section aria-labelledby="today" id="today" className="mt-10 scroll-mt-anchor border-t border-border-subtle pt-8">
            <h2
              id="today"
              className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
            >
              {t.todayTitle}
            </h2>
            <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.todayBody}</p>
            <ul className="mt-4 flex flex-col">
              {today.map((source) => (
                <ListeningRow key={source.id} source={source} t={t} areaNames={areaNames} />
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 flex flex-col gap-12">
          {groups.map((group) => (
            <section key={group.medium} id={group.medium} className="scroll-mt-anchor">
              <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
                {t.medium[group.medium]}
              </h2>
              <ul className="mt-4 flex flex-col">
                {group.sources.map((source) => (
                  <ListeningRow key={source.id} source={source} t={t} areaNames={areaNames} />
                ))}
              </ul>
              {/* Said where it is useful — beside the films — rather than in
                  a general note nobody reads before clicking. */}
              {group.medium === "film" && (
                <div className="mt-6 max-w-measure border-l-2 border-border-subtle pl-4">
                  <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.filmsTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{t.filmsBody}</p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
      </SectionNavLayout>
    </Shell>
  );
}
