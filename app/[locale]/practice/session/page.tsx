import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PACK_ITEMS } from "@/lib/domain/practice/published";
import { includesSaved, itemsInScope, parseScope } from "@/lib/domain/practice/scope";
import { itemsFor, parseFlow, parseMode } from "@/lib/domain/practice/mode";
import { BACK_PARAM, closeTarget, sittingKey, sittingQuery } from "@/lib/domain/practice/sitting";
import { PracticeSession } from "../../_components/practice-session";
import { TestSession } from "../../_components/test-session";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  // A sitting, not a page: `/practice` is the one to find.
  return { title: dict.practice.title, robots: { index: false, follow: false } };
}

/**
 * The session screen for practice and the test — full screen, no site header
 * or footer (`session/frame.tsx` says why).
 *
 * The same URL as `/practice` with `/session` on the end, read the same way:
 * scope, mode and flow narrow the pool here on the server, and only the
 * questions travel to the browser. `back` is where the close button goes;
 * without it, the practice page for this same sitting.
 */
export default async function PracticeSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.practice;

  const query = await searchParams;
  const scope = parseScope(query);
  const mode = parseMode(query);
  const flow = parseFlow(query);
  const items = itemsFor(itemsInScope(PACK_ITEMS, scope), mode, flow);

  const sitting = sittingQuery({ scope, mode, flow });
  const hub = sitting ? `${href(locale, "practice")}?${sitting}` : href(locale, "practice");
  // Nothing to ask: the practice page says why, and offers the way out.
  if (items.length === 0) redirect(hub);
  const closeHref = closeTarget(query[BACK_PARAM], hub);

  return flow === "test" ? (
    <TestSession
      items={items}
      t={t}
      grammarT={dict.grammar} situationsT={dict.situations} vocabularyT={dict.vocabulary} learnT={dict.chat.learn}
      sessionT={dict.session}
      closeHref={closeHref}
      locale={locale}
    />
  ) : (
    <PracticeSession
      packItems={items}
      t={t}
      grammarT={dict.grammar} situationsT={dict.situations} vocabularyT={dict.vocabulary} learnT={dict.chat.learn}
      sessionT={dict.session}
      closeHref={closeHref}
      sessionKey={sittingKey({ scope, mode })}
      locale={locale}
      mode={mode}
      includeSaved={includesSaved(scope)}
    />
  );
}
