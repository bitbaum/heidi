import { test } from "node:test";
import assert from "node:assert/strict";
import { extractJson, looksDegenerate, parseAnswer } from "./parse.ts";
import { ZURICH_GERMAN } from "../../variety/packs/gsw-zh.ts";

const ZH = ZURICH_GERMAN;
const parse = (o: unknown) => parseAnswer(JSON.stringify(o), ZH, "test/model");

// ---------------------------------------------------------------------------
// Reading what the model actually sends — fenced, prefaced, or cut off.
// ---------------------------------------------------------------------------

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

test("valid JSON is never touched by the repair path", () => {
  const data = extractJson('{"text":"a } and a ] inside a string"}') as { text: string };
  assert.equal(data.text, "a } and a ] inside a string");
});

// ---------------------------------------------------------------------------
// Truncation. Observed in production on the very first live request: the
// answer hit the token ceiling mid-array and a 90%-written reply was thrown
// away entirely by JSON.parse.
// ---------------------------------------------------------------------------

test("an answer cut off inside a string still yields what was complete", () => {
  const raw = '{"text":"Are you coming?","glosses":[{"form":"chunnsch","english":"come"},{"form":"Abi';
  const data = extractJson(raw) as { text: string; glosses: unknown[] };
  assert.equal(data.text, "Are you coming?");
  assert.equal(data.glosses.length, 1, "the half-written gloss goes, the finished one stays");
});

test("an answer cut off between elements is repaired", () => {
  const raw = '{"text":"hi","suggestions":[{"label":"neutral","text":"Hoi"},';
  assert.equal((extractJson(raw) as { suggestions: unknown[] }).suggestions.length, 1);
});

test("an escaped quote inside a truncated string does not confuse the scanner", () => {
  const raw = '{"text":"she said \\"hoi\\" back","suggestions":[{"label":"a","text":"b"},{"label":"c';
  const data = extractJson(raw) as { text: string; suggestions: unknown[] };
  assert.equal(data.text, 'she said "hoi" back');
  assert.equal(data.suggestions.length, 1);
});

test("a truncated answer still produces a usable card", () => {
  const raw =
    '{"mode":"understand","text":"Are you also coming by this evening?","tone":"warm","suggestions":[{"label":"neutral","text":"Ja, chume gern verbi.","english":"Yes, gladly."},{"label":"cas';
  const a = parseAnswer(raw, ZH, "m");
  assert.equal(a.text, "Are you also coming by this evening?");
  assert.equal(a.tone, "warm");
  assert.equal(a.suggestions.length, 1);
  assert.equal(a.suggestions[0].clean, true, "and the salvaged line is still gated");
});

// ---------------------------------------------------------------------------
// The mode the model chose — the thing we stopped asking the human for.
// ---------------------------------------------------------------------------

test("the model's chosen mode is carried through", () => {
  assert.equal(parse({ mode: "understand", text: "x" }).mode, "understand");
  assert.equal(parse({ mode: "produce", text: "x", dialect: "Hoi" }).mode, "produce");
  assert.equal(parse({ mode: "answer", text: "x" }).mode, "answer");
});

test("an unknown mode degrades to answer rather than reaching the UI", () => {
  assert.equal(parse({ mode: "interpretive-dance", text: "x" }).mode, "answer");
  assert.equal(parse({ text: "x" }).mode, "answer");
});

test("an unknown tone is dropped rather than shown", () => {
  assert.equal(parse({ text: "x", tone: "ecstatic" }).tone, undefined);
  assert.equal(parse({ text: "x", tone: "warm" }).tone, "warm");
});

test("an answer with nothing to show is a failure, not an empty card", () => {
  assert.throws(() => parseAnswer('{"mode":"answer"}', ZH, "m"), /nothing to show/);
});

test("a produce answer missing its dialect line recovers from the first suggestion", () => {
  // Seen live: the model returned mode=produce, put the reader-language
  // restatement in `text`, and omitted `dialect` — leaving the person with
  // nothing to send. The suggestions ARE target-variety text by contract and
  // have already been gated, so the first is promoted.
  const a = parse({
    mode: "produce",
    text: "Sie möchten die Nachbarin fragen.",
    suggestions: [
      { label: "neutral", text: "Frag d'Nachbarin, ob ich es Päckli bi ihre cha laa.", english: "..." },
      { label: "shorter", text: "Chan ich es Päckli bi dir laa?", english: "..." },
    ],
  });
  assert.equal(a.dialect, "Frag d'Nachbarin, ob ich es Päckli bi ihre cha laa.");
  assert.equal(a.dialectClean, true, "the promoted line is still gated");
  assert.equal(a.suggestions.length, 1, "and it is not also listed below itself");
});

test("the reader-language text is never promoted into the send box", () => {
  // It looks like something to send and is not — worse than nothing.
  const a = parse({ mode: "produce", text: "Sie möchten die Nachbarin fragen." });
  assert.equal(a.dialect, undefined);
});

test("a produce answer with only a dialect line still works", () => {
  // The model sometimes puts everything in `dialect` and leaves `text` empty.
  const a = parse({ mode: "produce", dialect: "Ich chum spöter." });
  assert.equal(a.text, "Ich chum spöter.");
  assert.equal(a.dialect, "Ich chum spöter.");
});

// ---------------------------------------------------------------------------
// The gate. The learner is buying a variety they do not know, so they cannot
// check this work — which is exactly why the model never grades itself.
// ---------------------------------------------------------------------------

test("the dialect line is gated and its verdict reported", () => {
  const clean = parse({ mode: "produce", text: "ok", dialect: "Ich chum es bitzeli spöter." });
  assert.equal(clean.dialectClean, true);

  const dirty = parse({ mode: "produce", text: "ok", dialect: "Das isch nid güet." });
  assert.equal(dirty.dialectClean, false);
  assert.ok(dirty.dialectFlags?.some((f) => f.includes("nöd")), "and the Zurich form is offered");
});

test("a suggestion carrying another dialect is kept but marked, never shown as clean", () => {
  const a = parse({
    text: "ok",
    suggestions: [{ label: "neutral", text: "Das isch nid güet, gäu.", english: "Not great." }],
  });
  assert.equal(a.suggestions[0].clean, false);
  assert.ok(a.suggestions[0].flags.length >= 2, "every offending form is named");
});

test("the reader-language text is never run through the dialect gate", () => {
  // "sai" is a Basel form and also sits inside ordinary English words. Checking
  // an English explanation against Zurich rules would reject correct answers.
  const a = parse({ mode: "understand", text: "He said it was fine." });
  assert.equal(a.text, "He said it was fine.");
  assert.equal(a.dialectClean, undefined, "no dialect line means no verdict to give");
});

// ---------------------------------------------------------------------------
// Invented linguistics. The model is fluent enough to make up a sound law.
// ---------------------------------------------------------------------------

test("a correspondence the pack vouches for survives", () => {
  const a = parse({ text: "x", glosses: [{ form: "Chind", standard: "Kind", english: "child", rule: "k → ch" }] });
  assert.equal(a.glosses[0].rule, "k → ch");
});

test("an invented correspondence is dropped, the gloss is kept", () => {
  // The real observed failure: "Kauz" is a Zurich bar, not a typo for Huus,
  // and "k → h" is not a sound law of anything.
  const a = parse({ text: "x", glosses: [{ form: "Kauz", standard: "Huus", english: "house", rule: "k → h, au → uu" }] });
  assert.equal(a.glosses[0].rule, "", "the fabricated rule must not reach the learner");
  assert.equal(a.glosses[0].form, "Kauz", "but the word is still glossed");
});

test("arrow and spacing variants still match the pack", () => {
  const arrow = parse({ text: "x", glosses: [{ form: "isch", standard: "ist", english: "is", rule: "st -> sch" }] });
  assert.equal(arrow.glosses[0].rule, "st -> sch");
  const caps = parse({ text: "x", glosses: [{ form: "isch", standard: "ist", english: "is", rule: "ST  →  SCH" }] });
  assert.equal(caps.glosses[0].rule, "ST  →  SCH");
});

test("a word glossed against itself is dropped entirely", () => {
  // The model kept explaining that freundlich means freundlich.
  assert.deepEqual(parse({ text: "x", glosses: [{ form: "freundlich", standard: "freundlich", english: "friendly" }] }).glosses, []);
  assert.deepEqual(parse({ text: "x", glosses: [{ form: "Ich", standard: "ich", english: "I" }] }).glosses, []);
});

test("a gloss with no bridge word is still useful and kept", () => {
  assert.equal(parse({ text: "x", glosses: [{ form: "gsi", standard: "", english: "been" }] }).glosses[0].form, "gsi");
});

// ---------------------------------------------------------------------------
// Shape discipline — a chat card that grows without bound is a wall of text.
// ---------------------------------------------------------------------------

test("glosses and suggestions are capped", () => {
  const many = Array.from({ length: 12 }, (_, i) => ({ form: `w${i}`, standard: `s${i}`, english: "x" }));
  const lots = Array.from({ length: 9 }, (_, i) => ({ label: `l${i}`, text: `Hoi ${i}`, english: "hi" }));
  const a = parse({ text: "x", glosses: many, suggestions: lots });
  assert.equal(a.glosses.length, 4);
  assert.equal(a.suggestions.length, 3);
});

test("junk entries are dropped, not rendered as blanks", () => {
  const a = parse({
    text: "x",
    glosses: [null, { standard: "no form" }, { form: "chli", english: "a little" }],
    suggestions: [{ label: "a" }, "nonsense", null],
  });
  assert.equal(a.glosses.length, 1);
  assert.equal(a.suggestions.length, 0);
});

test("optional fields are omitted rather than shipped empty", () => {
  const a = parse({ text: "x" });
  assert.equal(a.note, undefined);
  assert.equal(a.toneNote, undefined);
  assert.equal(a.dialect, undefined);
});

// ---------------------------------------------------------------------------
// Degenerate output. A looping model is fluent, confident and empty — and the
// learner cannot tell, because not understanding is the state they are in.
// ---------------------------------------------------------------------------

test("a looping answer is refused rather than shown", () => {
  // Observed live from a free model asked what a word meant.
  const looped =
    '„verbi" ist ein umgangssprachliches Kurzwort für „verbi" = „verbi" (Kurzform von „verbi" = „verbi").';
  assert.equal(looksDegenerate(looped), true);
  assert.throws(() => parse({ mode: "answer", text: looped }), /looped/);
});

test("ordinary prose that repeats a key term is not mistaken for a loop", () => {
  const fine =
    "Zurich German uses nöd where Standard German uses nicht. The word nöd is simply the local form, and you will hear nöd constantly.";
  assert.equal(looksDegenerate(fine), false, "four mentions of a key term is normal writing");
});

test("a short answer is never judged degenerate", () => {
  // Too little text to tell, and a false positive here costs a real answer.
  assert.equal(looksDegenerate("Ja ja ja ja ja ja."), false);
  assert.equal(looksDegenerate("It means: coming by."), false);
});

test("the model that answered is always recorded", () => {
  // An answer with no provenance is a rumour.
  assert.equal(parse({ text: "x" }).model, "test/model");
});
