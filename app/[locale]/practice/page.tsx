import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PACK_ITEMS } from "@/lib/domain/practice/published";
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

      {/* Where the answers are explained, for somebody who arrived here first.
          A drill links to the specific topic it came from; these two are the
          general way back into reading rather than answering. */}
      <nav aria-label={t.title} className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-border-subtle pt-6">
        <Link
          href={href(locale, "grammar")}
          className="text-sm text-link underline underline-offset-4 hover:text-accent"
        >
          {dict.nav.grammar}
        </Link>
        <Link
          href={href(locale, "vocabulary")}
          className="text-sm text-link underline underline-offset-4 hover:text-accent"
        >
          {dict.nav.vocabulary}
        </Link>
      </nav>
    </Shell>
  );
}
