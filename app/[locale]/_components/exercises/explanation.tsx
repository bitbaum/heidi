"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";
import { askHeidi } from "@/lib/browser/ask";
import { DISPLAY } from "@/lib/variety/display";
import type { PracticeItem } from "@/lib/domain/practice/types";
import { explanationFor } from "@/lib/domain/practice/explanation";
import type { DisplayPhrase } from "@/lib/situations/display";

/**
 * What a learner sees after answering: why, where it lives, and what next.
 *
 * Reported: "when i answr questions, i need to see explanations and be able to
 * practice it … explanation of words, grammar, or how it is said and how else
 * it could be said. if it's a word, synonyms, anonyms, word in context, short
 * text". Before this there was one line, in one of six places a question can
 * be answered, and none at all after a translate, a reveal or a card.
 *
 * FOUR PARTS, EACH ONLY WHEN IT HAS SOMETHING TRUE TO SAY. What to show is
 * decided by `explanationFor`, a pure function tested against every published
 * item; this file only draws it. So an empty labelled box — the interface
 * reporting on something that did not happen — cannot occur here.
 *
 *   Die Regel      the topic's rule AND its "where it catches" line, the same
 *                  words as the grammar page so the two cannot drift, with a
 *                  link to read more and one to drill exactly this.
 *   Im Gespräch    the line with the lines before and after it. A sentence
 *                  from a handover means something different alone.
 *   Das Wort       meaning, article, forms, example, the false-friend trap,
 *                  and where else it is said.
 *   Heidi          one tap to ask for other ways to say it, similar words and
 *                  the opposite, a short text, or a word-by-word breakdown.
 *
 * THE LAST PART IS THE MODEL, AND SAYS SO. Synonyms and short texts are not in
 * the packs and are not invented into them: both packs are unreviewed, and
 * forty synonyms per word written without a Zurich speaker would be unreviewed
 * content wearing the costume of reference. They arrive in the chat as an
 * ordinary message the learner sent — the rule `lib/browser/ask.ts` keeps —
 * and the note beneath the buttons says whose answer it will be.
 */
export function Explanation({
  item,
  locale,
  t,
  grammarT,
  situationsT,
  vocabularyT,
  learnT,
  compact = false,
}: {
  item: PracticeItem;
  locale: Locale;
  t: Dictionary["practice"];
  grammarT: Dictionary["grammar"];
  situationsT: Dictionary["situations"];
  vocabularyT: Dictionary["vocabulary"];
  /** The "ask Heidi" sentences — the chat's own, so a tap here and a tap in the chat send the same words. */
  learnT: Dictionary["chat"]["learn"];
  /** In a long review list: folded behind one control instead of expanded. */
  compact?: boolean;
}) {
  const e = explanationFor(item);
  const x = t.explain;
  const topic = e.topic ? grammarT.topics[e.topic as keyof typeof grammarT.topics] : undefined;
  const sceneTitle = e.scene ? situationsT.scenes[e.scene.id as keyof typeof situationsT.scenes]?.title : undefined;
  const practice = href(locale, "practice");

  const body = (
    <div className="flex flex-col gap-5">
      {topic && e.topic && (
        <Part title={x.ruleTitle}>
          <p className="text-sm font-medium text-fg-primary">{topic.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-fg-secondary">{topic.rule}</p>
          <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
            <span className="text-fg-muted">{x.watchTitle}: </span>
            {topic.watch}
          </p>
          <Links>
            {/* The trace link beside this already goes to the topic when the item
                CAME from it; a second link to the same page is noise. It stays
                for an item that is only explained by a topic — an article
                question traces to its noun, not to the article system. */}
            {item.source.kind !== "grammar" && (
              <Link href={`${href(locale, "grammar")}/${e.topic}`} className={LINK}>{x.moreOnTopic}</Link>
            )}
            <Link href={`${practice}?topic=${encodeURIComponent(e.topic)}`} className={LINK}>{x.practiseTopic}</Link>
          </Links>
        </Part>
      )}

      {e.scene?.phrase && (
        <Part title={sceneTitle ? `${x.contextTitle} · ${sceneTitle}` : x.contextTitle}>
          <ol className="flex flex-col gap-2">
            {e.scene.before && <Line phrase={e.scene.before} quiet />}
            <Line phrase={e.scene.phrase} />
            {e.scene.after && <Line phrase={e.scene.after} quiet />}
          </ol>
          <Links>
            {/* Same reason: a situation item's trace link is this page. */}
            {item.source.kind !== "situation" && (
              <Link href={`${href(locale, "situations")}/${e.scene.id}`} className={LINK}>{x.openScene}</Link>
            )}
            <Link href={`${practice}?scene=${encodeURIComponent(e.scene.id)}`} className={LINK}>{x.practiseScene}</Link>
          </Links>
        </Part>
      )}

      {e.word && (
        <Part title={x.wordTitle}>
          <p className="text-sm">
            <span lang={DISPLAY.tag} className="font-medium text-dialect">
              {e.word.article ? `${e.word.article} ` : ""}
              {e.word.target}
            </span>
            <span lang="de" className="text-fg-secondary"> — {e.word.bridge}</span>
          </p>
          {e.word.mistakenFor && (
            <p lang="de" className="mt-1 text-sm text-fg-muted">
              {fill(vocabularyT.mistakenForLabel, { assumed: e.word.mistakenFor })}
            </p>
          )}
          {e.word.forms && e.word.forms.length > 0 && (
            <p lang={DISPLAY.tag} className="mt-1 text-sm text-fg-secondary">
              {e.word.forms.map((f) => f.target).join(" · ")}
            </p>
          )}
          {e.word.example && (
            <p className="mt-1 text-sm leading-relaxed">
              <span lang={DISPLAY.tag} className="text-dialect">«{e.word.example.target}»</span>{" "}
              <span lang="de" className="text-fg-muted">{e.word.example.bridge}</span>
            </p>
          )}
          {e.saidIn.length > 0 && (
            <p className="mt-2 text-sm text-fg-secondary">
              <span className="text-fg-muted">{x.saidInTitle}: </span>
              {e.saidIn.map((id, i) => (
                <span key={id}>
                  {i > 0 && " · "}
                  <Link href={`${href(locale, "situations")}/${id}`} className="text-link underline underline-offset-4 hover:text-accent">
                    {situationsT.scenes[id as keyof typeof situationsT.scenes]?.title ?? id}
                  </Link>
                </span>
              ))}
            </p>
          )}
          <Links>
            <Link href={`${practice}?group=${encodeURIComponent(e.word.group)}`} className={LINK}>{x.practiseWord}</Link>
          </Links>
        </Part>
      )}

      {(e.sentence || e.term) && (
        <Part title={x.askTitle}>
          <div className="flex flex-wrap gap-2">
            {(e.sentence ?? e.term) && (
              <Ask say={fill(learnT.otherWays, { text: (e.sentence ?? e.term)! })} label={learnT.otherWaysLabel} />
            )}
            {e.term && <Ask say={fill(learnT.similar, { word: e.term })} label={learnT.similarLabel} />}
            {e.term && <Ask say={fill(learnT.story, { word: e.term })} label={learnT.storyLabel} />}
            {e.sentence && <Ask say={fill(learnT.breakdown, { text: e.sentence })} label={learnT.breakdownLabel} />}
          </div>
          <p className="mt-2 max-w-measure text-xs leading-relaxed text-fg-muted">{learnT.aiNote}</p>
        </Part>
      )}
    </div>
  );

  if (!compact) return <div className="mt-5 border-t border-border-subtle pt-4">{body}</div>;

  return (
    <details className="group mt-2">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-sm text-link underline underline-offset-4 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="transition-transform group-open:rotate-90">&rsaquo;</span>
        {x.show}
      </summary>
      <div className="mt-3">{body}</div>
    </details>
  );
}

const LINK = "inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent";

function Part({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 font-mono text-caption uppercase tracking-caps text-fg-muted">{title}</h4>
      {children}
    </section>
  );
}

function Links({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 flex flex-wrap gap-x-5">{children}</div>;
}

function Line({ phrase, quiet = false }: { phrase: DisplayPhrase; quiet?: boolean }) {
  return (
    <li className={quiet ? "opacity-70" : ""}>
      <p lang={DISPLAY.tag} className={`text-sm leading-snug ${quiet ? "text-fg-secondary" : "font-medium text-dialect"}`}>
        {phrase.target}
      </p>
      <p lang="de" className="text-sm leading-snug text-fg-muted">{phrase.bridge}</p>
    </li>
  );
}

/** One tap: the question goes to Heidi as the learner's own visible message. */
function Ask({ say, label }: { say: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => askHeidi(say)}
      className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-3 text-sm text-fg-primary transition-colors hover:bg-surface-sunk"
    >
      {label}
    </button>
  );
}
