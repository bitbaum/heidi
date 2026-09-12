/**
 * Turn whatever the model said into an Answer, or fail honestly.
 *
 * Three jobs, and only the first is parsing:
 *
 *  1. Read defensively. Models fence their JSON, prepend "Here you go:", and
 *     hit the token ceiling mid-array. None of that should reach a component,
 *     and none of it should throw.
 *  2. Run every generated form through the deterministic gate. The model is
 *     never asked whether its own output is in the right variety — it is the
 *     one party that cannot be trusted to answer, because it produced it and
 *     the learner cannot check it.
 *  3. Strip invented linguistics. A correspondence the pack does not vouch for
 *     is a confident, plausible, fabricated sound law aimed at exactly the
 *     person least able to spot it.
 */

import { check } from "../../variety/check.ts";
import type { VarietyPack } from "../../variety/pack.ts";
import { type Answer, type Gloss, type Mode, MODES, type Suggestion, TONES, type Tone } from "./types.ts";

/** `k → ch`, `k -> ch` and `K  →  CH` are the same claim. */
function normaliseRule(rule: string): string {
  return rule.toLowerCase().replace(/[→>]+|->/g, "→").replace(/\s+/g, "").trim();
}

function knownRules(pack: VarietyPack): Set<string> {
  return new Set(pack.correspondences.map((c) => normaliseRule(c.rule)));
}

/**
 * Close whatever the model left open.
 *
 * Seen in production on the first live request: the answer hit the token
 * ceiling mid-array and `JSON.parse` threw, so a reply that was 90% written
 * became "Heidi could not answer that just now". Raising the budget makes it
 * rarer; it cannot make it impossible, because the ceiling always exists.
 */
function repairTruncated(text: string): string {
  let inString = false;
  let escaped = false;
  let lastSafe = -1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "," || ch === "}" || ch === "]") lastSafe = i;
  }
  if (lastSafe === -1) return text;

  let cut = text.slice(0, lastSafe + 1).replace(/,\s*$/, "");

  const open: string[] = [];
  let s = false;
  let e = false;
  for (const ch of cut) {
    if (e) {
      e = false;
      continue;
    }
    if (ch === "\\" && s) {
      e = true;
      continue;
    }
    if (ch === '"') s = !s;
    else if (!s && (ch === "{" || ch === "[")) open.push(ch);
    else if (!s && (ch === "}" || ch === "]")) open.pop();
  }
  for (let i = open.length - 1; i >= 0; i--) cut += open[i] === "{" ? "}" : "]";
  return cut;
}

export function extractJson(raw: string): unknown {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = text.indexOf("{");
  if (start === -1) throw new Error("no JSON object in the model's answer");

  const end = text.lastIndexOf("}");
  if (end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      // fall through to repair
    }
  }
  return JSON.parse(repairTruncated(text.slice(start)));
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}
function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
function toMode(value: unknown): Mode {
  const m = str(value).toLowerCase();
  return (MODES as readonly string[]).includes(m) ? (m as Mode) : "answer";
}
function toTone(value: unknown): Tone | undefined {
  const t = str(value).toLowerCase();
  return (TONES as readonly string[]).includes(t) ? (t as Tone) : undefined;
}

function toGloss(value: unknown, known: Set<string>): Gloss | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const form = str(v.form);
  if (!form) return null;

  const standard = str(v.standard);
  // Glossing a word against itself teaches nothing and costs a row.
  if (standard.toLowerCase() === form.toLowerCase()) return null;

  const rule = str(v.rule);
  return {
    form,
    standard,
    english: str(v.english),
    // Observed: asked about "Im Kauz" — a Zurich bar — the model decided Kauz
    // was a typo for Huus and supplied the sound law "k → h". The pack is the
    // authority; a rule it does not list is dropped rather than shown.
    rule: known.has(normaliseRule(rule)) ? rule : "",
  };
}

function toSuggestion(value: unknown, pack: VarietyPack): Suggestion | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const text = str(v.text);
  if (!text) return null;
  const verdict = check(text, pack);
  return {
    label: str(v.label, "—"),
    text,
    english: str(v.english),
    clean: verdict.ok,
    // Kept and marked rather than dropped: silently discarding a flagged line
    // would hide the fact that the model is drifting, and that drift is the
    // thing we most need to see.
    flags: verdict.findings.map((f) => (f.suggest ? `${f.form} → ${f.suggest}` : f.form)),
  };
}

/**
 * Catch a model that has fallen into a loop.
 *
 * Observed live, from a free model asked what a word meant:
 *
 *   „verbi" ist ein Kurzwort für „verbi" = „verbi" (Kurzform von „verbi")
 *
 * It is fluent, well-punctuated, confidently wrong, and says nothing. Sending
 * that to someone learning the language is worse than sending nothing: they
 * cannot tell it is broken, because not understanding is the state they are
 * already in. Treating it as a failed turn gives them a retry instead.
 *
 * Tuned to be quiet: a word must be four or more characters and repeat at
 * least five times before this fires, so ordinary emphasis and a genuinely
 * repeated key term both pass.
 */
export function looksDegenerate(text: string): boolean {
  const words = text.toLowerCase().match(/\p{L}{4,}/gu);
  if (!words || words.length < 8) return false;
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  return [...counts.values()].some((n) => n >= 5);
}

export function parseAnswer(raw: string, pack: VarietyPack, model: string): Answer {
  const data = extractJson(raw) as Record<string, unknown>;

  const text = str(data.text);
  const dialect = str(data.dialect);
  if (!text && !dialect) throw new Error("the model returned nothing to show");
  if (looksDegenerate(text)) throw new Error("the model looped instead of answering");

  const known = knownRules(pack);
  const mode = toMode(data.mode);

  // `text` is in the reader's language and must NOT face the dialect gate —
  // it would flag ordinary words and refuse a correct answer. Only `dialect`
  // claims to be the target variety, so only `dialect` is checked.
  const verdict = dialect ? check(dialect, pack) : null;

  return {
    mode,
    text: text || dialect,
    ...(dialect ? { dialect } : {}),
    ...(verdict
      ? {
          dialectClean: verdict.ok,
          dialectFlags: verdict.findings.map((f) => (f.suggest ? `${f.form} → ${f.suggest}` : f.form)),
        }
      : {}),
    ...(toTone(data.tone) ? { tone: toTone(data.tone) } : {}),
    ...(str(data.toneNote) ? { toneNote: str(data.toneNote) } : {}),
    glosses: arr(data.glosses)
      .map((g) => toGloss(g, known))
      .filter((g): g is Gloss => g !== null)
      .slice(0, 4),
    suggestions: arr(data.suggestions)
      .map((s) => toSuggestion(s, pack))
      .filter((s): s is Suggestion => s !== null)
      .slice(0, 3),
    ...(str(data.note) ? { note: str(data.note) } : {}),
    model,
  };
}
