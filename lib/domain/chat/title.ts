/**
 * A name for a conversation, derived rather than asked for.
 *
 * Nobody titles a chat. Every product that asks gets "Untitled" a thousand
 * times, so the first thing the learner said becomes the name — which is also
 * the most useful possible label, because what they pasted is exactly how they
 * will recognise it in a list a week later.
 *
 * Cut at a word boundary, not mid-word: a sidebar full of "Chunnsch au no ver…"
 * is harder to scan than one full of slightly shorter whole words.
 */

/** Long enough to identify a thread, short enough for a narrow sidebar. */
export const MAX_TITLE = 60;

export function titleFrom(body: string): string {
  // A pasted WhatsApp thread arrives with newlines; a title is one line.
  const flat = body.replace(/\s+/g, " ").trim();
  if (!flat) return "";
  if (flat.length <= MAX_TITLE) return flat;

  const cut = flat.slice(0, MAX_TITLE);
  const lastSpace = cut.lastIndexOf(" ");
  // Only back off to the word boundary if there is one worth backing off to —
  // a single 60-character token should be truncated, not emptied.
  const stem = lastSpace > MAX_TITLE * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${stem.replace(/[\s,.;:!?-]+$/, "")}…`;
}
