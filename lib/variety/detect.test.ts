import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readDialect, CONSISTENT_AT } from "./detect.ts";
import { ZURICH_GERMAN as PACK } from "./packs/gsw-zh.ts";

describe("reading where a message comes from", () => {
  test("a Zurich message with several taught forms reads as consistent, with meanings", () => {
    const r = readDialect("Ich chume hüt nöd, ich han no öppis z tue.", PACK);
    assert.equal(r.verdict, "consistent");
    assert.equal(r.origins.length, 0);
    const nod = r.known.find((k) => k.form === "nöd");
    assert.equal(nod?.bridge, "nicht");
    assert.ok(r.known.length >= CONSISTENT_AT);
  });

  test("a Bernese form points to Bern and links the area", () => {
    const r = readDialect("Ig ha gseit, wosch?", PACK);
    assert.equal(r.verdict, "area");
    assert.equal(r.lead?.origin, "Bern");
    assert.equal(r.lead?.areaId, "baerndueuetsch");
    assert.equal(r.lead?.forms.length, 2);
    assert.equal(r.lead?.forms.find((f) => f.form === "wosch")?.suggest, "wotsch");
  });

  test("Germany's German reads as outside the family, not as a canton", () => {
    const r = readDialect("Ich komme mit dem Fahrrad und bringe Sahne mit.", PACK);
    assert.equal(r.verdict, "outside");
    assert.equal(r.lead?.origin, "Germany");
    assert.equal(r.lead?.areaId, undefined);
  });

  test("an area outranks an outside origin — the more specific answer", () => {
    const r = readDialect("Wosch, i nimm s Fahrrad.", PACK);
    assert.equal(r.verdict, "area");
    assert.equal(r.lead?.origin, "Bern");
    assert.deepEqual(r.origins.map((o) => o.origin).sort(), ["Bern", "Germany"]);
  });

  test("too little to go on is unclear, never a confident Zurich", () => {
    assert.equal(readDialect("Hallo", PACK).verdict, "unclear");
    assert.equal(readDialect("nöd", PACK).verdict, "unclear");
    assert.equal(readDialect("", PACK).verdict, "unclear");
  });

  test("one word is one piece of evidence", () => {
    // A form flagged as foreign is not also counted as a taught form, and a
    // taught form is found once however many entries could match it.
    const r = readDialect("wosch wosch", PACK);
    assert.equal(r.known.length, 0);
    const indexes = readDialect("nöd nöd", PACK).known.map((k) => k.index);
    assert.equal(new Set(indexes).size, indexes.length);
  });

  test("a pack with no areas still answers, without inventing one", () => {
    const bare = { ...PACK, family: undefined };
    const r = readDialect("Wosch es?", bare);
    assert.equal(r.verdict, "outside");
    assert.equal(r.lead?.areaId, undefined);
  });
});

describe("the markers a reader is most likely to meet", () => {
  // One real-looking message per area. If a marker is removed from the pack,
  // the reading goes back to "unclear" and this says which one.
  const cases: [string, string][] = [
    ["Dr Giel und ds Meitschi hei Miuch gno.", "Bern"],
    ["Mir nämme s Drämmli, d Kuchi isch no nit fertig.", "Basel"],
  ];
  for (const [text, origin] of cases) {
    test(`${origin}: "${text}"`, () => {
      const r = readDialect(text, PACK);
      assert.equal(r.verdict, "area");
      assert.equal(r.lead?.origin, origin);
    });
  }
});

test("a listed form counts, with its own meaning; a form spelled like German does not", () => {
  const r = readDialect("Mir sind müed, er isch dehei.", PACK);
  assert.equal(r.known.find((k) => k.form === "isch")?.bridge, "ist");
  assert.equal(r.known.find((k) => k.form === "sind"), undefined);
});
