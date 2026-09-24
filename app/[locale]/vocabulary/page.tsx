import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import { SOURCES, type SourceId } from "@/lib/research/sources";
import { href } from "@/lib/i18n/routes";
import { scenesSayingWord } from "@/lib/situations/display";
import { BandHeader, Shell } from "../_components/page-shell";
import { KeptCount } from "../_components/word-list";
import { VocabularyBrowser, type SceneLink } from "../_components/vocabulary-browser";
import { SourceList } from "../_components/source-list";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.vocabulary.title, description: dict.vocabulary.lead };
}

/** The order they are worth learning in, not alphabetical. */
const GROUPS = ["function", "verbs", "helvetisms", "everyday", "greetings"] as const;

/**
 * The words that buy the most comprehension — now findable.
 *
 * READ TOP TO BOTTOM IT IS STILL AN ARGUMENT: the first two groups are the
 * short constant words and the handful of verbs, because those are what no
 * sound correspondence rescues and what actually stops a German reader. Nouns
 * and greetings come last, and are short, because a person does not fail to
 * follow a Zurich lunch table for want of "good evening". That ordering is why
 * `GROUPS` is a literal here rather than derived alphabetically.
 *
 * HELVETISMS SIT THIRD, BY THE SAME ARGUMENT. They are nouns, which would put
 * them at the bottom — but the rule above is not about part of speech, it is
 * about what a correspondence can rescue, and nothing gets a reader from
 * `Bürgersteig` to `Trottoir`. Worse, half of them are words the reader is
 * CERTAIN of and wrong about, which no amount of scrolling surfaces. So they
 * go above the ordinary nouns and below the words that stop somebody mid
 * sentence.
 *
 * WHAT CHANGED IS EVERYTHING AROUND IT. The list was a list: no way in except
 * scrolling, no way out except the chat. It now has a filter over both
 * languages, jump links to the groups, a scoped practice session per group,
 * and — for the words that have one — the scenes where the word is actually
 * said. See `vocabulary-browser.tsx` for why each of those is there.
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
   * The word-to-scene join, resolved HERE rather than in the browser.
   *
   * It needs the situation packs and the seven dictionaries, and shipping
   * either to the client to render a handful of links would send the whole
   * corpus in order to print four titles. Most words get nothing, which is the
   * honest result: the pack's function words are general and a care shift is
   * one domain.
   */
  const saidIn: Record<string, readonly SceneLink[]> = {};
  for (const word of DISPLAY.vocabulary) {
    const scenes = scenesSayingWord(word.target)
      .map((scene) => {
        const words = dict.situations.scenes[scene.id as keyof typeof dict.situations.scenes];
        if (!words) return null;
        return { id: scene.id, title: words.title, href: `${href(locale, "situations")}/${scene.id}` };
      })
      .filter((scene): scene is SceneLink => scene !== null);
    if (scenes.length > 0) saidIn[word.target] = scenes;
  }

  return (
    <Shell>
      <BandHeader title={t.title} lead={t.lead} note={t.note}>
        {/* What the reader is carrying, and the way back into reviewing it. */}
        <KeptCount t={t} portalHref={href(locale, "")} />
      </BandHeader>

      <div className="border-t border-border-subtle pt-10">
        <VocabularyBrowser
          words={DISPLAY.vocabulary.map((word) => ({
            target: word.target,
            bridge: word.bridge,
            group: word.group,
            ...(word.article ? { article: word.article } : {}),
            ...(word.mistakenFor ? { mistakenFor: word.mistakenFor } : {}),
            ...(word.forms ? { forms: word.forms } : {}),
            ...(word.example ? { example: word.example } : {}),
          }))}
          groups={GROUPS.filter((group) => DISPLAY.vocabulary.some((w) => w.group === group)).map((group) => ({
            id: group,
            title: t.groups[group],
          }))}
          saidIn={saidIn}
          t={t}
          chatT={dict.chat}
          persons={dict.practice.persons}
          practiceHref={href(locale, "practice")}
        />
      </div>
      <SourceList title={dict.dialect.sourcesTitle} ids={sources} className="mt-14 border-t border-border-subtle pt-8" />
</Shell>
  );
}
