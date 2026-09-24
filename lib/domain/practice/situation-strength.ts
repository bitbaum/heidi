import type { LearnerModel, Trace } from "./model.ts";
import { lineKey } from "./model.ts";
import type { PracticeItem } from "./types.ts";

/**
 * How well a learner can follow ONE situation — and why that is the unit.
 *
 * "I understand Swiss German at the doctor's" is the sentence somebody
 * actually wants to be able to say. Not "I have a B1", not "I am on a
 * fourteen-day streak", not "I know 340 words": a bounded, honest claim about
 * a moment they will really be in. Someone can be solid in a hospital handover
 * and lost in a restaurant, and that is not a contradiction to be averaged
 * away — it is the truth about them, and it is the most useful thing the
 * product knows.
 *
 * WHY A DENOMINATOR IS ALLOWED HERE, when `mastered.ts` refuses percentages
 * everywhere else. Its argument is exact and worth quoting: "there is no
 * denominator that means anything — the pack is not the language." That is
 * true of Zurich German as a whole and FALSE of one situation. A situation is
 * a closed set somebody authored: eleven lines, and we know which eleven. "You
 * can follow nine of the eleven things said here" is checkable — we can print
 * the nine and the two — and a learner can disagree with it. That is the only
 * kind of claim this product publishes.
 *
 * THE DENOMINATOR IS WHAT WE CAN ASK, NOT WHAT THE PACK HOLDS. It is derived
 * from the generated items rather than from `phrases.length`, because not
 * every line becomes a question: `blankable` refuses lines with no worthwhile
 * gap, and a `gaptext` passage covers several lines at once without being
 * about any one of them. Counting lines nobody will ever be asked would put a
 * ceiling below 100% on every scene and quietly call it the learner's fault.
 *
 * NO DATES, ANYWHERE. `history.ts` states the rule — "no answers, no scores,
 * no timestamps. There is nothing here to reconstruct a study history from" —
 * and a per-situation practice calendar is exactly that. Durability is read
 * from DEPTH instead: `buildSession` orders by least-recently-asked and
 * `history` pushes what was just asked to the back, so a line reaching a third
 * asking has, in practice, come back in a later sitting. The spacing signal
 * without the surveillance.
 *
 * NOTHING HERE IS FRAMED AS LOSS. §3's distinction is what is COUNTED
 * (capability, not consumption) and how it is FRAMED (gain, not loss). This
 * counts capability. It reports what holds and what is left, never what was
 * lost, never a figure that was higher last week — the product does not store
 * last week, which is the cheapest possible way to keep that promise.
 */

/**
 * How many askings before one line is "you have this".
 *
 * TWO, where `mastered.ts` demands four — and the asymmetry is the point.
 * Four is right there because it is claiming a whole grammar topic on one
 * axis. A line is one sentence, and a situation's claim rests on MANY lines
 * agreeing, so each may carry thinner evidence without the total being thin.
 * Demanding four askings of every line would also drill eleven sentences
 * forty-four times to finish one scene, which is how a good idea becomes a
 * chore.
 */
export const LINE_HOLDS_AT = 2;

/**
 * And how many before it counts as having stuck.
 *
 * THREE, which in practice means a later sitting. The session builder asks
 * least-recently-seen items first, so the third asking of a line is one the
 * learner came back to rather than one they were drilled on. This is the same
 * fact `STEADY_STEP` records for kept words — "once is recognition; twice
 * across a gap is the spacing effect having actually happened" — read off the
 * mechanism that already exists instead of a clock we refuse to keep.
 */
export const LINE_STICKS_AT = 3;

/** How often a line may still be missed and be said to hold. A third. */
export const LINE_MISS_RATE = 1 / 3;

/** The share of a scene's lines that must hold before it reads as steady. */
export const STEADY_SHARE = 2 / 3;

/**
 * What a learner can say about one situation.
 *
 * Deliberately FOUR, and deliberately not a number between 0 and 100. A
 * percentage invites comparison with other people and with yesterday; a state
 * says what is true now and what would change it.
 */
export type Standing =
  /** Never asked about. Not a judgement — an invitation. */
  | "new"
  /** Some of it holds. Real progress, and not yet a claim worth making. */
  | "met"
  /** Two thirds of the lines hold: they can follow most of this. */
  | "steady"
  /** Every line holds and most have come back and held again. */
  | "sure";

export type SituationStrength = {
  scene: string;
  standing: Standing;
  /** Lines this site can actually ask about — the denominator. */
  askable: number;
  /** Lines that hold. */
  held: number;
  /** Lines that have come back and held again. */
  stuck: number;
  /**
   * The line indexes NOT yet holding, in the scene's own order.
   *
   * The page prints these as sentences. `mastered.ts` makes the argument: "a
   * bare number is a score; the same number beside the eleven words it is
   * about is a claim the reader can disagree with." Here it is also the answer
   * to "what do I do next", which a percentage never is.
   */
  remaining: number[];
};

function holds(trace: Trace | undefined, asked: number): boolean {
  if (!trace || trace.asked < asked) return false;
  return trace.missed / trace.asked <= LINE_MISS_RATE;
}

/**
 * Which lines of which scenes this build can ask about at all.
 *
 * Derived from the items themselves, so the denominator cannot drift from what
 * the learner is actually shown. Pass `PACK_ITEMS`.
 */
export function askableLines(items: readonly PracticeItem[]): Map<string, Set<number>> {
  const out = new Map<string, Set<number>>();
  for (const item of items) {
    if (item.source.kind !== "situation" || item.source.line === undefined) continue;
    const set = out.get(item.source.scene) ?? new Set<number>();
    set.add(item.source.line);
    out.set(item.source.scene, set);
  }
  return out;
}

/** How this learner stands in one situation. */
export function strengthOf(scene: string, model: LearnerModel, askable: ReadonlySet<number>): SituationStrength {
  const lines = [...askable].sort((a, b) => a - b);
  const remaining: number[] = [];
  let held = 0;
  let stuck = 0;

  for (const line of lines) {
    const trace = model.lines[lineKey(scene, line)];
    if (holds(trace, LINE_HOLDS_AT)) {
      held += 1;
      if (holds(trace, LINE_STICKS_AT)) stuck += 1;
    } else {
      remaining.push(line);
    }
  }

  return { scene, standing: standingOf(lines.length, held, stuck), askable: lines.length, held, stuck, remaining };
}

function standingOf(askable: number, held: number, stuck: number): Standing {
  // A scene with nothing to ask cannot be claimed either way. Saying "sure"
  // about an empty set would be the product congratulating somebody for
  // content that does not exist.
  if (askable === 0 || held === 0) return "new";
  if (held === askable && stuck >= Math.ceil(askable * STEADY_SHARE)) return "sure";
  if (held >= Math.ceil(askable * STEADY_SHARE)) return "steady";
  return "met";
}

/** Every situation this build teaches, strongest first — the whole picture. */
export function strengthAcross(
  scenes: readonly string[],
  model: LearnerModel,
  askable: ReadonlyMap<string, Set<number>>,
): SituationStrength[] {
  return scenes.map((scene) => strengthOf(scene, model, askable.get(scene) ?? new Set()));
}

/**
 * The situation to suggest next.
 *
 * THE WEAKEST ONE THAT HAS BEEN STARTED, and if none has, the first untouched
 * one. Not the strongest, which would be the product steering somebody toward
 * the number going up; and not the weakest overall, which is always whatever
 * they have never opened and is therefore no recommendation at all.
 *
 * Someone solid in the hospital and shaky in a restaurant should be pointed at
 * the restaurant. That is the whole idea, and it falls out of sorting.
 */
export function weakestStarted(all: readonly SituationStrength[]): SituationStrength | undefined {
  const started = all.filter((s) => s.standing !== "new" && s.standing !== "sure");
  if (started.length === 0) return all.find((s) => s.standing === "new" && s.askable > 0);
  return [...started].sort((a, b) => a.held / a.askable - b.held / b.askable || a.scene.localeCompare(b.scene))[0];
}
