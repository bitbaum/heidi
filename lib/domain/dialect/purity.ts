/**
 * Zurich-dialect purity check — a deterministic gate over any text that claims
 * to be Züritüütsch, whether a person or a model wrote it.
 *
 * Why this exists: a language model asked for Zurich German will happily emit
 * Bernese diphthongs or Ostschweiz forms, and nobody downstream can tell. The
 * model must never be the judge of its own dialect; this pure function is.
 * Pure: no I/O, no model, same input → same output.
 */

export type PurityViolation = {
  /** The offending form as it appears in the text. */
  form: string;
  /** Why it is not Zurich German. */
  reason: string;
  /** Character offset of the match in the input. */
  index: number;
};

export type PurityResult = { ok: boolean; violations: PurityViolation[] };

/** Unicode-aware word boundary: not preceded/followed by a letter. */
const word = (form: string) => new RegExp(`(?<!\\p{L})${form}(?!\\p{L})`, "giu");

const RULES: ReadonlyArray<{ pattern: RegExp; reason: string }> = [
  { pattern: word("tüü?tsch"), reason: "Ostschweiz form — Zurich says it only inside Züritüütsch" },
  { pattern: word("nid"), reason: "Ostschweiz 'nid' — Zurich says nöd" },
  { pattern: word("güet"), reason: "Bernese 'güet' — Zurich says guet" },
  { pattern: word("gäu"), reason: "Bernese tag 'gäu' — Zurich says gäll" },
  { pattern: /\p{L}*öu\p{L}*/giu, reason: "Bernese öu diphthong — Zurich says au" },
  { pattern: word("sai"), reason: "Basel 'sai'" },
  { pattern: /ß/gu, reason: "ß is not used in Switzerland — write ss" },
];

export function checkZurichPurity(text: string): PurityResult {
  const violations: PurityViolation[] = [];
  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    for (const m of text.matchAll(rule.pattern)) {
      violations.push({ form: m[0], reason: rule.reason, index: m.index ?? 0 });
    }
  }
  violations.sort((a, b) => a.index - b.index);
  return { ok: violations.length === 0, violations };
}
