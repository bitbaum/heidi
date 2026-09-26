import type { DialectArea, VarietyPack, VarietyRule } from "./pack.ts";

/**
 * The family around the variety Heidi teaches.
 *
 * Three different questions used to be answered by one list, and the map got
 * them confused:
 *
 *   WHERE ARE THE DIALECTS?   Linguistic fact. `family.areas`. Every German-
 *                             speaking part of Switzerland, whether or not we
 *                             teach it or can detect it.
 *   WHAT WILL HEIDI TEACH?    A product decision. `family.planned`, a roadmap.
 *   WHAT CAN THE GATE PLACE?  A property of the rules we have written so far,
 *                             and it grows. Derived here, never hand-listed.
 *
 * The third is the interesting one. A page about Bernese could carry its own
 * list of Bernese forms — and then there would be two lists, one enforced by
 * the checker and one merely printed, free to drift apart. So there is one:
 * the page reads the gate's own rules. It cannot show a form the checker does
 * not enforce, and writing a new rule improves the page for nothing.
 */

/** A form that marks a neighbouring dialect, against the taught variety's own. */
export type Mark = {
  /** The neighbour's form, e.g. `gäu`. */
  theirs: string;
  /** What the taught variety says instead, e.g. `gäll`. */
  ours: string;
};

/**
 * The forms that distinguish one area, read out of the gate.
 *
 * Only literal rules: a `RegExp` rule matches a pattern rather than a word, so
 * printing it would show a reader something like `(?<!\p{L})tüü?tsch` — which
 * is the exact failure `VarietyRule.display` was added to stop. And only rules
 * carrying a replacement, because "this form is wrong" without "this is what
 * we say instead" leaves a reader where they started.
 */
export function marksFor(pack: VarietyPack, area: DialectArea): Mark[] {
  if (!area.ruleOrigin) return [];

  return pack.rules
    .filter(
      (rule: VarietyRule): rule is VarietyRule & { match: string; suggest: string } =>
        rule.origin === area.ruleOrigin && typeof rule.match === "string" && Boolean(rule.suggest),
    )
    .map((rule) => ({ theirs: rule.match, ours: rule.suggest }));
}

/** Every area of the family, or none for a pack that has not mapped one. */
export function areasOf(pack: VarietyPack): readonly DialectArea[] {
  return pack.family?.areas ?? [];
}

/** One area by id, for a page that was asked for it by name. */
export function areaById(pack: VarietyPack, id: string): DialectArea | undefined {
  return areasOf(pack).find((area) => area.id === id);
}

/**
 * Is this the variety Heidi actually teaches?
 *
 * Matched on the area covering the pack's own home canton rather than by
 * hardcoding an id, so a Bern pack lights up Bern without editing this file.
 */
export function isTaught(pack: VarietyPack, area: DialectArea): boolean {
  const home = pack.family?.atlas?.home;
  if (!home) return false;
  return area.place.lon === home.lon && area.place.lat === home.lat;
}

/**
 * What an area's page cites: its own literature, then every source its marks
 * rest on — each once, in that order. The page renders one reference list, so
 * a form shown under "how to recognise it" is always one click from where it
 * is described.
 */
export function sourcesFor(pack: VarietyPack, area: DialectArea): string[] {
  const fromRules = area.ruleOrigin
    ? pack.rules.filter((r) => r.origin === area.ruleOrigin).flatMap((r) => r.sources ?? [])
    : [];
  return [...new Set([...area.sources, ...fromRules])];
}
