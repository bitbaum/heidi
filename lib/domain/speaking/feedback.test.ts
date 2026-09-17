import { test } from "node:test";
import assert from "node:assert/strict";
import { VARIETY } from "../../variety/active.ts";
import { deliveryNotes, feedbackFor, languageNotes, NOTE_IDS, recordingNotes, type Note } from "./feedback.ts";
import type { Delivery } from "./delivery.ts";

const take = (over: Partial<Delivery> = {}): Delivery => ({
  totalMs: 30_000,
  speechMs: 24_000,
  pauseMs: 4_000,
  pauseCount: 4,
  longestPauseMs: 1_200,
  runCount: 12,
  meanRunMs: 2_000,
  phonationRatio: 24 / 28,
  clippedRatio: 0,
  problems: [],
  ...over,
});

const ids = (notes: Note[]) => notes.map((n) => n.id);

test("a problem with the recording is reported as a problem with the recording", () => {
  const notes = recordingNotes(take({ problems: ["clipped"], clippedRatio: 0.02 }));
  assert.deepEqual(ids(notes), ["recording-clipped"]);
});

test("an unusable recording produces no delivery notes at all", () => {
  // The alternative is a confident page of numbers about two seconds of noise.
  assert.deepEqual(deliveryNotes(take({ problems: ["too-short"], totalMs: 1_500 })), []);
  assert.deepEqual(deliveryNotes(take({ problems: ["too-quiet"] })), []);
});

test("a long silence is named, and its absence is named too", () => {
  const stalled = deliveryNotes(take({ longestPauseMs: 4_200 }));
  const note = stalled.find((n) => n.id === "longest-pause");
  assert.ok(note);
  assert.equal(note.value, 4.2, "reported in seconds, rounded once, here");
  assert.ok(!ids(stalled).includes("no-long-pauses"));

  const fluent = deliveryNotes(take({ longestPauseMs: 900 }));
  assert.ok(ids(fluent).includes("no-long-pauses"));
});

test("nothing in the delivery notes is a rating", () => {
  const notes = deliveryNotes(take({ longestPauseMs: 4_000 }));
  for (const note of notes) {
    assert.ok(
      !/score|rating|grade|level/i.test(note.id),
      `${note.id} reads as a grade; §8 forbids scoring somebody's speech`,
    );
  }
});

test("a comparison with the last take needs a real difference, not measurement noise", () => {
  const before = take({ pauseCount: 5 });
  // One fewer pause is noise. Reporting it would be congratulating somebody
  // for nothing, which is what makes every other number here untrustworthy.
  const barely = deliveryNotes(take({ pauseCount: 4 }), before);
  assert.ok(!ids(barely).includes("fewer-pauses-than-before"));

  const really = deliveryNotes(take({ pauseCount: 2 }), before);
  const note = really.find((n) => n.id === "fewer-pauses-than-before");
  assert.ok(note);
  assert.equal(note.value, 3);
});

test("more pauses than last time is reported too, not only the flattering direction", () => {
  const notes = deliveryNotes(take({ pauseCount: 9 }), take({ pauseCount: 3 }));
  const note = notes.find((n) => n.id === "more-pauses-than-before");
  assert.ok(note, "a product that only reports improvement is not measuring");
  assert.equal(note.value, 6);
});

test("takes of wildly different lengths are not compared", () => {
  const short = take({ speechMs: 5_000, pauseCount: 1 });
  const long = take({ speechMs: 60_000, pauseCount: 9 });
  const notes = deliveryNotes(short, long);
  assert.ok(
    !ids(notes).some((id) => id.endsWith("-than-before")),
    "comparing a five-second take with a minute-long one says nothing about the speaker",
  );
});

test("longer runs than before are reported when the gain is beyond noise", () => {
  const notes = deliveryNotes(take({ meanRunMs: 3_000 }), take({ meanRunMs: 2_000 }));
  assert.ok(ids(notes).includes("longer-runs-than-before"));

  const flat = deliveryNotes(take({ meanRunMs: 2_100 }), take({ meanRunMs: 2_000 }));
  assert.ok(!ids(flat).includes("longer-runs-than-before"));
});

test("a form from another dialect is named, with the Zurich one to use instead", () => {
  const notes = languageNotes("Das isch güet gsi, gäu", VARIETY);
  const forms = notes.filter((n) => n.id === "foreign-form");
  assert.ok(forms.length >= 2, `expected güet and gäu, got ${JSON.stringify(notes)}`);

  const guet = forms.find((n) => n.form?.toLowerCase() === "güet");
  assert.ok(guet);
  assert.equal(guet.suggest, "guet");
  assert.equal(guet.origin, "Bern");
});

/**
 * §6, encoded. This is the test that would go red if somebody widened the
 * threshold to "helpfully" catch more.
 */
test("SPELLING IS NEVER CORRECTED IN A SPOKEN TAKE", () => {
  // `ß` is `unattested` in the pack and carries a suggestion. It is also
  // purely orthographic: there is no way to SAY a ß, so flagging it on a
  // recording would be telling somebody their spelling is wrong in a variety
  // that has no standard spelling — the one thing §6 forbids outright.
  const notes = languageNotes("Das isch grüezi und ein Fluß", VARIETY);
  for (const note of notes) {
    assert.notEqual(note.form, "ß", "a ß is not something anybody pronounced");
  }
  assert.ok(
    notes.every((n) => n.id === "nothing-flagged" || n.form !== "ß"),
    "orthographic findings must not reach a learner's spoken take",
  );
});

test("clean words get an explicit all-clear rather than silence", () => {
  const notes = languageNotes("Hoi zäme, wie gaat s?", VARIETY);
  assert.deepEqual(ids(notes), ["nothing-flagged"], "an empty panel reads as a broken feature");
});

test("the words are not judged until the learner has written them out", () => {
  const before = feedbackFor({ delivery: take(), pack: VARIETY });
  assert.deepEqual(before.language, [], "nothing is judged from audio alone");
  assert.ok(before.delivery.length > 0, "but the recording is measured immediately");

  const after = feedbackFor({ delivery: take(), said: "Das isch güet", pack: VARIETY });
  assert.ok(after.language.length > 0);
});

test("whitespace is not a confirmation", () => {
  const blank = feedbackFor({ delivery: take(), said: "   \n ", pack: VARIETY });
  assert.deepEqual(blank.language, []);
});

test("every note id a learner can meet is one of the closed set", () => {
  const produced = new Set<string>();
  for (const notes of [
    recordingNotes(take({ problems: ["too-short", "too-quiet", "clipped"] })),
    deliveryNotes(take({ longestPauseMs: 5_000 }), take({ pauseCount: 9, meanRunMs: 900 })),
    deliveryNotes(take({ longestPauseMs: 500, pauseCount: 0, meanRunMs: 0, runCount: 3 })),
    languageNotes("Das isch güet", VARIETY),
    languageNotes("Hoi zäme", VARIETY),
  ]) {
    for (const note of notes) produced.add(note.id);
  }
  for (const id of produced) {
    assert.ok((NOTE_IDS as readonly string[]).includes(id), `${id} is not in NOTE_IDS`);
  }
  assert.ok(produced.size >= 8, `expected most of the vocabulary exercised, saw ${produced.size}`);
});
