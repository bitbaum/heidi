"use client";

import { useEffect, useState } from "react";
import { DISPLAY } from "@/lib/variety/display";
import type { PracticeItem } from "@/lib/domain/practice/types";
import type { ExerciseViewProps } from "./view";
import { PROMPT_TEXT, Verdict, ignoreKey, optionClass, person } from "./chrome";

type ChoiceItem = Extract<PracticeItem, { kind: "pair" | "article" | "form" }>;

/**
 * The three kinds with options: which is Zurich, which article, which form.
 *
 * ONE VIEW FOR THREE KINDS, and it is the right grouping for the same reason
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
export function ChoiceView({ item, t, locale, onAnswer }: ExerciseViewProps) {
  const choice = item as ChoiceItem;
  const [chose, setChose] = useState<number | null>(null);

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
          setChose(digit - 1);
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
  }, [choice, chose, onAnswer]);

  return (
    <>
      <ChoicePrompt item={choice} t={t} />

      <ul className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {choice.options.map((option, index) => (
          <li key={option}>
            <button
              type="button"
              disabled={chose !== null}
              onClick={() => setChose(index)}
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

      {chose !== null && (
        <Verdict
          right={chose === choice.answer}
          t={t}
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

  if (item.kind === "article") {
    return (
      <>
        <p lang={DISPLAY.tag} className={PROMPT_TEXT}>
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

  return (
    <>
      <p className={PROMPT_TEXT}>
        <span className="text-fg-primary">{person(t, item.label)} </span>
        <span aria-hidden="true" className="text-fg-muted">
          ___
        </span>
      </p>
      <p className="mt-1 text-base text-fg-secondary">
        <span lang={DISPLAY.tag}>{item.word}</span>
        <span aria-hidden="true"> · </span>
        <span lang="de">{item.bridge}</span>
      </p>
    </>
  );
}
