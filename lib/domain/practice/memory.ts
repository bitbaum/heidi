import { REVIEW_STEPS } from "../saved/review.ts";
import type { PracticeItem } from "./types.ts";

/**
 * When each question comes back — so what was learned is asked again just
 * before it would be forgotten, instead of never or at random.
 *
 * THE GAP IT CLOSES. The learner model (`model.ts`) knows which AREAS are weak,
 * and `history.ts` knows what was asked lately; neither knows TIME. A question
 * answered right today and one answered right in June were the same fact, so
 * nothing brought back the June one, and «gemeistert» meant "got it right a
 * few times once". Kept words had a schedule (`saved/review.ts`); the 1,800
 * questions from the packs did not.
 *
 * THE SAME SCHEDULE AS KEPT WORDS, not a second one. `REVIEW_STEPS` — 1, 3, 7,
 * 16, 35 days — for the reasons `review.ts` gives: expanding intervals are
 * what the spacing evidence supports, and fitting a forgetting curve per
 * learner to a few dozen answers is the false precision §8 forbids. A miss
 * goes back to the start; a right answer moves one step, never more. At the
 * last step a question keeps returning every five weeks: it does not vanish.
 *
 * A QUESTION HAS THREE STATES, and the order a sitting takes them in is the
 * point of the module (`urgency`):
 *
 *   due      its day has come — asked first, most overdue first;
 *   new      never answered — fills what is left;
 *   resting  answered, and not due yet — asked only when nothing else is
 *            left, soonest first. Asking it early spends the spacing that
 *            makes the next answer worth more.
 *
 * ONLY THE FIRST ANSWER IN A SITTING COUNTS, as for the model and for kept
 * words: a question requeued after a miss is answered a minute after seeing
 * the answer, which is not the retrieval the schedule is built on. The caller
 * enforces that; this module records what it is handed.
 *
 * Kept words (`recall:` items) are not recorded here: they carry their own
 * schedule on the word, and two schedules for one word would disagree.
 *
 * WHERE IT LIVES: the browser, like the model, and synced to the account only
 * when the learner turns sync on. Pure: every function returns a new value.
 */

/** One question's place in the schedule. Times are epoch milliseconds. */
export type Card = {
  /** Index into `REVIEW_STEPS`. */
  step: number;
  /** When it is due again. */
  due: number;
  /** When it was last answered — the newer answer wins across devices. */
  seen: number;
  /** How often it was answered wrong after having been answered at all. */
  lapses: number;
};

/** Cards by item id. */
export type Memory = Readonly<Record<string, Card>>;

export const NO_MEMORY: Memory = {};

const DAY_MS = 86_400_000;

/**
 * The most cards a stored memory may hold. Every question in the packs is
 * about 1,800; this leaves room to grow and bounds what a hostile or broken
 * record can make a page parse.
 */
export const MEMORY_LIMIT = 10_000;

/** Whether an item is scheduled here at all. */
export function schedules(item: Pick<PracticeItem, "kind">): boolean {
  return item.kind !== "recall";
}

/**
 * Record one answer.
 *
 * A skip is not an answer about knowledge (the same rule as `observe`), and
 * leaves the card as it was.
 */
export function scheduleAnswer(
  memory: Memory,
  item: Pick<PracticeItem, "id" | "kind">,
  outcome: "right" | "wrong" | "skipped",
  now: Date,
): Memory {
  if (outcome === "skipped" || !schedules(item)) return memory;
  const before = memory[item.id];
  const right = outcome === "right";
  const step = right ? (before ? Math.min(before.step + 1, REVIEW_STEPS.length - 1) : 0) : 0;
  const at = now.getTime();
  const card: Card = {
    step,
    due: at + REVIEW_STEPS[step] * DAY_MS,
    seen: at,
    lapses: (before?.lapses ?? 0) + (!right && before ? 1 : 0),
  };
  return { ...memory, [item.id]: card };
}

/** 0 due, 1 new, 2 resting — lower is asked sooner. */
export type Urgency = 0 | 1 | 2;

export function urgency(memory: Memory, id: string, now: Date): Urgency {
  const card = memory[id];
  if (!card) return 1;
  return card.due <= now.getTime() ? 0 : 2;
}

/**
 * The order two items of the SAME urgency take: due and resting by due time
 * (most overdue, or soonest, first); new ones tie and fall through to the
 * caller's own order.
 */
export function dueOrder(memory: Memory, a: string, b: string): number {
  return (memory[a]?.due ?? 0) - (memory[b]?.due ?? 0);
}

/** How many of these items are due now. Without `ids`, every card. */
export function dueCount(memory: Memory, now: Date, ids?: Iterable<string>): number {
  const at = now.getTime();
  if (!ids) return Object.values(memory).filter((card) => card.due <= at).length;
  let n = 0;
  for (const id of ids) if ((memory[id]?.due ?? Infinity) <= at) n++;
  return n;
}

/** How many come back within `days` from now, not counting those due already. */
export function comingBack(memory: Memory, now: Date, days = 1): number {
  const at = now.getTime();
  const horizon = at + days * DAY_MS;
  return Object.values(memory).filter((card) => card.due > at && card.due <= horizon).length;
}

/**
 * Several devices' memories as one: per question, the card answered most
 * recently. Each device only records what it observed, so the newest answer
 * is the truth about where that question stands.
 */
export function combineMemories(memories: readonly Memory[]): Memory {
  if (memories.length === 1) return memories[0]!;
  const out: Record<string, Card> = {};
  for (const memory of memories) {
    for (const [id, card] of Object.entries(memory)) {
      const current = out[id];
      if (!current || card.seen > current.seen) out[id] = card;
    }
  }
  return out;
}

/**
 * Read a stored memory back, keeping only well-formed cards.
 *
 * Null for something that is not a memory at all, so the sync endpoint can
 * refuse it; a record with some bad cards keeps the good ones.
 */
export function decodeMemory(raw: string): Memory | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const out: Record<string, Card> = {};
  let kept = 0;
  for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (kept >= MEMORY_LIMIT) break;
    if (!id.trim() || id.length > 200 || !value || typeof value !== "object") continue;
    const { step, due, seen, lapses } = value as Record<string, unknown>;
    if (![step, due, seen, lapses].every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0)) continue;
    out[id] = {
      step: Math.min(Math.trunc(step as number), REVIEW_STEPS.length - 1),
      due: Math.trunc(due as number),
      seen: Math.trunc(seen as number),
      lapses: Math.trunc(lapses as number),
    };
    kept++;
  }
  return out;
}
