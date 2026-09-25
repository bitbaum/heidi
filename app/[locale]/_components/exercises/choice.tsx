"use client";

import { useEffect, useState } from "react";
import { DISPLAY } from "@/lib/variety/display";
import type { PracticeItem } from "@/lib/domain/practice/types";
import type { ExerciseViewProps } from "./view";
import { PROMPT_TEXT, Verdict, ignoreKey, optionClass, person } from "./chrome";

type ChoiceItem = Extract<PracticeItem, { kind: "pair" | "article" | "form" | "pick" }>;

/**
 * The four kinds with options: which is Zurich, which article, which form,
 * which word is missing.
 *
 * ONE VIEW FOR FOUR KINDS, and it is the right grouping for the same reason
 * `kinds/vocabulary.ts` groups three generators: these differ in what the
 * QUESTION says and agree completely on what ANSWERING looks like. A row of
 * buttons, digits printed on them, press to mark, read the verdict, move on.
 * Splitting them into three files would be three copies of the keyboard
 * handler, which is the one piece here that has already gone wrong once.
 *
 * PRESSING AN OPTION MARKS; IT DOES NOT ADVANCE. The learner moves on from the
 * verdict, once they have read why — advancing on the answer is how a quiz
 * gets through eight questions without anybody learning from the six they
 * missed.
 */
export function ChoiceView({ item, t, grammarT, situationsT, vocabularyT, learnT, locale, reveal, onAnswer }: ExerciseViewProps) {
  const choice = item as ChoiceItem;
  const [chose, setChose] = useState<number | null>(null);

  /**
   * In a test, PRESSING AN OPTION IS THE WHOLE TURN.
   *
   * No verdict, no colour, no pause on a "next" button — the answer is
   * recorded and the next question is already there. That is what makes a run
   * of twenty take three minutes rather than ten, and the silence is not a
   * feature being withheld: a verdict after each item would change what the
   * next item measures.
   */
  function pick(index: number) {
    if (reveal === "later") {
      onAnswer(index === choice.answer ? "right" : "wrong", choice.options[index]);
      return;
    }
    setChose(index);
  }

  /**
   * THE WHOLE SESSION FROM THE KEYBOARD.
   *
   * Eight questions is about two minutes of work and roughly twenty round
   * trips to the mouse, which is what makes a short drill feel long. A digit
   * picks an option, Enter moves on — so the hand never leaves the keys.
   *
   * The digits are PRINTED on the buttons. A shortcut nobody can see is not a
   * feature, it is a thing the person who wrote it enjoys.
   *
   * It is bound HERE rather than in the session, which is the point of the
   * view split: a kind with no keyboard affordance binds nothing, instead of
   * falling through a shared handler into another kind's meaning.
   */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (ignoreKey(event)) return;
      const digit = Number.parseInt(event.key, 10);

      if (chose === null) {
        if (digit >= 1 && digit <= choice.options.length) {
          event.preventDefault();
          pick(digit - 1);
        }
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onAnswer(chose === choice.answer ? "right" : "wrong");
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <ChoicePrompt item={choice} t={t} />

      <ul className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {choice.options.map((option, index) => (
          <li key={option}>
            <button
              type="button"
              disabled={chose !== null}
              onClick={() => pick(index)}
              className={optionClass(index, chose, choice.answer)}
            >
              {/* The key that picks it. Muted, and gone once answered — at
                  which point it is a label for something you can no longer
                  do. */}
              {chose === null && (
                <span aria-hidden="true" className="mr-2 font-mono text-caption font-normal text-fg-muted">
                  {index + 1}
                </span>
              )}
              <span lang={DISPLAY.tag}>{option}</span>
            </button>
          </li>
        ))}
      </ul>

      {chose !== null && reveal === "now" && (
        <Verdict
          right={chose === choice.answer}
          t={t}
          grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT} learnT={learnT}
          item={item}
          locale={locale}
          onNext={() => onAnswer(chose === choice.answer ? "right" : "wrong")}
        />
      )}
    </>
  );
}

/** What is being asked, which is the only part the three kinds disagree on. */
function ChoicePrompt({ item, t }: { item: ChoiceItem; t: ExerciseViewProps["t"] }) {
  // The options ARE the question for a pair — nothing to print above them.
  if (item.kind === "pair") return null;

  /**
   * A `pick` prints the sentence and then the German, and the ORDER matters.
   *
   * The German is not a hint bolted on: it is what makes exactly one option
   * correct, because several of them will produce a perfectly good Zurich
   * sentence. Printing it second keeps the dialect line as the question and
   * the translation as the condition on the answer — the other way round, the
   * exercise becomes "translate this", which is a different skill and one this
   * product does not claim to mark.
   */
  if (item.kind === "pick") {
    return (
      <>
        <p lang={DISPLAY.tag} className={`${PROMPT_TEXT} wrap-anywhere text-dialect`}>
          {item.prompt}
        </p>
        <p lang="de" className="mt-2 max-w-measure wrap-anywhere text-base leading-relaxed text-fg-secondary">
          {item.bridge}
        </p>
      </>
    );
  }

  if (item.kind === "article") {
    return (
      <>
        <p lang={DISPLAY.tag} className={`${PROMPT_TEXT} text-dialect`}>
          <span aria-hidden="true" className="text-fg-muted">
            ___{" "}
          </span>
          {item.noun}
        </p>
        <p lang="de" className="mt-1 text-base text-fg-secondary">
          {item.bridge}
        </p>
      </>
    );
  }

  /**
   * A conjugation question, ASKED IN THE VARIETY.
   *
   * It used to read «мы ___» to a Russian reader and «we ___» to an English
   * one — the product translating the one thing it exists to teach. Answering
   * it correctly left the learner having never seen `mir chömed`, which is the
   * only string the question was ever about.
   *
   * So the pronoun comes from the pack and is printed in dialect, and the
   * reader's own pronoun drops to the gloss line beside the verb — the shape
   * every other kind here already uses. Nothing is taken away from somebody
   * who needs the translation; it stops being the question.
   *
   * `plural` and `past` have no pronoun to print and keep the translated
   * label, because "past tense" is a fact about grammar rather than a word.
   */
  return (
    <>
      <p className={PROMPT_TEXT}>
        {item.subject ? (
          <span lang={DISPLAY.tag} className="text-fg-primary">
            {item.subject}{" "}
          </span>
        ) : (
          <span className="text-fg-primary">{person(t, item.label)} </span>
        )}
        <span aria-hidden="true" className="text-fg-muted">
          ___
        </span>
      </p>
      <p className="mt-1 text-base text-fg-secondary">
        <span lang={DISPLAY.tag}>{item.word}</span>
        <span aria-hidden="true"> · </span>
        <span lang="de">{item.bridge}</span>
        {item.subject && (
          <>
            <span aria-hidden="true"> · </span>
            <span>{person(t, item.label)}</span>
          </>
        )}
      </p>
    </>
  );
}
