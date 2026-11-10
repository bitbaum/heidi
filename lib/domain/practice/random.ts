/**
 * Seeded randomness for a sitting.
 *
 * A sitting used to be fully deterministic — "no shuffle, and no randomness
 * anywhere" — so the same learner on the same day met the same questions in
 * the same order, the options always in the same places, and learned the
 * positions as much as the words. The owner's call, 2026-11-09: practice
 * should not be predictable.
 *
 * The three reasons the old rule gave still hold, and a SEED keeps all of
 * them: a test passes a seed and gets the same sitting twice; a sitting in
 * progress is resumed from its stored ids, not rebuilt; and "have I seen
 * this" is still answered by the learner's history, not by chance. What is
 * random is only what was arbitrary before — the alphabetical tie-break.
 */
export type Random = () => number;

/** mulberry32: small, fast, and good enough to order eight questions. */
export function seeded(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A new array in a random order (Fisher–Yates). */
export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The positions 0..n-1 in a random order: how a choice's options are laid out this time. */
export function permutation(n: number, random: Random): number[] {
  return shuffled(Array.from({ length: n }, (_, i) => i), random);
}
