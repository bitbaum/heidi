import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { BACK_PARAM, closeTarget } from "@/lib/domain/practice/sitting";
import { WarmupSession } from "../../_components/warmup-session";
import { WARMUP_ITEMS } from "../items";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.warmup.title, robots: { index: false, follow: false } };
}

/** The warm-up's eight lines, on the session screen. `/warmup` is the page. */
export default async function WarmupSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const page = href(locale, "warmup");

  return (
    <WarmupSession
      items={WARMUP_ITEMS}
      t={dict.warmup}
      practiceT={dict.practice}
      grammarT={dict.grammar}
      situationsT={dict.situations}
      vocabularyT={dict.vocabulary}
      learnT={dict.chat.learn}
      sessionT={dict.session}
      locale={locale}
      surface="session"
      sessionHref={`${page}/session`}
      closeHref={closeTarget((await searchParams)[BACK_PARAM], page)}
    />
  );
}
