import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PACK_ITEMS } from "@/lib/domain/practice/published";
import { includesSaved, itemsInScope, parseScope, type Scope } from "@/lib/domain/practice/scope";
import { itemsFor, parseFlow, parseMode } from "@/lib/domain/practice/mode";
import { fill } from "@/lib/i18n/fill";
import type { Dictionary } from "@/lib/i18n/dictionaries/de";
import { SOURCES, shortCitation } from "@/lib/research/sources";
import { BandHeader, Shell } from "../_components/page-shell";
import { PracticeSession } from "../_components/practice-session";
import { FocusPanel } from "../_components/focus-panel";
import { PracticeChooser } from "../_components/practice-chooser";
import { TestSession } from "../_components/test-session";
import { StreakCard } from "../_components/streak-card";

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
/**
 * What to call a scope, in the reader's language.
 *
 * It reads the SAME dictionary entries the pages themselves render — the
 * grammar topic's own title, the scene's own title, the vocabulary group's own
 * heading — rather than a second set of names written for this banner. Two
 * names for one thing is how a product ends up telling somebody they are
 * practising "Verbs" on a page headed "Verben, die ständig vorkommen".
 *
 * An id nothing recognises falls back to the id itself. That is deliberate: a
 * hand-edited URL should show what it asked for, so the person can see their
 * typo, rather than a friendly label that hides it.
 */
function scopeName(dict: Dictionary, scope: Scope): string {
  switch (scope.kind) {
    case "all":
      return "";
    case "topic":
      return dict.grammar.topics[scope.id as keyof typeof dict.grammar.topics]?.title ?? scope.id;
    case "scene":
      return dict.situations.scenes[scope.id as keyof typeof dict.situations.scenes]?.title ?? scope.id;
    case "group":
      return dict.vocabulary.groups[scope.id as keyof typeof dict.vocabulary.groups] ?? scope.id;
  }
}

export default async function PracticePage({
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

  /**
   * WHAT THIS SITTING IS ABOUT, read from the URL.
   *
   * `/practice` is the whole pool and stays exactly as it was.
   * `/practice?topic=am-progressive` is the same page narrowed to one thing,
   * and it is what every reference surface now links to — the grammar topic
   * you have just read, the scene you have just skimmed, the group of words
   * you are looking at. The narrowing happens HERE, on the server, where the
   * items and the URL both are; the session component is handed a pool and
   * does not need to know what a scope is.
   */
  const query = await searchParams;
  const scope = parseScope(query);

  /**
   * AND WHAT KIND OF SITTING IT IS, read from the same URL.
   *
   * Two axes, independent of the scope and of each other: what the hands do
   * (`mode`) and when the learner finds out (`flow`). Both narrow the pool
   * here, on the server, for the same reason the scope does — the items and
   * the URL are both in this function, and the session component is handed a
   * pool rather than a set of rules about one.
   */
  const mode = parseMode(query);
  const flow = parseFlow(query);
  const items = itemsFor(itemsInScope(PACK_ITEMS, scope), mode, flow);
  const named = scopeName(dict, scope);

  /**
   * A scope that matches nothing says so, and offers the way out.
   *
   * This is reachable by editing the URL and, more importantly, by following a
   * link from a topic the pack has not written questions for yet — a grammar
   * topic with no examples produces no cloze items, and pretending otherwise
   * would drop somebody into a blank session with no explanation.
   */
  const empty = items.length === 0;

  return (
    <Shell>
      <BandHeader title={t.title} lead={t.lead} note={t.note} />

      <div className="border-t border-border-subtle pt-8">
        <div className="mb-6">
          <StreakCard t={dict.streak} locale={locale} compact />
        </div>
        {/* The subject of a scoped sitting, named, with the door back to
            everything. A drill that has silently been narrowed is worse than
            one that has not: the learner cannot tell whether the pool is small
            or the product is broken. */}
        {scope.kind !== "all" && (
          <p className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-control border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-fg-secondary">
            <span>{fill(t.scopedTo, { what: named })}</span>
            <Link href={href(locale, "practice")} className="text-link underline underline-offset-4 hover:text-accent">
              {t.scopeAll}
            </Link>
          </p>
        )}

        {/* What kind of sitting this is. Above the questions rather than
            behind a settings link, because it is the first decision and it
            changes every question that follows. */}
        <PracticeChooser mode={mode} flow={flow} scope={scope} t={t} locale={locale} />

        {/* Only on the unscoped page: inside a scoped sitting the learner has
            already said what they want to work on, and offering them three
            other things is the product arguing with them. */}
        {scope.kind === "all" && flow === "practice" && (
          <FocusPanel t={t} grammarT={dict.grammar} situationsT={dict.situations} locale={locale} />
        )}

        {empty ? (
          <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.scopeEmpty}</p>
        ) : flow === "test" ? (
          <TestSession items={items} t={t} grammarT={dict.grammar} situationsT={dict.situations} vocabularyT={dict.vocabulary} learnT={dict.chat.learn} locale={locale} />
        ) : (
          <PracticeSession
            packItems={items}
            t={t}
            grammarT={dict.grammar} situationsT={dict.situations} vocabularyT={dict.vocabulary} learnT={dict.chat.learn}
            locale={locale}
            mode={mode}
            includeSaved={includesSaved(scope)}
          />
        )}
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
        {/*
          FOLDED SHUT, and that is a fix rather than a demotion.

          This section is four research claims with citations, and it made the
          practice page 4,800 pixels tall on a phone — so the questions, which
          are the reason anybody opened it, sat in the first fifth of a page
          that then scrolled for another four screens of prose. "Hard to
          navigate long pages like this" was the report, and it was right.

          `<details>` rather than a toggle with state: it opens without
          JavaScript, it is in the tab order and announced as expandable for
          free, and the browser's own find-in-page opens it to show a match.
          Nothing is hidden from a reader who wants it, and nothing is in the
          way of a reader who does not. The claims still live on the page they
          describe — see the note below — they are simply folded.
        */}
        <details className="group">
          <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4">
            <h2
              id="why"
              className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
            >
              {t.whyTitle}
            </h2>
            <span aria-hidden="true" className="font-mono text-caption text-fg-muted transition-transform group-open:rotate-90">
              →
            </span>
          </summary>

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
        </details>
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
