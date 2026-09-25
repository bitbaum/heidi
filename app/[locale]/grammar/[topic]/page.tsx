import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { DISPLAY } from "@/lib/variety/display";
import { scenesUsingTopic } from "@/lib/situations/display";
import { PACK_ITEMS } from "@/lib/domain/practice/published";
import { itemsInScope } from "@/lib/domain/practice/scope";
import { fill } from "@/lib/i18n/fill";
import { PageHeader, Shell } from "../../_components/page-shell";
import { AskButton } from "../../_components/ask-button";

/** Every topic, in every language, at build time. Eight of them, rarely changed. */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => DISPLAY.grammar.map((topic) => ({ locale, topic: topic.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}): Promise<Metadata> {
  const { locale: raw, topic: id } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  const words = dict.grammar.topics[id as keyof typeof dict.grammar.topics];
  if (!words) return { title: dict.grammar.title };
  return { title: `${words.title} — ${dict.grammar.title}`, description: words.rule };
}

/**
 * One grammar topic, with somewhere to go from it.
 *
 * WHY A PAGE PER TOPIC AT ALL, when the anchors already worked. Because an
 * anchor into the middle of a four-screen document is not a place — there is
 * no title in the tab, nothing to share, no previous and next, and no room to
 * put anything ELSE about the topic without making the shared page longer for
 * everybody. Every improvement below was impossible while these were sections.
 *
 * `#no-preterite` still works: the index links to `/grammar/no-preterite`, and
 * an answer that handed somebody `/grammar#no-preterite` months ago lands on
 * the index, which now lists the topic as a card. Nothing 404s.
 *
 * THE THREE THINGS A SECTION COULD NOT HOLD, in the order they matter:
 *
 *   1. ASK ME NOW. A scoped practice session on this topic alone — the pack's
 *      own examples plus every real scene line that turns on the same rule.
 *      The evidence this repo rests on is that a contrast works as a cue
 *      beside something you are about to meet again and does nothing as a
 *      lecture (Bergsma 2014; Pederson & Guion-Anderson 2010). A button that
 *      asks about the topic while it is still warm is that cue; the old
 *      `/practice` link, which drew eight questions from the whole pack, was
 *      not.
 *   2. WHERE IT ACTUALLY HAPPENS. The situation packs already declare which
 *      topic each line turns on, so this is the same join read backwards, and
 *      it costs nothing to keep true. A rule illustrated by sentences written
 *      to illustrate it is a circular argument; the same rule in four lines
 *      said on a shift is not.
 *   3. PREVIOUS AND NEXT, within the band. Somebody who has just understood
 *      one thing is the likeliest person in the world to want the next one,
 *      and a scroll position is not an offer.
 */
export default async function GrammarTopicPage({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}) {
  const { locale: raw, topic: id } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.grammar;

  const topic = DISPLAY.grammar.find((candidate) => candidate.id === id);
  const words = topic ? t.topics[topic.id as keyof typeof t.topics] : undefined;
  // Both halves of the join. Either missing is a page with a heading and
  // nothing under it, which is worse than an honest 404.
  if (!topic || !words) notFound();

  /**
   * Neighbours WITHIN the band, not across the whole list.
   *
   * Walking from the last blocking topic into the first cosmetic one would
   * quietly tell a reader the two are the same kind of thing, which is the
   * distinction the index was restructured to make.
   */
  const siblings = DISPLAY.grammar.filter((candidate) => candidate.band === topic.band);
  const here = siblings.findIndex((candidate) => candidate.id === topic.id);
  const previous = here > 0 ? siblings[here - 1] : undefined;
  const next = here >= 0 && here < siblings.length - 1 ? siblings[here + 1] : undefined;

  const scenes = scenesUsingTopic(topic.id);
  // Whether pressing "practise this" would land on anything. A button that
  // leads to an empty session is worse than no button.
  const askable = itemsInScope(PACK_ITEMS, { kind: "topic", id: topic.id }).length > 0;

  return (
    <Shell>
      <PageHeader eyebrow={t.bands[topic.band as keyof typeof t.bands]?.title} title={words.title} />

      <section className="mt-8">
        <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.ruleLabel}</p>
        <p className="mt-2 max-w-measure text-lead leading-relaxed text-fg-primary">{words.rule}</p>
      </section>

      {/* The forms, target beside bridge — the part a learner actually looks
          at, and the only part that is the same in all seven languages. */}
      <ul className="mt-8 flex flex-col gap-3">
        {topic.examples.map((example) => (
          <li
            key={example.target}
            className="grid grid-cols-safe gap-1 rounded-control border border-border-subtle p-4 sm:grid-cols-2 sm:gap-4"
          >
            <p lang={DISPLAY.tag} className="wrap-anywhere text-base font-medium leading-relaxed text-dialect">
              {example.target}
            </p>
            <p lang="de" className="wrap-anywhere text-base leading-relaxed text-fg-secondary">
              {example.bridge}
            </p>
          </li>
        ))}
      </ul>

      {/* Last, not first: it only means anything once you have seen the pair
          above it. */}
      <div className="mt-6 border-l-2 border-accent pl-4">
        <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.watchLabel}</p>
        <p className="mt-1 max-w-measure text-base leading-relaxed text-fg-primary">{words.watch}</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        {askable && (
          <Link
            href={`${href(locale, "practice")}?topic=${encodeURIComponent(topic.id)}`}
            className="inline-flex min-h-11 items-center rounded-control bg-action px-5 text-sm font-semibold text-on-action transition-opacity hover:opacity-90"
          >
            {t.practiseTopic}
          </Link>
        )}
        {/* The other way of using a topic, and the one that predates the
            practice link: two sentences on demand, from the assistant, without
            leaving the page or composing the request. */}
        <AskButton say={fill(t.practiseSay, { word: words.title })} label={t.practiseLabel} />
      </div>

      {scenes.length > 0 && (
        <section aria-labelledby="where" className="mt-14 border-t border-border-subtle pt-8">
          <h2
            id="where"
            className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
          >
            {t.whereTitle}
          </h2>
          <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.whereLead}</p>

          <ul className="mt-6 flex flex-col gap-4">
            {scenes.map((scene) => {
              const sceneWords = dict.situations.scenes[scene.id as keyof typeof dict.situations.scenes];
              if (!sceneWords) return null;
              // The lines from THIS scene that turn on THIS topic — not the
              // whole scene, which is a click away and is not the argument.
              const lines = scene.phrases.filter((phrase) => phrase.grammar === topic.id);

              return (
                <li key={scene.id} className="min-w-0 rounded-control border border-border-subtle p-4">
                  <Link
                    href={`${href(locale, "situations")}/${scene.id}`}
                    className="font-mono text-caption uppercase tracking-caps text-link underline underline-offset-4 hover:text-accent"
                  >
                    {sceneWords.title}
                  </Link>
                  <ul className="mt-3 flex flex-col gap-2">
                    {lines.map((line) => (
                      <li key={line.target} className="min-w-0">
                        <p lang={DISPLAY.tag} className="wrap-anywhere text-base font-medium leading-snug text-dialect">
                          {line.target}
                        </p>
                        <p lang="de" className="wrap-anywhere text-sm leading-snug text-fg-muted">
                          {line.bridge}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Labelled, like the other fourteen navs on the site. An unnamed
          second navigation landmark is one a screen-reader user has to enter
          to identify. */}
      <nav
        aria-label={dict.nav.grammar}
        className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-6"
      >
        <Link
          href={href(locale, "grammar")}
          className="text-sm text-link underline underline-offset-4 hover:text-accent"
        >
          {t.allTopics}
        </Link>
        <span className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {previous && (
            <Link
              href={`${href(locale, "grammar")}/${previous.id}`}
              className="text-link underline underline-offset-4 hover:text-accent"
            >
              {t.prevLabel}
              {": "}
              {t.topics[previous.id as keyof typeof t.topics]?.title ?? previous.id}
            </Link>
          )}
          {next && (
            <Link
              href={`${href(locale, "grammar")}/${next.id}`}
              className="text-link underline underline-offset-4 hover:text-accent"
            >
              {t.nextLabel}
              {": "}
              {t.topics[next.id as keyof typeof t.topics]?.title ?? next.id}
            </Link>
          )}
        </span>
      </nav>
    </Shell>
  );
}
