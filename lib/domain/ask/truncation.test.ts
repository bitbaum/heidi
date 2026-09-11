import { test } from "node:test";
import assert from "node:assert/strict";
import { extractJson, parseAnswer } from "./parse.ts";
import { ZURICH_GERMAN } from "../../variety/packs/gsw-zh.ts";

/**
 * The model hitting its token ceiling mid-answer. Observed on the first live
 * request: a 90%-written reply became "Heidi could not answer that just now".
 */

test("an answer cut off inside a string still yields what was complete", () => {
  const raw = '{"meaning":"Are you coming?","glosses":[{"form":"chunnsch","english":"come"},{"form":"Abi';
  const data = extractJson(raw) as { meaning: string; glosses: unknown[] };
  assert.equal(data.meaning, "Are you coming?");
  assert.equal(data.glosses.length, 1, "the half-written gloss is dropped, the finished one kept");
});

test("an answer cut off between elements is repaired", () => {
  const raw = '{"meaning":"hi","replies":[{"label":"neutral","text":"Hoi","english":"Hi"},';
  const data = extractJson(raw) as { replies: unknown[] };
  assert.equal(data.replies.length, 1);
});

test("an answer cut off with unclosed nested objects is repaired", () => {
  const raw = '{"meaning":"hi","glosses":[{"form":"a","english":"b"}],"replies":[{"label":"x","text":"y"}';
  const data = extractJson(raw) as { glosses: unknown[]; replies: unknown[] };
  assert.equal(data.glosses.length, 1);
  assert.ok(Array.isArray(data.replies));
});

test("a truncated answer still produces a usable card", () => {
  const raw =
    '{"meaning":"Are you also coming by this evening?","tone":"warm","replies":[{"label":"neutral","text":"Ja, chume gern verbi.","english":"Yes, gladly."},{"label":"cas';
  const a = parseAnswer(raw, ZURICH_GERMAN, "understand", "m");
  assert.equal(a.meaning, "Are you also coming by this evening?");
  assert.equal(a.tone, "warm");
  assert.equal(a.replies.length, 1);
  assert.equal(a.replies[0].clean, true, "and the salvaged reply is still gated");
});

test("valid JSON is never touched by the repair path", () => {
  const raw = '{"meaning":"x","note":"a } and a ] inside a string"}';
  const data = extractJson(raw) as { note: string };
  assert.equal(data.note, "a } and a ] inside a string");
});

test("an escaped quote inside a truncated string does not confuse the scanner", () => {
  const raw = '{"meaning":"she said \\"hoi\\" back","replies":[{"label":"a","text":"b"},{"label":"c';
  const data = extractJson(raw) as { meaning: string; replies: unknown[] };
  assert.equal(data.meaning, 'she said "hoi" back');
  assert.equal(data.replies.length, 1);
});

test("genuinely empty output still fails rather than inventing an answer", () => {
  assert.throws(() => extractJson("I cannot help with that."), /no JSON/);
});
