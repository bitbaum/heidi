import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import { SOURCES, citation, type SourceId } from "@/lib/research/sources";
import { href } from "@/lib/i18n/routes";
import { Shell } from "../_components/page-shell";
import { KeptCount, WordList } from "../_components/word-list";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.vocabulary.title, description: dict.vocabulary.lead };
}

/** The order they are worth learning in, not alphabetical. */
const GROUPS = ["function", "verbs", "everyday", "greetings"] as const;

/**
 * The words that buy the most comprehension.
 *
 * Read top to bottom it is an argument as much as a list: the first two groups
 * are the short constant words and the handful of verbs, because those are
 * what no sound correspondence rescues and what actually stops a German
 * reader. Nouns and greetings come last, and are short, because a person does
 * not fail to follow a Zurich lunch table for want of "good evening".
 *
 * THE DIRECTION IS DIALECT → GERMAN and the page says so, because the same
 * pair read the other way would contradict the Swiss Standard German gate:
 * this page says *Velo* means *Fahrrad*, and that gate flags *Fahrrad* as
 * Germany's word. Both are right and they face opposite ways — understanding
 * what was said, versus writing something to send.
 */
export default async function VocabularyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.vocabulary;

  const sources = DISPLAY.vocabularySources.filter((s): s is SourceId => s in SOURCES);

  return (
    <Shell>
      <header className="-mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
        <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
          {t.title}
        </h1>
        <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.lead}</p>
        <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{t.note}</p>

        {/* What the reader is carrying, and the way back into reviewing it.
            The list below is now something to act on rather than only read,
            and this is the line that says so. */}
        <div className="mt-6">
          <KeptCount t={t} portalHref={href(locale, "portal")} />
        </div>
      </header>

      <div className="flex flex-col gap-12 border-t border-border-subtle pt-10">
        {GROUPS.map((group) => {
          const words = DISPLAY.vocabulary.filter((w) => w.group === group);
          if (words.length === 0) return null;

          return (
            <section key={group} id={group} className="scroll-mt-24">
              <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
                {t.groups[group]}
              </h2>

              {/* Two columns of pairs rather than a table: a table implies
                  columns you can sort and compare down, and there is nothing
                  to compare — each row is one fact on its own. The two
                  controls per row are what make it a place to learn rather
                  than a place to read; see `word-list.tsx`. */}
              <WordList words={words} t={t} chatT={dict.chat} persons={dict.practice.persons} />
            </section>
          );
        })}
      </div>

      {sources.length > 0 && (
        <section aria-labelledby="sources" className="mt-14 border-t border-border-subtle pt-8">
          <h2 id="sources" className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
            {getDictionary(locale).dialect.sourcesTitle}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {sources.map((id) => (
              <li key={id} className="text-sm leading-relaxed text-fg-secondary">
                <a
                  href={SOURCES[id].url}
                  className="text-link underline underline-offset-4 hover:text-accent"
                  rel="noreferrer"
                >
                  {citation(id)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  );
}
