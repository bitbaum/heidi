import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PageHeader, Shell } from "../_components/page-shell";
import { WarmupSession } from "../_components/warmup-session";
import { WARMUP_ITEMS } from "./items";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.warmup.title, description: dict.warmup.metaDescription };
}

/**
 * «Wie viel Züridütsch verstehen Sie schon?» — eight lines, no grade, and
 * where starting pays off. See `lib/domain/warmup/run.ts` for the rules and
 * why there is no level. The lines themselves are asked on the session
 * screen, `/warmup/session`; this page is the invitation and the result.
 */
export default async function WarmupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.warmup;
  const page = href(locale, "warmup");

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.warmup} title={t.title} lead={t.lead} measure="24ch" />
      <div className="pb-16 pt-8">
        <WarmupSession
          items={WARMUP_ITEMS}
          t={t}
          practiceT={dict.practice}
          grammarT={dict.grammar}
          situationsT={dict.situations}
          vocabularyT={dict.vocabulary}
          learnT={dict.chat.learn}
          sessionT={dict.session}
          locale={locale}
          surface="page"
          sessionHref={`${page}/session`}
          closeHref={page}
        />
      </div>
    </Shell>
  );
}
