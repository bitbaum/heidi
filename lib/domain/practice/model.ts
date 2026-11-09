import type { PracticeItem } from "./types.ts";
import { KIND_META } from "./kinds/meta.ts";

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
  /**
   * ONE LINE OF ONE SCENE, keyed `sceneId:index` — the axis that lets a
   * situation be something a learner can finish.
   *
   * `scenes` above answers "how have you done in the handover", which is a
   * real question and the wrong one for "can you follow a handover". Twelve
   * right answers about one sentence and one right answer about each of
   * twelve sentences are the same number on that axis and are not the same
   * learner. Only the second has met the situation.
   *
   * So coverage is counted here, one line at a time, and `situation-strength.ts`
   * turns it into the claim. It is the fifth axis and the first that is not
   * about a NAMED thing in the packs — `areasOf`'s comment says a fifth axis
   * would need a fifth kind of provenance, and this one has it: `ItemSource`
   * now carries the line.
   */
  lines: Record<string, Trace>;
  /**
   * By what the question tests (`kinds/meta.ts`): verb forms, articles,
   * words, understanding, saying it, the sound rules. "You keep missing
   * articles" is a fact about this axis.
   */
  skills: Record<string, Trace>;
  /** By how far the Zurich German is from German: "1", "2", "3" (`distance.ts`). */
  levels: Record<string, Trace>;
};

/** The key a line's evidence is stored under. One spelling, used everywhere. */
export function lineKey(scene: string, line: number): string {
  return `${scene}:${line}`;
}

/** Every axis of the model, once: observing, decoding and summing devices all read this. */
export const MODEL_AXES = ["topics", "scenes", "groups", "words", "lines", "skills", "levels"] as const satisfies readonly (keyof LearnerModel)[];

/** A model built axis by axis from `MODEL_AXES`, so no copy of the list can drop one. */
export function modelFrom(axis: (name: keyof LearnerModel) => Record<string, Trace>): LearnerModel {
  return Object.fromEntries(MODEL_AXES.map((name) => [name, axis(name)])) as LearnerModel;
}

export const EMPTY_MODEL: LearnerModel = modelFrom(() => ({}));

/** Which areas an item belongs to. One item can touch two — a scene and a topic. */
export function areasOf(item: PracticeItem): { axis: keyof LearnerModel; id: string }[] {
  const own = originsOf(item);
  // A kept word is scheduled by `review.ts` alone, so it is not tracked at all.
  if (item.source.kind === "saved") return own;
  const level = item.source.level;
  return [
    ...own,
    { axis: "skills", id: KIND_META[item.kind].skill },
    ...(level ? [{ axis: "levels" as const, id: String(level) }] : []),
  ];
}

function originsOf(item: PracticeItem): { axis: keyof LearnerModel; id: string }[] {
  const source = item.source;
  switch (source.kind) {
    case "grammar":
      return [{ axis: "topics", id: source.topic }];
    case "situation": {
      const areas: { axis: keyof LearnerModel; id: string }[] = [{ axis: "scenes", id: source.scene }];
      // A `gaptext` passage spans several lines and carries no single one; it
      // still counts toward the scene. See `ItemSource`.
      if (source.line !== undefined) areas.push({ axis: "lines", id: lineKey(source.scene, source.line) });
      if (source.topic) areas.push({ axis: "topics", id: source.topic });
      return areas;
    }
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

  const next: LearnerModel = modelFrom((name) => ({ ...model[name] }));

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
    // Skills and levels are for REPORTING (and the level frontier), not for
    // pressure: missing one grammar topic five times must not push every verb
    // question forward, and struggling with hard words is no reason to be
    // shown more of them. Pressure stays on the specific thing that is missed.
    if (axis === "skills" || axis === "levels") continue;
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

/**
 * Parse whatever is in storage, tolerating anything.
 *
 * IT TOOK `unknown` AND WAS HANDED A STRING, so it returned `EMPTY_MODEL`
 * EVERY TIME and the learner model never once survived a reload.
 *
 * `Decode<T>` is `(raw: string) => T | null` — `createBrowserStore` passes
 * `localStorage.getItem(key)` straight in, unparsed, which is what
 * `decodeHistory` next door has always done correctly. This function declared
 * `unknown`, and a function accepting `unknown` structurally satisfies one
 * accepting `string`, so the mismatch type-checked perfectly. Then
 * `typeof "{...}" !== "object"` was true of every value ever stored.
 *
 * WHAT IT COST, which is the reason this comment is long. Everything built on
 * the model read an empty one on every page load: the focus panel, whose whole
 * job is "what you keep getting wrong", had nothing to be wrong about; the
 * mastered panel, which exists to say what you can do now that you could not
 * before, could never say anything. The dashboard was reported as useless —
 * "Heute nichts fällig. Kommen Sie morgen wieder" — and it was, structurally,
 * because the record it reads from was thrown away between every render.
 *
 * NOTHING FAILED. History used a different decoder and persisted correctly, so
 * sessions genuinely varied day to day and the one observable symptom of a
 * dead model looked like the feature working. The parameter type is now
 * `string`, which is what makes this un-writable a second time.
 */
export function decodeModel(raw: string): LearnerModel {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY_MODEL;
  }
  if (!parsed || typeof parsed !== "object") return EMPTY_MODEL;
  const source = parsed as Partial<Record<keyof LearnerModel, unknown>>;
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

  return modelFrom((name) => axis(source[name]));
}

/**
 * THE LADDER: recognise a line before producing it.
 *
 * A line the learner has not yet recognised reliably is asked in a form that
 * shows it — "Stimmt das?", the gist, the meaning of a word in it. Once it is
 * recognised (asked twice or more, missed at most a quarter of the time), the
 * same line comes back to be PRODUCED — built from its words, translated,
 * transformed. Retrieval in a harder form is what makes a thing stick; asking
 * the easy form forever is what makes practice feel like a loop.
 *
 * 0 means "this form suits this line now", 1 means "not yet / not any more",
 * and kinds on neither rung are 0 always. Used as a tie-break after the
 * schedule and after what the learner is struggling with, never before.
 */
export function recognised(model: LearnerModel, scene: string, line: number): boolean {
  const trace = model.lines[lineKey(scene, line)];
  return Boolean(trace && trace.asked >= 2 && trace.missed / trace.asked <= 0.25);
}

export function ladderOf(model: LearnerModel, item: PracticeItem): 0 | 1 {
  const source = item.source;
  if (source.kind !== "situation" || source.line === undefined) return 0;
  const known = recognised(model, source.scene, source.line);
  const rung = KIND_META[item.kind].rung;
  if (rung === "recognise") return known ? 1 : 0;
  if (rung === "produce") return known ? 0 : 1;
  return 0;
}

/**
 * THE LEVEL A LEARNER IS WORKING AT, from their own answers: level 1 (like
 * German) until it holds, then 2 (by a sound rule), then 3 (different, and
 * the false friends). "Holds": at least twelve answers there, at most one in
 * five missed. Twelve because fewer cannot tell a level from a lucky sitting.
 */
export const LEVEL_HOLDS = { asked: 12, missRate: 0.2 } as const;

export function frontierOf(model: LearnerModel): 1 | 2 | 3 {
  for (const level of [1, 2] as const) {
    const trace = model.levels[String(level)];
    const holds = trace && trace.asked >= LEVEL_HOLDS.asked && trace.missed / trace.asked <= LEVEL_HOLDS.missRate;
    if (!holds) return level;
  }
  return 3;
}

/**
 * How far above the learner's level a question is: 0 at or below it. A
 * tie-break after the schedule, the pressure and the ladder — so harder
 * questions wait their turn, but still fill a sitting when nothing easier of
 * that kind is left. A gradient, not a wall.
 */
export function stretchOf(item: PracticeItem, frontier: 1 | 2 | 3): number {
  const level = item.source.level;
  return level ? Math.max(0, level - frontier) : 0;
}
