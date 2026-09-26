import type { VarietyPack } from "../../variety/pack.ts";
import type { SavedWord } from "../saved/types.ts";
import { due } from "../saved/review.ts";
import { allItems } from "./generate.ts";
import { EMPTY_MODEL, pressureOf, type LearnerModel } from "./model.ts";
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
  return orderSession({ items: allItems(pack, saved), saved, now, seen, size });
}

/**
 * The same session, from items that have already been generated.
 *
 * WHY A SECOND ENTRY POINT EXISTS, since one is otherwise a smell.
 *
 * The two halves of a session come from two places that cannot meet on one
 * side of the wire. The pack's items are the same for everybody and belong on
 * the server, where the pack already lives — shipping `VarietyPack` to the
 * browser to regenerate them would send every rule's prose and every grammar
 * topic's explanation in order to build eight questions out of them. The
 * learner's own words are in their browser's storage and have never been sent
 * anywhere, which is the point of §7 and not a thing to relax for an exercise
 * page.
 *
 * So the page generates the pack half on the server, the client generates the
 * recall half from storage, and this orders the two together. The ordering —
 * due first, then a balanced mix, then interleaved — is the part that must not
 * fork, and now cannot.
 */
export function orderSession({
  items,
  saved,
  now,
  seen = [],
  size = SESSION_SIZE,
  model = EMPTY_MODEL,
}: {
  items: readonly PracticeItem[];
  saved: readonly SavedWord[];
  now: Date;
  seen?: readonly string[];
  size?: number;
  /**
   * What this learner keeps getting wrong. Empty by default, which reproduces
   * the old behaviour exactly — a new learner has no model and gets the same
   * recency ordering as before.
   */
  model?: LearnerModel;
}): PracticeItem[] {
  const dueIds = new Set(due([...saved], now).map((word) => `recall:${word.target.trim().toLocaleLowerCase()}`));
  const everything = items;

  const isDueRecall = (item: PracticeItem) => item.kind === "recall" && dueIds.has(item.id);

  // A word that is NOT due is not asked at all. It is not filler: showing it
  // early is the one thing the schedule is there to prevent.
  const candidates = everything.filter((item) => item.kind !== "recall" || isDueRecall(item));

  const seenAt = new Map(seen.map((id, i) => [id, i]));
  const freshness = (item: PracticeItem) => (seenAt.has(item.id) ? seenAt.get(item.id)! : -1);

  /**
   * Pressure first, then recency — and the order of those two is the whole of
   * "the system should be smarter".
   *
   * Recency alone made a topic somebody has missed four times out of four
   * exactly as likely to come up as one they have never got wrong. Sorting by
   * what the learner keeps missing puts `isch gsi` in front of them until it
   * stops being missed, which is how a form becomes a reflex rather than a
   * thing they once read.
   *
   * IT IS BANDED, NOT RAW, and that matters. A continuous sort on pressure
   * would let one bad area own every sitting: the same eight questions, in the
   * same order, until answered correctly — which is both unpleasant and the
   * opposite of the interleaving the session is built on. Rounding to a few
   * bands means "clearly struggling" beats "fine", while everything inside a
   * band is still ordered by what has been asked least recently. Variety is
   * preserved; the weight is on the weak half.
   *
   * A learner with no model has every pressure at 0, so this collapses to the
   * old recency ordering exactly — which is what makes it safe to turn on for
   * everybody from the first answer.
   */
  const band = (item: PracticeItem) => Math.round(pressureOf(model, item) * 4);

  const rank = (a: PracticeItem, b: PracticeItem) => {
    const pressureGap = band(b) - band(a);
    if (pressureGap !== 0) return pressureGap;
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

  // Then round-robin across the remaining kinds, in an order that is fixed for
  // the same inputs and still MOVES between sittings.
  //
  // It was alphabetical, and with more kinds than seats that was a bug: the
  // first eight names took the eight seats every time, so `translate` — ninth
  // of nine — never appeared in a mixed sitting at all. Now a kind that the
  // model says is weak still goes first (the head item's pressure band), and
  // among the rest the kind asked LEAST RECENTLY sits first. Item freshness
  // cannot do this on its own: every kind has an unseen item at its head for
  // weeks, so they would all tie and fall back to the alphabet again.
  const kindOf = new Map(candidates.map((item) => [item.id, item.kind]));
  const lastAsked = new Map<string, number>();
  for (const [at, id] of seen.entries()) {
    const kind = kindOf.get(id);
    if (kind) lastAsked.set(kind, at);
  }
  const kinds = [...buckets.keys()].sort((a, b) => {
    const pressureGap = band(buckets.get(b)![0]!) - band(buckets.get(a)![0]!);
    if (pressureGap !== 0) return pressureGap;
    const recencyGap = (lastAsked.get(a) ?? -1) - (lastAsked.get(b) ?? -1);
    if (recencyGap !== 0) return recencyGap;
    return a.localeCompare(b);
  });
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
 * How far ahead a missed item comes back, within the same sitting.
 *
 * Three, which is a compromise between two things the evidence pulls apart.
 * Rawson & Dunlosky (2011) find the durable gain comes from retrieving a thing
 * CORRECTLY more than once, spaced — not from being shown the answer and
 * moving on — and the cheapest place to get the first correct retrieval is
 * before the learner closes the page. But immediately re-asking the item you
 * just revealed tests short-term memory and nothing else, so there has to be
 * something in between. Three items is roughly a minute here: far enough that
 * the answer is not still on screen, near enough that the session does not end
 * first.
 *
 * It is a judgement, not a finding, and it is written down as one. The
 * literature gives the direction and does not give the number.
 */
export const RELEARN_GAP = 3;

/**
 * Put a missed item back into the queue, once.
 *
 * WHAT THIS FIXES. A session used to reveal the answer and move on, which
 * makes the whole sitting a test with feedback and never a second chance to
 * produce the thing. Butler & Roediger (2008) is the sharper version of the
 * problem for the multiple-choice items in particular: choosing a wrong option
 * can leave the learner with the wrong option, and feedback is what turns a
 * test that can teach errors into one that corrects them. Feedback plus a
 * second attempt is strictly more than feedback.
 *
 * ONCE PER ITEM, and `asked` is what makes that true rather than nearly true.
 *
 * The first version guarded on "is it already in the queue", which reads
 * correctly and is wrong: by the time a requeued item is answered again it has
 * left the queue to become the current question, so missing it a second time
 * put it back a second time. Found by driving a whole session wrong on
 * purpose — eight questions became thirteen and would have kept going. An
 * unbounded sitting punishes exactly the learner who is finding it hard, which
 * is the opposite of the intention.
 *
 * So the rule is stated on what actually decides it: an item the learner has
 * already answered once in this sitting is on its second attempt, and a second
 * attempt is the last. The worst case is a session of twice the size, which is
 * bounded and survivable.
 *
 * Pure: it takes the queue and returns the queue. The page holds the position;
 * this decides the order.
 */
export function requeue({
  remaining,
  item,
  asked = [],
  gap = RELEARN_GAP,
}: {
  /** The items still to be asked, in order, NOT including the current one. */
  remaining: readonly PracticeItem[];
  /** The one just answered wrong. */
  item: PracticeItem;
  /** Ids already answered in this sitting, BEFORE the answer being recorded. */
  asked?: readonly string[];
  gap?: number;
}): PracticeItem[] {
  // Second attempt — it has had its extra go.
  if (asked.includes(item.id)) return [...remaining];
  // Belt to those braces: a duplicate already waiting is the same defect seen
  // from the queue's side.
  if (remaining.some((queued) => queued.id === item.id)) return [...remaining];

  const at = Math.min(gap, remaining.length);
  return [...remaining.slice(0, at), item, ...remaining.slice(at)];
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
