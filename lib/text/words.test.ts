import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { escapeLiteral, saysWord, wordPattern, replaceWord } from "./words.ts";

/**
 * Each case here is a bug one of the five former copies was written to avoid.
 * Keeping them together is the point: the reason the copies drifted is that
 * each one knew about some of these and none knew about all of them.
 */
describe("whole-word matching", () => {
  test("a word is not found inside a longer word", () => {
    // The `si` / `isch` case, named in three of the five original comments.
    assert.equal(saysWord("Das isch guet", "si"), false);
    assert.equal(saysWord("Si händ gseit", "si"), true);
  });

  test("an umlaut is a letter, so the boundary is not `\\w`", () => {
    // With `\w` the boundary falls after "gr", and "grüezi" matches "gr".
    assert.equal(saysWord("grüezi mitenand", "gr"), false);
    assert.equal(saysWord("grüezi mitenand", "grüezi"), true);
  });

  test("case is folded, because a sentence-initial word is the same word", () => {
    // The shipped bug: located case-insensitively, blanked case-sensitively,
    // so the exercise printed its own answer.
    assert.equal(saysWord("Mir händ es gseh", "mir"), true);
    assert.equal(replaceWord("Mir händ es gseh", "mir", "____"), "____ händ es gseh");
  });

  test("a literal form with regex punctuation matches itself and nothing else", () => {
    assert.equal(escapeLiteral("z'spöt"), "z'spöt");
    assert.equal(saysWord("es isch z.spöt", "z.spöt"), true);
    // Unescaped, `.` would match the apostrophe and report a false positive.
    assert.equal(saysWord("es isch z'spöt", "z.spöt"), false);
  });

  test("a form containing a bracket does not throw", () => {
    // Pack and vocabulary data is typed by contributors, not generated.
    assert.doesNotThrow(() => saysWord("was auch immer", "(chunnt"));
    assert.equal(saysWord("was auch immer", "(chunnt"), false);
  });

  test("`i` and `u` cannot be switched off by a caller", () => {
    const p = wordPattern("mir", "g");
    assert.ok(p.flags.includes("i"), "case-insensitivity is not the caller's to drop");
    assert.ok(p.flags.includes("u"), "unicode is not the caller's to drop");
    assert.ok(p.flags.includes("g"), "the caller's own flag survives");
  });

  test("a duplicated flag does not produce an invalid pattern", () => {
    assert.doesNotThrow(() => wordPattern("mir", "gi"));
    assert.equal(wordPattern("mir", "giu").flags.split("").length, new Set(wordPattern("mir", "giu").flags).size);
  });

  test("replacement hits every occurrence, not just the first", () => {
    assert.equal(replaceWord("mir und mir", "mir", "x"), "x und x");
  });
});
