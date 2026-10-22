/**
 * A transcript, as the listening screen needs it: timed lines.
 *
 * ONE SHAPE FOR THREE ORIGINS. A publisher's captions, the platform's
 * automatic ones and a transcript the learner pasted from the platform's own
 * "show transcript" panel all arrive differently and are all read the same
 * way afterwards — tap a line to hear it, ask a question that names a line.
 * `source` travels with the lines because the screen prints it: HEIDI.md §8
 * forbids showing a machine transcript as if somebody had written it down,
 * and the only way to keep that promise is to carry the fact to the page.
 *
 * NOTHING HERE NAMES A LANGUAGE. Which caption languages are accepted is the
 * variety pack's business (`accepted.ts`); this file is shape and arithmetic.
 */

export type TranscriptLine = {
  /** Seconds from the start. */
  start: number;
  /** Seconds from the start; never before `start`. */
  end: number;
  text: string;
};

export type TranscriptSource =
  /** Captions the publisher uploaded. The best this product can get. */
  | "publisher"
  /** The platform's speech recognition. Present, and wrong often enough to say so. */
  | "auto"
  /** Pasted by a learner from the platform's transcript panel. */
  | "pasted";

export type Transcript = {
  lines: TranscriptLine[];
  source: TranscriptSource;
  /** BCP-47 as the platform labelled the track, or "" for a paste. */
  lang: string;
  /**
   * How many seconds from the start the transcript covers, when it is not
   * the whole piece — Heidi's own transcription of a podcast's opening
   * minutes. Absent means the whole recording. The page prints it, so a
   * learner is never asked about minute forty from a text that stops at six.
   */
  coverageSeconds?: number;
};

/** More than any question set needs; a two-hour stream is cut, not refused. */
export const MAX_LINES = 900;

/** The paste box's ceiling. A ninety-minute programme is about 60k characters. */
export const MAX_PASTE_CHARS = 120_000;

/** Fewer than this and it is not a transcript, it is a caption. */
export const MIN_LINES = 3;

const WHITESPACE = /\s+/g;

export function cleanText(text: string): string {
  return text
    .replace(/\[(?:Musik|Music|Applaus|Applause|Lachen|Laughter|Gelächter)\]/gi, " ")
    .replace(/&nbsp;/g, " ")
    .replace(WHITESPACE, " ")
    .trim();
}

/**
 * Automatic captions come as fragments of three to six words, cut by the
 * recogniser's breath rather than by sense. A question cannot point at "und
 * dann hat er" as its evidence. So consecutive fragments are joined until a
 * sentence ends, the line gets long, or the speaker pauses.
 *
 * Pure, and the thresholds are here so an argument about them is an argument
 * about two numbers.
 */
export function mergeFragments(
  lines: readonly TranscriptLine[],
  { maxChars = 160, gap = 1.5 }: { maxChars?: number; gap?: number } = {},
): TranscriptLine[] {
  const out: TranscriptLine[] = [];
  for (const raw of lines) {
    const text = cleanText(raw.text);
    if (!text) continue;
    const last = out[out.length - 1];
    const endsSentence = last ? /[.!?…]["»”)]?$/.test(last.text) : true;
    const close = last ? raw.start - last.end <= gap : false;
    if (last && !endsSentence && close && last.text.length + 1 + text.length <= maxChars) {
      last.text = `${last.text} ${text}`;
      last.end = Math.max(last.end, raw.end);
    } else {
      out.push({ start: raw.start, end: Math.max(raw.end, raw.start), text });
    }
  }
  return out;
}

/** `1:02`, `01:02:03`, `1:02:03.500`, `00:01:02,500` → seconds, or null. */
export function parseClock(value: string): number | null {
  const m = value.trim().match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?$/);
  if (!m) return null;
  const hours = m[1] ? Number(m[1]) : 0;
  const minutes = Number(m[2]);
  const seconds = Number(m[3]);
  const fraction = m[4] ? Number(`0.${m[4].padEnd(3, "0")}`) : 0;
  if (minutes > 59 || seconds > 59) return null;
  return hours * 3600 + minutes * 60 + seconds + fraction;
}

/** Roughly how long a line takes to say, when nothing told us. */
function spokenLength(text: string): number {
  return Math.max(1.5, Math.min(12, text.length * 0.065));
}

/**
 * A transcript somebody copied out of the platform's own transcript panel —
 * the way a learner gets one when the platform will not hand it to a server.
 *
 * Three shapes are read, because three shapes turn up:
 *
 *   0:00            the panel's copy: a time on one line, the words on the next
 *   Guten Morgen
 *
 *   0:05 Guten Morgen         the same, joined
 *   [0:05] Guten Morgen
 *
 *   00:00:05.000 --> 00:00:07.000   WebVTT / SRT cue timing, words below
 *   Guten Morgen
 *
 * Returns null when fewer than `MIN_LINES` timed lines came out of it: a page
 * of prose with no times is not something a line can be replayed from, and
 * saying "that did not look like a transcript" is better than a silent empty
 * screen.
 */
export function parsePasted(text: string): TranscriptLine[] | null {
  if (text.length > MAX_PASTE_CHARS) text = text.slice(0, MAX_PASTE_CHARS);
  const rows = text.replace(/\r/g, "").split("\n");
  const stamped: Array<{ start: number; end?: number; text: string }> = [];
  let pending: { start: number; end?: number } | null = null;

  for (const row of rows) {
    const line = row.trim();
    if (!line) continue;
    // SRT numbers its cues; the number is noise.
    if (/^\d+$/.test(line) && pending === null) continue;

    const cue = line.match(/^(\S+)\s*-->\s*(\S+)/);
    if (cue) {
      const start = parseClock(cue[1]);
      const end = parseClock(cue[2]);
      if (start !== null) pending = { start, end: end ?? undefined };
      continue;
    }

    const bracketed = line.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?)\]?\s*(.*)$/);
    if (bracketed) {
      const start = parseClock(bracketed[1]);
      if (start !== null) {
        const rest = bracketed[2].trim();
        if (rest) {
          stamped.push({ start, text: rest });
          pending = null;
        } else {
          pending = { start };
        }
        continue;
      }
    }

    if (pending) {
      stamped.push({ ...pending, text: line });
      pending = null;
    } else if (stamped.length > 0) {
      // A wrapped continuation of the previous cue.
      stamped[stamped.length - 1].text += ` ${line}`;
    }
  }

  const lines: TranscriptLine[] = stamped.map((s, i) => {
    const next = stamped[i + 1];
    const text = cleanText(s.text);
    // Without an end of its own a cue runs until the next one starts — a
    // long silence is capped, so a gap in the recording is not a line that
    // "plays" for a minute.
    const end = s.end ?? (next ? Math.min(Math.max(next.start, s.start), s.start + 30) : s.start + spokenLength(text));
    return { start: s.start, end: Math.max(end, s.start), text };
  });
  const kept = lines.filter((l) => l.text.length > 0);
  if (kept.length < MIN_LINES) return null;
  return mergeFragments(kept).slice(0, MAX_LINES);
}

function isLine(value: unknown): value is TranscriptLine {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.start === "number" &&
    Number.isFinite(v.start) &&
    typeof v.end === "number" &&
    Number.isFinite(v.end) &&
    typeof v.text === "string" &&
    v.text.length > 0
  );
}

/**
 * Timed words — what a recogniser returns — as lines a question can cite.
 *
 * Cut at sentence punctuation, at a pause longer than `gap`, or when a line
 * would grow past `maxChars`. The thresholds are the same kind of number as
 * `mergeFragments` uses, and for the same reason: a line is the unit a
 * learner fails at, and the recogniser's own units are words.
 */
export function linesFromWords(
  words: readonly { word: string; start: number; end: number }[],
  { maxChars = 160, gap = 1.2 }: { maxChars?: number; gap?: number } = {},
): TranscriptLine[] {
  const out: TranscriptLine[] = [];
  let current: TranscriptLine | null = null;
  for (const w of words) {
    const text = w.word.trim();
    if (!text) continue;
    const startsNew = !current || w.start - current.end > gap || current.text.length + 1 + text.length > maxChars;
    if (startsNew || !current) {
      current = { start: w.start, end: w.end, text };
      out.push(current);
    } else {
      current.text += ` ${text}`;
      current.end = Math.max(current.end, w.end);
    }
    if (/[.!?…]["»”)]?$/.test(text)) current = null;
  }
  return out.slice(0, MAX_LINES);
}

/**
 * A publisher's transcript in the podcast namespace's JSON shape
 * (`{"segments":[{"startTime":0.5,"endTime":2,"body":"…"}]}`), as lines.
 */
export function parseTranscriptJson(json: unknown): TranscriptLine[] | null {
  if (typeof json !== "object" || json === null) return null;
  const segments = (json as { segments?: unknown }).segments;
  if (!Array.isArray(segments)) return null;
  const raw: TranscriptLine[] = [];
  for (const s of segments) {
    if (typeof s !== "object" || s === null) continue;
    const v = s as Record<string, unknown>;
    const start = typeof v.startTime === "number" ? v.startTime : NaN;
    const end = typeof v.endTime === "number" ? v.endTime : start;
    const text = typeof v.body === "string" ? cleanText(v.body) : "";
    if (!Number.isFinite(start) || !text) continue;
    raw.push({ start, end: Math.max(end, start), text });
  }
  const merged = mergeFragments(raw);
  return merged.length >= MIN_LINES ? merged.slice(0, MAX_LINES) : null;
}

const SOURCES: readonly TranscriptSource[] = ["publisher", "auto", "pasted"];

/** What came out of the database, checked rather than trusted. */
export function decodeTranscript(raw: unknown): Transcript | null {
  if (typeof raw !== "object" || raw === null) return null;
  const v = raw as Record<string, unknown>;
  if (!Array.isArray(v.lines) || !(SOURCES as readonly unknown[]).includes(v.source)) return null;
  const lines = v.lines.filter(isLine).slice(0, MAX_LINES);
  if (lines.length < MIN_LINES) return null;
  return {
    lines,
    source: v.source as TranscriptSource,
    lang: typeof v.lang === "string" ? v.lang : "",
    ...(typeof v.coverageSeconds === "number" && v.coverageSeconds > 0 ? { coverageSeconds: v.coverageSeconds } : {}),
  };
}

/**
 * The part of a transcript a question set is written from.
 *
 * The first `maxChars` worth of lines, whole lines only. A set is written
 * about the opening minutes rather than sampled across the piece, because the
 * listener answers after hearing it from the start and should not need to
 * reach minute forty to meet question two. `truncated` lets the page say so.
 */
export function excerpt(lines: readonly TranscriptLine[], maxChars = 9000): { lines: TranscriptLine[]; truncated: boolean } {
  const out: TranscriptLine[] = [];
  let used = 0;
  for (const line of lines) {
    if (used + line.text.length > maxChars && out.length > 0) return { lines: out, truncated: true };
    out.push(line);
    used += line.text.length + 1;
  }
  return { lines: out, truncated: false };
}

/** `m:ss` or `h:mm:ss`, for a line's button. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${rest}` : `${m}:${rest}`;
}
