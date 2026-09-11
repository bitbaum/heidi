import { test } from "node:test";
import assert from "node:assert/strict";
import { extractJson, parseAnswer } from "./parse.ts";
import { ZURICH_GERMAN } from "../../variety/packs/gsw-zh.ts";

const ok = JSON.stringify({
  meaning: "I've been to Kauz. I didn't like it much. Have you?",
  tone: "playful",
  toneNote: "Sounds like a friend asking.",
  glosses: [{ form: "gfalle", standard: "gefallen", english: "to please", rule: "" }],
  replies: [
    { label: "neutral", text: "Ja, mir hät's au nöd so gfalle.", english: "Yeah, I didn't like it either." },
  ],
  note: "",
});

test("reads a bare JSON object", () => {
  assert.equal((extractJson('{"a":1}') as { a: number }).a, 1);
});

test("reads JSON out of a code fence", () => {
  assert.equal((extractJson('```json\n{"a":1}\n```') as { a: number }).a, 1);
});

test("reads JSON the model wrapped in a sentence", () => {
  assert.equal((extractJson('Sure! {"a":1} Hope that helps.') as { a: number }).a, 1);
});

test("refuses text with no JSON rather than guessing", () => {
  assert.throws(() => extractJson("I cannot help with that."), /no JSON/);
});

test("parses a well-formed understand answer", () => {
  const a = parseAnswer(ok, ZURICH_GERMAN, "understand", "groq/x");
  assert.equal(a.tone, "playful");
  assert.equal(a.glosses[0].form, "gfalle");
  assert.equal(a.replies[0].clean, true);
  assert.equal(a.model, "groq/x");
});

test("an unknown tone degrades to neutral instead of reaching the UI", () => {
  const a = parseAnswer(JSON.stringify({ meaning: "x", tone: "ecstatic", replies: [] }), ZURICH_GERMAN, "understand", "m");
  assert.equal(a.tone, "neutral");
});

test("missing meaning is a failure, not an empty card", () => {
  assert.throws(() => parseAnswer('{"tone":"warm"}', ZURICH_GERMAN, "understand", "m"), /no meaning/);
});

test("missing glosses and replies degrade to empty lists", () => {
  const a = parseAnswer('{"meaning":"hello"}', ZURICH_GERMAN, "understand", "m");
  assert.deepEqual(a.glosses, []);
  assert.deepEqual(a.replies, []);
});

test("a reply carrying another dialect is kept but marked, never silently shown as clean", () => {
  const raw = JSON.stringify({
    meaning: "ok",
    replies: [{ label: "neutral", text: "Das isch nid güet, gäu.", english: "That's not good." }],
  });
  const a = parseAnswer(raw, ZURICH_GERMAN, "understand", "m");
  assert.equal(a.replies[0].clean, false);
  assert.ok(a.replies[0].flags.length >= 2, "every offending form is named");
  assert.ok(a.replies[0].flags.some((f) => f.includes("nöd")), "and the Zurich form is offered");
});

test("English meaning is not run through the dialect gate", () => {
  // "sai" is a Basel form; it is also inside ordinary English words. Checking
  // an English explanation against Zurich rules would reject correct answers.
  const raw = JSON.stringify({ meaning: "He said it was fine.", replies: [] });
  const a = parseAnswer(raw, ZURICH_GERMAN, "understand", "m");
  assert.equal(a.meaning, "He said it was fine.");
});

test("in produce mode the sentence itself is gated and offered first", () => {
  const raw = JSON.stringify({ meaning: "Ich chum es bitzeli spöter.", replies: [] });
  const a = parseAnswer(raw, ZURICH_GERMAN, "produce", "m");
  assert.equal(a.replies[0].label, "as written");
  assert.equal(a.replies[0].text, "Ich chum es bitzeli spöter.");
  assert.equal(a.replies[0].clean, true);
});

test("in produce mode a contaminated sentence is flagged rather than shipped clean", () => {
  const a = parseAnswer(JSON.stringify({ meaning: "Das isch güet." }), ZURICH_GERMAN, "produce", "m");
  assert.equal(a.replies[0].clean, false);
});

test("glosses are capped so the card cannot become a wall", () => {
  const many = Array.from({ length: 12 }, (_, i) => ({ form: `w${i}`, standard: "", english: "x", rule: "" }));
  const a = parseAnswer(JSON.stringify({ meaning: "x", glosses: many }), ZURICH_GERMAN, "understand", "m");
  assert.equal(a.glosses.length, 6);
});

test("junk entries in a list are dropped, not rendered as blanks", () => {
  const raw = JSON.stringify({
    meaning: "x",
    glosses: [null, { standard: "no form" }, { form: "chli", english: "a little" }],
    replies: [{ label: "a" }, "nonsense"],
  });
  const a = parseAnswer(raw, ZURICH_GERMAN, "understand", "m");
  assert.equal(a.glosses.length, 1);
  assert.equal(a.replies.length, 0);
});
