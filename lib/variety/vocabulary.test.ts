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

/**
 * The detail a word can carry beyond its gloss — and the rules that keep it
 * from becoming the place where this product starts inventing language.
 *
 * An article, a paradigm and an example sentence are all CLAIMS ABOUT THE
 * LANGUAGE, which is a different kind of statement from a target/bridge pair
 * and needs its own guarantees. §6's whole argument is that the learner cannot
 * audit any of them: somebody told that *Velo* is masculine has no way to find
 * out otherwise, and will say it wrong for a year.
 */
describe("what a word says beyond its meaning", () => {
  const words = PACK.vocabulary ?? [];

  test("an article is one of the variety's three, never a German one", () => {
    // `der` here would be a German article presented as a Zurich one — the
    // invisible error the whole product is built around.
    for (const word of words) {
      if (!word.article) continue;
      assert.ok(
        ["de", "d", "s"].includes(word.article),
        `${word.target} claims the article "${word.article}", which this variety does not have`,
      );
    }
  });

  test("every claim about the language names who vouches for it", () => {
    /**
     * The rule that makes it safe to add more. A bare target/bridge pair
     * inherits the pack's `vocabularySources`; an article, a paradigm or an
     * example is a further assertion, and this repo does not publish an
     * assertion about the language that names nobody.
     */
    for (const word of words) {
      const claims = Boolean(word.article || word.forms?.length || word.example);
      if (!claims) continue;
      assert.ok(
        word.source && word.source.trim().length > 0,
        `${word.target} carries an article, forms or an example and cites no source`,
      );
    }
  });

  test("an example sentence passes the variety gate", () => {
    // It is generated dialect reaching a learner, so it faces the same checker
    // every generated line faces. An example carrying a Bernese form would
    // teach the exact thing the gate exists to prevent, from the reference
    // page rather than from a model.
    for (const word of words) {
      if (!word.example) continue;
      const verdict = check(word.example.target, PACK);
      assert.equal(verdict.ok, true, `${word.target}'s example is flagged: ${verdict.findings.map((f) => f.form).join(", ")}`);
    }
  });

  test("an example actually contains the word it illustrates", () => {
    // An example that does not use the word is a sentence, not an example —
    // and this is the kind of thing that survives review because it reads well.
    for (const word of words) {
      if (!word.example) continue;
      assert.match(
        word.example.target.toLowerCase(),
        new RegExp(word.target.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `${word.target}'s example does not contain it`,
      );
    }
  });

  test("a form is not the same string as the headword", () => {
    // A paradigm row identical to the lemma teaches nothing and usually means
    // the row was filled in to make the table look complete.
    for (const word of words) {
      for (const form of word.forms ?? []) {
        assert.notEqual(
          form.target.toLowerCase(),
          word.target.toLowerCase(),
          `${word.target} lists a form identical to itself (${form.label})`,
        );
        assert.ok(form.bridge.trim().length > 0, `${word.target}'s ${form.label} has no bridge form`);
      }
    }
  });

  test("no word claims the same form label twice", () => {
    for (const word of words) {
      const labels = (word.forms ?? []).map((f) => f.label);
      assert.equal(new Set(labels).size, labels.length, `${word.target} repeats a form label`);
    }
  });
});
