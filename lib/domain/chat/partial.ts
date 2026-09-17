/**
 * Reading one field out of an answer that has not finished arriving.
 *
 * THE PROBLEM STREAMING CREATES HERE. Heidi's answers are a JSON object — the
 * mode, the explanation, the dialect line, the glosses, the suggestions, the
 * follow-up moves. Streaming the raw tokens to the screen would show
 * `{"mode":"understand","text":"Sie f`, which is worse than showing nothing.
 *
 * `extractJson` in `parse.ts` already repairs truncated JSON, and the obvious
 * move is to call it on every delta. It does not work for this: it repairs by
 * cutting back to the last COMPLETE value, so a string that is still being
 * written is discarded entirely. The explanation would appear in one jump when
 * its closing quote arrived, which is the thing streaming was supposed to fix.
 *
 * So this reads a half-written string value, which is exactly what a repairing
 * parser must not do and exactly what a live preview needs.
 *
 * ONLY `text` IS EVER STREAMED, AND THAT IS A SAFETY PROPERTY.
 *
 * `text` is the explanation, in the reader's own language, and `parse.ts` is
 * explicit that it must NOT face the dialect gate — it would flag ordinary
 * German words. Everything the gate DOES judge — the `dialect` line, the
 * suggestions — is withheld until the turn is complete and `parseAnswer` has
 * run: the variety gate, the invented-correspondence strip, the
 * gloss-against-itself drop and the degenerate-loop refusal all happen there.
 *
 * That ordering is the whole design. A learner cannot audit dialect (HEIDI.md
 * §2), so showing them an ungated dialect form — even for a second, even
 * before it is marked — would be the one failure this product is built to
 * prevent. The prose streams; the language waits for the checker.
 */

/** Which fields may be shown before the answer has been checked. */
export const STREAMABLE_FIELD = "text" as const;

/**
 * The value of a top-level string field, as far as it has been written.
 *
 * Returns "" when the field has not started yet, and the partial contents once
 * it has — including while its closing quote is still missing.
 *
 * A REAL SCAN, not a regular expression. `/"text"\s*:\s*"/` would also match
 * those characters INSIDE another string — and the one thing people paste into
 * this product is text they did not write, which includes, occasionally, JSON.
 * Tracking string state costs a dozen lines and removes the whole class.
 */
export function partialField(raw: string, field: string = STREAMABLE_FIELD): string {
  let depth = 0;
  let i = 0;
  // The last complete string token seen at the top level, which is a candidate
  // key until the next non-space character proves otherwise.
  let pendingKey: string | null = null;

  while (i < raw.length) {
    const ch = raw[i];

    if (ch === '"') {
      const token = readString(raw, i);

      // At the top level a string is either a key or a value; it is a key if a
      // colon follows it, and `pendingKey` holds it until we find out.
      //
      // Whether OUR field's value is finished makes no difference to what is
      // returned — `decoded` is the best reading either way — which is the
      // property that lets the same call serve every delta.
      if (depth === 1 && pendingKey === field) return token.decoded;

      // Any other unterminated string means the buffer ends inside a value we
      // do not want. There is nothing further to find.
      if (token.value === undefined) return "";
      i = token.end;

      pendingKey = depth === 1 && nextMeaningful(raw, i) === ":" ? token.decoded : null;
      continue;
    }

    if (ch === "{" || ch === "[") depth += 1;
    else if (ch === "}" || ch === "]") depth -= 1;

    i += 1;
  }

  return "";
}

/** The next character that is not whitespace, or "" at the end of the input. */
function nextMeaningful(raw: string, from: number): string {
  for (let i = from; i < raw.length; i++) {
    if (!/\s/.test(raw[i])) return raw[i];
  }
  return "";
}

/**
 * Read a JSON string starting at an opening quote.
 *
 * `value` is undefined when the closing quote has not arrived — which is not
 * an error here, it is the state this module is for. `decoded` is always the
 * best reading of what is there, so a caller can render it either way.
 */
function readString(raw: string, start: number): { decoded: string; value?: string; end: number } {
  let out = "";
  let i = start + 1;

  while (i < raw.length) {
    const ch = raw[i];

    if (ch === "\\") {
      const escape = raw[i + 1];
      // A backslash at the very end of the buffer is half an escape sequence.
      // Stopping here rather than guessing keeps a stray `\` off the screen.
      if (escape === undefined) return { decoded: out, end: i };
      if (escape === "u") {
        const hex = raw.slice(i + 2, i + 6);
        if (hex.length < 4) return { decoded: out, end: i };
        const code = Number.parseInt(hex, 16);
        // An invalid escape is dropped rather than rendered as a replacement
        // box: this is a preview, and a box that vanishes a moment later looks
        // like a bug in the answer.
        if (!Number.isNaN(code)) out += String.fromCharCode(code);
        i += 6;
        continue;
      }
      out += UNESCAPE[escape] ?? escape;
      i += 2;
      continue;
    }

    if (ch === '"') return { decoded: out, value: out, end: i + 1 };

    out += ch;
    i += 1;
  }

  // Ran out of input inside the string: partial, and that is the point.
  return { decoded: out, end: i };
}

const UNESCAPE: Record<string, string> = {
  n: "\n",
  t: "\t",
  r: "\r",
  b: "\b",
  f: "\f",
  '"': '"',
  "\\": "\\",
  "/": "/",
};
