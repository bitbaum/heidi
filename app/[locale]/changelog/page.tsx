import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { CHANGELOG } from "@/lib/config/changelog";
import { sectorLocale } from "@/lib/config/sectors";
import { PageHeader, Shell } from "../_components/page-shell";
import { formatDate } from "@/lib/i18n/dates";
import { OtherLanguage } from "../_components/other-language";
import { ChangelogDocument } from "bip-kit/react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
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
export default async function ChangelogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.changelog;
  const lang = sectorLocale(locale);
  const entries = CHANGELOG[lang];

  return (
    <Shell>
      <PageHeader
        eyebrow={dict.nav.changelog}
        title={t.title}
        lead={t.lead}
        note={t.note}
        lang={lang}
      >
        <OtherLanguage
          asked={locale}
          got={lang}
          reason="byDesign"
          t={dict.language}
        />
      </PageHeader>

      <ChangelogDocument
        entries={[...entries]}
        lang={lang}
        formatDate={(iso) => formatDate(iso, locale, "long")}
        tagLabels={t.tags}
      />

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
