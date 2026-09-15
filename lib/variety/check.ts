/**
 * Deterministic variety check — a gate over any text claiming to be the
 * target variety, whether a person or a model wrote it.
 *
 * Why it exists: a language model asked for Zurich German will happily emit
 * Bernese diphthongs, and a model asked for Ukrainian will happily emit
 * Russian calques. In both cases the output is fluent, grammatical and
 * meaning-transparent, so the learner — who is buying the variety precisely
 * because they do not know it — cannot audit what they were given. The model
 * must never be the judge of its own variety; this pure function is.
 *
 * Pure: no I/O, no model, same input -> same output.
 */

import { SEVERITY_RANK, type Severity, type VarietyPack, type VarietyRule } from "./pack.ts";

export type Finding = {
  /** The offending form as it appears in the text. */
  form: string;
  severity: Severity;
  /** Why it is flagged, for a learner. */
  reason: string;
  /** The variety it belongs to, when known. */
  origin?: string;
  /** The target-variety form to use instead. */
  suggest?: string;
  /** Character offset of the match in the input. */
  index: number;
};

export type CheckResult = {
  /** No finding at or above the threshold. */
  ok: boolean;
  /** Every finding, worst-first within text order, regardless of threshold. */
  findings: Finding[];
};

/**
 * Two callers, two thresholds, one rule set:
 *
 *   "foreign"      generation gate — never ship another variety's forms.
 *   "dispreferred" house style — for our own published copy.
 *
 * A learner's own writing is checked at `foreign` too: telling someone their
 * spelling is "wrong" in a variety that has no standard spelling is the one
 * thing the product must not do.
 */
export type Threshold = Severity;

/** Unicode-aware whole-word match: not preceded or followed by a letter. */
function wordPattern(form: string): RegExp {
  return new RegExp(`(?<!\\p{L})${escape(form)}(?!\\p{L})`, "giu");
}

/** Packs carry literal forms, not patterns; a stray `.` must not match anything. */
function escape(form: string): string {
  return form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function patternOf(rule: VarietyRule): RegExp {
  if (typeof rule.match === "string") return wordPattern(rule.match);
  // A pack-supplied RegExp must be global to enumerate every occurrence, and
  // sticky would anchor it — normalise rather than trust the pack author.
  const flags = rule.match.flags.replace(/[gy]/g, "");
  return new RegExp(rule.match.source, `${flags}g`);
}

export function check(text: string, pack: VarietyPack, threshold: Threshold = "foreign"): CheckResult {
  return checkAgainst(text, pack.rules, threshold);
}

/**
 * The same gate, over any rule set.
 *
 * `check` is the target variety; this is what lets a BRIDGE be checked too.
 * The two are one function because they are one idea — a model asked for a
 * variety will produce a neighbouring one, fluently, and the learner cannot
 * tell. That is as true of "Swiss Standard German" coming back as Germany's
 * German as it is of Zurich German coming back Bernese.
 */
export function checkAgainst(
  text: string,
  rules: readonly VarietyRule[],
  threshold: Threshold = "foreign",
): CheckResult {
  const findings: Finding[] = [];

  for (const rule of rules) {
    for (const m of text.matchAll(patternOf(rule))) {
      findings.push({
        form: m[0],
        severity: rule.severity,
        reason: rule.reason,
        ...(rule.origin ? { origin: rule.origin } : {}),
        ...(rule.suggest ? { suggest: rule.suggest } : {}),
        index: m.index ?? 0,
      });
    }
  }

  findings.sort((a, b) => a.index - b.index || SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

  const bar = SEVERITY_RANK[threshold];
  return { ok: !findings.some((f) => SEVERITY_RANK[f.severity] >= bar), findings };
}
