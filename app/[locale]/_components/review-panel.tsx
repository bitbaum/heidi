"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { DISPLAY } from "@/lib/variety/display";
import { useGrade, useReview } from "./use-review";
import { sentenceFor } from "@/lib/domain/saved/context";

/**
 * The review surface: one word, asked rather than shown.
 *
 * RECOGNITION FIRST, and in this direction on purpose. The prompt is the
 * dialect form and the reveal is the form they already have — which is the
 * direction the product teaches (understand first, produce later, HEIDI.md §1)
 * and the direction they will actually meet the word in, on a screen, from
 * somebody who is not going to repeat themselves.
 *
 * THE REVEAL IS A SEPARATE STEP, and that is the whole feature. Printing the
 * word beside its meaning is restudying, and restudying is the control
 * condition that being asked beats by g ≈ 0.50 (Yang et al. 2021). A panel
 * that showed both at once would look almost identical and do much less.
 *
 * Self-graded, with no right-answer checking. Typing the answer would mean
 * marking it, marking it means deciding whether a near-miss counts, and
 * getting that wrong in a language whose spelling is genuinely unsettled
 * (HEIDI.md's own orthography note) would tell a learner they were wrong when
 * they were not. "Did you know it?" is a question they can answer honestly and
 * we cannot get wrong.
 */
export function ReviewPanel({ t }: { t: Dictionary["review"] }) {
  const review = useReview();
  const grade = useGrade();
  const [revealed, setRevealed] = useState(false);

  // Storage cannot be read on the server, so the first pass renders nothing
  // rather than flashing "no words" at somebody who has plenty.
  if (!review.ready) return null;

  const current = review.queue[0];

  /**
   * NOTHING DUE SHOWS ONLY THE FACTS, and no buttons.
   *
   * This used to hold an empty state with its own three doors — practise,
   * cards, paste a message — answering a complaint that "nothing due today"
   * was a dead end («what am I supposed to do with this info»). Those doors
   * now open the page, in `today-panel.tsx`, where they apply whether or not
   * any word is due, so repeating them here was the same offer twice. With no
   * words at all the list below explains how to keep one.
   */
  if (!current) {
    return <Counts t={t} tomorrow={review.tomorrow} settled={review.settled} />;
  }

  function answer(knew: boolean) {
    grade(current!, knew);
    // The next word is the next render's `queue[0]`: grading rewrites the word
    // in storage, the store announces, and the queue recomputes without this
    // component holding an index that could drift from it.
    setRevealed(false);
  }

  return (
    <div>
      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
        {review.queue.length} {t.due}
      </p>

      <div className="mt-3 rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
        <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.prompt}</p>

        {/* The variety's own tag, so a screen reader does not read Zurich
            German with German phonology. */}
        <p
          lang={DISPLAY.tag}
          className="mt-2 font-heading text-2xl font-semibold leading-snug tracking-display text-dialect sm:text-3xl"
        >
          {current.target}
        </p>

        {/* A SENTENCE THE WORD LIVES IN, and a different one each time where we
            have the choice.

            The word is shown alone above; seen only ever in the sentence it was
            first found in, it gets learned attached to that sentence rather
            than learned. Rotating on the review count means a word met four
            times has been met in more than one place, which is the thing
            varied input actually does. Falls back to the original sentence,
            which is what this showed before examples existed, and to nothing
            at all for a single-word lookup that never had one. */}
        {sentenceFor(current) && (
          <p lang={DISPLAY.tag} className="mt-2 text-sm italic leading-relaxed text-fg-muted">
            «{sentenceFor(current)}»
          </p>
        )}

        {revealed ? (
          <div className="mt-5 border-t border-border-subtle pt-4">
            <p className="text-lg leading-snug text-fg-primary">{current.bridge}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => answer(true)}
                className="min-h-11 rounded-control bg-action px-4 font-medium text-on-action hover:opacity-90"
              >
                {t.knew}
              </button>
              <button
                type="button"
                onClick={() => answer(false)}
                className="min-h-11 rounded-control border border-border-strong px-4 font-medium text-fg-primary hover:bg-surface-page"
              >
                {t.missed}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-5 min-h-11 rounded-control border border-border-strong px-4 font-medium text-fg-primary hover:bg-surface-page"
          >
            {t.show}
          </button>
        )}
      </div>

      <div className="mt-3">
        <Counts t={t} tomorrow={review.tomorrow} settled={review.settled} />
      </div>
    </div>
  );
}

/**
 * Facts about their own words, never a score.
 *
 * "4 due tomorrow" is a reason to come back that is true and checkable. A
 * streak is a reason to come back that measures how much Heidi you have
 * consumed while pretending to measure what you have learned — §8 names it.
 */
function Counts({ t, tomorrow, settled }: { t: Dictionary["review"]; tomorrow: number; settled: number }) {
  if (tomorrow === 0 && settled === 0) return null;
  return (
    <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
      {tomorrow > 0 && (
        <span>
          {tomorrow} {t.tomorrow}
        </span>
      )}
      {tomorrow > 0 && settled > 0 && <span aria-hidden="true"> · </span>}
      {settled > 0 && (
        <span>
          {settled} {t.settled}
        </span>
      )}
    </p>
  );
}
