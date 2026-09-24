import type { Dictionary } from "@/lib/i18n";

/**
 * What to tell the reader when a request failed.
 *
 * THE RULE IS ALREADY WRITTEN DOWN, in `rule-check.tsx`:
 *
 *   "Never the server's own string: those are written once, in English, for a
 *    log. This client speaks the reader's language or nothing."
 *
 * Three components followed it. Three call sites did not: `round-list.tsx`
 * (twice) and `topic-board.tsx` read `data.error` off the response and put it
 * on the page. The API's strings are hard English — "This round is full.",
 * "No such round.", and, worst of the set, "Check the meetingUrl: too long."
 * with the field's own identifier in it. So on a seven-language site a
 * Romansh or Russian reader who typed a long URL was shown an English
 * sentence naming a JSON key.
 *
 * `topic-board.tsx` managed BOTH behaviours in one file — localised at line
 * 47, the server's English at line 138 — which is what a rule with no
 * mechanism behind it looks like after a few months.
 *
 * WHY STATUS CODES AND NOT AN ERROR ENUM. A code would be better and is a
 * bigger change: it means a new field in every JSON error, seven translations
 * per case, and a contract to keep. The status is a contract that already
 * exists and is already correct — the routes return 409 for a full round and
 * 401 for signed-out, deliberately. This reads what is already true rather
 * than adding a parallel vocabulary, and the cases it cannot tell apart get
 * the honest general sentence rather than an English specific one.
 */
export function apiErrorMessage(status: number, t: Dictionary["speaking"]): string {
  // The two the reader can actually act on.
  if (status === 409) return t.roundFull;
  if (status === 401 || status === 403) return t.signInFirst;
  return t.failed;
}
