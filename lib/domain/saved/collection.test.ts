import { test } from "node:test";
import assert from "node:assert/strict";
import { add, decode, has, identity, isKeepable, oldestFirst, remove } from "./collection.ts";
import { EMPTY, MAX_WORDS, SAVED_VERSION, type SavedCollection } from "./types.ts";

const word = (target: string, bridge = "Kommst du", savedAt = "2026-09-12T10:00:00.000Z") => ({
  target,
  bridge,
  savedAt,
});

test("a saved word is kept, newest first", () => {
  const one = add(EMPTY, word("Chunnsch"));
  const two = add(one, word("verbi", "vorbeikommen"));
  assert.deepEqual(
    two.words.map((w) => w.target),
    ["verbi", "Chunnsch"],
  );
});

test("saving the same word twice keeps one copy and the ORIGINAL date", () => {
  // The learner pressed save because they were not sure it had worked. The
  // honest answer is that it had — not a second copy, and not a reset clock
  // that erases how long they have been carrying the word.
  const first = add(EMPTY, word("Chunnsch", "Kommst du", "2026-01-01T00:00:00.000Z"));
  const again = add(first, word("Chunnsch", "Kommst du", "2026-09-12T00:00:00.000Z"));
  assert.equal(again.words.length, 1);
  assert.equal(again.words[0].savedAt, "2026-01-01T00:00:00.000Z");
});

test("the same word in different case is the same word", () => {
  // Saved from the start of a sentence and again from the middle.
  const first = add(EMPTY, word("Chunnsch"));
  const again = add(first, word("chunnsch"));
  assert.equal(again.words.length, 1);
});

test("accents are NOT folded away", () => {
  // The whole lesson in some pairs is that one vowel became another. Folding
  // them together would collapse the distinction being taught.
  assert.notEqual(identity({ target: "gäu" }), identity({ target: "gau" }));
});

test("a pasted paragraph is not a vocabulary item", () => {
  assert.equal(isKeepable({ target: "x".repeat(200), bridge: "y" }), false);
  assert.equal(add(EMPTY, word("x".repeat(200))).words.length, 0);
});

test("a word with no meaning is not kept", () => {
  assert.equal(add(EMPTY, word("Chunnsch", "")).words.length, 0);
  assert.equal(add(EMPTY, word("", "Kommst du")).words.length, 0);
});

test("the list is capped, and the OLDEST fall off", () => {
  let c: SavedCollection = EMPTY;
  for (let i = 0; i < MAX_WORDS + 10; i++) {
    c = add(c, word(`w${i}`, `m${i}`, new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString()));
  }
  assert.equal(c.words.length, MAX_WORDS);
  // Newest first, so the survivors are the most recently added.
  assert.equal(c.words[0].target, `w${MAX_WORDS + 9}`);
  assert.equal(has(c, "w0"), false, "the very first word should have fallen off");
});

test("removing takes the word out regardless of case", () => {
  const c = add(add(EMPTY, word("Chunnsch")), word("verbi", "vorbeikommen"));
  const after = remove(c, "CHUNNSCH");
  assert.deepEqual(
    after.words.map((w) => w.target),
    ["verbi"],
  );
});

test("context is kept when there is one and omitted when there is not", () => {
  const withCtx = add(EMPTY, { ...word("Chunnsch"), context: "Chunnsch au no verbi?" });
  assert.equal(withCtx.words[0].context, "Chunnsch au no verbi?");
  const blank = add(EMPTY, { ...word("verbi", "vorbei"), context: "   " });
  assert.equal("context" in blank.words[0], false, "whitespace is not context");
});

test("an unknown version reads as ABSENT rather than being coerced", () => {
  // The decision that matters for every future schema change: old data lives
  // in browsers we cannot reach, and an empty list is recoverable while a
  // half-parsed one teaches the learner the feature is broken.
  const future = JSON.stringify({ version: 99, words: [word("Chunnsch")] });
  assert.equal(decode(future), null);
});

test("decode refuses entries that are not words", () => {
  const dirty = JSON.stringify({
    version: SAVED_VERSION,
    words: [
      word("Chunnsch"),
      { target: "broken" }, // no bridge, no date
      { target: 42, bridge: "x", savedAt: "2026-01-01T00:00:00.000Z" },
      null,
    ],
  });
  const out = decode(dirty);
  assert.deepEqual(out?.words.map((w) => w.target), ["Chunnsch"]);
});

test("decode de-duplicates storage someone edited by hand", () => {
  const dirty = JSON.stringify({
    version: SAVED_VERSION,
    words: [word("Chunnsch"), word("chunnsch")],
  });
  assert.equal(decode(dirty)?.words.length, 1);
});

test("decode survives anything that is not JSON", () => {
  assert.equal(decode("not json at all"), null);
  assert.equal(decode("null"), null);
  assert.equal(decode("[]"), null);
});

test("a decoded collection round-trips through add", () => {
  const stored = JSON.stringify(add(EMPTY, word("Chunnsch")));
  const back = decode(stored);
  assert.ok(back);
  assert.equal(has(back, "Chunnsch"), true);
});

test("revision order is oldest first, which is not storage order", () => {
  let c = add(EMPTY, word("first", "a", "2026-01-01T00:00:00.000Z"));
  c = add(c, word("second", "b", "2026-06-01T00:00:00.000Z"));
  assert.deepEqual(c.words.map((w) => w.target), ["second", "first"]);
  assert.deepEqual(oldestFirst(c).map((w) => w.target), ["first", "second"]);
});
