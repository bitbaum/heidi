import type { VarietyPack } from "../../variety/pack.ts";
import type { SavedWord } from "../saved/types.ts";
import { due } from "../saved/review.ts";
import { allItems } from "./generate.ts";
import { SESSION_SIZE, type PracticeItem } from "./types.ts";

/**
 * What one sitting asks, and in what order.
 *
 * THE LEARNER'S OWN WORDS COME FIRST, AND ONLY WHEN THEY ARE DUE.
 *
 * A word is due on the schedule in `review.ts`, and practice must not override
 * it: asking a word early because the session needed filling would spend the
 * spacing effect the whole schedule exists to produce, and asking it late is
 * what the schedule is for. So due words are taken in order, and the pack's
 * items fill whatever is left.
 *
 * That ordering is also the honest one for a new learner. Someone who has kept
 * nothing yet gets a session entirely of pack items — real, checkable, and
 * available on day one — rather than an empty screen telling them to come back
 * when they have saved something.
 *
 * NO SHUFFLE, AND NO RANDOMNESS ANYWHERE.
 *
 * A random session cannot be tested, cannot be resumed, and gives a learner no
 * way to tell "I have seen this" from "this came up again". The variation
 * comes from `seen` — what has already been asked — which is a fact about the
 * learner rather than a dice roll, so the same person gets a different session
 * tomorrow and a test gets the same one twice.
 */
export function buildSession({
  pack,
  saved,
  now,
  seen = [],
  size = SESSION_SIZE,
}: {
  pack: VarietyPack;
  saved: readonly SavedWord[];
  /** Passed in, never read from the clock here — so tests are not tests of today. */
  now: Date;
  /** Item ids already asked, most recent last. */
  seen?: readonly string[];
  size?: number;
}): PracticeItem[] {
  const dueIds = new Set(due([...saved], now).map((word) => `recall:${word.target.trim().toLocaleLowerCase()}`));
  const everything = allItems(pack, saved);

  const isDueRecall = (item: PracticeItem) => item.kind === "recall" && dueIds.has(item.id);

  // A word that is NOT due is not asked at all. It is not filler: showing it
  // early is the one thing the schedule is there to prevent.
  const candidates = everything.filter((item) => item.kind !== "recall" || isDueRecall(item));

  const seenAt = new Map(seen.map((id, i) => [id, i]));
  const freshness = (item: PracticeItem) => (seenAt.has(item.id) ? seenAt.get(item.id)! : -1);

  const rank = (a: PracticeItem, b: PracticeItem) => {
    // Whatever has been asked least recently. Never-seen items (-1) come before
    // anything seen, oldest-seen before newest.
    const freshGap = freshness(a) - freshness(b);
    if (freshGap !== 0) return freshGap;
    // A stable tiebreak so the same inputs give the same session.
    return a.id.localeCompare(b.id);
  };

  /**
   * PICK A MIX, THEN ORDER IT — not the other way round.
   *
   * Sorting everything and taking the first eight was the obvious version and
   * it produced eight cloze items in a row: the tiebreak is alphabetical, and
   * "cloze" sorts before "pair". Interleaving afterwards could not fix it,
   * because by then the eight were all one kind. Selection has to be the thing
   * that balances.
   */
  const dueRecalls = candidates.filter(isDueRecall).sort(rank);
  const buckets = new Map<string, PracticeItem[]>();
  for (const item of candidates.filter((i) => !isDueRecall(i))) {
    const bucket = buckets.get(item.kind) ?? [];
    bucket.push(item);
    buckets.set(item.kind, bucket);
  }
  for (const bucket of buckets.values()) bucket.sort(rank);

  // Due words lead: they are the only items with a deadline.
  const picked: PracticeItem[] = dueRecalls.slice(0, size);

  // Then round-robin across the remaining kinds, in a fixed order so the
  // session stays reproducible.
  const kinds = [...buckets.keys()].sort();
  let exhausted = false;
  while (picked.length < size && !exhausted) {
    exhausted = true;
    for (const kind of kinds) {
      if (picked.length >= size) break;
      const next = buckets.get(kind)?.shift();
      if (next) {
        picked.push(next);
        exhausted = false;
      }
    }
  }

  return interleave(picked);
}

/**
 * Keep two items of the same kind from sitting next to each other where that
 * can be avoided.
 *
 * Not decoration. Eight multiple-choice questions in a row is the shape that
 * makes a person stop reading the options and start pattern-matching the
 * layout — and the variety is the part of "enjoyable" this module can actually
 * deliver without inventing a score.
 *
 * Best-effort by construction: when the session is all one kind there is
 * nothing to interleave, and it returns the order it was given rather than
 * pretending otherwise.
 */
function interleave(items: PracticeItem[]): PracticeItem[] {
  const out: PracticeItem[] = [];
  const rest = [...items];

  while (rest.length > 0) {
    const previous = out[out.length - 1];
    const next = rest.findIndex((item) => item.kind !== previous?.kind);
    out.push(...rest.splice(next === -1 ? 0 : next, 1));
  }

  return out;
}

/**
 * What to say at the end, without inventing a score.
 *
 * Counts of what happened, which are true, and nothing derived from them. No
 * percentage, because eight items cannot support one; no streak, because §8
 * forbids measuring consumption; no "level", because the product's own metric
 * is how much of an unfamiliar speaker you understand and this is not that.
 */
export function summarise(outcomes: readonly { id: string; outcome: string }[]): {
  asked: number;
  right: number;
  /** Items the learner asked to see again — a choice, not a failure. */
  again: number;
} {
  return {
    asked: outcomes.length,
    right: outcomes.filter((o) => o.outcome === "right").length,
    again: outcomes.filter((o) => o.outcome === "wrong").length,
  };
}
