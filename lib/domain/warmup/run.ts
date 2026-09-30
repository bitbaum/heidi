import type { PracticeItem } from "../practice/types.ts";
import { LADDER, OPENER, tierOf } from "./ladder.ts";

/**
 * The warm-up: eight lines, two minutes, and where to start.
 *
 * WHAT IT IS FOR. A newcomer's first session decides whether there is a
 * second, and the two ways to lose them are opposite: questions so easy they
 * learn nothing, or so hard they conclude the dialect is hopeless. So the
 * warm-up climbs while somebody keeps up and steps down when they miss, and
 * it never ends on a miss — if the eighth answer is wrong, one gentler line
 * follows. Every answer shows the word that gave the line away, so even a
 * run of misses teaches eight things.
 *
 * WHAT IT IS NOT. No level, no score, no percentage (HEIDI.md §8: a number
 * about the person is the thing this product refuses to build). What comes
 * back is a PORTRAIT in terms of the material — the scenes somebody already
 * follows and the one worth starting with — which is a diagnosis of where to
 * go, not a grade of who they are.
 *
 * Pure: answers in, next question or portrait out. The browser keeps the
 * record (`heidi.warmup.v1`) and nothing reaches the server.
 */

export const LENGTH = 8;

export type WarmupAnswer = { id: string; right: boolean };

/** What the warm-up leaves in the browser. */
export type WarmupRecord = {
  /** When it was finished, ISO 8601. */
  at: string;
  answers: WarmupAnswer[];
  /** What they said to the offer of reading the site in Swiss German, if made. */
  dialect?: "accepted" | "declined";
};

/** Which scene a question's line comes from. */
export type SceneOf = (id: string) => string | undefined;

export function sceneLookup(items: readonly PracticeItem[]): SceneOf {
  const scenes = new Map<string, string>();
  for (const item of items) {
    if (item.source.kind === "situation") scenes.set(item.id, item.source.scene);
  }
  return (id) => scenes.get(id);
}

/** Up a tier after a right answer, down one after a miss. */
export function nextTier(answers: readonly WarmupAnswer[]): number {
  const last = answers.at(-1);
  if (!last) return 0;
  const tier = tierOf(last.id);
  return last.right ? Math.min(tier + 1, LADDER.length - 1) : Math.max(tier - 1, 0);
}

export function finished(answers: readonly WarmupAnswer[]): boolean {
  if (answers.length < LENGTH) return false;
  return answers.at(-1)!.right || answers.length > LENGTH;
}

/** Tiers nearest to `want` first, the gentler one before the harder on a tie. */
function byDistance(want: number): number[] {
  return LADDER.map((_, tier) => tier).sort(
    (a, b) => Math.abs(a - want) - Math.abs(b - want) || a - b,
  );
}

/**
 * The next question's id, or null when the warm-up is over.
 *
 * Within a tier it is drawn at random, so a second run is not the first one
 * again — from a scene not yet asked about when there is one, and never from
 * the scene just asked about when another is open, so eight lines are as many
 * different moments in the city as the tier allows.
 */
export function nextQuestion(
  answers: readonly WarmupAnswer[],
  sceneOf: SceneOf,
  random: () => number = Math.random,
): string | null {
  if (finished(answers)) return null;
  if (answers.length === 0) return OPENER;

  const asked = new Set(answers.map((a) => a.id));
  const seenScenes = new Set(answers.map((a) => sceneOf(a.id)));
  const lastScene = sceneOf(answers.at(-1)!.id);
  for (const tier of byDistance(nextTier(answers))) {
    const open = LADDER[tier].filter((id) => !asked.has(id));
    if (open.length === 0) continue;
    const unseen = open.filter((id) => !seenScenes.has(sceneOf(id)));
    const notLast = open.filter((id) => sceneOf(id) !== lastScene);
    const pool = unseen.length > 0 ? unseen : notLast.length > 0 ? notLast : open;
    return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  }
  return null;
}

export type Portrait = {
  /** Scenes with a line understood and none missed, in the order they came up. */
  followed: string[];
  /** The scene of the gentlest miss: where starting pays off first. */
  startAt?: string;
  /** At least one between-the-lines question understood. */
  betweenTheLines: boolean;
  /**
   * Understands well enough to read the site in the dialect itself: two
   * between-the-lines questions right and at most one miss overall. Strict on
   * purpose — the offer is a compliment, and a compliment that turns out to
   * be wrong is a page somebody cannot read.
   */
  readsDialect: boolean;
};

export function portrait(answers: readonly WarmupAnswer[], sceneOf: SceneOf): Portrait {
  const missedScenes = new Set(answers.filter((a) => !a.right).map((a) => sceneOf(a.id)));
  const followed: string[] = [];
  for (const a of answers) {
    const scene = sceneOf(a.id);
    if (a.right && scene && !missedScenes.has(scene) && !followed.includes(scene)) followed.push(scene);
  }

  const misses = answers.filter((a) => !a.right);
  const gentlest = [...misses].sort((a, b) => tierOf(a.id) - tierOf(b.id))[0];
  const top = LADDER.length - 1;
  const rightAtTop = answers.filter((a) => a.right && tierOf(a.id) === top).length;

  return {
    followed,
    ...(gentlest && sceneOf(gentlest.id) ? { startAt: sceneOf(gentlest.id) } : {}),
    betweenTheLines: rightAtTop > 0,
    readsDialect: rightAtTop >= 2 && misses.length <= 1,
  };
}

/** Read the record back, refusing anything a browser should not have kept. */
export function decodeWarmup(raw: string): WarmupRecord | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const { at, answers, dialect } = value as Record<string, unknown>;
  if (typeof at !== "string" || Number.isNaN(Date.parse(at))) return null;
  if (!Array.isArray(answers) || answers.length > LENGTH + 1) return null;
  const clean: WarmupAnswer[] = [];
  for (const a of answers) {
    if (!a || typeof a !== "object") return null;
    const { id, right } = a as Record<string, unknown>;
    if (typeof id !== "string" || typeof right !== "boolean") return null;
    clean.push({ id, right });
  }
  return {
    at,
    answers: clean,
    ...(dialect === "accepted" || dialect === "declined" ? { dialect } : {}),
  };
}
