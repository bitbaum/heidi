"use client";

import { useState } from "react";
import { DISPLAY } from "@/lib/variety/display";
import type { PracticeItem } from "@/lib/domain/practice/types";
import type { ExerciseViewProps } from "./view";
import { Verdict } from "./chrome";

/**
 * A passage with its words taken out, and the words offered back.
 *
 * THE FIRST EXERCISE HERE THAT ASKS FOR MORE THAN ONE SENTENCE. A handover is
 * four lines that refer to each other, and the word filling a gap is often
 * decidable only from the line before it — which is the actual skill this
 * product exists for and which no single-sentence item can rehearse.
 *
 * TAP A WORD, IT GOES IN THE NEXT EMPTY GAP. The alternative — select a gap,
 * then select a word — is one more decision per placement for no gain, since
 * the gaps fill in reading order anyway. Tapping a filled gap takes its word
 * back, so a mistake costs one tap and not a restart.
 *
 * NOTHING IS MARKED UNTIL EVERY GAP IS FULL. Checking each placement as it
 * lands would turn the passage into three separate questions and destroy the
 * point: the third gap is supposed to be informed by the first two.
 */
export function GapTextView({ item, t, locale, onAnswer }: ExerciseViewProps) {
  const gap = item as Extract<PracticeItem, { kind: "gaptext" }>;

  /** `filled[g]` is the index in `bank` placed at gap `g`, or null. */
  const [filled, setFilled] = useState<(number | null)[]>(() => gap.answer.map(() => null));
  const [checked, setChecked] = useState(false);

  const placed = new Set(filled.filter((v): v is number => v !== null));
  const complete = filled.every((v) => v !== null);
  const right = complete && filled.every((v, g) => v === gap.answer[g]);

  function place(bankIndex: number) {
    if (checked || placed.has(bankIndex)) return;
    const next = filled.indexOf(null);
    if (next === -1) return;
    setFilled((previous) => previous.map((v, i) => (i === next ? bankIndex : v)));
  }

  function clear(g: number) {
    if (checked) return;
    setFilled((previous) => previous.map((v, i) => (i === g ? null : v)));
  }

  return (
    <div className="mt-5">
      <p className="text-sm leading-relaxed text-fg-secondary">{t.gapHint}</p>

      <ol className="mt-4 flex flex-col gap-4">
        {gap.lines.map((line, index) => {
          const at = line.gap;
          const chosen = at === undefined ? null : filled[at];
          const parts = line.prompt.split("____");

          return (
            <li key={`${index}-${line.prompt}`} className="min-w-0">
              <p lang={DISPLAY.tag} className="wrap-anywhere text-base leading-loose text-dialect">
                {at === undefined ? (
                  line.prompt
                ) : (
                  <>
                    {parts[0]}
                    <button
                      type="button"
                      disabled={checked || chosen === null}
                      onClick={() => clear(at)}
                      className={gapClass(chosen !== null, checked, checked && chosen === gap.answer[at])}
                    >
                      {chosen === null ? "    " : gap.bank[chosen]}
                    </button>
                    {parts[1] ?? ""}
                  </>
                )}
              </p>
              <p lang="de" className="wrap-anywhere text-sm leading-snug text-fg-muted">
                {line.bridge}
              </p>
            </li>
          );
        })}
      </ol>

      {!checked && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {gap.bank.map((word, index) => (
            <li key={word}>
              <button
                type="button"
                disabled={placed.has(index)}
                onClick={() => place(index)}
                className={
                  placed.has(index)
                    ? "min-h-11 rounded-control border border-border-subtle px-4 text-base text-fg-muted line-through"
                    : "min-h-11 rounded-control border border-border-strong px-4 text-base text-fg-primary hover:bg-surface-page"
                }
              >
                <span lang={DISPLAY.tag}>{word}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {complete && !checked && (
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="mt-5 min-h-11 rounded-control bg-accent px-5 font-semibold text-on-accent hover:opacity-90"
        >
          {t.check}
        </button>
      )}

      {checked && <Verdict right={right} t={t} item={item} locale={locale} onNext={() => onAnswer(right ? "right" : "wrong")} />}
    </div>
  );
}

/**
 * A gap's states: empty, filled, and — once checked — right or wrong.
 *
 * `leading-loose` on the line above is what keeps these from colliding with
 * the line beneath: an inline button inside a paragraph is taller than the
 * text it sits in, and at normal leading the rows of a four-line passage
 * overlap on a phone.
 */
function gapClass(filled: boolean, checked: boolean, correct: boolean): string {
  const base = "mx-1 inline-flex min-h-8 min-w-16 items-baseline justify-center rounded-control border px-2 align-baseline";
  if (checked) {
    return correct
      ? `${base} border-accent bg-accent text-on-accent`
      : `${base} border-border-strong text-fg-muted line-through`;
  }
  if (filled) return `${base} border-accent bg-accent-tint text-fg-primary`;
  return `${base} border-dashed border-border-strong`;
}
