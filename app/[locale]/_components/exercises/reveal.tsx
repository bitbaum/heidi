"use client";

import { useEffect, useState } from "react";
import { DISPLAY } from "@/lib/variety/display";
import type { PracticeItem } from "@/lib/domain/practice/types";
import type { ExerciseViewProps } from "./view";
import { PROMPT_TEXT, Trace, ignoreKey } from "./chrome";

type RevealItem = Extract<PracticeItem, { kind: "cloze" | "recall" }>;

/**
 * The two self-marked kinds: a gapped sentence, and a word you kept.
 *
 * WHY THEY ARE MARKED BY THE LEARNER AND NOT BY US. Zurich German has no
 * standard orthography, so marking a typed answer means deciding whether a
 * near-miss counts — and getting that wrong tells somebody they were wrong
 * when they were not, in a variety where nobody can tell them otherwise. So
 * the answer is revealed and the learner says whether they had it.
 *
 * THAT IS NOT A WEAKER QUESTION. The reveal comes AFTER the attempt, which is
 * the whole of the generation effect: the work happened in the second before
 * the button was pressed. What is given up is only our ability to score it.
 *
 * A RECALL ANSWER ALSO GRADES THE WORD. The word carries its own review
 * schedule, and practising it without telling the schedule would spend the
 * spacing effect the schedule exists to produce — so this view reports through
 * `onRecall`, and every other kind does not.
 */
export function RevealView({ item, t, locale, onAnswer, onRecall }: ExerciseViewProps) {
  const reveal = item as RevealItem;
  const [shown, setShown] = useState(false);

  function mark(knew: boolean) {
    if (reveal.kind === "recall") onRecall(reveal.prompt, knew);
    else onAnswer(knew ? "right" : "wrong");
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (ignoreKey(event)) return;
      const digit = Number.parseInt(event.key, 10);

      if (!shown) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setShown(true);
        }
        return;
      }
      // Revealed, and self-marked: 1 knew it, 2 ask again. Enter takes the
      // common case so the rhythm of the objective items carries over.
      if (event.key === "Enter" || digit === 1) {
        event.preventDefault();
        mark(true);
      } else if (digit === 2) {
        event.preventDefault();
        mark(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      {reveal.kind === "cloze" ? (
        <>
          <p lang={DISPLAY.tag} className={PROMPT_TEXT}>
            {reveal.prompt}
          </p>
          <p lang="de" className="mt-2 text-base leading-relaxed text-fg-secondary">
            {reveal.bridge}
          </p>
          {shown && <p className={`${PROMPT_TEXT} text-accent`}>{reveal.answer}</p>}
        </>
      ) : (
        <>
          <p lang={DISPLAY.tag} className={PROMPT_TEXT}>
            {reveal.prompt}
          </p>
          {reveal.context && (
            <p lang={DISPLAY.tag} className="mt-2 text-sm italic leading-relaxed text-fg-muted">
              «{reveal.context}»
            </p>
          )}
          {shown && <p className="mt-4 text-lg leading-snug text-fg-primary">{reveal.answer}</p>}
        </>
      )}

      {shown ? (
        <div className="mt-5 border-t border-border-subtle pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => mark(true)}
              className="min-h-11 rounded-control bg-accent px-4 font-medium text-on-accent hover:opacity-90"
            >
              {t.knew}
            </button>
            <button
              type="button"
              onClick={() => mark(false)}
              className="min-h-11 rounded-control border border-border-strong px-4 font-medium text-fg-primary hover:bg-surface-page"
            >
              {t.missed}
            </button>
          </div>
          <Trace item={item} t={t} locale={locale} />
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShown(true)}
            className="min-h-11 rounded-control border border-border-strong px-4 font-medium text-fg-primary hover:bg-surface-page"
          >
            {t.show}
          </button>
          <button
            type="button"
            onClick={() => onAnswer("skipped")}
            className="min-h-11 rounded-control px-4 text-sm text-fg-muted hover:text-fg-primary"
          >
            {t.skip}
          </button>
        </div>
      )}
    </>
  );
}
