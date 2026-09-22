import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, LOCALE_NAMES, LOCALE_TAGS, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { ESSAYS, essayBySlug } from "@/lib/essays/registry";
import { SOURCES, citation } from "@/lib/research/sources";
import { EssayBody } from "../../_components/essay-body";
import { Shell } from "../../_components/page-shell";
import { formatDate } from "../page";

/** Every essay in every language at build time; both lists are short. */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => ESSAYS.map((essay) => ({ locale, slug: essay.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const served = essayBySlug(slug, locale);
  if (!served) return { title: getDictionary(locale).essays.title };
  return { title: served.text.title, description: served.text.lead };
}

/**
 * One essay.
 *
 * The body is typed blocks rather than Markdown — see `lib/essays/types.ts`
 * for why — so the page cannot render a type size the rest of the site does
 * not have, and a block kind nobody implemented is a build error instead of a
 * paragraph that looks wrong in production.
 *
 * The sources sit at the foot exactly as a dialect area's do, from the one
 * registry. An essay on this site making historical claims without them would
 * be the thing `/method` exists to refuse.
 */
export default async function EssayPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.essays;

  const served = essayBySlug(slug, locale);
  if (!served) notFound();
  const { essay, text, asked, got } = served;

  return (
    <Shell>
      <header className="-mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-14">
        <Link
          href={href(locale, "essays")}
          className="font-mono text-caption uppercase tracking-caps text-link hover:text-accent"
        >
          ← {t.backToAll}
        </Link>
        <h1 className="mt-4 max-w-[22ch] font-heading text-title font-semibold leading-[1.05] tracking-display text-fg-primary">
          {text.title}
        </h1>
        <p className="mt-5 max-w-measure text-lead leading-relaxed text-fg-secondary">{text.lead}</p>
        <p className="mt-5 font-mono text-caption uppercase tracking-caps text-fg-muted">
          <time dateTime={essay.published}>{formatDate(essay.published, locale)}</time>
        </p>
      </header>

      {/*
        Told, rather than silently served.

        A reader who clicked a title on their own language's page and got two
        thousand words of German with no word about it concludes the site is
        broken. Saying which language this is, and that it is not theirs yet, is
        both the honest line and the one that keeps them reading.
      */}
      {got !== asked && (
        <p className="mt-8 rounded-control border border-border-subtle bg-surface-raised p-4 text-base leading-relaxed text-fg-secondary">
          {t.notTranslated} <span className="text-fg-primary">{LOCALE_NAMES[got]}</span>
        </p>
      )}

      {/* `lang` on the article, because this really is the language of the
          text — and when it is a fallback it is not the language of the page
          around it, which is exactly what the attribute is for. */}
      <article lang={LOCALE_TAGS[got]} className="border-t border-border-subtle py-10">
        <EssayBody blocks={text.blocks} />
      </article>

      {essay.sources.length > 0 && (
        <section aria-labelledby="sources" className="mb-14 border-t border-border-subtle pt-8">
          <h2 id="sources" className="font-mono text-caption uppercase tracking-caps text-fg-muted">
            {t.sourcesTitle}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {essay.sources.map((id) => (
              <li key={id} className="text-sm leading-relaxed text-fg-secondary">
                <a
                  lang="en"
                  href={SOURCES[id].url}
                  rel="noreferrer"
                  className="text-link underline underline-offset-4 hover:text-accent"
                >
                  {citation(id)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  );
}
