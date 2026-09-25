"use client";

import { useState } from "react";
import { DISPLAY } from "@/lib/variety/display";
import type { PracticeItem } from "@/lib/domain/practice/types";
import type { ExerciseViewProps } from "./view";
import { Verdict } from "./chrome";

/**
 * Four words, four meanings, joined up — the one exercise here that is
 * actually a pleasure to do.
 *
 * WHY IT IS BUILT THIS WAY. §8 refuses streaks, points and levels and that
 * refusal is not being softened. What makes this satisfying is structural
 * rather than awarded: the board visibly EMPTIES as pairs are solved, each
 * correct answer makes the rest easier, and it is over in fifteen seconds.
 * Nobody is told they are on a roll.
 *
 * TWO TAPS, NOT DRAG AND DROP. Dragging is the obvious implementation and it
 * is wrong here: unusable from a keyboard without a great deal of ARIA that
 * would then have to be maintained, fiddly on the phone this is mostly read
 * on, and bad for anyone with a motor impairment. Tap a word, tap its meaning,
 * and both are ordinary buttons.
 *
 * A WRONG PAIR IS NOT PUNISHED, IT IS SHOWN. The pair clears and the grid
 * stays open — the session requeues missed items rather than ejecting anybody,
 * and a grid that ended on the first mistake would teach nothing. What the
 * mistake costs is the outcome: one wrong pair and the item comes back later.
 *
 * THE LAST PAIR IS FREE AND IS NOT COUNTED. With four pairs, solving three
 * leaves one, and marking somebody right for a walkover would make the outcome
 * a little bit false.
 */
export function MatchView({ item, t, grammarT, situationsT, vocabularyT, locale, onAnswer }: ExerciseViewProps) {
  const match = item as Extract<PracticeItem, { kind: "match" }>;

  /** Index into `targets` that is waiting for a meaning. */
  const [picked, setPicked] = useState<number | null>(null);
  /** Indices into `targets` that are solved. */
  const [solved, setSolved] = useState<number[]>([]);
  /** The bridge index most recently got wrong, for the flash. */
  const [wrong, setWrong] = useState<number | null>(null);
  const [missed, setMissed] = useState(false);

  const done = solved.length === match.targets.length;

  function choose(bridgeIndex: number) {
    if (picked === null || done) return;

    if (match.answer[picked] === bridgeIndex) {
      setSolved((previous) => [...previous, picked]);
      setPicked(null);
      setWrong(null);
      return;
    }

    // Recorded once. A second wrong pair does not make the item more missed
    // than it already is, and a counter here would be a score by another name.
    setMissed(true);
    setWrong(bridgeIndex);
    setPicked(null);
  }

  const solvedBridges = new Set(solved.map((targetIndex) => match.answer[targetIndex]));

  return (
    <div className="mt-5">
      <p className="text-sm leading-relaxed text-fg-secondary">{t.matchHint}</p>

      {/*
        TWO COLUMNS AT EVERY WIDTH, and this was a real defect on a phone.

        The base was one column, which is the house rule for grids whose
        content is somebody else's words — but a MATCHING grid collapsed to one
        column puts four dialect words above four German ones, so the pair you
        are trying to join can be a screen apart and the whole point of the
        layout is gone. These cells hold single words, which is the case the
        rule does not need to protect: `minmax(0,1fr)` twice keeps the tracks
        from taking their width from the longest word, and `wrap-anywhere`
        handles the one that is still too long.
      */}
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 sm:gap-3">
        <ul className="flex flex-col gap-2">
          {match.targets.map((target, index) => {
            const isSolved = solved.includes(index);
            return (
              <li key={target} className="min-w-0">
                <button
                  type="button"
                  disabled={isSolved || done}
                  aria-pressed={picked === index}
                  onClick={() => setPicked(index)}
                  className={tileClass(isSolved, picked === index, false)}
                >
                  <span lang={DISPLAY.tag} className="wrap-anywhere">
                    {target}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <ul className="flex flex-col gap-2">
          {match.bridges.map((bridge, index) => {
            const isSolved = solvedBridges.has(index);
            return (
              <li key={bridge} className="min-w-0">
                <button
                  type="button"
                  disabled={isSolved || done || picked === null}
                  onClick={() => choose(index)}
                  className={tileClass(isSolved, false, wrong === index)}
                >
                  <span lang="de" className="wrap-anywhere">
                    {bridge}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {done && (
        <Verdict right={!missed} t={t} grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT} item={item} locale={locale} onNext={() => onAnswer(missed ? "wrong" : "right")} />
      )}
    </div>
  );
}

/**
 * A tile's states: waiting, picked, solved — plus the flash for a pair that
 * did not go together.
 *
 * Solved tiles stay on screen rather than disappearing. A board that removes
 * what you got right leaves the hardest pairs alone on an empty page, which
 * looks like a punishment; keeping them dimmed shows the work.
 */
function tileClass(solved: boolean, picked: boolean, wrong: boolean): string {
  const base =
    "min-h-11 w-full rounded-control border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default sm:px-4 sm:text-base";

  if (solved) return `${base} border-border-subtle bg-surface-page text-fg-muted line-through`;
  if (wrong) return `${base} border-fg-muted text-fg-muted`;
  if (picked) return `${base} border-action bg-action text-on-action`;
  return `${base} border-border-strong text-fg-primary hover:bg-surface-page`;
}
