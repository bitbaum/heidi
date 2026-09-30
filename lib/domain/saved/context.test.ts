import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { containsWord, sentenceFor, sentenceWith } from "./context.ts";

describe("a kept word's sentence", () => {
  test("is never a sentence the word is not in", () => {
    // The reported card: «däm» over the English request it was kept from.
    const word = { target: "däm", bridge: "diesem", context: "after this set i will go home sleep", savedAt: "2026-09-30T10:00:00Z" };
    assert.equal(sentenceFor(word), undefined);
  });

  test("keeps a context that does contain it", () => {
    const word = { target: "däm", bridge: "diesem", context: "Nach däm Satz gang i hei go schlafe.", savedAt: "2026-09-30T10:00:00Z" };
    assert.equal(sentenceFor(word), word.context);
  });

  test("prefers a generated example, rotating by step", () => {
    const word = { target: "däm", bridge: "diesem", examples: ["A däm Tag.", "Mit däm Velo."], step: 1, savedAt: "2026-09-30T10:00:00Z" };
    assert.equal(sentenceFor(word), "Mit däm Velo.");
  });

  test("matches whole words, ignoring case, accents and punctuation", () => {
    assert.ok(containsWord("Chunnsch hüt au?", "chunnsch"));
    assert.ok(containsWord("Gäll, das isch guet.", "gall"));
    assert.ok(!containsWord("Dämmerig", "däm"));
    assert.ok(containsWord("Wie gahts dir hüt?", "gahts dir"));
  });

  test("is chosen from the candidates in order, skipping ones without the word", () => {
    assert.equal(
      sentenceWith("däm", ["after this set i will go home sleep", "Nach däm Satz gang i hei.", "Däm isch so."]),
      "Nach däm Satz gang i hei.",
    );
    assert.equal(sentenceWith("däm", ["nothing here", undefined]), undefined);
  });
});
