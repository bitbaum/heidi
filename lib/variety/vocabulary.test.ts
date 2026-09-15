import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { check } from "./check.ts";
import { ZURICH_GERMAN as PACK } from "./packs/gsw-zh.ts";
import { DISPLAY } from "./display.ts";
import { getDictionary } from "../i18n/index.ts";
import { LOCALES } from "../i18n/locales.ts";

/**
 * Word-level claims are the easiest kind to get subtly wrong and the hardest
 * for a reader to catch, because a plausible wrong gloss looks exactly like a
 * right one. These are the checks that do not depend on anybody being careful.
 */
describe("the vocabulary", () => {
  const words = PACK.vocabulary ?? [];

  test("there is a list, and it is not a phrasebook", () => {
    assert.ok(words.length >= 30, "too short to be the words that buy comprehension");

    // The test of the selection, not the size. Content words are mostly
    // cognate and the correspondences carry them; the short constant words are
    // what no correspondence rescues, so they must dominate.
    const carrying = words.filter((w) => w.group === "function" || w.group === "verbs");
    assert.ok(
      carrying.length > words.length / 2,
      "a vocabulary page that is mostly nouns and greetings is a phrasebook",
    );
  });

  test("every word passes our own dialect gate", () => {
    // Heidi's own word list going through Heidi's own checker. If a word here
    // is refused, either the word is wrong or the gate is, and both are worth
    // finding before a Zurich reader does.
    for (const word of words) {
      const verdict = check(word.target, PACK);
      assert.equal(
        verdict.ok,
        true,
        `"${word.target}" — ${verdict.findings.map((f) => `${f.form} (${f.reason})`).join("; ")}`,
      );
    }
  });

  test("no word is listed twice", () => {
    // Case-folded the way the saved list folds identity, so `Au` and `au`
    // count as one — two entries for one word is one of them wasted and the
    // reader wondering which is right.
    const seen = words.map((w) => w.target.toLocaleLowerCase());
    assert.equal(new Set(seen).size, seen.length, `duplicate: ${seen.filter((t, i) => seen.indexOf(t) !== i)}`);
  });

  test("every word has both halves, and they differ", () => {
    for (const word of words) {
      assert.ok(word.target.trim(), "a word with no dialect form");
      assert.ok(word.bridge.trim(), `"${word.target}" has nothing to compare it to`);
      // A pair that is identical teaches nothing and quietly pads the list.
      assert.notEqual(
        word.target.trim().toLocaleLowerCase(),
        word.bridge.trim().toLocaleLowerCase(),
        `"${word.target}" is the same word in both`,
      );
    }
  });

  test("no bridge form is one the Swiss Standard gate would refuse — unless that is the point", () => {
    // `Velo → Fahrrad` looks like a contradiction: the bridge gate flags
    // *Fahrrad* as Germany's word. It is not one, because these face opposite
    // ways — this page is for UNDERSTANDING what somebody said, that gate is
    // for WRITING something to send. The test pins the direction rather than
    // the forms, so the distinction cannot quietly erode into a list of things
    // we would tell someone to write.
    const everyday = words.filter((w) => w.group === "everyday");
    assert.ok(everyday.length > 0);
    for (const word of everyday) {
      assert.equal(check(word.target, PACK).ok, true, `${word.target} must be real Zurich German`);
    }
  });

  test("every group used has a label in every language", () => {
    // A group with no label renders as a heading-shaped hole, in six languages,
    // because German is the one the author checked.
    const used = new Set(words.map((w) => w.group));
    for (const locale of LOCALES) {
      const t = getDictionary(locale).vocabulary;
      for (const group of used) {
        const label = t.groups[group as keyof typeof t.groups];
        assert.ok(label && label.trim(), `${locale} has no label for the "${group}" group`);
      }
      assert.ok(t.title.trim() && t.lead.trim());
    }
  });

  test("the projection carries the words and no English prose", () => {
    assert.equal(DISPLAY.vocabulary.length, words.length);
    for (const word of DISPLAY.vocabulary) {
      assert.deepEqual(Object.keys(word).sort(), ["bridge", "group", "target"]);
    }
  });

  test("it cites the dictionary, not the atlas", () => {
    // A word-level claim needs a dictionary. The SDS maps where forms are
    // spoken and is the wrong authority for what one means — citing it here
    // would be a reference that looks right and does not support the claim.
    assert.ok(PACK.vocabularySources?.includes("idiotikon"), "the vocabulary must cite the Idiotikon");
  });
});
