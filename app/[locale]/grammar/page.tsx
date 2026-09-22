import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import { href } from "@/lib/i18n/routes";
import { GRAMMAR_BANDS } from "@/lib/variety/bands";
import { PACK_ITEMS } from "@/lib/domain/practice/published";
import { itemsInScope } from "@/lib/domain/practice/scope";
import { Shell } from "../_components/page-shell";

/**
 * Which topics a scoped sitting would actually have questions for.
 *
 * Computed once at module load rather than per render: the answer depends only
 * on the packs, so it is the same for every request and every locale. A topic
 * with no items shows no practise link — a button that opens an empty session
 * is worse than no button.
 */
const PRACTISABLE = new Set(
  DISPLAY.grammar
    .filter((topic) => itemsInScope(PACK_ITEMS, { kind: "topic", id: topic.id }).length > 0)
    .map((topic) => topic.id),
);

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

                  const askable = PRACTISABLE.has(topic.id);

                  return (
                    /*
                      A CARD, NOT A LINK, and the difference is the practise
                      button. The whole card used to be one `<Link>`, which is
                      the simplest thing that works right up to the moment the
                      card needs a SECOND destination — and nesting an anchor
                      inside an anchor is invalid, unreachable by keyboard, and
                      read as one control by a screen reader.
                    */
                    <li
                      key={topic.id}
                      className="group flex min-w-0 flex-col rounded-control border border-border-subtle p-5 transition-colors hover:border-border-strong"
                    >
                      <h3 className="font-heading text-xl font-semibold leading-snug tracking-display text-fg-primary">
                        <Link
                          href={`${href(locale, "grammar")}/${topic.id}`}
                          className="hover:text-accent focus-visible:text-accent"
                        >
                          {topicWords.title}
                        </Link>
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

                      {/* The second destination, and the reason this stopped
                          being one big link: practising a topic took two
                          clicks and a page load, when it is the thing most
                          people came to the index to do. */}
                      {askable && (
                        <p className="mt-4">
                          <Link
                            href={`${href(locale, "practice")}?topic=${encodeURIComponent(topic.id)}`}
                            className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
                          >
                            {t.practiseTopic}
                          </Link>
                        </p>
                      )}
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
