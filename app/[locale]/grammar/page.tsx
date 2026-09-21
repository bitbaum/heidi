import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import { href } from "@/lib/i18n/routes";
import { GRAMMAR_BANDS } from "@/lib/variety/bands";
import { Shell } from "../_components/page-shell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.grammar.title, description: dict.grammar.lead };
}

/**
 * Grammar, as a map rather than a scroll.
 *
 * WHAT WAS WRONG WITH THE OLD PAGE, stated plainly because it was mine and it
 * shipped: eight topics, one under the other, every one of them fully expanded,
 * about four screens of reading with no way to see the shape of it. A reader
 * who wanted `am-progressive` scrolled past five things they had not asked for;
 * a reader who wanted to know what Zurich German is LIKE got no overview at
 * all, because an overview is precisely what a list of full sections is not.
 *
 * THE STRUCTURE IS NOT INVENTED FOR THE REDESIGN. The page's own lead has
 * claimed this division since it was written — "first what makes a sentence
 * fail completely, then what you understand but would never say yourself" —
 * and that claim was carried entirely by the ORDER of the list. It is now a
 * field on the topic (`band`), two headed sections, and a sentence each saying
 * what the band is for. The argument was always there; it just was not visible.
 *
 * EACH CARD SHOWS ITS FIRST CONTRAST. A title and a rule is a table of
 * contents, and a table of contents for eight things is not worth a page. One
 * pair of forms — `Ich bi geschter hei gange.` beside `Ich ging gestern nach
 * Hause.` — is the whole topic in miniature, and some readers will not need to
 * click at all. That is a success rather than a lost pageview.
 */
export default async function GrammarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDictionary(locale).grammar;

  // A pack that has written no topics renders no topics, rather than a page
  // promising grammar it does not have.
  const topics = DISPLAY.grammar.filter((topic) => topic.id in t.topics);

  return (
    <Shell>
      <header className="-mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
        <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
          {t.title}
        </h1>
        <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.lead}</p>
      </header>

      <div className="flex flex-col gap-14 border-t border-border-subtle pt-10">
        {GRAMMAR_BANDS.map((band) => {
          const inBand = topics.filter((topic) => topic.band === band);
          // A band with nothing in it is not an empty heading — it is absent.
          // A pack may legitimately put every topic in one of the two.
          if (inBand.length === 0) return null;
          const words = t.bands[band];

          return (
            <section key={band} id={band} className="scroll-mt-24">
              <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
                {words.title}
              </h2>
              <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{words.lead}</p>

              {/* `grid-cols-safe` on the one-column base, per AGENTS.md. The
                  cards hold dialect sentences nobody on this side chose the
                  line breaks for, which is exactly when an `auto` track takes
                  its minimum from the longest unbreakable run. */}
              <ul className="mt-8 grid grid-cols-safe gap-4 sm:grid-cols-2">
                {inBand.map((topic) => {
                  const topicWords = t.topics[topic.id as keyof typeof t.topics];
                  const first = topic.examples[0];

                  return (
                    <li key={topic.id} className="min-w-0">
                      <Link
                        href={`${href(locale, "grammar")}/${topic.id}`}
                        className="group flex h-full flex-col rounded-control border border-border-subtle p-5 transition-colors hover:border-border-strong focus-visible:border-border-strong"
                      >
                        <h3 className="font-heading text-xl font-semibold leading-snug tracking-display text-fg-primary group-hover:text-accent">
                          {topicWords.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-secondary">{topicWords.rule}</p>

                        {first && (
                          <p className="mt-4 border-t border-border-subtle pt-3 text-sm leading-snug">
                            <span lang={DISPLAY.tag} className="font-medium text-dialect">
                              {first.target}
                            </span>
                            <br />
                            <span lang="de" className="text-fg-muted">
                              {first.bridge}
                            </span>
                          </p>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
