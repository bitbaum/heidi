import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { ESSAYS, essayBySlug } from "@/lib/essays/registry";
import { EssayBody } from "../../_components/essay-body";
import { Shell } from "../../_components/page-shell";
import { OtherLanguage } from "../../_components/other-language";
import { formatDate } from "@/lib/i18n/dates";
import { SourceList } from "../../_components/source-list";

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
        broken. Saying which language this is, and that it is not theirs yet,
        is both the honest line and the one that keeps them reading.

        THIS PAGE INVENTED THE PATTERN AND NOW USES THE SHARED ONE. It was
        right first and stayed alone: four later pages shipped without any
        notice at all and a fifth wrote a third variant. Moving this one onto
        the common component is the half of the fix that stops it drifting
        back apart — `untranslated` here, because an essay genuinely may be
        translated later, where a sector argument will not be.
      */}
      <div className="mt-8">
        <OtherLanguage asked={asked} got={got} reason="untranslated" t={dict.language} />
      </div>

      {/* `lang` on the article, because this really is the language of the
          text — and when it is a fallback it is not the language of the page
          around it, which is exactly what the attribute is for. */}
      <article lang={LOCALE_TAGS[got]} className="border-t border-border-subtle py-10">
        <EssayBody blocks={text.blocks} />
      </article>
      <SourceList
        title={t.sourcesTitle}
        ids={essay.sources}
        className="mb-14 border-t border-border-subtle pt-8"
      />
    </Shell>
  );
}
