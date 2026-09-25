"use client";

import { useCallback, useMemo } from "react";
import { useSaved } from "./use-saved";
import { comingUp, due, grade, settled } from "@/lib/domain/saved/review";
import { patternsIn } from "@/lib/domain/saved/patterns";
import { DISPLAY } from "@/lib/variety/display";
import type { SavedWord } from "@/lib/domain/saved/types";
import { recordPractice } from "./streak-store";

/**
 * The review queue and what it says about the learner, from the words they
 * already kept.
 *
 * Wiring only — `review.ts` decides when a word comes back and `patterns.ts`
 * decides what the list says about them, both pure and both tested. Nothing
 * new is stored about anybody to make this work: the schedule rides along on
 * the word, and the patterns are computed from the word list and the pack.
 *
 * `now` is taken ONCE per render rather than inside each helper, so a queue
 * cannot change shape halfway through building itself — a word can otherwise
 * be absent from `due` and counted in `comingUp` in the same paint if the
 * clock crosses a boundary between the two calls.
 */
export function useReview() {
  const saved = useSaved();
  const { words, ready } = saved;

  return useMemo(() => {
    const now = new Date();
    return {
      ready,
      words,
      /** Ask about these, most overdue first. */
      queue: due(words, now),
      /** "4 more tomorrow" — a fact about their own words, not a streak. */
      tomorrow: comingUp(words, now, 1),
      /** Words that came back five times and were still there. A count, never a level. */
      settled: settled(words),
      /** The regularities their own list is full of. */
      patterns: patternsIn(words, DISPLAY.correspondences),
    };
  }, [words, ready]);
}

/** Record an answer and write the word back where it was. */
export function useGrade() {
  const { grade: write } = useSaved();
  return useCallback(
    (word: SavedWord, knew: boolean) => {
      write(grade(word, knew, new Date()));
      recordPractice();
    },
    [write],
  );
}
