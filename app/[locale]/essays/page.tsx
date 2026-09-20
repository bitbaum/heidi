import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, LOCALE_NAMES, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { essaysFor } from "@/lib/essays/registry";
import { PageHeader, Shell } from "../_components/page-shell";

/** Seven locales, a handful of essays, and both change rarely. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.essays.title, description: dict.essays.lead };
}

/**
 * The writing.
 *
 * A reference page answers the question you already knew to ask. This is for
 * the one that brings people here in the first place — why does a country this
 * small have this many dialects, and why did the big neighbour lose its own —
 * which is an argument with sources rather than a form or a map.
 *
 * It is also the honest home for prose. Everything on the dialect pages is
 * data, deliberately, so that eleven areas do not become seventy-seven blocks
 * of translated description nobody here can check. Prose that cannot be held
 * to that standard belongs where it is signed, dated and sourced.
 */
export default async function EssaysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.essays;
  const essays = essaysFor(locale);

  return (
    <Shell>
      <PageHeader title={t.title} lead={t.lead} />

      {essays.length === 0 ? (
        <p className="py-10 max-w-measure text-base leading-relaxed text-fg-secondary">{t.none}</p>
      ) : (
        <ul className="flex flex-col">
          {essays.map(({ essay, text, asked, got }) => (
            <li key={essay.slug} className="border-b border-border-subtle py-8">
              <Link href={`${href(locale, "essays")}/${essay.slug}`} className="group block">
                <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                  <time dateTime={essay.published}>{formatDate(essay.published, locale)}</time>
                  {/* The language they are about to get, but only when it is
                      not the one they asked for. Saying "in German" on a German
                      page is noise; saying nothing when the piece is in German
                      and the page is in Russian is a broken-looking site. */}
                  {got !== asked && <> · {LOCALE_NAMES[got]}</>}
                </p>
                <h2 className="mt-2 max-w-[28ch] font-heading text-section font-semibold leading-tight tracking-display text-fg-primary group-hover:text-accent">
                  {text.title}
                </h2>
                <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary sm:text-lg">
                  {text.lead}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

/** The reader's own date format, never a hardcoded one. */
export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(date);
  } catch {
    return iso.slice(0, 10);
  }
}
