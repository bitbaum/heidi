import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { distance, explains, parseRule, patternsIn } from "./patterns.ts";
import { DISPLAY } from "../../variety/display.ts";
import type { SavedWord } from "./types.ts";

const word = (target: string, bridge: string): SavedWord => ({
  target,
  bridge,
  savedAt: "2026-09-01T00:00:00.000Z",
});

describe("the patterns in someone's own words", () => {
  test("every parseable rule in the pack describes its OWN example pair", () => {
    // The guard on the whole feature. These rules are written by hand as
    // display strings, and a rule that stops describing its example is a
    // pattern that silently matches nothing — a panel that is empty for
    // everyone, forever, with no error anywhere.
    let checked = 0;
    for (const c of DISPLAY.correspondences) {
      const sub = parseRule(c.rule);
      if (!sub) continue;
      checked += 1;
      assert.ok(
        explains({ target: c.target, bridge: c.bridge }, sub),
        `"${c.rule}" does not explain its own example ${c.bridge} → ${c.target}`,
      );
    }
    assert.ok(checked >= 4, "the pack should carry several parseable correspondences");
  });

  test("a rule is split on its arrow, and nonsense is skipped rather than guessed", () => {
    assert.deepEqual(parseRule("k → ch"), { from: "k", to: "ch" });
    assert.deepEqual(parseRule("  st  →  sch  "), { from: "st", to: "sch" });
    assert.equal(parseRule("something about vowels"), null);
    assert.equal(parseRule("a → a"), null, "a rule that changes nothing is not a rule");
    assert.equal(parseRule("→ ch"), null);
    assert.equal(parseRule("a → b → c"), null);
  });

  test("a correspondence matches the word it explains", () => {
    assert.equal(explains(word("Chind", "Kind"), { from: "k", to: "ch" }), true);
    assert.equal(explains(word("isch", "ist"), { from: "st", to: "sch" }), true);
    assert.equal(explains(word("Huus", "Haus"), { from: "au", to: "uu" }), true);
  });

  test("and NOT a word that merely contains the letter", () => {
    // The reason this is a substitution test rather than `bridge.includes(from)`:
    // that would match every word with a k in it, most of which demonstrate
    // nothing, and the panel would claim a pattern from noise.
    // Kafi/Kaffee keeps its k — the difference between the forms is the ending,
    // so swapping k for ch moves it further away, not closer.
    assert.equal(explains(word("Kafi", "Kaffee"), { from: "k", to: "ch" }), false);
    assert.equal(explains(word("Velo", "Fahrrad"), { from: "k", to: "ch" }), false);

    // And the opposite check, so this test cannot pass by the function simply
    // being broken: Küche/Chuchi IS a k → ch word and must be found.
    assert.equal(explains(word("Chuchi", "Küche"), { from: "k", to: "ch" }), true);
  });

  test("a word missing either half explains nothing", () => {
    assert.equal(explains(word("", "Kind"), { from: "k", to: "ch" }), false);
    assert.equal(explains(word("Chind", "   "), { from: "k", to: "ch" }), false);
  });

  test("one word is a coincidence; two is a pattern", () => {
    const kch = DISPLAY.correspondences.find((c) => c.rule === "k → ch")!;

    const one = patternsIn([word("Chind", "Kind")], [kch]);
    assert.equal(one.length, 0, "a thing that caught you once is not what keeps catching you");

    const two = patternsIn([word("Chind", "Kind"), word("Chalt", "kalt")], [kch]);
    assert.equal(two.length, 1);
    assert.deepEqual(two[0].words.map((w) => w.target), ["Chind", "Chalt"]);
  });

  test("the commonest pattern comes first", () => {
    const words = [
      word("Chind", "Kind"),
      word("Chalt", "kalt"),
      word("Chopf", "Kopf"),
      word("isch", "ist"),
      word("bisch", "bist"),
    ];
    const ranked = patternsIn(words, DISPLAY.correspondences);
    assert.equal(ranked[0].correspondence.rule, "k → ch");
    assert.equal(ranked[0].words.length, 3);
    assert.ok(ranked.some((p) => p.correspondence.rule === "st → sch"));
  });

  test("an empty list produces no claims", () => {
    assert.deepEqual(patternsIn([], DISPLAY.correspondences), []);
  });

  test("distance is a real edit distance", () => {
    assert.equal(distance("chind", "chind"), 0);
    assert.equal(distance("", "abc"), 3);
    assert.equal(distance("abc", ""), 3);
    assert.equal(distance("kind", "chind"), 2, "k→ch is one substitution plus one insertion");
  });
});
