/**
 * Turn whatever the model said into an Answer, or fail honestly.
 *
 * Two jobs, and the second is the one that matters:
 *
 *  1. Parse defensively. Models fence their JSON, prepend "Here you go:", and
 *     return the right shape with one field missing. None of that should reach
 *     a component, and none of it should throw.
 *
 *  2. Run every generated form through the deterministic gate. The model is
 *     never asked whether its own output is in the right variety — it is the
 *     one party that cannot be trusted to answer, because it is also the one
 *     that produced it, and the learner cannot check its work.
 */

import { check } from "../../variety/check.ts";
import type { VarietyPack } from "../../variety/pack.ts";
import { type Answer, type Gloss, type Intent, type Reply, TONES, type Tone } from "./types.ts";

/** Models fence JSON, or bracket it with a sentence. Take the outermost object. */
export function extractJson(raw: string): unknown {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no JSON object in the model's answer");
  return JSON.parse(text.slice(start, end + 1));
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toTone(value: unknown): Tone {
  const t = str(value).toLowerCase();
  return (TONES as readonly string[]).includes(t) ? (t as Tone) : "neutral";
}

/** `k → ch`, `k -> ch` and `K  →  CH` are the same claim. */
function normaliseRule(rule: string): string {
  return rule.toLowerCase().replace(/[→>]+|->/g, "→").replace(/\s+/g, "").trim();
}

/** The only correspondences anyone may cite are the ones the pack vouches for. */
function knownRules(pack: VarietyPack): Set<string> {
  return new Set(pack.correspondences.map((c) => normaliseRule(c.rule)));
}

/**
 * A gloss the learner cannot check, so we check it.
 *
 * Observed in testing: asked about "Im Kauz" — a Zurich bar — the model
 * decided Kauz was a typo for Huus and supplied the correspondence "k → h,
 * au → uu". The second half is real, the first half is invented, and the
 * result is a confident, plausible, fabricated sound law aimed at exactly the
 * person least able to spot it. Same failure mode as a Bernese form slipping
 * through, so it gets the same treatment: the pack is the authority, and a
 * rule it does not list is dropped rather than shown.
 */
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
    rule: known.has(normaliseRule(rule)) ? rule : "",
  };
}

/**
 * A reply is only offered if the gate passes it. A flagged reply is kept and
 * marked rather than dropped: silently discarding it would hide the fact that
 * the model is drifting, and that drift is the thing we most need to see.
 */
function toReply(value: unknown, pack: VarietyPack): Reply | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const text = str(v.text);
  if (!text) return null;
  const verdict = check(text, pack);
  return {
    label: str(v.label, "reply"),
    text,
    english: str(v.english),
    clean: verdict.ok,
    flags: verdict.findings.map((f) => (f.suggest ? `${f.form} → ${f.suggest}` : f.form)),
  };
}

export function parseAnswer(raw: string, pack: VarietyPack, intent: Intent, model: string): Answer {
  const data = extractJson(raw) as Record<string, unknown>;

  const meaning = str(data.meaning);
  if (!meaning) throw new Error("the model returned no meaning");

  // For `produce` the meaning IS target-variety text, so it faces the same gate
  // as a reply. For `understand` it is English and must not be checked — the
  // gate would flag ordinary English words and refuse a correct answer.
  const meaningVerdict = intent === "produce" ? check(meaning, pack) : { ok: true, findings: [] };

  const replies = arr(data.replies)
    .map((r) => toReply(r, pack))
    .filter((r): r is Reply => r !== null);

  if (intent === "produce") {
    replies.unshift({
      label: "as written",
      text: meaning,
      english: "",
      clean: meaningVerdict.ok,
      flags: meaningVerdict.findings.map((f) => (f.suggest ? `${f.form} → ${f.suggest}` : f.form)),
    });
  }

  return {
    intent,
    meaning,
    tone: toTone(data.tone),
    toneNote: str(data.toneNote),
    glosses: arr(data.glosses)
      .map((g) => toGloss(g, knownRules(pack)))
      .filter((g): g is Gloss => g !== null)
      .slice(0, 6),
    replies: replies.slice(0, 4),
    note: str(data.note),
    model,
  };
}
