import { test } from "node:test";
import assert from "node:assert/strict";
import { hesitations, MAX_HESITATIONS, NOTABLE_PAUSE_MS } from "./hesitation.ts";
import { MIN_PAUSE_MS } from "./pause.ts";

const w = (word: string, start: number, end: number) => ({ word, start, end });

test("the word after a long gap is named, because it is usually the one being reached for", () => {
  const take = [w("Ich", 0, 0.2), w("hätte", 0.25, 0.5), w("gern", 0.55, 0.8), w("einen", 0.85, 1.1), w("Termin", 2.9, 3.3)];
  assert.deepEqual(hesitations(take), [{ before: "Termin", index: 4, ms: 1800 }]);
});

test("an ordinary breath is not pointed at", () => {
  // A pause counts from MIN_PAUSE_MS; pointing at every one would list half the sentence.
  const take = [w("Guten", 0, 0.3), w("Tag", 0.3 + (MIN_PAUSE_MS + 50) / 1000, 1)];
  assert.deepEqual(hesitations(take), []);
});

test("the threshold is exactly NOTABLE_PAUSE_MS, not one off", () => {
  const at = [w("a", 0, 1), w("b", 1 + NOTABLE_PAUSE_MS / 1000, 2)];
  const under = [w("a", 0, 1), w("b", 1 + (NOTABLE_PAUSE_MS - 10) / 1000, 2)];
  assert.equal(hesitations(at).length, 1);
  assert.equal(hesitations(under).length, 0);
});

test("silence before the first word is finding the button, not searching for a word", () => {
  assert.deepEqual(hesitations([w("Hallo", 3, 3.4)]), []);
});

test("only the longest few are kept, and they read in sentence order", () => {
  const take = [
    w("a", 0, 0.1),
    w("b", 1.1, 1.2), // 1000
    w("c", 3.2, 3.3), // 2000
    w("d", 4.1, 4.2), // 800
    w("e", 7.2, 7.3), // 3000
    w("f", 8.8, 8.9), // 1500
  ];
  const found = hesitations(take);
  assert.equal(found.length, MAX_HESITATIONS);
  assert.deepEqual(
    found.map((h) => h.before),
    ["c", "e", "f"],
    "the three longest (2000, 3000, 1500), in the order they were said",
  );
});

test("no words, one word, or nothing notable is an empty list, never a score", () => {
  assert.deepEqual(hesitations([]), []);
  assert.deepEqual(hesitations([w("Ja", 0, 0.3)]), []);
});
