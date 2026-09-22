"use client";

import { useEffect, useId, useState } from "react";
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
 * TYPING, AND WHY IT IS NOT MARKED. The reveal button used to be the only
 * control here, which meant a learner could press it and read the answer
 * without ever attempting one — the retrieval this whole page exists for,
 * skipped in a keystroke. There is now a field to write the answer in first.
 *
 * Nothing compares what they wrote to what the pack says, and that is the
 * design rather than a shortcut. §6: this variety has no settled orthography,
 * so a machine that judges a typed dialect answer eventually tells somebody
 * their spelling is wrong when it is not, in a language where they cannot
 * argue back. What typing adds is the COMMITMENT — the answer is out of your
 * head and on the screen before the real one appears, which is the generation
 * effect (Bertsch 2007) the method page already cites, and it makes the
 * self-marking honest in a way "did you know it?" after a bare reveal cannot.
 *
 * So: type, reveal, compare them yourself, say whether you had it.
 *
 * A RECALL ANSWER ALSO GRADES THE WORD. The word carries its own review
 * schedule, and practising it without telling the schedule would spend the
 * spacing effect the schedule exists to produce — so this view reports through
 * `onRecall`, and every other kind does not.
 */
export function RevealView({ item, t, locale, onAnswer, onRecall }: ExerciseViewProps) {
  const reveal = item as RevealItem;
  const [shown, setShown] = useState(false);
  const [wrote, setWrote] = useState("");
  const fieldId = useId();

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
          <Wrote wrote={wrote} shown={shown} t={t} />
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
          <Wrote wrote={wrote} shown={shown} t={t} />
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
        <div className="mt-5">
          {/* OPTIONAL ON PURPOSE. Somebody on a tram with one hand should not
              be blocked by a text field, and somebody who wants the retrieval
              should not have to go looking for it. Nothing is graded either
              way — see the note at the top of this file. */}
          <label htmlFor={fieldId} className="font-mono text-caption uppercase tracking-caps text-fg-muted">
            {t.typeLabel}
          </label>
          <input
            id={fieldId}
            type="text"
            value={wrote}
            onChange={(event) => setWrote(event.target.value)}
            onKeyDown={(event) => {
              // Enter reveals, which is the rhythm every other kind has. The
              // global handler cannot do it: it deliberately ignores keys
              // aimed at a text field, so the chat dock's composer keeps its
              // own digits.
              if (event.key === "Enter") {
                event.preventDefault();
                setShown(true);
              }
            }}
            lang={DISPLAY.tag}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={t.typePlaceholder}
            className="mt-2 min-h-11 w-full max-w-measure rounded-control border border-border-strong bg-surface-page px-4 text-base text-fg-primary placeholder:text-fg-muted focus-visible:border-accent focus-visible:outline-none"
          />

          <div className="mt-4 flex flex-wrap gap-3">
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
        </div>
      )}
    </>
  );
}

/**
 * What the learner wrote, beside what the pack says — and NO verdict between
 * them.
 *
 * The comparison is the learner's to make, and they are perfectly able to make
 * it: two short strings, one above the other. A machine placed between them
 * would be judging spelling in a variety that has none, which is exactly what
 * §6 forbids — so this shows both and says nothing, which carries the same
 * information and none of the false authority.
 *
 * Nothing at all when the field was left empty: an empty row labelled "you
 * wrote" is the interface reporting on a thing that did not happen.
 */
function Wrote({ wrote, shown, t }: { wrote: string; shown: boolean; t: ExerciseViewProps["t"] }) {
  if (!shown || !wrote.trim()) return null;
  return (
    <p className="mt-3 text-sm leading-relaxed text-fg-muted">
      <span className="font-mono text-caption uppercase tracking-caps">{t.youWrote}</span>{" "}
      <span lang={DISPLAY.tag} className="wrap-anywhere text-base text-fg-secondary">
        {wrote.trim()}
      </span>
    </p>
  );
}
