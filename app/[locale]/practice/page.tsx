import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PACK_ITEMS } from "@/lib/domain/practice/published";
import { SOURCES, shortCitation } from "@/lib/research/sources";
import { Shell } from "../_components/page-shell";
import { PracticeSession } from "../_components/practice-session";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.practice.title, description: dict.practice.lead };
}

/**
 * The page where the learner is asked instead of shown.
 *
 * THE ITEMS ARE GENERATED ON THE SERVER and handed to the client component as
 * data. The pack is large and full of prose — every rule's reason, every
 * grammar topic's explanation — and none of it is needed to ask eight
 * questions. `PACK_ITEMS` is the projection that sends the questions and
 * leaves the book behind; this page never sees the pack, which is what
 * `display.test.ts` enforces and why it is a separate module.
 *
 * The other half of a session never comes through this page at all: the
 * learner's own kept words live in their browser and are turned into items
 * there. That is not an implementation detail but the privacy claim on
 * `/privacy` holding under a feature that would have been easier to build by
 * breaking it.
 */
export default async function PracticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.practice;

  return (
    <Shell>
      <header className="-mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
        <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
          {t.title}
        </h1>
        <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.lead}</p>
        <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{t.note}</p>
      </header>

      <div className="border-t border-border-subtle pt-8">
        <PracticeSession packItems={PACK_ITEMS} t={t} locale={locale} />
      </div>

      {/*
        WHY IT IS BUILT LIKE THIS, with the papers, on the page it describes.

        Not on `/method`, and that is the decision worth recording. A method
        page is read by somebody deciding whether to trust the product; this is
        read by somebody who has just been told they got something wrong and is
        wondering whether the thing that told them knows what it is doing. The
        claim belongs where the doubt is.

        Every row names its source and links to it, so a reader can check the
        number rather than take it. Where the literature gives a direction and
        not a number — how far ahead a missed item should come back — the row
        says the number is ours. A cited estimate presented as a finding is the
        same defect as an uncited claim, one step better disguised.
      */}
      <section aria-labelledby="why" className="mt-14 border-t border-border-subtle pt-10">
        <h2
          id="why"
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {t.whyTitle}
        </h2>
        <p className="mb-8 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.whyLead}</p>

        <ul className="flex flex-col gap-7">
          {t.why.map((entry) => (
            <li key={entry.claim}>
              <h3 className="max-w-measure font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">
                {entry.claim}
              </h3>
              <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{entry.detail}</p>
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {entry.source.map((id) => (
                  <a
                    key={id}
                    href={SOURCES[id].url}
                    rel="noreferrer"
                    className="font-mono text-caption text-link underline underline-offset-4 hover:text-accent"
                  >
                    {shortCitation(id)}
                  </a>
                ))}
              </p>
            </li>
          ))}
        </ul>

        <Link
          href={href(locale, "method")}
          className="mt-8 inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
        >
          {t.whyMore} →
        </Link>
      </section>

      {/* Where the answers are explained, for somebody who arrived here first.
          A drill links to the specific topic it came from; these two are the
          general way back into reading rather than answering. */}
      <nav aria-label={t.title} className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-border-subtle pt-6">
        <Link
          href={href(locale, "grammar")}
          className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
        >
          {dict.nav.grammar}
        </Link>
        <Link
          href={href(locale, "vocabulary")}
          className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
        >
          {dict.nav.vocabulary}
        </Link>
      </nav>
    </Shell>
  );
}
