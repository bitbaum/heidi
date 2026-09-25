import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { DISPLAY } from "@/lib/variety/display";
import { LISTENING_SOURCES } from "@/lib/listening/sources";
import { branchSiblings, nearestRecognised, neighboursOf } from "@/lib/variety/neighbours";
import { fill } from "@/lib/i18n/fill";
import { LOCALE_TAGS } from "@/lib/i18n/locales";
import { SOURCES, type SourceId } from "@/lib/research/sources";
import { ListeningRow } from "../../_components/listening-row";
import { Shell } from "../../_components/page-shell";
import { SourceList } from "../../_components/source-list";

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
 * STILL NO PER-AREA PROSE, and the reason has not changed: eleven areas of
 * translated description would be seventy-seven blocks nobody on this project
 * can check, and a machine-translated claim about where a form is spoken is
 * how a reference page ends up confidently wrong in six languages at once.
 *
 * The page got substantially longer anyway, which is the point worth
 * recording: everything added is DATA, and data does not need translating.
 *
 *   the branch     which of the three divisions of Alemannic it belongs to,
 *                  and the pair of forms that draws that line — `Kind` inside
 *                  Low Alemannic, `Chind` outside it. Three explanations in
 *                  the dictionaries serve all eleven areas, instead of eleven
 *                  descriptions serving one each.
 *   what it sounds  the listening register, filtered by `area`. Those rows
 *   like            have carried an atlas id since the first commit and no
 *                  page ever followed the join, so the one question this page
 *                  could not answer — "where do I actually hear this?" — was
 *                  already answered in the data.
 *   the marks       READ from the gate, as before. A page cannot show a form
 *                  the checker does not enforce, and an area with no rules yet
 *                  says so rather than showing plausible invented ones.
 *
 * The ordering follows what a visitor wants in order: what is this, what does
 * it sound like, how do I recognise it, who says so.
 */
export default async function AreaPage({ params }: { params: Promise<{ locale: string; area: string }> }) {
  const { locale: raw, area: id } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.dialect;

  // Zurich's slug was spelled with the east's t (`zueritueuetsch`) until the
  // name was corrected to Züridütsch; links to the old one still arrive.
  if (id === "zueritueuetsch") permanentRedirect(`${href(locale, "dialect")}/zueriduetsch`);

  const area = DISPLAY.areas.find((a) => a.id === id);
  if (!area) notFound();

  // From the projection, not the pack. A page reaching for `VARIETY` is what
  // `display.test.ts` refuses, and rightly: the projection exists so a
  // component cannot accidentally render a field of English prose.
  const sources = area.sources.filter((s): s is SourceId => s in SOURCES);

  /**
   * Derived, not asserted. See `lib/variety/neighbours.ts` — nothing here is a
   * new claim about any dialect, only arithmetic over the pack's own data.
   */
  const neighbours = neighboursOf(area, DISPLAY.areas);
  const siblings = branchSiblings(area, DISPLAY.areas);
  const nearest = area.marks.length === 0 ? nearestRecognised(area, DISPLAY.areas) : undefined;

  /**
   * Distances in the reader's own numerals.
   *
   * The site already has a test about this: a JS number stringifies with a
   * dot, and nothing asked it which script the reader uses.
   */
  const num = (value: number) => new Intl.NumberFormat(LOCALE_TAGS[locale]).format(value);

  // The branch, and the words for it. `groupWords` is looked up by id in the
  // dictionary exactly as a grammar topic is: three explanations translated
  // once, serving eleven areas.
  const group = DISPLAY.dialectGroups.find((g) => g.id === area.group);
  const groupWords = group ? t.groups[group.id as keyof typeof t.groups] : undefined;

  /**
   * Where you can hear this one, from the register that already knows.
   *
   * `sources.test.ts` joins every `area` id to the atlas, so this filter
   * cannot silently match nothing because of a typo — it matches nothing only
   * when nothing has been checked for this dialect, which the page says.
   */
  const heard = LISTENING_SOURCES.filter((source) => source.area === area.id);
  const areaNames = new Map(DISPLAY.areas.map((a) => [a.id, a.endonym]));

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
          <p className="mt-3 inline-block rounded-control bg-action px-3 py-1 text-sm font-medium text-on-action">
            {t.taught}
          </p>
        )}
      </header>

      {/* WHAT KIND OF DIALECT THIS IS, before what marks it out. A reader who
          does not yet know that Alemannic has three branches cannot do
          anything with a list of forms; knowing that Basel is the one place
          that kept its `k` makes the whole map legible at once. */}
      <section aria-labelledby="branch" className="border-t border-border-subtle pt-10">
        <h2
          id="branch"
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {t.groupsTitle}
        </h2>
        {group ? (
          <>
            <p className="mt-3 font-mono text-caption uppercase tracking-caps text-fg-muted">
              {t.groupLabel}: {groupWords?.name}
            </p>
            <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{groupWords?.body}</p>
            {group.diagnostic && (
              <div className="mt-6 rounded-control border border-border-subtle p-4">
                <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                  {t.diagnosticTitle}
                </h3>
                <dl className="mt-3 grid grid-cols-safe gap-x-6 gap-y-3 sm:grid-cols-3">
                  {[
                    { label: t.diagnosticInside, form: group.diagnostic.inside, dialect: true },
                    { label: t.diagnosticOutside, form: group.diagnostic.outside, dialect: true },
                    { label: t.diagnosticStandard, form: group.diagnostic.standard, dialect: false },
                  ].map((cell) => (
                    <div key={cell.label}>
                      <dt className="font-mono text-caption uppercase tracking-caps text-fg-muted">{cell.label}</dt>
                      <dd
                        {...(cell.dialect ? { lang: DISPLAY.tag } : { lang: "de" })}
                        className={`mt-1 font-heading text-xl leading-snug tracking-display ${
                          cell.dialect ? "text-dialect" : "text-fg-primary"
                        }`}
                      >
                        {cell.form}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </>
        ) : (
          // An area on both sides of the line. Saying so is the whole reason
          // `group` is optional — see the note on `DialectArea.group`.
          <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.groupSpans}</p>
        )}
      </section>

      <section aria-labelledby="hear" className="mt-12 border-t border-border-subtle pt-10">
        <h2
          id="hear"
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {t.hearTitle}
        </h2>
        {heard.length === 0 ? (
          <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.hearNone}</p>
        ) : (
          <>
            <p className="mb-4 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.hearLead}</p>
            <ul>
              {heard.map((source) => (
                <ListeningRow key={source.id} source={source} t={dict.listening} areaNames={areaNames} />
              ))}
            </ul>
          </>
        )}
        <Link
          href={href(locale, "listen")}
          className="mt-4 inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
        >
          {t.hearAll}
        </Link>
      </section>

      <section aria-labelledby="marks" className="mt-12 border-t border-border-subtle pt-10">
        <h2
          id="marks"
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {t.marksTitle}
        </h2>

        {area.marks.length === 0 ? (
          <>
            <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.marksNone}</p>
            {/* A DEAD END BECOMES A DIRECTION. "No forms for this dialect yet"
                is honest and it is where a reader leaves the site. The nearest
                area Heidi CAN recognise forms from is a real next step, and it
                is derived rather than asserted — see `neighbours.ts`. */}
            {nearest && (
              <p className="mt-4 max-w-measure text-base leading-relaxed text-fg-secondary">
                <Link
                  href={`${href(locale, "dialect")}/${nearest.area.id}`}
                  className="text-link underline underline-offset-4 hover:text-accent"
                >
                  {fill(t.marksInstead, { area: nearest.area.endonym, km: num(nearest.km) })} →
                </Link>
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mb-5 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.marksLead}</p>
            <ul className="flex flex-col gap-2">
              {area.marks.map((mark) => (
                <li
                  key={mark.theirs}
                  className="grid grid-cols-safe items-baseline gap-1 rounded-control border border-border-subtle p-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4"
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

      {/*
        WHERE THIS SITS AMONG THE OTHERS — computed, not claimed.

        The pages were reported as too thin, and the honest reason for the
        thinnest of them is that we have no verified Walliser forms. The
        temptation that creates is to write plausible dialect facts and cite
        the atlas generally, which is the one thing this product must not do.

        So every number and every name below is derived from data the pack
        already vouches for: the branch, the cantons, the reference town. More
        page, no new assertions. `neighbours.ts` makes the case at length.
      */}
      <section aria-labelledby="around" className="mt-12 border-t border-border-subtle pt-10">
        <h2
          id="around"
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {t.aroundTitle}
        </h2>
        <p className="mb-6 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.aroundLead}</p>

        <div className="grid grid-cols-safe gap-x-10 gap-y-8 sm:grid-cols-2">
          <div className="min-w-0">
            <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.nearestTitle}</h3>
            <ul className="mt-3 flex flex-col gap-1">
              {neighbours.map((neighbour) => (
                <li key={neighbour.area.id}>
                  <Link
                    href={`${href(locale, "dialect")}/${neighbour.area.id}`}
                    className="inline-flex min-h-11 items-center gap-2 wrap-anywhere text-sm text-link underline underline-offset-4 hover:text-accent"
                  >
                    {neighbour.area.endonym}
                    <span className="font-mono text-caption text-fg-muted no-underline">
                      {fill(t.kmAway, { km: num(neighbour.km) })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEAR AND RELATED ARE DIFFERENT ANSWERS, and the page keeps them
              apart on purpose: Wallisertitsch is a long way from Glarus and
              shares its branch, Aargau is close to Zurich and shares its
              branch. Collapsing the two columns would be telling a learner
              that geography is dialectology. */}
          {siblings.length > 0 && (
            <div className="min-w-0">
              <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.siblingsTitle}</h3>
              <ul className="mt-3 flex flex-col gap-1">
                {siblings.map((sibling) => (
                  <li key={sibling.id}>
                    <Link
                      href={`${href(locale, "dialect")}/${sibling.id}`}
                      className="inline-flex min-h-11 items-center wrap-anywhere text-sm text-link underline underline-offset-4 hover:text-accent"
                    >
                      {sibling.endonym}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
      <SourceList title={t.sourcesTitle} ids={sources} className="mt-12 border-t border-border-subtle pt-8" />
</Shell>
  );
}
