import { test } from "node:test";
import assert from "node:assert/strict";
import { VARIETY } from "../../variety/active.ts";
import { guessable, nextWords, rankWords, wordStatus, type WordStatus } from "./rank.ts";

const rules = [{ rule: "k → ch" }, { rule: "st → sch" }, { rule: "au → uu" }, { rule: "u → ue" }];
const word = (target: string, bridge: string, extra: Partial<{ group: string; mistakenFor: string }> = {}) => ({
  target,
  bridge,
  group: extra.group ?? "function",
  ...(extra.mistakenFor ? { mistakenFor: extra.mistakenFor } : {}),
});

test("a word the German gives away is guessable, one it does not is not", () => {
  assert.equal(guessable(word("schlafe", "schlafen"), rules), true);
  assert.equal(guessable(word("Chind", "Kind"), rules), true, "k → ch makes it free");
  assert.equal(guessable(word("grad", "gerade, sofort"), rules), false);
  assert.equal(guessable(word("nöd", "nicht"), rules), false);
  assert.equal(guessable(word("mir", "wir"), rules), false, "one letter of three is not close");
});

test("every gloss is tried, and a trap is never guessable", () => {
  assert.equal(guessable(word("ume", "herum, hinüber"), rules), false);
  assert.equal(guessable(word("scho", "bereits, schon"), rules), true);
  assert.equal(guessable(word("Estrich", "Estrich", { mistakenFor: "Fussbodenbelag" }), rules), false);
});

test("heard often first, guessable last, traps first among equals", () => {
  const words = [
    word("schlafe", "schlafen"),
    word("Estrich", "Dachboden", { group: "helvetisms", mistakenFor: "Fussbodenbelag" }),
    word("nöd", "nicht"),
    word("gäng", "immer"),
    word("mir", "wir"),
  ];
  const heard: Record<string, number> = { nöd: 15, mir: 17, schlafe: 30 };
  const ranked = rankWords(words, { heard: (t) => heard[t] ?? 0, correspondences: rules, groupOrder: ["function", "helvetisms"] });
  assert.deepEqual(
    ranked.map((r) => r.word.target),
    ["mir", "nöd", "Estrich", "gäng", "schlafe"],
  );
  assert.equal(ranked.at(-1)!.guessable, true);
});

test("status reads the model and the kept words, and stores nothing", () => {
  const model = { words: { nöd: { asked: 5, missed: 0 }, au: { asked: 2, missed: 1 } } };
  const saved = [{ target: "scho", step: 0 }, { target: "gäng", step: 3 }];
  assert.equal(wordStatus("nöd", model, saved), "known");
  assert.equal(wordStatus("au", model, saved), "learning");
  assert.equal(wordStatus("scho", model, saved), "learning", "kept is learning");
  assert.equal(wordStatus("gäng", model, saved), "known", "kept and remembered across a gap");
  assert.equal(wordStatus("öppis", model, saved), "new");
});

test("the next words skip what is known and what cannot be practised", () => {
  const ranked = ["a", "b", "c", "d"].map((t) => ({ word: { target: t }, practisable: t !== "c" }));
  const status = (t: string): WordStatus => (t === "a" ? "known" : "new");
  assert.deepEqual(nextWords(ranked, status, 2), ["b", "d"]);
});

test("on the real pack, the first words to learn are not ones German gives away", () => {
  const ranked = rankWords(VARIETY.vocabulary ?? [], {
    heard: () => 0,
    correspondences: VARIETY.correspondences,
    groupOrder: ["function"],
  });
  const guessed = ranked.filter((r) => r.guessable).map((r) => r.word.target);
  assert.ok(guessed.includes("schlafe") && guessed.includes("Chind"));
  assert.ok(!guessed.includes("nöd") && !guessed.includes("mir"));
  // A rule that marked most of the list as free would be ranking nothing.
  assert.ok(guessed.length < ranked.length / 3, `${guessed.length} of ${ranked.length} guessable`);
});
