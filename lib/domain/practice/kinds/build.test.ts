import { test } from "node:test";
import assert from "node:assert/strict";
import { SITUATIONS } from "../../../situations/active.ts";
import { buildItems, sameWords, tilesOf, verifyItems } from "./build.ts";

const builds = buildItems(SITUATIONS);
const verifies = verifyItems(SITUATIONS);

test("build: a sentence of 3–9 words, its own words in order, one stranger that does not belong", () => {
  assert.ok(builds.length >= 100, `${builds.length} build items`);
  for (const item of builds) {
    assert.ok(item.words.length >= 3 && item.words.length <= 9, item.id);
    assert.ok(sameWords(tilesOf(item.answer), item.words), item.id);
    for (const extra of item.extra) {
      assert.ok(!item.words.some((w) => w.toLocaleLowerCase("de") === extra.toLocaleLowerCase("de")), `${item.id}: ${extra} is in the line`);
    }
  }
});

test("build: the order is judged; case and the punctuation around a word are not", () => {
  assert.ok(sameWords(["Ja,", "am", "halbi", "drüü."], ["ja", "am", "Halbi", "drüü"]));
  assert.ok(!sameWords(["am", "Ja,", "halbi", "drüü."], ["Ja,", "am", "halbi", "drüü."]));
  assert.ok(!sameWords(["Ja,", "am", "halbi"], ["Ja,", "am", "halbi", "drüü."]));
});

test("verify: about half true, and every false meaning is another line of the same scene", () => {
  assert.ok(verifies.length >= 200);
  const share = verifies.filter((v) => v.correct).length / verifies.length;
  assert.ok(share > 0.35 && share < 0.65, `share true ${share}`);
  for (const v of verifies) {
    if (v.correct) assert.equal(v.meaning, v.truth, v.id);
    else assert.notEqual(v.meaning.trim(), v.truth.trim(), v.id);
  }
});

test("ids are unique, so the model and the schedule see one question each", () => {
  const ids = [...builds, ...verifies].map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
});
