import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import { SOURCES, type SourceId } from "@/lib/research/sources";
import { href } from "@/lib/i18n/routes";
import { linesSayingWord } from "@/lib/situations/display";
import { PACK_ITEMS } from "@/lib/domain/practice/published";
import { rankWords } from "@/lib/domain/vocabulary/rank";
import { BandHeader, Shell } from "../_components/page-shell";
import { VocabularyBrowser, type SceneLink, type VocabRow } from "../_components/vocabulary-browser";
import { SourceList } from "../_components/source-list";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.vocabulary.title, description: dict.vocabulary.lead };
}

/** The pack's groups, in the order ties are broken and the filter lists them. */
const GROUPS = ["function", "verbs", "helvetisms", "everyday", "slang", "greetings"] as const;

/**
 * The words that buy the most comprehension, in the order worth learning them,
 * and a way to learn them.
 *
 * WHAT A LEARNER COMES HERE FOR is one of three things, in this order of
 * frequency: "what should I learn next", "do I know these yet", and "what did
 * that word mean". The page used to answer only the last, as 226 rows of word,
 * gloss and up to seventeen scene links each — twenty-three thousand pixels on
 * a phone, sorted by part of speech, with no way to tell which word mattered.
 *
 * So, top to bottom:
 *
 *   NEXT. The ten most useful words this learner does not know yet, named, and
 *   one button that opens a sitting on exactly those. Everything else on the
 *   page is secondary to that button.
 *
 *   THE LIST, RANKED. By how often a word is heard in the scenes and whether a
 *   German reader could guess it (`lib/domain/vocabulary/rank.ts`) — so reading
 *   down it is reading in the order worth learning, and the guessable words
 *   sit together at the end under a heading that says why. A group is a
 *   filter, not a chapter.
 *
 *   ONE LINE PER WORD, the detail on demand. Word, meaning, the trap if there
 *   is one (it has to arrive in the same glance), and the keep button. A
 *   sentence, the forms and where it is said open under the row.
 *
 * THE DIRECTION IS DIALECT → GERMAN and the page still says so, because the
 * same pair read the other way would contradict the Swiss Standard German
 * gate: this page says *Velo* means *Fahrrad*, and that gate flags *Fahrrad*
 * as Germany's word. Both are right and they face opposite ways.
 */
export default async function VocabularyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.vocabulary;

  const sources = DISPLAY.vocabularySources.filter((s): s is SourceId => s in SOURCES);

  /**
   * The joins, resolved HERE rather than in the browser: they need the
   * situation packs and the practice pool, and shipping either to the client
   * to print a sentence and a count per word would send the whole corpus.
   */
  const lines = new Map(DISPLAY.vocabulary.map((word) => [word.target, linesSayingWord(word.target)]));
  const practisable = new Set(PACK_ITEMS.flatMap((item) => (item.source.kind === "word" ? [item.source.word] : [])));
  const sceneTitle = (id: string) => dict.situations.scenes[id as keyof typeof dict.situations.scenes]?.title;

  const ranked = rankWords(DISPLAY.vocabulary, {
    heard: (target) => lines.get(target)?.length ?? 0,
    correspondences: DISPLAY.correspondences,
    groupOrder: GROUPS,
  });

  const rows: VocabRow[] = ranked.map(({ word, heard, guessable }) => {
    const said = lines.get(word.target) ?? [];
    const scenes: SceneLink[] = [];
    for (const { scene } of said) {
      const title = sceneTitle(scene.id);
      if (title && !scenes.some((s) => s.id === scene.id)) {
        scenes.push({ id: scene.id, title, href: `${href(locale, "situations")}/${scene.id}` });
      }
    }
    /**
     * A sentence for every word that is said anywhere. The pack's own example
     * when it has one; otherwise the shortest scene line of two words or more
     * — short because the word has to be findable in it, two words because a
     * bare «Merci.» shows nothing a gloss does not.
     */
    const line = said
      .filter(({ phrase }) => phrase.target.trim().split(/\s+/).length >= 2)
      .sort((a, b) => a.phrase.target.length - b.phrase.target.length)[0];
    const lineScene = line && scenes.find((s) => s.id === line.scene.id);
    const example = word.example
      ? { target: word.example.target, bridge: word.example.bridge }
      : line
        ? { target: line.phrase.target, bridge: line.phrase.bridge, ...(lineScene ? { scene: lineScene } : {}) }
        : undefined;

    return {
      target: word.target,
      bridge: word.bridge,
      group: word.group,
      ...(word.article ? { article: word.article } : {}),
      ...(word.mistakenFor ? { mistakenFor: word.mistakenFor } : {}),
      ...(word.register ? { register: word.register } : {}),
      ...(word.forms ? { forms: word.forms } : {}),
      ...(example ? { example } : {}),
      heard,
      scenes,
      guessable,
      practisable: practisable.has(word.target),
    };
  });

  return (
    <Shell>
      <BandHeader title={t.title} lead={t.lead} note={t.note} />

      <VocabularyBrowser
        rows={rows}
        groups={GROUPS.filter((group) => rows.some((w) => w.group === group)).map((group) => ({
          id: group,
          title: t.groups[group],
        }))}
        t={t}
        chatT={dict.chat}
        persons={dict.practice.persons}
        locale={locale}
        portalHref={href(locale, "")}
      />

      <SourceList title={dict.dialect.sourcesTitle} ids={sources} className="mt-14 border-t border-border-subtle pt-8" />
    </Shell>
  );
}
