"use client";

import { useEffect, useState } from "react";
import { DISPLAY } from "@/lib/variety/display";
import type { CardItem } from "@/lib/domain/practice/types";
import type { ExerciseViewProps } from "./view";
import { Trace, ignoreKey } from "./chrome";
import { Explanation } from "./explanation";

/**
 * A card, turned over.
 *
 * WHY IT LOOKS LIKE A CARD AND NOT LIKE THE OTHER QUESTIONS. Because it is a
 * different promise. Every other kind on this page asks you to decide
 * something and then tells you how you did; a card asks you to remember
 * something and then shows you, and the pace is four times faster. Making it
 * share the layout of a multiple-choice question would tell the learner to
 * slow down and read, which is exactly wrong — the value of a card is the
 * number of them you get through.
 *
 * SO: one surface, one tap anywhere on it to turn it, two buttons underneath.
 * The whole card is the target rather than a small button on it, because this
 * is the one exercise here designed to be done one-handed at speed, and a
 * 44px target somewhere on a card is a miss waiting to happen.
 *
 * NO FLIP ANIMATION. A card that spends 300ms rotating costs ten seconds over
 * a run of thirty, and the transform is the kind of thing that renders as a
 * grey rectangle on a browser that does not do it. The face changes; the card
 * stays still.
 */
export function CardView({ item, t, grammarT, situationsT, vocabularyT, learnT, locale, onAnswer, onRecall }: ExerciseViewProps) {
  const card = item as CardItem;
  const [turned, setTurned] = useState(false);

  /**
   * SPACE OR ENTER TURNS IT, then 1 and 2 mark it.
   *
   * The same two digits every self-marked kind here uses, so the hand learns
   * one rhythm rather than one per kind. A card run is the place that rhythm
   * pays off most: thirty cards is sixty keystrokes and no mouse at all.
   */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (ignoreKey(event)) return;
      const digit = Number.parseInt(event.key, 10);

      if (!turned) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setTurned(true);
        }
        return;
      }
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

  /**
   * A card is a word, and a word carries a review schedule.
   *
   * `onRecall` is what feeds the schedule; every other kind reports through
   * `onAnswer` alone. Practising a word without telling its schedule would
   * spend the spacing effect the schedule exists to produce.
   */
  function mark(knew: boolean) {
    onRecall(card.source.kind === "word" ? card.source.word : card.prompt, knew);
    onAnswer(knew ? "right" : "wrong");
  }

  const frontIsDialect = card.direction === "recognise";

  return (
    <>
      {/* Which way round this one is, so a run of thirty never leaves the
          learner guessing whether they are being asked for the word or the
          meaning. Small, above the card, out of the way. */}
      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
        {frontIsDialect ? t.cardRecognise : t.cardProduce}
      </p>

      <button
        type="button"
        onClick={() => setTurned(true)}
        disabled={turned}
        aria-label={turned ? undefined : t.cardTurn}
        className="mt-3 flex min-h-[9rem] w-full max-w-measure flex-col items-center justify-center gap-3 rounded-card border border-border-strong bg-surface-raised px-5 py-8 text-center disabled:cursor-default sm:min-h-[11rem]"
      >
        {turned ? (
          <>
            <p
              lang={frontIsDialect ? "de" : DISPLAY.tag}
              className="wrap-anywhere font-heading text-2xl font-semibold leading-snug tracking-display text-dialect sm:text-3xl"
            >
              {card.article && !frontIsDialect && <span className="text-fg-secondary">{card.article} </span>}
              {card.answer}
            </p>
            {/* The front stays visible on the back. Turning a card over and
                losing the thing you were asked is how somebody ends up
                marking a card they can no longer see the question for. */}
            <p
              lang={frontIsDialect ? DISPLAY.tag : "de"}
              className="wrap-anywhere text-base leading-relaxed text-fg-muted"
            >
              {card.article && frontIsDialect && <span>{card.article} </span>}
              {card.prompt}
            </p>
          </>
        ) : (
          <p
            lang={frontIsDialect ? DISPLAY.tag : "de"}
            className="wrap-anywhere font-heading text-3xl font-semibold leading-snug tracking-display text-fg-primary sm:text-4xl"
          >
            {card.article && frontIsDialect && <span className="text-fg-secondary">{card.article} </span>}
            {card.prompt}
          </p>
        )}

        {!turned && <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.cardTurn}</span>}
      </button>

      {/* The sentence, on the back only. A word met only ever as a gloss is
          learned as a gloss; showing it on the front would answer the card. */}
      {turned && card.example && (
        <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-secondary">
          <span lang={DISPLAY.tag} className="wrap-anywhere text-dialect">
            {card.example.target}
          </span>
          <br />
          <span lang="de" className="wrap-anywhere text-fg-muted">
            {card.example.bridge}
          </span>
        </p>
      )}

      {turned && (
        <div className="mt-5 border-t border-border-subtle pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => mark(true)}
              className="min-h-11 rounded-control bg-action px-4 font-medium text-on-action hover:opacity-90"
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
          <Explanation item={item} locale={locale} t={t} grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT} learnT={learnT} />
        </div>
      )}
    </>
  );
}
