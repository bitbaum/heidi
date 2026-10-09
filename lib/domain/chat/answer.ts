import type { Answer, Gloss, Mode, Suggestion, Tone } from "./types.ts";
import { MODES, TONES } from "./types.ts";
import { decodeMoves } from "./moves.ts";
import { REPLIES_FENCE, extractReplies } from "@bitbaum/chatkit";

/**
 * An `Answer` read back out of storage, checked rather than asserted.
 *
 * Heidi's answers are written to `jsonb` whole — `group_messages.answer`, and
 * soon conversation rows too. That is the right call (the shape belongs to the
 * prompt, and columns would turn every prompt revision into a migration) but it
 * has a consequence: a row written weeks ago was produced by a different
 * version of `parseAnswer`, and nothing in the database enforces the current
 * shape.
 *
 * So `row.answer as Answer` is how `a.glosses.map(...)` reaches production and
 * throws on a row that predates `glosses`. This is the one place that cast is
 * allowed to happen, and it happens defensively.
 *
 * The rule: a field that cannot be trusted is DROPPED, never defaulted to
 * something that reads as content. A missing gloss list becomes no gloss
 * section; it does not become an empty section implying Heidi found nothing
 * worth explaining.
 */

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function gloss(value: unknown): Gloss | null {
  if (!value || typeof value !== "object") return null;
  const g = value as Record<string, unknown>;
  const form = str(g.form);
  if (!form) return null;
  return {
    form,
    standard: typeof g.standard === "string" ? g.standard : "",
    english: typeof g.english === "string" ? g.english : "",
    // A rule the pack does not vouch for is stripped at generation time; an old
    // row may still carry one, and it is only ever decoration here.
    rule: typeof g.rule === "string" ? g.rule : "",
  };
}

function suggestion(value: unknown): Suggestion | null {
  if (!value || typeof value !== "object") return null;
  const s = value as Record<string, unknown>;
  const text = str(s.text);
  if (!text) return null;
  return {
    label: typeof s.label === "string" ? s.label : "",
    text,
    english: typeof s.english === "string" ? s.english : "",
    // A stored row may predate this field; absent means the dialect, which is
    // what every row written before Swiss Standard German existed was.
    ...(s.variety === "bridge" ? { variety: "bridge" as const } : {}),
    // `clean` false means the gate flagged it. An old row with no verdict is
    // treated as CLEAN, because showing an unexplained warning on a line the
    // gate never judged would invent a problem.
    clean: s.clean !== false,
    flags: Array.isArray(s.flags) ? s.flags.filter((f): f is string => typeof f === "string") : [],
  };
}

export function decodeAnswer(value: unknown): Answer | null {
  if (!value || typeof value !== "object") return null;
  const a = value as Record<string, unknown>;

  // `text` is the answer. Without it there is nothing to show, whatever else
  // the row carries.
  const text = str(a.text);
  if (!text) return null;

  return {
    text,
    // Checked against the list: collapsing to two values turned every stored
    // "answer" into "understand" on reload.
    mode: MODES.includes(a.mode as Mode) ? (a.mode as Mode) : "understand",
    dialect: typeof a.dialect === "string" ? a.dialect : "",
    dialectClean: a.dialectClean === false ? false : true,
    dialectFlags: Array.isArray(a.dialectFlags)
      ? a.dialectFlags.filter((f): f is string => typeof f === "string")
      : [],
    // Absent on every row written before explanations were judged — read as
    // unjudged, never as flagged.
    ...(a.textClean === false
      ? {
          textClean: false,
          textFlags: Array.isArray(a.textFlags) ? a.textFlags.filter((f): f is string => typeof f === "string") : [],
        }
      : a.textClean === true
        ? { textClean: true }
        : {}),
    // A closed union, checked against the list rather than trusted. An older
    // row carrying a tone we no longer recognise loses the label and keeps the
    // note — better a sentence with no heading than a heading that is not a
    // tone this product has an opinion about.
    ...(TONES.includes(a.tone as Tone) ? { tone: a.tone as Tone } : {}),
    ...(str(a.toneNote) ? { toneNote: a.toneNote as string } : {}),
    glosses: Array.isArray(a.glosses) ? a.glosses.map(gloss).filter((g): g is Gloss => g !== null) : [],
    suggestions: Array.isArray(a.suggestions)
      ? a.suggestions.map(suggestion).filter((s): s is Suggestion => s !== null)
      : [],
    // Same rule as `tone`: an id we no longer recognise is dropped rather
    // than rendered, because a chip whose label cannot be looked up is a blank
    // button that does nothing when pressed.
    ...(decodeMoves(a.next).length ? { next: decodeMoves(a.next) } : {}),
    ...(str(a.note) ? { note: a.note as string } : {}),
    // Stored data a reader can edit (the draft lives in localStorage), so it
    // is re-bounded exactly like a model's output rather than trusted.
    ...(storedReplies(a.replies).length ? { replies: storedReplies(a.replies) } : {}),
    // Provenance. An answer with no model attached is a rumour, so an old row
    // missing it says so rather than borrowing today's model's name.
    model: typeof a.model === "string" && a.model ? a.model : "unknown",
  };
}

/**
 * Re-bounded by chatkit's own rule (at most four, short, distinct) rather than
 * a copy of it, so a stored row and a fresh answer can never disagree.
 */
function storedReplies(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return extractReplies("```" + REPLIES_FENCE + "\n" + JSON.stringify(value) + "\n```").replies;
}
