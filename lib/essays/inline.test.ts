import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { inline, isInternal } from "./inline.ts";

describe("the inline syntax essays are written in", () => {
  test("plain prose comes back as one span", () => {
    assert.deepEqual(inline("Zurich German has no standard spelling."), [
      { kind: "text", text: "Zurich German has no standard spelling." },
    ]);
  });

  test("a link keeps its label and its target apart", () => {
    assert.deepEqual(inline("see [the method](/de/method) for why"), [
      { kind: "text", text: "see " },
      { kind: "link", text: "the method", href: "/de/method" },
      { kind: "text", text: " for why" },
    ]);
  });

  test("forms and emphasis are different things and stay different", () => {
    assert.deepEqual(inline("Basel says `Kind`, and that is **the** line"), [
      { kind: "text", text: "Basel says " },
      { kind: "form", text: "Kind" },
      { kind: "text", text: ", and that is " },
      { kind: "strong", text: "the" },
      { kind: "text", text: " line" },
    ]);
  });

  /**
   * The ordering bug this pins. Three separate passes would let the emphasis
   * rule eat the asterisks around a link and leave the brackets behind, which
   * publishes as literal `[label](url)` in the middle of a sentence.
   */
  test("a link inside emphasis survives both", () => {
    assert.deepEqual(inline("**[Idiotikon](https://idiotikon.ch)**"), [
      { kind: "strong", text: "[Idiotikon](https://idiotikon.ch)" },
    ]);
  });

  test("an unclosed marker stays literal rather than swallowing the rest", () => {
    assert.deepEqual(inline("a lone ** and a lone ` are just characters"), [
      { kind: "text", text: "a lone ** and a lone ` are just characters" },
    ]);
  });

  test("markers at the very edges lose nothing", () => {
    assert.deepEqual(inline("`Chind`"), [{ kind: "form", text: "Chind" }]);
    assert.deepEqual(inline("**both** ends `here`"), [
      { kind: "strong", text: "both" },
      { kind: "text", text: " ends " },
      { kind: "form", text: "here" },
    ]);
  });

  test("an internal link is the one the router owns", () => {
    assert.equal(isInternal("/de/dialect"), true);
    assert.equal(isInternal("https://idiotikon.ch"), false);
    assert.equal(isInternal("mailto:hoi@heidi.ch"), false);
  });
});

/**
 * The one hard-coded slug on the site.
 *
 * `/dialect` hands its hardest question — why a country this size has this
 * many dialects — to a specific essay, by slug. Every other link between pages
 * goes through `ROUTES`, so this is the single place a rename becomes a 404,
 * and it would be a 404 on the most-linked reference page here.
 */
describe("the essay the dialect page points at", () => {
  test("exists, and is readable in the default locale", async () => {
    const { essayBySlug } = await import("./registry.ts");
    const slug = "warum-die-schweiz-ihre-mundarten-behalten-hat";
    const served = essayBySlug(slug, "de");
    assert.ok(served, `/dialect links to "${slug}", which is not a published essay`);
    assert.equal(served.got, "de", "the piece the dialect page leans on should exist in German");
  });
});
