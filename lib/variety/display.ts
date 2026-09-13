import { VARIETY } from "./active.ts";
import { ruleLabel, type Severity } from "./pack.ts";
import type { Atlas } from "./pack.ts";

/**
 * The pack, minus everything written in English for developers.
 *
 * A variety pack is authored in one language — ours — because it is data about
 * a language, read by whoever maintains it and by the model. Several of its
 * fields are prose: `learner.who`, `learner.because`, `rules[].reason`,
 * `correspondences[].cue`, `orthography.note`. They are correct, useful, and
 * must never reach a reader.
 *
 * They did. Three times:
 *
 *   - `orthography.note` rendered a paragraph of English at the bottom of the
 *     dialect checker, in all seven locales, including Russian.
 *   - `learner.because` rendered another on the About page, likewise.
 *   - a finding's `reason` explained a Bernese form in English to a French
 *     reader, inside the one feature whose entire job is telling a learner
 *     which regional form they are looking at.
 *
 * Each was fixed where it was found, which is why there was a third. The fix
 * that ends it is not vigilance: it is that a component cannot reach the
 * field at all. `app/**\/*.tsx` imports THIS, never `active.ts`, and
 * `display.test.ts` fails the build if that ever stops being true.
 *
 * API routes still import the full pack — they build the model's prompt, and
 * the prompt is meant to be English.
 */

export type DisplayRule = {
  /** What to print. Literal matches show themselves; regexes carry a label. */
  label: string;
  severity: Severity;
  /** A PLACE, e.g. "Bern" — not a sentence. Safe in any locale. */
  origin?: string;
  /** The form this variety uses instead. A dialect word, not prose. */
  suggest?: string;
};

export type DisplayCorrespondence = {
  bridge: string;
  target: string;
  /** e.g. `k → ch`. Letters, not prose. */
  rule: string;
};

export type DisplayVariety = {
  tag: string;
  name: string;
  endonym: string;
  region: string;
  family?: { name: string; endonym: string; planned: readonly string[]; atlas?: Atlas };
  rules: readonly DisplayRule[];
  correspondences: readonly DisplayCorrespondence[];
  /** `note` is deliberately absent — it is a paragraph of English. */
  orthography: { convention: string };
  /**
   * One line of the variety itself, for the hero to show and then answer.
   * Only the line — its meaning is language, so it lives in the dictionaries.
   * Nothing here is English prose, which is the whole point of this file.
   */
  showcase?: { line: string };
};

/**
 * Everything a page may say about the variety it teaches.
 *
 * What survives the projection is names, places and letters: `Bern`, `nöd`,
 * `k → ch`. Those read correctly in every locale because they are not in any
 * locale — which is exactly why they are the safe half.
 */
export const DISPLAY: DisplayVariety = {
  tag: VARIETY.tag,
  name: VARIETY.name,
  endonym: VARIETY.endonym,
  region: VARIETY.region,
  family: VARIETY.family
    ? {
        name: VARIETY.family.name,
        endonym: VARIETY.family.endonym,
        planned: VARIETY.family.planned,
        atlas: VARIETY.family.atlas,
      }
    : undefined,
  rules: VARIETY.rules.map((rule) => ({
    label: ruleLabel(rule),
    severity: rule.severity,
    origin: rule.origin,
    suggest: rule.suggest,
  })),
  correspondences: VARIETY.correspondences.map((c) => ({
    bridge: c.bridge,
    target: c.target,
    rule: c.rule,
  })),
  orthography: { convention: VARIETY.orthography.convention },
  showcase: VARIETY.showcase ? { line: VARIETY.showcase.line } : undefined,
};
