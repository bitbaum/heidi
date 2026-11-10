import { test } from "node:test";
import assert from "node:assert/strict";
import { VARIETY } from "../../variety/active.ts";
import { closenessOf, levelOf, sentenceLevel } from "./distance.ts";

const rules = VARIETY.correspondences;
const c = (target: string, bridge: string, mistakenFor?: string) => closenessOf({ target, bridge, mistakenFor }, rules);

test("the three levels a German speaker meets, plus the trap", () => {
  assert.equal(c("Hund", "Hund"), "same");
  assert.equal(c("schlafe", "schlafen"), "close");
  assert.equal(c("au", "auch"), "close", "the ending dropped, not a different word");
  assert.equal(c("no", "noch"), "close");
  assert.equal(c("Chind", "Kind"), "rule", "free once k → ch is known");
  assert.equal(c("nöd", "nicht"), "far");
  assert.equal(c("öppis", "etwas"), "far");
  assert.equal(c("mir", "wir"), "far", "one letter of three is not close");
  assert.equal(c("Estrich", "Dachboden", "Fussbodenbelag"), "trap");
  assert.deepEqual(["same", "close", "rule", "far", "trap"].map((x) => levelOf(x as never)), [1, 1, 2, 3, 3]);
});

test("a sentence is as hard as the share of words German does not give away", () => {
  assert.equal(sentenceLevel("Ich schlafe", "Ich schlafe", rules), 1);
  assert.equal(sentenceLevel("Mir händ nöd gwüsst, öppis z säge", "Wir wussten nicht, etwas zu sagen", rules), 3);
  assert.ok(sentenceLevel("Ich mache das Chind", "Ich mache das Kind", rules) <= 2);
});

test("every word of the pack gets exactly one level, and all three levels are used", () => {
  const levels = new Set(VARIETY.vocabulary!.map((w) => levelOf(closenessOf(w, rules))));
  assert.deepEqual([...levels].sort(), [1, 2, 3]);
});
