import type { PracticeItem } from "./types.ts";

/**
 * What this learner keeps getting wrong — the part that makes practice smart
 * instead of merely random.
 *
 * THE PROBLEM. A session drew eight questions from a pool by recency alone, so
 * a topic somebody has missed four times out of four is exactly as likely to
 * come up as one they have never got wrong. That is not a scheduling detail;
 * it is the difference between a drill and teaching. `isch gsi` becomes a
 * reflex by being asked more often than the things that are already reflexes,
 * and nothing in the product knew which those were.
 *
 * WHAT IT IS NOT, and the distinction is the whole of §8. This is a record of
 * WHAT NEEDS WORK, not a score. It is never rendered as a number out of ten, a
 * percentage, a level or a streak — the surfaces that read it show which
 * topics to look at again and offer a session on them. A measure that points
 * at the material is diagnostic; the same measure pointed at the person is the
 * thing this product refuses to build.
 *
 * WHERE IT LIVES: the learner's browser, with their kept words and for the
 * same reason. HEIDI.md is explicit that saved vocabulary is device-local
 * because it keeps Heidi from holding a record of what a particular person
 * cannot understand. This IS that record, in its purest form, so it gets the
 * same treatment — and unlike the kept words it is also declared on the
 * privacy page and deletable from settings, because a thing this personal must
 * be visible to the person it is about.
 *
 * Pure: every function here takes a model and returns a new one.
 */

/** How often an area was asked, and how often it was missed. */
export type Trace = { asked: number; missed: number };

/**
 * Traces by area, where an "area" is whatever an item can be attributed to.
 *
 * FOUR AXES BECAUSE ITEMS CARRY FOUR KINDS OF PROVENANCE, not because four
 * felt thorough. `ItemSource` already says where every question came from —
 * that field was built so a wrong answer could be traced back — and this reads
 * exactly the same field. A fifth axis would need a fifth kind of source.
 */
export type LearnerModel = {
  topics: Record<string, Trace>;
  scenes: Record<string, Trace>;
  groups: Record<string, Trace>;
  words: Record<string, Trace>;
};

export const EMPTY_MODEL: LearnerModel = { topics: {}, scenes: {}, groups: {}, words: {} };

/** Which areas an item belongs to. One item can touch two — a scene and a topic. */
export function areasOf(item: PracticeItem): { axis: keyof LearnerModel; id: string }[] {
  const source = item.source;
  switch (source.kind) {
    case "grammar":
      return [{ axis: "topics", id: source.topic }];
    case "situation":
      return source.topic
        ? [
            { axis: "scenes", id: source.scene },
            { axis: "topics", id: source.topic },
          ]
        : [{ axis: "scenes", id: source.scene }];
    case "word":
      return [
        { axis: "words", id: source.word },
        { axis: "groups", id: source.group },
      ];
    case "rule":
      return [{ axis: "words", id: source.rule }];
    case "saved":
      // A kept word already has a schedule of its own in `review.ts`, and two
      // mechanisms moving the same word would fight. Deliberately untracked.
      return [];
  }
}

/**
 * Record one answer.
 *
 * A SKIP IS NOT A MISS and is not recorded at all. The learner said "not now",
 * which is an answer about their attention rather than about their knowledge,
 * and counting it as a failure would make the model recommend whatever
 * somebody happened to skip on a tram.
 */
export function observe(model: LearnerModel, item: PracticeItem, outcome: "right" | "wrong" | "skipped"): LearnerModel {
  if (outcome === "skipped") return model;

  const next: LearnerModel = {
    topics: { ...model.topics },
    scenes: { ...model.scenes },
    groups: { ...model.groups },
    words: { ...model.words },
  };

  for (const { axis, id } of areasOf(item)) {
    const before = next[axis][id] ?? { asked: 0, missed: 0 };
    next[axis][id] = { asked: before.asked + 1, missed: before.missed + (outcome === "wrong" ? 1 : 0) };
  }

  return next;
}

/**
 * How much confidence a rate needs before it is allowed to shout.
 *
 * OURS, not a finding — three answers is the point where a miss rate starts
 * being about the material rather than about the afternoon. Stated as a
 * constant so it is one decision rather than a number buried in an expression.
 */
export const CONFIDENCE = 3;

/**
 * How badly an area needs work, as a number a sort can use.
 *
 * SHRUNK TOWARD ZERO BY SAMPLE SIZE, and getting this right took a failing
 * test. The obvious smoothing — a notional extra right answer, `missed /
 * (asked + 1)` — does not work: one miss out of one is still 0.5 and nine out
 * of twenty is 0.43, so the first question somebody ever got wrong would
 * outrank a topic they have been failing for a fortnight and would own their
 * next four sessions.
 *
 * What is wanted is not a corrected rate but a rate we are entitled to act on.
 * So the observed rate is multiplied by `asked / (asked + CONFIDENCE)`, which
 * is near zero for one answer and approaches the true rate as evidence
 * accumulates:
 *
 *   1 of 1 missed    1.00 × 1/4  = 0.25
 *   2 of 2 missed    1.00 × 2/5  = 0.40
 *   9 of 20 missed   0.45 × 20/23 = 0.39
 *
 * Two misses out of two still edges ahead of a chronic 45%, which is right:
 * missing both attempts is real signal, just not as much as it looks.
 *
 * An area never asked returns 0 rather than 1. Unknown is not the same as
 * weak, and treating it as weak would make the model chase novelty — which the
 * recency ordering already handles, and handles better.
 */
export function pressure(trace: Trace | undefined): number {
  if (!trace || trace.asked === 0) return 0;
  return (trace.missed / trace.asked) * (trace.asked / (trace.asked + CONFIDENCE));
}

/** The most pressing area an item belongs to. Items touch at most two. */
export function pressureOf(model: LearnerModel, item: PracticeItem): number {
  let worst = 0;
  for (const { axis, id } of areasOf(item)) {
    worst = Math.max(worst, pressure(model[axis][id]));
  }
  return worst;
}

/**
 * The areas worth going back to, worst first.
 *
 * `minimum` exists so a surface can refuse to name anything on one wrong
 * answer. Telling somebody after a single miss that `wo-relative` is their
 * weakness is a claim the evidence does not support, and it is the kind of
 * false precision §8 forbids everywhere else.
 */
export function weakest(
  model: LearnerModel,
  axis: keyof LearnerModel,
  { limit = 3, minimum = 2 }: { limit?: number; minimum?: number } = {},
): { id: string; trace: Trace }[] {
  return Object.entries(model[axis])
    .filter(([, trace]) => trace.missed > 0 && trace.asked >= minimum)
    .sort((a, b) => pressure(b[1]) - pressure(a[1]) || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id, trace]) => ({ id, trace }));
}

/** Parse whatever is in storage, tolerating anything. */
export function decodeModel(raw: unknown): LearnerModel {
  if (!raw || typeof raw !== "object") return EMPTY_MODEL;
  const source = raw as Partial<Record<keyof LearnerModel, unknown>>;
  const axis = (value: unknown): Record<string, Trace> => {
    if (!value || typeof value !== "object") return {};
    const out: Record<string, Trace> = {};
    for (const [id, trace] of Object.entries(value as Record<string, unknown>)) {
      if (!trace || typeof trace !== "object") continue;
      const { asked, missed } = trace as { asked?: unknown; missed?: unknown };
      if (typeof asked !== "number" || typeof missed !== "number") continue;
      if (!Number.isFinite(asked) || !Number.isFinite(missed) || asked < 0 || missed < 0) continue;
      out[id] = { asked: Math.trunc(asked), missed: Math.trunc(missed) };
    }
    return out;
  };

  return {
    topics: axis(source.topics),
    scenes: axis(source.scenes),
    groups: axis(source.groups),
    words: axis(source.words),
  };
}
