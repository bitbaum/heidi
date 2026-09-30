import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PRACTISABLE, sittingPool } from "@/lib/domain/practice/pool";
import { ALL, includesSaved, parseScope, type Scope } from "@/lib/domain/practice/scope";
import { MODES, itemsFor, parseFlow, parseMode, testable, type Flow, type Mode } from "@/lib/domain/practice/mode";
import { BACK_PARAM, closeTarget, quickScope, sessionPath, sittingKey, sittingQuery } from "@/lib/domain/practice/sitting";
import { PracticeSession } from "../../_components/practice-session";
import { TestSession } from "../../_components/test-session";
import { PracticeChooser } from "../../_components/practice-chooser";
import { SessionSettings } from "../../_components/session/settings";
import { scopeName } from "../scope-name";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  // A sitting, not a page: `/practice` is the one to find.
  return { title: dict.practice.title, robots: { index: false, follow: false } };
}

const sameScope = (a: Scope, b: Scope) => a.kind === b.kind && (a.kind === "all" || (b.kind !== "all" && a.id === b.id));

/**
 * The session screen for practice and the test — full screen, no site header
 * or footer (`session/frame.tsx` says why).
 *
 * The same URL as `/practice` with `/session` on the end, read the same way:
 * scope, mode and flow narrow the pool here on the server, and only the
 * questions travel to the browser. `back` is where the close button goes;
 * without it, the practice page for this same sitting.
 *
 * Every "practise" on the site opens this directly (`SessionLink`), so the
 * choices the practice page used to ask first are here, behind the chip under
 * the progress bar: what to practise, how, and whether it is a test. Only the
 * choices that have questions are offered.
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
  const pool = sittingPool(scope);
  const items = itemsFor(pool, mode, flow);

  const sitting = sittingQuery({ scope, mode, flow });
  const hub = sitting ? `${href(locale, "practice")}?${sitting}` : href(locale, "practice");
  const closeHref = closeTarget(query[BACK_PARAM], hub);
  // Too few to measure anything: the same scope, practised.
  if (flow === "test" && !testable(pool)) redirect(sessionPath(locale, { scope }, closeHref));
  // Nothing to ask: the practice page says why, and offers the way out.
  if (items.length === 0) redirect(hub);

  const about = (
    <SessionSettings label={chipLabel(dict, scope, mode, flow)} scopes={scopeChoices()} t={dict.session}>
      <PracticeChooser
        mode={mode}
        flow={flow}
        scope={scope}
        t={t}
        locale={locale}
        base={sessionPath(locale, { scope: ALL })}
        keep={{ [BACK_PARAM]: closeHref }}
        replace
        available={{
          modes: MODES.filter((m) => itemsFor(pool, m, "practice").length > 0),
          test: testable(pool),
        }}
        className=""
      />
    </SessionSettings>
  );

  /**
   * What else the sitting could be about: the page it was opened from (so
   * "everything" is never a one-way door), the current scope, and everything.
   * A switch keeps the mode when the new scope has questions for it.
   */
  function scopeChoices() {
    const home = quickScope(closeHref.split("?")[0] ?? "", PRACTISABLE);
    const candidates = [home, scope, ALL].filter(
      (s, i, all) => all.findIndex((other) => sameScope(other, s)) === i,
    );
    return candidates.map((s) => {
      const target = sittingPool(s);
      const keeps = flow === "test" ? testable(target) : itemsFor(target, mode, flow).length > 0;
      return {
        label: scopeName(dict, s) || dict.session.everything,
        href: sessionPath(locale, keeps ? { scope: s, mode, flow } : { scope: s }, closeHref),
        current: sameScope(s, scope),
      };
    });
  }

  // Keyed on the sitting: a choice in the sheet is a new sitting on the same
  // route, and without a key React would keep the old one's questions.
  const key = `${sittingKey({ scope, mode })}|${flow}`;

  return flow === "test" ? (
    <TestSession
      key={key}
      items={items}
      t={t}
      grammarT={dict.grammar} situationsT={dict.situations} vocabularyT={dict.vocabulary} learnT={dict.chat.learn}
      sessionT={dict.session}
      closeHref={closeHref}
      about={about}
      locale={locale}
    />
  ) : (
    <PracticeSession
      key={key}
      packItems={items}
      t={t}
      grammarT={dict.grammar} situationsT={dict.situations} vocabularyT={dict.vocabulary} learnT={dict.chat.learn}
      sessionT={dict.session}
      closeHref={closeHref}
      about={about}
      sessionKey={sittingKey({ scope, mode })}
      locale={locale}
      mode={mode}
      includeSaved={includesSaved(scope)}
    />
  );
}

/** "Im Spital", "Im Spital · Karten", "Alles gemischt · Test" — the sitting in a few words. */
function chipLabel(dict: ReturnType<typeof getDictionary>, scope: Scope, mode: Mode, flow: Flow): string {
  const t = dict.practice;
  const what = scopeName(dict, scope) || dict.session.everything;
  if (flow === "test") return `${what} · ${t.flowTest}`;
  if (mode === "mixed") return what;
  const how: Record<Exclude<Mode, "mixed">, string> = { tap: t.modeTap, write: t.modeWrite, card: t.modeCard };
  return `${what} · ${how[mode]}`;
}
