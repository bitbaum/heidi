import { extractJson } from "../domain/chat/parse.ts";
import { excerpt, type TranscriptLine } from "./transcript.ts";

/**
 * Questions about a video, written by the model from its transcript and
 * checked here before anybody sees them.
 *
 * THE SHAPE IS HEIDI.md's LISTENING LAB, unchanged: one gist question shown
 * BEFORE the first listen so the learner listens for something (Field 2008),
 * then three to five detail questions, multiple choice, in the bridge — the
 * variety every practice question is asked in — testing meaning and never
 * spelling. Every question names the lines that answer it, so a wrong answer
 * can replay the moment rather than say "no".
 *
 * WHAT THE MODEL IS NOT TRUSTED WITH. It writes the words; this file decides
 * whether they are a question set at all. An option index out of range, a
 * line number the transcript does not have, two identical options, a set with
 * two detail questions — each is refused, and the route tries once more
 * before telling the learner the questions could not be written. A learner
 * being told "wrong" by a question whose answer is not in the video is the
 * failure §8 exists to prevent, one level down.
 */
export type Question = {
  prompt: string;
  /** Three or four, distinct. */
  options: string[];
  /** Index into `options`. */
  answer: number;
  /** Line indices into the transcript the question was written from. */
  evidence: number[];
};

export type QuestionSet = {
  gist: Question;
  detail: Question[];
  /** How many of the transcript's lines the set was written from. */
  linesUsed: number;
  /** True when the transcript was longer than the excerpt the set covers. */
  truncated: boolean;
  /** Which model wrote it, for the footer and for a later re-generation. */
  model: string;
};

export const MIN_DETAIL = 3;
export const MAX_DETAIL = 5;
const MIN_OPTIONS = 3;
const MAX_OPTIONS = 4;
const MAX_PROMPT = 240;
const MAX_OPTION = 160;

/**
 * The request. `askIn` is the bridge's name from the pack — no language is
 * named here. The lines are numbered so the model can cite them.
 */
export function questionsPrompt(args: { title: string; lines: readonly TranscriptLine[]; askIn: string }): {
  system: string;
  user: string;
  linesUsed: number;
  truncated: boolean;
} {
  const cut = excerpt(args.lines);
  const numbered = cut.lines.map((l, i) => `${i}: ${l.text}`).join("\n");
  const system = [
    "You write listening-comprehension questions for an adult language learner from a video transcript.",
    `Write every prompt and every option in ${args.askIn}. Plain, neutral wording; no slang, no emoji.`,
    "Questions test what was SAID — facts, reasons, who did what, what happens next. Never spelling, never grammar, never the learner's opinion.",
    "Each question is answerable from the transcript alone, and exactly one option is right. Wrong options must be plausible and must NOT be stated anywhere in the transcript.",
    "The gist question asks about the piece as a whole and can be answered after one listen.",
    `Then ${MIN_DETAIL} to ${MAX_DETAIL} detail questions, in the order the answers occur, spread across the transcript.`,
    "For every question list the line numbers that contain its answer as `evidence` (one to three numbers).",
    "Answer with ONE JSON object and nothing else:",
    '{"gist":{"prompt":"…","options":["…","…","…"],"answer":0,"evidence":[0]},"detail":[{"prompt":"…","options":["…","…","…"],"answer":0,"evidence":[0]}]}',
    "`answer` is the index of the right option. Use three or four options. Do not number the options.",
  ].join("\n");
  const user = `Title: ${args.title}\n\nTranscript (line number: text):\n${numbered}`;
  return { system, user, linesUsed: cut.lines.length, truncated: cut.truncated };
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function toQuestion(value: unknown, lineCount: number): Question | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const prompt = str(v.prompt, MAX_PROMPT);
  if (!prompt) return null;
  if (!Array.isArray(v.options)) return null;
  const options = v.options.map((o) => str(o, MAX_OPTION)).filter(Boolean);
  const distinct = new Set(options.map((o) => o.toLowerCase()));
  if (options.length < MIN_OPTIONS || options.length > MAX_OPTIONS || distinct.size !== options.length) return null;
  const answer = typeof v.answer === "number" ? v.answer : typeof v.answer === "string" ? Number.parseInt(v.answer, 10) : NaN;
  if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) return null;
  const evidence = Array.isArray(v.evidence)
    ? [...new Set(v.evidence.map((e) => (typeof e === "number" ? e : Number.parseInt(String(e), 10))).filter((e) => Number.isInteger(e) && e >= 0 && e < lineCount))]
    : [];
  return { prompt, options, answer, evidence: evidence.slice(0, 3) };
}

/**
 * The model's text as a question set, or null.
 *
 * The gist may cite no line — it is about the whole. A detail question must
 * cite at least one real line, because the replay button is the point.
 */
export function parseQuestions(
  raw: string,
  context: { lineCount: number; linesUsed: number; truncated: boolean; model: string },
): QuestionSet | null {
  let json: unknown;
  try {
    json = extractJson(raw);
  } catch {
    return null;
  }
  if (typeof json !== "object" || json === null) return null;
  const v = json as Record<string, unknown>;
  const gist = toQuestion(v.gist, context.lineCount);
  if (!gist) return null;
  const detail = Array.isArray(v.detail)
    ? v.detail.map((d) => toQuestion(d, context.lineCount)).filter((q): q is Question => q !== null && q.evidence.length > 0)
    : [];
  if (detail.length < MIN_DETAIL) return null;
  return { gist, detail: detail.slice(0, MAX_DETAIL), linesUsed: context.linesUsed, truncated: context.truncated, model: context.model };
}

/** What came out of the database, checked rather than trusted. */
export function decodeQuestionSet(raw: unknown, lineCount: number): QuestionSet | null {
  if (typeof raw !== "object" || raw === null) return null;
  const v = raw as Record<string, unknown>;
  const gist = toQuestion(v.gist, lineCount);
  if (!gist || !Array.isArray(v.detail)) return null;
  const detail = v.detail.map((d) => toQuestion(d, lineCount)).filter((q): q is Question => q !== null);
  if (detail.length < MIN_DETAIL) return null;
  return {
    gist,
    detail,
    linesUsed: typeof v.linesUsed === "number" ? v.linesUsed : lineCount,
    truncated: v.truncated === true,
    model: typeof v.model === "string" ? v.model : "",
  };
}
