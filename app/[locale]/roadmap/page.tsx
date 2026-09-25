import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { ROADMAP } from "@/lib/config/roadmap";
import { sectorLocale } from "@/lib/config/sectors";
import { PageHeader, Shell } from "../_components/page-shell";
import { OtherLanguage } from "../_components/other-language";
import { roadmapItemId } from "bip-kit";
import { CommentThread, FeedbackProvider, StanceButtons, SuggestBox } from "bip-kit/react";
import { ROADMAP_TARGETS } from "@/lib/feedback/targets";
import { LOCALE_TAGS } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const lang = sectorLocale(locale);
  const doc = ROADMAP[lang];
  return { title: doc.title, description: doc.lede };
}

/**
 * What is being built, what comes next, and what after — and the reader's say
 * in it.
 *
 * ANSWERABLE. Every item can be marked "I need this" or "not for me" and
 * commented on, and anything missing can be suggested, without an account.
 * The rules for that (one vote per browser, spam, duplicate suggestions) are
 * bip-kit's, shared with every product whose roadmap it renders; Heidi only
 * stores the answers (`lib/feedback/`). The order stays an editorial decision
 * — HEIDI.md §9 says why — so the counts inform it and are shown, but do not
 * silently reorder the page.
 *
 * RENDERED FROM `bip-kit`'s `RoadmapDoc`. The fleet already owns this contract
 * and nine products use it; the tenth hand-rolled version had no excuse. What
 * is NOT adopted is the package's React renderer, because Heidi has its own
 * tokens and its own type scale — the package ships the contract separately
 * for exactly that case.
 */
export default async function RoadmapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const lang = sectorLocale(locale);
  const doc = ROADMAP[lang];
  const fb = dict.roadmapFeedback;
  const readerLang = LOCALE_TAGS[locale];

  return (
    <Shell>
      <PageHeader eyebrow={doc.eyebrow} title={doc.title} lead={doc.lede} lang={lang}>
        <OtherLanguage asked={locale} got={lang} reason="byDesign" t={dict.language} />
      </PageHeader>

      <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{fb.intro}</p>

      <FeedbackProvider endpoint="/api/feedback" targetIds={ROADMAP_TARGETS} labels={fb}>
      {doc.buckets.map((bucket) => (
        <section key={bucket.title} lang={lang} className="border-b border-border-subtle py-10">
          <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {bucket.title}
          </h2>
          <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{bucket.summary}</p>

          <ul className="mt-7 flex flex-col gap-8">
            {bucket.items.map((item) => (
              <li key={item.title} className="min-w-0 border-l-2 border-border-subtle pl-4">
                <h3 className="max-w-measure font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">
                  {item.title}
                </h3>
                <p className="mt-1 max-w-measure text-base leading-relaxed text-fg-secondary">{item.line}</p>

                {/* The detail is where a blocked item earns its place: naming
                    the blocker specifically enough that a reader could be the
                    one who removes it. */}
                {item.details && item.details.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-2">
                    {item.details.map((detail) => (
                      <li
                        key={detail.slice(0, 40)}
                        className="max-w-measure text-sm leading-relaxed text-fg-muted before:mr-2 before:text-fg-muted before:content-['—']"
                      >
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}

                {item.essay && (
                  <Link
                    href={href(locale, item.essay.href)}
                    className="mt-3 inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
                  >
                    {item.essay.label} →
                  </Link>
                )}

                <div lang={readerLang}>
                  <StanceButtons targetId={roadmapItemId(item)} />
                  <CommentThread targetId={roadmapItemId(item)} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div lang={readerLang} className="py-4">
        <SuggestBox />
      </div>
      </FeedbackProvider>

      {/* A roadmap is a claim about the future; these two are the record of
          the past and the argument for the present. A reader who doubts the
          first should be one tap from both. */}
      <nav aria-label={doc.title} className="flex flex-wrap gap-x-6 gap-y-2 py-8">
        {(["changelog", "paper", "contribute"] as const).map((key) => (
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
