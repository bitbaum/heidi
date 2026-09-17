import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import { fill } from "@/lib/i18n/fill";
import { Shell } from "../_components/page-shell";
import { AskButton } from "../_components/ask-button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.grammar.title, description: dict.grammar.lead };
}

/**
 * Grammar, as the place an answer links to.
 *
 * NOT a course, and the difference matters. The evidence this repo already
 * rests on is that correspondences work as attentional cues beside something
 * you are about to meet again, and produce no measurable gain as a lecture you
 * sit through first (Bergsma 2014; Pederson & Guion-Anderson 2010). A page
 * that tried to teach Zurich German grammar front-to-back would be the version
 * that was measured and found not to work.
 *
 * So each topic is one sentence of rule, the forms beside the German a reader
 * already has, and the thing that actually trips them. It is browsable for
 * somebody who wants to read, and it is deep-linkable so that an answer which
 * turned on a structure can point at the exact topic.
 *
 * The forms come from the variety pack and the words from the dictionary,
 * joined by topic id — so a second variety gets this page by writing its own
 * topics, with no component to change.
 */
export default async function GrammarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDictionary(locale).grammar;

  // A pack that has written no topics renders no topics, rather than an empty
  // page promising grammar it does not have.
  const topics = DISPLAY.grammar.filter((topic) => topic.id in t.topics);

  return (
    <Shell>
      <header className="-mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
        <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
          {t.title}
        </h1>
        <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.lead}</p>
      </header>

      <div className="flex flex-col gap-12 border-t border-border-subtle pt-10">
        {topics.map((topic) => {
          const words = t.topics[topic.id as keyof typeof t.topics];
          return (
            // The id IS the anchor. An answer that links here points at
            // `#no-preterite`, so renaming one breaks a link Heidi has already
            // given somebody — which is why the pack treats ids as permanent.
            <section key={topic.id} id={topic.id} className="scroll-mt-24">
              <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
                {words.title}
              </h2>

              <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">
                <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.ruleLabel}</span>
                <br />
                {words.rule}
              </p>

              {/* The forms, target beside bridge. This is the part a learner
                  actually looks at, and the only part that is the same in all
                  seven languages. */}
              <ul className="mt-5 flex flex-col gap-3">
                {topic.examples.map((example) => (
                  <li
                    key={example.target}
                    className="grid gap-1 rounded-control border border-border-subtle p-3 sm:grid-cols-2 sm:gap-4"
                  >
                    <p lang={DISPLAY.tag} className="text-base font-medium leading-relaxed text-dialect">
                      {example.target}
                    </p>
                    <p lang="de" className="text-base leading-relaxed text-fg-secondary">
                      {example.bridge}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Last, not first: it only means anything once you have seen the
                  pair above it. */}
              <div className="mt-4 border-l-2 border-accent pl-4">
                <p className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.watchLabel}</p>
                <p className="mt-1 max-w-measure text-base leading-relaxed text-fg-primary">{words.watch}</p>
              </div>

              {/* The way out of reading and into using it.

                  This page is deliberately not a course — the evidence it
                  rests on says a correspondence works as a cue beside
                  something you are about to meet again, and does nothing as a
                  lecture you sit through first. A button that turns the topic
                  into two sentences and a question is that cue, on demand,
                  without the reader having to leave the page or compose the
                  request themselves. */}
              <div className="mt-5">
                <AskButton
                  say={fill(t.practiseSay, { word: words.title })}
                  label={t.practiseLabel}
                />
              </div>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
