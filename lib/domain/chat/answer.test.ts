import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeAnswer } from "./answer.ts";
import { titleFrom, MAX_TITLE } from "./title.ts";

/**
 * These exist because an `Answer` comes back out of `jsonb`, and a row written
 * weeks ago was produced by a different version of the prompt. `as Answer` on
 * such a row is how `a.glosses.map(...)` throws in production.
 */

const full = {
  text: "Sie fragen, ob jemand vorbeikommt.",
  mode: "understand",
  dialect: "Ja, chume gern.",
  dialectClean: true,
  dialectFlags: [],
  tone: "warm",
  toneNote: "Freundlich.",
  glosses: [{ form: "Chunnsch", standard: "kommst du", english: "are you coming", rule: "k → ch" }],
  suggestions: [{ label: "neutral", text: "Ja, chume.", english: "Yes, I'm coming.", clean: true, flags: [] }],
  note: "Kurz gehalten.",
  model: "openai/gpt-oss-120b",
};

test("a well-formed answer survives the round trip", () => {
  const a = decodeAnswer(full);
  assert.ok(a);
  assert.equal(a!.text, full.text);
  assert.equal(a!.glosses[0].form, "Chunnsch");
  assert.equal(a!.suggestions[0].text, "Ja, chume.");
  assert.equal(a!.tone, "warm");
  assert.equal(a!.model, "openai/gpt-oss-120b");
});

test("anything that is not an answer decodes to null, not a crash", () => {
  for (const junk of [null, undefined, "", "a string", 42, [], {}]) {
    assert.equal(decodeAnswer(junk), null, `${JSON.stringify(junk)} should not decode`);
  }
});

test("a row from before a field existed loses the field, not the answer", () => {
  // The actual failure this guards: an old row with no `glosses` key at all.
  const old = { text: "Etwas Altes.", model: "old-model" };
  const a = decodeAnswer(old);
  assert.ok(a, "an answer with text is still an answer");
  assert.deepEqual(a!.glosses, [], "missing glosses becomes an empty list, never undefined");
  assert.deepEqual(a!.suggestions, []);
});

test("an unrecognised tone is dropped, and the note it labelled is kept", () => {
  const a = decodeAnswer({ ...full, tone: "cheerful" });
  assert.equal(a!.tone, undefined, "a tone outside the union is not a tone");
  assert.equal(a!.toneNote, "Freundlich.", "the sentence survives its missing heading");
});

test("a half-written gloss is dropped rather than rendered blank", () => {
  const a = decodeAnswer({ ...full, glosses: [{ standard: "kommst du" }, full.glosses[0], null, "nonsense"] });
  assert.deepEqual(a!.glosses.map((g) => g.form), ["Chunnsch"]);
});

test("a suggestion with no verdict is treated as clean", () => {
  // An old row never met the gate. Showing an unexplained warning on a line
  // nothing judged would invent a problem the learner cannot act on.
  const a = decodeAnswer({ ...full, suggestions: [{ label: "x", text: "Hoi." }] });
  assert.equal(a!.suggestions[0].clean, true);
  assert.deepEqual(a!.suggestions[0].flags, []);
});

test("an answer with no model says so rather than borrowing today's", () => {
  const a = decodeAnswer({ text: "Ohne Provenienz." });
  assert.equal(a!.model, "unknown");
});

test("a title is the first line, in one line", () => {
  assert.equal(titleFrom("Chunnsch au no verbi hüt Abig?"), "Chunnsch au no verbi hüt Abig?");
  assert.equal(titleFrom("  zwei\nZeilen  "), "zwei Zeilen");
  assert.equal(titleFrom("   "), "");
});

test("a long title is cut at a word boundary, not mid-word", () => {
  const long = "Chunnsch au no verbi hüt Abig oder hesch scho öppis anders abgmacht mit dene andere?";
  const title = titleFrom(long);
  assert.ok(title.length <= MAX_TITLE + 1, `too long: ${title.length}`);
  assert.ok(title.endsWith("…"));
  assert.ok(!/\s…$/.test(title), "no dangling space before the ellipsis");
  // The cut lands between words, so the last visible word is a whole one.
  const lastWord = title.slice(0, -1).trim().split(" ").pop()!;
  assert.ok(long.split(/\s+/).includes(lastWord), `"${lastWord}" is not a whole word from the input`);
});

test("one enormous word is truncated rather than emptied", () => {
  const title = titleFrom("x".repeat(200));
  assert.ok(title.length <= MAX_TITLE + 1);
  assert.ok(title.startsWith("xxx"));
});
