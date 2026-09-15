import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { REVIEW_STEPS, comingUp, due, grade, isDue, nextDue, settled, type ReviewWord } from "./review.ts";

const NOW = new Date("2026-09-15T10:00:00.000Z");
const DAY = 86_400_000;
const at = (offsetDays: number) => new Date(NOW.getTime() + offsetDays * DAY).toISOString();

const word = (over: Partial<ReviewWord> = {}): ReviewWord => ({
  target: "Chunnsch",
  bridge: "Kommst du",
  savedAt: "2026-09-01T00:00:00.000Z",
  ...over,
});

describe("when a kept word comes back", () => {
  test("a word that has never been reviewed is due now", () => {
    // Not a fallback — the correct answer. You kept it because you did not
    // know it, and nothing has asked you since. It also means the feature
    // arrives with everyone's existing list populated instead of empty.
    assert.equal(isDue(word(), NOW), true);
    assert.equal(isDue(word({ step: 0 }), NOW), true);
  });

  test("a word scheduled for later is not due", () => {
    assert.equal(isDue(word({ dueAt: at(1) }), NOW), false);
    assert.equal(isDue(word({ dueAt: at(-1) }), NOW), true, "overdue is due");
    assert.equal(isDue(word({ dueAt: NOW.toISOString() }), NOW), true, "exactly now is due");
  });

  test("unreadable storage is treated as due, not as an error", () => {
    // Hand-edited localStorage should cost someone a question they did not
    // need, never a crash or a word that silently never returns.
    assert.equal(isDue(word({ dueAt: "not a date" }), NOW), true);
  });

  test("getting it right advances exactly one step", () => {
    const first = grade(word(), true, NOW);
    assert.equal(first.step, 1);
    assert.equal(first.dueAt, at(REVIEW_STEPS[1]));
    assert.equal(first.reviewedAt, NOW.toISOString());

    // Two correct answers is evidence of two correct answers, not of a word
    // that can safely disappear for a month.
    assert.equal(grade(first, true, NOW).step, 2);
  });

  test("getting it wrong returns to the START, not back one", () => {
    // A word you cannot produce today is a word you do not know, whatever you
    // managed a fortnight ago. Dropping one step keeps handing people long
    // intervals on words they are actually failing.
    const practised = word({ step: 3, dueAt: at(-1) });
    const failed = grade(practised, false, NOW);
    assert.equal(failed.step, 0);
    assert.equal(failed.dueAt, at(REVIEW_STEPS[0]));
  });

  test("the schedule expands and then stops", () => {
    // Past about five weeks a word kept from a chat message is either part of
    // your German or gone. Promising to ask again in eight months is promising
    // something nobody is here to collect.
    assert.deepEqual([...REVIEW_STEPS], [1, 3, 7, 16, 35]);
    for (let i = 1; i < REVIEW_STEPS.length; i++) {
      assert.ok(REVIEW_STEPS[i] > REVIEW_STEPS[i - 1], "each interval is longer than the last");
    }

    let w = word();
    for (let i = 0; i < 20; i++) w = grade(w, true, NOW);
    assert.equal(w.step, REVIEW_STEPS.length - 1, "it tops out rather than running off the end");
    assert.equal(w.dueAt, at(35));
  });

  test("a step from hand-edited storage cannot index off the end", () => {
    assert.equal(nextDue(99, NOW), at(35));
    assert.equal(nextDue(-5, NOW), at(1));
    assert.equal(grade(word({ step: 99 }), true, NOW).dueAt, at(35));
    assert.equal(grade(word({ step: Number.NaN }), true, NOW).step, 1);
  });

  test("the most overdue word is asked first", () => {
    // Otherwise a word waiting three weeks is permanently buried under words
    // saved this morning.
    const list = [
      word({ target: "recent", dueAt: at(-1) }),
      word({ target: "ancient", dueAt: at(-30) }),
      word({ target: "never-asked" }),
      word({ target: "later", dueAt: at(5) }),
    ];
    assert.deepEqual(
      due(list, NOW).map((w) => w.target),
      ["never-asked", "ancient", "recent"],
      "never-asked sorts first, then by how long it has waited",
    );
  });

  test("coming up counts the near future and excludes what is already due", () => {
    const list = [
      word({ target: "due now", dueAt: at(-1) }),
      word({ target: "tomorrow", dueAt: at(0.5) }),
      word({ target: "next week", dueAt: at(7) }),
    ];
    assert.equal(comingUp(list, NOW, 1), 1);
    assert.equal(comingUp(list, NOW, 10), 2);
  });

  test("settled counts words, and only ones actually reviewed", () => {
    // "6 of your 20 words came back five times and you still had them" is a
    // fact about what they did. "30% fluent" is a number we cannot support.
    const list = [
      word({ target: "done", step: REVIEW_STEPS.length - 1, reviewedAt: at(-1), dueAt: at(30) }),
      word({ target: "claims-done", step: REVIEW_STEPS.length - 1 }),
      word({ target: "in progress", step: 2, reviewedAt: at(-1) }),
    ];
    assert.equal(settled(list), 1, "a step with no review behind it is hand-edited storage, not an achievement");
  });

  test("grading never loses the word itself", () => {
    const kept = word({ context: "Chunnsch au no verbi?" });
    const graded = grade(kept, true, NOW);
    assert.equal(graded.target, kept.target);
    assert.equal(graded.bridge, kept.bridge);
    assert.equal(graded.context, kept.context);
    assert.equal(graded.savedAt, kept.savedAt, "how long they have carried it is not reset by reviewing it");
  });
});
