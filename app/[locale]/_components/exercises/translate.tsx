"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DISPLAY } from "@/lib/variety/display";
import type { TranslateItem } from "@/lib/domain/practice/types";
import type { ExerciseViewProps } from "./view";
import { PROMPT_TEXT, Trace, ignoreKey } from "./chrome";
import { Explanation } from "./explanation";
import { Actions, PRIMARY, QUIET, SECONDARY } from "./actions";
import { fill } from "@/lib/i18n/fill";
import { compareWords } from "@/lib/domain/practice/compare";

/**
 * Write it in Zurich German.
 *
 * THE WHOLE TYPING EXPERIENCE, IN ONE PLACE. Typing used to be an optional
 * field attached to two other kinds, which meant a text box appeared every
 * third question whatever the learner had sat down to do — annoying on a
 * phone, and pointless for somebody who wanted to tap through a drill. It is
 * now one kind, in one mode, chosen deliberately.
 *
 * Which also lets the field be the POINT rather than an afterthought: it is
 * focused on arrival, it is the first thing on the screen after the sentence,
 * and Enter submits. A learner in this mode is here to write, so nothing
 * should need a tap before they can.
 *
 * NO VERDICT ON THE TWO STRINGS. §6 — no settled orthography, so an
 * automatic verdict would eventually tell somebody their spelling is wrong
 * when it is not. What they wrote and what the pack says are set one above the
 * other, in the same size, and the learner decides. Underneath, words that are
 * missing or typed as a different form are named (`compare.ts`), respellings
 * never. The comparison is easy and
 * it is theirs; a machine placed between them would add only false authority.
 */
export function TranslateView({ item, t, grammarT, situationsT, vocabularyT, learnT, locale, onAnswer }: ExerciseViewProps) {
  const translate = item as TranslateItem;
  const [shown, setShown] = useState(false);
  const [wrote, setWrote] = useState("");
  const fieldId = useId();
  const field = useRef<HTMLTextAreaElement>(null);

  /**
   * FOCUS ON ARRIVAL, and it is not a flourish.
   *
   * This is the writing mode; every item in it wants the same first action.
   * Making somebody tap into the field before each of eight sentences is eight
   * taps that carry no decision — and on a phone it is eight taps plus waiting
   * for the keyboard. Focusing it also brings the keyboard up, which is the
   * behaviour anybody who has used a language app expects here.
   */
  useEffect(() => {
    if (!shown) field.current?.focus();
  }, [shown, translate.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      // While the field has focus this deliberately does nothing — see
      // `ignoreKey`. It only matters after the reveal, when focus has left.
      if (ignoreKey(event)) return;
      const digit = Number.parseInt(event.key, 10);
      if (!shown) return;
      if (event.key === "Enter" || digit === 1) {
        event.preventDefault();
        onAnswer("right");
      } else if (digit === 2) {
        event.preventDefault();
        onAnswer("wrong");
      }
    }

    window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
  });

  const { missing, differs } = shownComparison(wrote, translate.answer);

  return (
    <>
      {/* NO SECOND LABEL HERE. The question card already prints "how do you
          say that in Zurich German?" above this, and a line under it reading
          "write it in Zurich German" is the same instruction twice — the
          duplicate-label problem that was reported on the buttons, in its
          other form. `translateLabel` is still used, as the field's
          accessible name, where it is the only label there is. */}
      {/* German, the sentence translated FROM — so it takes the page's ink.
          It was painted in the dialect's while `PROMPT_TEXT` carried a colour;
          now each view states its own beside the `lang` that says why. */}
      <p lang="de" className={`${PROMPT_TEXT} wrap-anywhere text-fg-primary`}>
        {translate.prompt}
      </p>

      {shown ? (
        <div className="mt-5">
          {/* What they wrote, then what the pack says, same size, no verdict
              between them. The order is chronological: their answer existed
              first. */}
          {wrote.trim() && (
            <>
              <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.youWrote}</p>
              <p lang={DISPLAY.tag} className="mt-1 wrap-anywhere text-lg leading-snug text-fg-secondary">
                {wrote.trim()}
              </p>
            </>
          )}
          <p className="mt-4 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.packSays}</p>
          <p
            lang={DISPLAY.tag}
            className="mt-1 wrap-anywhere font-heading text-2xl font-semibold leading-snug tracking-display text-dialect"
          >
            {translate.answer}
          </p>

          {/* The spelling caveat, ON the item rather than only in a footnote.
              A learner comparing two strings that differ by one letter needs
              to know, right there, that this product is not claiming theirs is
              wrong. */}
          {/* Words of the pack's line that were not in the answer AT ALL —
              respellings are folded away first, so this can never become the
              spelling judgement the note below promises not to make. It says
              what is missing and draws no conclusion. */}
          {missing.length > 0 && (
            <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-primary">
              {fill(t.explain.alsoInPack, { words: "" })}
              <span lang={DISPLAY.tag} className="font-medium text-dialect">
                {missing.join(", ")}
              </span>
            </p>
          )}
          {/* A different FORM, not a different spelling — `compareWords`
              folds respellings away first. «schlof» for «schlaft» was passed
              over in silence, and the learner was left asking which one is
              Zurich German. Said side by side, without a verdict. */}
          {differs.length > 0 && (
            <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-primary">
              {t.explain.formDiffers}
              {differs.map(([typed, pack], i) => (
                <span key={pack}>
                  {i > 0 && ", "}
                  <span lang={DISPLAY.tag} className="text-fg-secondary">{typed}</span> –{" "}
                  <span lang={DISPLAY.tag} className="font-medium text-dialect">{pack}</span>
                </span>
              ))}
            </p>
          )}
          <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-muted">{t.spellingNote}</p>

          <Trace item={item} t={t} locale={locale} />
          <Explanation item={item} locale={locale} t={t} grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT} learnT={learnT} mine={wrote.trim() || undefined} />
          <Actions>
            <button type="button" onClick={() => onAnswer("right")} className={PRIMARY}>
              {t.knew}
            </button>
            <button type="button" onClick={() => onAnswer("wrong")} className={SECONDARY}>
              {t.missed}
            </button>
          </Actions>
        </div>
      ) : (
        <div className="mt-5">
          <label htmlFor={fieldId} className="sr-only">
            {t.translateLabel}
          </label>
          {/*
            A TEXTAREA, NOT AN INPUT, and the reason is the sentences. Several
            scene lines run past forty characters, and a single-line field
            scrolls the beginning of their own answer out of view exactly when
            they want to read it back.

            `rows={2}` so it does not look like a comment box.
          */}
          <textarea
            id={fieldId}
            ref={field}
            rows={2}
            value={wrote}
            onChange={(event) => setWrote(event.target.value)}
            onKeyDown={(event) => {
              // Enter reveals; Shift+Enter is a newline, for the rare line
              // somebody wants to lay out. The global handler cannot do this:
              // it ignores keys aimed at a text field on purpose.
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                setShown(true);
              }
            }}
            lang={DISPLAY.tag}
            autoComplete="off"
            autoCapitalize="sentences"
            spellCheck={false}
            placeholder={t.typePlaceholder}
            className="w-full max-w-measure resize-y rounded-control border border-border-strong bg-surface-page px-4 py-3 font-heading text-lg leading-snug text-fg-primary placeholder:font-body placeholder:text-base placeholder:text-fg-muted focus-visible:border-accent focus-visible:outline-none"
          />

          <Actions>
            <button type="button" onClick={() => setShown(true)} className={PRIMARY}>
              {t.check}
            </button>
            <button type="button" onClick={() => onAnswer("skipped")} className={QUIET}>
              {t.skip}
            </button>
          </Actions>
        </div>
      )}
    </>
  );
}

/** Only once something was typed; an empty answer is "not attempted", not "missing everything". */
function shownComparison(wrote: string, answer: string) {
  return wrote.trim() ? compareWords(wrote, answer) : { missing: [], differs: [] };
}
