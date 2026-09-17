/**
 * A take: one recording, what it measured, and what the learner said they said.
 *
 * KEPT ON THE DEVICE, and this file is where that decision is written down.
 *
 * Saved vocabulary already established the pattern and the reason: it needs no
 * account, works signed out, and keeps Heidi from holding a record of what a
 * particular person cannot understand. A take is the same argument with more
 * force behind it. §10 names voice notes among the most private things a
 * person owns, and a table of how somebody sounds when they are bad at a
 * language is worse than a table of the words they looked up. The audio never
 * leaves the browser at all; the numbers derived from it stay there too.
 *
 * Three things follow, and all three are good:
 *
 *  1. It works signed out — which matters most for exactly this feature, since
 *     practising out loud is a thing done alone on a phone, not a thing done
 *     after making an account.
 *  2. "Fewer pauses than last time" needs only YOUR last take, which is on
 *     your own device. The comparison never needed a server.
 *  3. There is no breach to have. The most sensitive artefact this product
 *     touches is one we do not hold.
 *
 * The cost is real and stated: clear your browser data and your history is
 * gone, and it does not follow you to a second device. That is the same deal
 * saved words already make, and it is the right way round.
 */

import type { Delivery } from "./delivery.ts";

/**
 * One line, generously. A take is a thing you SAY in one breath-group or two,
 * and past this the learner is transcribing an essay rather than a sentence —
 * which is a different, worse exercise.
 */
export const MAX_SAID_LENGTH = 600;

/** How many takes are kept. Enough for a trend, not enough to be an archive. */
export const MAX_TAKES = 50;

export type Take = {
  id: string;
  /** ISO. */
  at: string;
  /** What the recording measured. No audio, ever. */
  delivery: Delivery;
  /** The learner's own write-up of what they said. Empty until they write it. */
  said: string;
  /** The round or topic it was practice for, when it was. */
  roundId?: string | null;
  topicId?: string | null;
  /** The title, copied so a take still reads after the round is gone. */
  about?: string;
};

export const TAKES_KEY = "heidi.takes.v1";

/**
 * Validate what came out of storage rather than trusting it.
 *
 * localStorage is writable by anything that ever ran on this origin, and a
 * half-written value from an older build must degrade to "no history" instead
 * of crashing the page somebody opened to practise. Unknown fields are
 * dropped, not preserved: the shape here is the shape.
 */
export function decodeTakes(raw: string): Take[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const takes: Take[] = [];
  for (const entry of parsed) {
    const take = decodeTake(entry);
    if (take) takes.push(take);
  }
  return takes.slice(0, MAX_TAKES);
}

function decodeTake(value: unknown): Take | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.at !== "string") return null;

  const delivery = decodeDelivery(row.delivery);
  if (!delivery) return null;

  return {
    id: row.id,
    at: row.at,
    delivery,
    said: typeof row.said === "string" ? row.said.slice(0, MAX_SAID_LENGTH) : "",
    roundId: typeof row.roundId === "string" ? row.roundId : null,
    topicId: typeof row.topicId === "string" ? row.topicId : null,
    ...(typeof row.about === "string" ? { about: row.about } : {}),
  };
}

const NUMERIC_FIELDS = [
  "totalMs",
  "speechMs",
  "pauseMs",
  "pauseCount",
  "longestPauseMs",
  "runCount",
  "meanRunMs",
  "phonationRatio",
  "clippedRatio",
] as const;

function decodeDelivery(value: unknown): Delivery | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;

  const out: Record<string, unknown> = {};
  for (const field of NUMERIC_FIELDS) {
    const n = row[field];
    if (typeof n !== "number" || !Number.isFinite(n)) return null;
    out[field] = n;
  }
  out.problems = Array.isArray(row.problems)
    ? row.problems.filter((p): p is string => typeof p === "string")
    : [];
  return out as Delivery;
}

/**
 * The take before this one, for the comparison.
 *
 * "Before" by time rather than by position, because the list is kept newest
 * first and a bug that compared a take with itself would look exactly like a
 * learner who never improves.
 */
export function previousTake(takes: Take[], id: string): Take | undefined {
  const index = takes.findIndex((t) => t.id === id);
  if (index < 0) return undefined;
  return takes
    .slice(index + 1)
    .find((t) => t.delivery.problems.length === 0 || !t.delivery.problems.includes("too-short"));
}

/** Newest first, capped. The cap is enforced on write so storage cannot creep. */
export function withTake(takes: Take[], take: Take): Take[] {
  return [take, ...takes.filter((t) => t.id !== take.id)].slice(0, MAX_TAKES);
}

export function withoutTake(takes: Take[], id: string): Take[] {
  return takes.filter((t) => t.id !== id);
}
