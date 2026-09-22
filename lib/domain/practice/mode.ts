import type { PracticeItem } from "./types.ts";
import { KINDS } from "./kinds/registry.ts";
import type { Answering } from "./kinds/kind.ts";

/**
 * The two things a learner is actually choosing when they open this page, and
 * they are not the same choice.
 *
 * WHAT WENT WRONG WITHOUT THIS. There was one drill. It mixed tapping, typing
 * and self-marked reveals into the same eight questions, so a person on a tram
 * holding a coffee got a text field every third item, and a person who had sat
 * down to write got two taps and a matching grid. The complaint was exact:
 * "typing every time is annoying — there should be typing exercises, but those
 * should be separate."
 *
 * They are separate now, along two axes that vary independently:
 *
 *   MODE — what you are asked to DO. Tap an option, write an answer, or turn
 *     a card over. This is about the hands, and it is the axis the tram
 *     decides.
 *
 *   FLOW — when you find out. Straight away, or at the end. This is about what
 *     the sitting is FOR, and it is a bigger difference than it looks: a drill
 *     that answers immediately is teaching, and a run of questions that holds
 *     its answers back is measuring. Mixing them gives you something that
 *     measures badly and teaches badly.
 *
 * Every combination is legal and none of them is a setting buried in a
 * preferences page — they are four buttons and two buttons, both in the URL,
 * so a link can carry "write, test" to somebody.
 */

/**
 * What the learner does with their hands.
 *
 * DERIVED FROM THE KINDS, never listed here. Each kind declares its own
 * `answering` in `kinds/`, and a mode is the set of kinds that answer that
 * way. A list in this file would be the second place a kind is classified, and
 * the one that silently stops matching the first — exactly the drift the kind
 * registry was built to end.
 */
export type Mode = "mixed" | Answering;

export const MODES: readonly Mode[] = ["mixed", "tap", "write", "card"];

export const DEFAULT_MODE: Mode = "mixed";

export function isMode(value: unknown): value is Mode {
  return typeof value === "string" && (MODES as readonly string[]).includes(value);
}

/**
 * When the learner finds out whether they were right.
 *
 * `practice` — after each item, with the explanation and the link to where it
 *   is taught. This is the teaching flow and it stays the default, because
 *   somebody who has not met the material yet is served by being told
 *   immediately and not by being scored.
 *
 * `test` — at the end, all of it at once, with an explanation per item. The
 *   run itself is silent: no verdict, no colour, no hint that the last answer
 *   landed. That silence is the whole point, because feedback after each item
 *   changes what the next item measures.
 */
export type Flow = "practice" | "test";

export const FLOWS: readonly Flow[] = ["practice", "test"];

export const DEFAULT_FLOW: Flow = "practice";

export function isFlow(value: unknown): value is Flow {
  return typeof value === "string" && (FLOWS as readonly string[]).includes(value);
}

/**
 * How many items a test run holds, and the timer it offers.
 *
 * TWENTY, against a practice sitting's eight. A sitting is short because you
 * should be able to finish one at a tram stop and open it again tomorrow; a
 * test is longer because eight items is not a measurement of anything — four
 * lucky taps out of eight is a plausible accident, and out of twenty it is not.
 *
 * THE TIMER IS OFF BY DEFAULT AND EXTENDABLE ON DEMAND. A clock makes a test
 * feel like a test, and it makes some people freeze; this product has no
 * business deciding which of those a given person is. So it starts absent, it
 * is switched on by pressing a number of minutes, and it can always be given
 * more. A run that reaches zero marks nothing and fails nobody — it stops
 * offering further questions and shows the answers to what was already done.
 */
export const TEST_SIZE = 20;

/** The lengths offered, in minutes, and what one press of "more time" adds. */
export const TEST_MINUTES = [3, 5, 10] as const;
export const TEST_EXTEND_MINUTES = 3;

/** Every kind's answering style, by id. Built from the registry, once. */
export const KIND_ANSWERING = new Map<PracticeItem["kind"], Answering>(KINDS.map((kind) => [kind.id, kind.answering]));

/**
 * The kinds a test may draw from: markable without anybody's opinion, AND
 * finished in one move.
 *
 * Both conditions, and they are different. `marking` is the principle — §6
 * forbids grading a typed dialect answer, and a self-marked card measures
 * nothing. `decisions` is the pace: a run of twenty is meant to move, and a
 * matching grid is half a minute of moving attention around a board. A test
 * made of six grids would be honest and would feel like homework.
 */
const TEST_KINDS = new Set(
  KINDS.filter((kind) => kind.marking === "objective" && kind.decisions === "one").map((kind) => kind.id),
);

/**
 * A test may only ask questions this product can mark.
 *
 * NOT A LIMITATION — THE POINT. §6: Zurich German has no settled orthography,
 * so a machine that grades a typed dialect answer eventually tells somebody
 * their spelling is wrong when it is not, in a language where they cannot
 * argue back. And a self-marked reveal is the learner grading themselves,
 * which is a fine way to study and a meaningless way to be measured.
 *
 * So a test is built from the objective kinds only, and the page says so
 * rather than quietly dropping half the material. That constraint is also the
 * only thing that would make a later certificate mean anything: every question
 * in it has an answer defined by a rule or a field in the pack, and no model
 * was asked.
 */
export function markableInTest(item: PracticeItem): boolean {
  return TEST_KINDS.has(item.kind);
}

/** Whether an item belongs in this mode. `mixed` takes everything. */
export function inMode(item: PracticeItem, mode: Mode): boolean {
  if (mode === "mixed") return true;
  return KIND_ANSWERING.get(item.kind) === mode;
}

/**
 * The pool, narrowed to what this sitting asks for.
 *
 * Both filters in one place because they compose in one order, and a caller
 * getting that order wrong is a bug nobody would see: a test in write mode has
 * to drop the typed kinds — they are not markable — and what is left is
 * nothing at all rather than a quietly different test. The page checks for
 * empty and says which of the two choices emptied it.
 */
export function itemsFor(items: readonly PracticeItem[], mode: Mode, flow: Flow): PracticeItem[] {
  return items.filter((item) => inMode(item, mode) && (flow === "practice" || markableInTest(item)));
}

/** Read the mode out of a URL's parameters, falling back to the default. */
export function parseMode(params: Record<string, string | string[] | undefined>): Mode {
  const raw = params.mode;
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return isMode(value) ? value : DEFAULT_MODE;
}

/** The same, for the flow. */
export function parseFlow(params: Record<string, string | string[] | undefined>): Flow {
  const raw = params.flow;
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return isFlow(value) ? value : DEFAULT_FLOW;
}
