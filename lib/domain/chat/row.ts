/**
 * The ONE row of one-tap buttons under an answer.
 *
 * Three sources used to render three rows: the model's suggested replies
 * (chatkit), "What now?" (`moves.ts`) and "Learn from this" (`learn.ts`). On
 * the latest answer that was up to ten buttons under three captions — a
 * toolbar, and a toolbar is the thing `moves.ts` removed the mode switch to
 * avoid. The decision was one row per answer, replies first.
 *
 *   1. REPLIES FIRST. They are the conversation continuing, written by the
 *      thing that knows what it just asked; the moves and the learn chips are
 *      things to do with the answer, and come after.
 *   2. NO SAME THING TWICE. A reply "Wie antworte ich darauf?" and the reply
 *      move that sends exactly that are one button. Compared case- and
 *      accent-insensitively on what the button SAYS and on what it SENDS.
 *   3. AT MOST `MAX_ROW`, so it stays one tidy wrap on a phone.
 *   4. AN ACTION KEEPS ITS PLACE. A button that does something other than
 *      send a message — the grammar link, which opens the explanation page —
 *      is not interchangeable with a sentence, so when the row is full a
 *      sentence gives way rather than it. Everything else keeps its order.
 *
 * Pure and free of the dictionary: the caller words the items, this decides
 * which survive.
 */
export type RowItem =
  /** Sends `say` as the reader's own visible message, like the composer. */
  | { kind: "send"; label: string; say: string }
  /** Navigates instead of sending. */
  | { kind: "link"; label: string; href: string };

/** Five: two short lines on a 320px phone, one on anything wider. */
export const MAX_ROW = 5;

function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function answerRow(replies: readonly string[], own: readonly RowItem[], max: number = MAX_ROW): RowItem[] {
  const seen = new Set<string>();
  const unique: RowItem[] = [];
  const candidates: RowItem[] = [
    ...replies.map((r): RowItem => ({ kind: "send", label: r, say: r })),
    ...own,
  ];
  for (const item of candidates) {
    const label = fold(item.label);
    if (!label) continue;
    const keys = item.kind === "send" ? [label, fold(item.say)] : [label, `link:${item.href}`];
    if (keys.some((k) => seen.has(k))) continue;
    keys.forEach((k) => seen.add(k));
    unique.push(item);
  }
  if (unique.length <= max) return unique;

  // Actions first claim their slots; sentences fill what is left, in order.
  const actions = unique.filter((i) => i.kind !== "send").slice(0, max);
  let room = max - actions.length;
  const keep = new Set<RowItem>(actions);
  for (const item of unique) {
    if (room === 0) break;
    if (item.kind === "send") {
      keep.add(item);
      room--;
    }
  }
  return unique.filter((i) => keep.has(i));
}
