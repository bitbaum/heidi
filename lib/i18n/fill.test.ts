import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { fill } from "./fill.ts";
import { LOCALES } from "./locales.ts";
import { getDictionary } from "./index.ts";

describe("fill", () => {
  test("replaces a placeholder anywhere in the sentence", () => {
    assert.equal(fill("Zeigen Sie mir «{word}» in zwei Sätzen.", { word: "Velo" }), "Zeigen Sie mir «Velo» in zwei Sätzen.");
    assert.equal(fill("{word} — was heisst das?", { word: "Chuchichäschtli" }), "Chuchichäschtli — was heisst das?");
  });

  test("replaces every occurrence, not just the first", () => {
    assert.equal(fill("{w} und nochmals {w}", { w: "a" }), "a und nochmals a");
  });

  test("leaves an unknown placeholder visible rather than blanking it", () => {
    // The whole point: a mismatch has to be obvious to whoever looks at the
    // page. A blank renders as a plausible, slightly odd sentence and survives.
    assert.equal(fill("«{term}» bitte", { word: "Velo" }), "«{term}» bitte");
  });

  test("a template with no placeholder is returned unchanged", () => {
    assert.equal(fill("Nichts zu ersetzen.", { word: "Velo" }), "Nichts zu ersetzen.");
  });
});

describe("every translation keeps the placeholder it is given", () => {
  /**
   * The failure this catches is silent and total: a translator writes the
   * sentence naturally, drops `{word}`, and the message Heidi receives no
   * longer names the word it is about — so the answer is about nothing. It
   * cannot be caught by the type system, because the type of a string that
   * contains `{word}` is `string`.
   */
  const MUST_NAME_THE_WORD: Array<(d: ReturnType<typeof getDictionary>) => string> = [
    (d) => d.vocabulary.askSay,
    (d) => d.grammar.practiseSay,
  ];

  for (const locale of LOCALES) {
    test(locale, () => {
      const dict = getDictionary(locale);
      for (const read of MUST_NAME_THE_WORD) {
        const template = read(dict);
        assert.match(template, /\{word\}/, `"${template}" must contain {word}, or the question names nothing`);
        // And it must actually change when filled — a template that is all
        // placeholder and no sentence is its own kind of broken.
        assert.notEqual(fill(template, { word: "Velo" }), template);
      }
    });
  }
});
