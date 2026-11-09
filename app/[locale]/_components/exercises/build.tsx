"use client";

import { useEffect, useState } from "react";
import { DISPLAY } from "@/lib/variety/display";
import { sameWords } from "@/lib/domain/practice/kinds/build";
import { permutation, seeded } from "@/lib/domain/practice/random";
import type { BuildItem, VerifyItem } from "@/lib/domain/practice/types";
import { fill } from "@/lib/i18n/fill";
import { Actions, PRIMARY, SECONDARY } from "./actions";
import { PROMPT_TEXT, Verdict, ignoreKey } from "./chrome";
import type { ExerciseViewProps } from "./view";

const TILE =
  "min-h-11 rounded-control border-2 px-3 py-1.5 font-heading text-base font-semibold tracking-display transition-[transform,background-color,border-color] active:scale-95";

/**
 * Build the sentence: the meaning in German above, the Zurich words below in
 * a shuffled heap with one that does not belong. Tap a word to put it next;
 * tap a placed word to send it back. "Prüfen" marks the order.
 */
export function BuildView({ item, t, grammarT, situationsT, vocabularyT, learnT, locale, reveal, onAnswer }: ExerciseViewProps) {
  const build = item as BuildItem;
  const [tiles] = useState(() => {
    const all = [...build.words, ...build.extra];
    return permutation(all.length, seeded(Math.floor(Math.random() * 2 ** 32))).map((i) => all[i]);
  });
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const answer = placed.map((i) => tiles[i]);
  const right = sameWords(answer, build.words);
  const full = placed.length >= build.words.length;

  function check() {
    if (placed.length === 0) return;
    if (reveal === "later") {
      onAnswer(right ? "right" : "wrong", answer.join(" "));
      return;
    }
    setChecked(true);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (ignoreKey(event) || checked) return;
      if (event.key === "Enter" && full) {
        event.preventDefault();
        check();
      }
      if (event.key === "Backspace" && placed.length > 0) {
        event.preventDefault();
        setPlaced((p) => p.slice(0, -1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <p lang="de" className={`${PROMPT_TEXT} wrap-anywhere text-fg-primary`}>
        {build.prompt}
      </p>

      {/* The line being built. Its own colour once checked: the whole line is the answer. */}
      <div
        aria-live="polite"
        className={`mt-5 flex min-h-14 flex-wrap items-center gap-2 rounded-control border-2 border-dashed p-2 ${
          checked ? (right ? "oc-pop border-correct bg-correct-tint" : "oc-shake border-incorrect bg-incorrect-tint") : "border-border-strong"
        }`}
      >
        {checked ? (
          /* Once checked it is a sentence again, read as one line — the tiles
             kept their button padding with the border hidden, so «Ich bi zwei
             Jahr sit» floated apart and «da.» fell to a line of its own. A
             word out of place is marked where it stands. */
          <p lang={DISPLAY.tag} className="mb-0 px-1 font-heading text-xl font-semibold leading-snug tracking-display text-fg-primary">
            {answer.map((word, at) => (
              <span key={at}>
                {at > 0 && " "}
                <span className={sameWords([word], [build.words[at] ?? ""]) ? "" : "text-incorrect underline decoration-2 underline-offset-4"}>
                  {word}
                </span>
              </span>
            ))}
          </p>
        ) : placed.map((tileIndex, at) => (
          <button
            key={`${tileIndex}-${at}`}
            type="button"
            lang={DISPLAY.tag}
            disabled={checked}
            onClick={() => setPlaced((p) => p.filter((_, i) => i !== at))}
            className={`${TILE} border-action bg-action text-on-action`}
          >
            {tiles[tileIndex]}
          </button>
        ))}
      </div>

      {checked && !right && (
        <div className="mt-4">
          <p className="mb-1 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.buildSaid}</p>
          <p lang={DISPLAY.tag} className="font-heading text-xl font-semibold leading-snug tracking-display text-dialect">
            {build.answer}
          </p>
        </div>
      )}

      {!checked && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {tiles.map((word, index) => {
            const used = placed.includes(index);
            return (
              <li key={`${word}-${index}`}>
                <button
                  type="button"
                  lang={DISPLAY.tag}
                  disabled={used}
                  aria-hidden={used}
                  onClick={() => setPlaced((p) => [...p, index])}
                  className={`${TILE} ${used ? "border-dashed border-border-subtle bg-transparent text-transparent" : "border-border-strong bg-surface-page text-fg-primary hover:bg-surface-raised"}`}
                >
                  {word}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {checked ? (
        <Verdict
          right={right}
          t={t}
          grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT} learnT={learnT}
          item={item}
          locale={locale}
          mine={right ? undefined : answer.join(" ")}
          onNext={() => onAnswer(right ? "right" : "wrong", answer.join(" "))}
        />
      ) : (
        <Actions>
          <button type="button" onClick={() => setPlaced([])} disabled={placed.length === 0} className={SECONDARY}>
            {t.buildClear}
          </button>
          <button type="button" onClick={check} disabled={placed.length === 0} className={PRIMARY}>
            {t.buildCheck}
          </button>
        </Actions>
      )}
    </>
  );
}

/**
 * "Stimmt das?" — a line that is heard, a meaning beside it, two buttons.
 * One glance, one tap, the verdict at once. Keys: 1 for right, 2 for not.
 */
export function VerifyView({ item, t, grammarT, situationsT, vocabularyT, learnT, locale, reveal, onAnswer }: ExerciseViewProps) {
  const verify = item as VerifyItem;
  const [said, setSaid] = useState<boolean | null>(null);
  const right = said !== null && said === verify.correct;

  function answer(yes: boolean) {
    if (said !== null) return;
    if (reveal === "later") {
      onAnswer(yes === verify.correct ? "right" : "wrong", yes ? t.verifyYes : t.verifyNo);
      return;
    }
    setSaid(yes);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (ignoreKey(event) || said !== null) return;
      if (event.key === "1" || event.key === "ArrowLeft") answer(true);
      if (event.key === "2" || event.key === "ArrowRight") answer(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const tone = (yes: boolean) => {
    if (said === null) return "border-border-strong text-fg-primary hover:bg-surface-page";
    if (yes === verify.correct) return yes === said ? "oc-pop border-correct bg-correct text-on-correct" : "border-correct bg-surface-page text-fg-primary";
    if (yes === said) return "oc-shake border-incorrect bg-incorrect-tint text-incorrect";
    return "border-border-subtle text-fg-muted opacity-60";
  };

  return (
    <>
      <p lang={DISPLAY.tag} className={`${PROMPT_TEXT} wrap-anywhere text-dialect`}>
        «{verify.said}»
      </p>
      <p lang="de" className="mt-3 flex items-baseline gap-2 text-lg leading-snug text-fg-primary">
        <span aria-hidden="true" className="font-heading text-2xl text-fg-muted">
          =
        </span>
        <span className="wrap-anywhere">{verify.meaning}</span>
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[true, false].map((yes) => (
          <button
            key={String(yes)}
            type="button"
            disabled={said !== null}
            onClick={() => answer(yes)}
            className={`flex min-h-14 items-center justify-center gap-1.5 whitespace-nowrap rounded-control border-2 px-2 font-heading text-base font-semibold tracking-display transition-colors active:scale-[0.98] ${tone(yes)}`}
          >
            <span aria-hidden="true">{yes ? "✓" : "✕"}</span>
            {yes ? t.verifyYes : t.verifyNo}
          </button>
        ))}
      </div>

      {said !== null && !verify.correct && (
        <p lang="de" className="mt-4 text-base leading-relaxed text-fg-secondary">
          {fill(t.verifyMeans, { meaning: verify.truth })}
        </p>
      )}

      {said !== null && (
        <Verdict
          right={right}
          t={t}
          grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT} learnT={learnT}
          item={item}
          locale={locale}
          onNext={() => onAnswer(right ? "right" : "wrong", said ? t.verifyYes : t.verifyNo)}
        />
      )}
    </>
  );
}
