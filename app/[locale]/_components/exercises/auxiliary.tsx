"use client";

import { useState } from "react";
import { DISPLAY } from "@/lib/variety/display";
import type { PracticeItem } from "@/lib/domain/practice/types";
import type { ExerciseViewProps } from "./view";
import { Verdict } from "./chrome";
import { Actions, PRIMARY } from "./actions";

/**
 * Four verbs, each given its auxiliary: «er [isch | hät] gange».
 *
 * The choice sits IN the sentence, between subject and participle, because
 * that is where the learner will need it. The German shown under each row is
 * the infinitive only — «ist gegangen» would hand over the answer for every
 * verb where the two languages agree.
 *
 * Nothing is marked until every row has a choice, as in the passage: the rows
 * are meant to be compared, and the comparison is the rule.
 */
export function AuxiliaryView({ item, t, grammarT, situationsT, vocabularyT, learnT, locale, onAnswer }: ExerciseViewProps) {
  const aux = item as Extract<PracticeItem, { kind: "auxiliary" }>;

  const [chosen, setChosen] = useState<(number | null)[]>(() => aux.verbs.map(() => null));
  const [checked, setChecked] = useState(false);

  const complete = chosen.every((c) => c !== null);
  const right = complete && chosen.every((c, i) => c === aux.answer[i]);

  function choose(row: number, option: number) {
    if (checked) return;
    setChosen((previous) => previous.map((c, i) => (i === row ? option : c)));
  }

  return (
    <div className="mt-5">
      <p className="text-sm leading-relaxed text-fg-secondary">{t.auxiliaryHint}</p>

      <ol className="mt-4 flex flex-col gap-4">
        {aux.verbs.map((verb, row) => (
          <li key={verb.word} className="min-w-0">
            <div lang={DISPLAY.tag} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-dialect">
              {aux.subject && <span>{aux.subject}</span>}
              <span role="group" aria-label={verb.word} className="inline-flex gap-1">
                {aux.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    disabled={checked}
                    aria-pressed={chosen[row] === index}
                    onClick={() => choose(row, index)}
                    className={optionClass(chosen[row] === index, checked, index === aux.answer[row])}
                  >
                    {option}
                  </button>
                ))}
              </span>
              <span className="font-medium">{verb.participle}</span>
            </div>
            <p className="mt-0.5 text-sm leading-snug text-fg-muted">
              <span lang={DISPLAY.tag}>{verb.word}</span>
              <span aria-hidden="true"> · </span>
              <span lang="de">{verb.bridge}</span>
            </p>
          </li>
        ))}
      </ol>

      {!checked && (
        <Actions>
          <button type="button" disabled={!complete} onClick={() => setChecked(true)} className={PRIMARY}>
            {t.check}
          </button>
        </Actions>
      )}

      {checked && <Verdict right={right} t={t} grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT} learnT={learnT} item={item} locale={locale} onNext={() => onAnswer(right ? "right" : "wrong")} />}
    </div>
  );
}

/**
 * An option's states. Once checked, the right auxiliary is filled whether or
 * not it was chosen, and a wrong choice is struck through — so every row reads
 * as its correct sentence.
 */
function optionClass(selected: boolean, checked: boolean, correct: boolean): string {
  const base = "min-h-11 min-w-14 rounded-control border px-3 text-base transition-colors disabled:cursor-default";
  if (checked) {
    if (correct) return `${base} border-action bg-action text-on-action`;
    if (selected) return `${base} border-border-strong text-fg-muted line-through`;
    return `${base} border-border-subtle text-fg-muted`;
  }
  if (selected) return `${base} border-action bg-action text-on-action`;
  return `${base} border-border-strong text-fg-primary hover:bg-surface-page`;
}
