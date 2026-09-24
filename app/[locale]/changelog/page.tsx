import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALE_TAGS, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { CHANGELOG } from "@/lib/config/changelog";
import { sectorLocale } from "@/lib/config/sectors";
import { PageHeader, Shell } from "../_components/page-shell";
import { OtherLanguage } from "../_components/other-language";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.changelog.title, description: dict.changelog.lead };
}

/**
 * What changed, dated, in the words of somebody using it.
 *
 * NOT A GIT LOG, which is `bip-kit`'s own word for the distinction on the type
 * this renders. Ninety-three merges in twelve days is a git log, the
 * repository is public, and anybody who wants it can read it. This is the
 * curation: which of those a person would have noticed.
 *
 * THE FIX ROWS ARE THE POINT. `/about` promises this project publishes the
 * parts that did not work, and a changelog with no embarrassing rows in it is
 * evidence that the promise is decorative. So the entries that say a
 * recording with no speech in it was given words, or that a question was
 * translating the language it teaches, sit at the same weight as the features
 * — and they say what was wrong rather than that something was improved.
 *
 * THE TAG IS A COLOUR AND A WORD, never a colour alone: a reader who cannot
 * distinguish the accent from the muted foreground would otherwise be reading
 * a list with one column missing.
 */
export default async function ChangelogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.changelog;
  const lang = sectorLocale(locale);
  const entries = CHANGELOG[lang];

  /**
   * The date as this reader writes dates.
   *
   * `Intl` rather than the ISO string: 2026-09-22 is unambiguous to a machine
   * and reads as foreign to most people, and the site already takes this
   * seriously enough to have a test about numerals elsewhere.
   */
  const asDate = (iso: string) =>
    new Intl.DateTimeFormat(LOCALE_TAGS[locale], { year: "numeric", month: "long", day: "numeric" }).format(
      new Date(`${iso}T12:00:00Z`),
    );

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.changelog} title={t.title} lead={t.lead} note={t.note} lang={lang}>
        <OtherLanguage asked={locale} got={lang} reason="byDesign" t={dict.language} />
      </PageHeader>

      <ol className="flex flex-col">
        {entries.map((entry) => (
          <li
            key={`${entry.date}-${entry.title}`}
            lang={lang}
            className="border-b border-border-subtle py-9"
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <time dateTime={entry.date} className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                {asDate(entry.date)}
              </time>
              <span
                className={`font-mono text-caption uppercase tracking-caps ${
                  entry.tag === "fix" ? "text-accent" : "text-fg-muted"
                }`}
              >
                {t.tags[entry.tag]}
              </span>
            </div>

            <h2 className="mt-2 max-w-[28ch] font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
              {entry.title}
            </h2>
            <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{entry.summary}</p>

            {entry.items && entry.items.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {entry.items.map((item) => (
                  <li
                    key={item.slice(0, 40)}
                    className="max-w-measure text-sm leading-relaxed text-fg-muted before:mr-2 before:text-fg-muted before:content-['—']"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <nav aria-label={t.title} className="flex flex-wrap gap-x-6 gap-y-2 py-8">
        {(["roadmap", "paper", "contribute"] as const).map((key) => (
          <Link
            key={key}
            href={href(locale, key)}
            className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
          >
            {dict.nav[key]}
          </Link>
        ))}
      </nav>
    </Shell>
  );
}
