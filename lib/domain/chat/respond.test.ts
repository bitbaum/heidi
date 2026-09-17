import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { pastedContext } from "./respond.ts";
import { HEIDI_ID, LEARNER_ID, type ChatMessage } from "./types.ts";

/**
 * Which turn the pasted-message note is built from.
 *
 * The model call itself is not exercised here — that needs a vendor. What is
 * exercised is the part that decides WHETHER to say anything, which is pure,
 * and which had a silent bug: see the group case below.
 */

let n = 0;
function said(authorId: string, body: string): ChatMessage {
  n += 1;
  return { id: `m${n}`, authorId, body, createdAt: new Date(2026, 0, 1, 12, n).toISOString() };
}

const EMAIL = `Von: Hausverwaltung <hv@example.ch>
Betreff: Heizungsablesung

Bitte bestätigen Sie den Termin bis Freitag.`;

describe("the pasted-message note", () => {
  test("is built from a solo thread's turn", () => {
    const context = pastedContext([said(LEARNER_ID, EMAIL)]);
    assert.match(context, /Heizungsablesung/);
    assert.match(context, /THE READER PASTED A MESSAGE/);
  });

  test("is built from a GROUP member's turn too", () => {
    /**
     * The bug this pins, which failed silently.
     *
     * The obvious test is `authorId === LEARNER_ID` — and `LEARNER_ID` is the
     * id the SOLO thread stamps. In a group every human carries their own
     * OrangeCat actor id, so a letter pasted into a study group matched
     * nothing, got none of this, and looked exactly like a letter that had
     * been handled.
     */
    const context = pastedContext([said("oc-actor-7f3a", EMAIL)]);
    assert.match(context, /Heizungsablesung/, "a group member's paste must be recognised");
  });

  test("only the LATEST human turn counts", () => {
    // An email pasted four messages ago has already been answered.
    // Re-describing it every turn would spend the budget re-explaining a
    // letter while the reader asks about something else, and would drag the
    // model back to it.
    const context = pastedContext([
      said(LEARNER_ID, EMAIL),
      said(HEIDI_ID, "Sie sollen den Termin bestätigen."),
      said(LEARNER_ID, "Was heisst «bestätigen»?"),
    ]);
    assert.equal(context, "", "a follow-up question is not a pasted letter");
  });

  test("Heidi's own turns are skipped when looking back", () => {
    const context = pastedContext([said(LEARNER_ID, EMAIL), said(HEIDI_ID, "…")]);
    assert.match(context, /Heizungsablesung/, "the last HUMAN turn is the one that counts");
  });

  test("ordinary dialect gets no note at all", () => {
    assert.equal(pastedContext([said(LEARNER_ID, "Chunnsch du am Samschtig?")]), "");
    assert.equal(pastedContext([]), "");
  });

  test("a bare quoted chain with no envelope gets no note", () => {
    // The model reads quoting perfectly well, and the only thing to say would
    // be "some of this is older", which the quoting already shows.
    assert.equal(pastedContext([said(LEARNER_ID, "Ja gern.\n\n> Chunnsch du?")]), "");
  });
});
