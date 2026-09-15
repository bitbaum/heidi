import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { areaById, areasOf, isTaught, marksFor } from "./family.ts";
import { ZURICH_GERMAN as PACK } from "./packs/gsw-zh.ts";
import { SOURCES } from "../research/sources.ts";
import { REGIONS } from "../geo/regions/index.ts";
import { project } from "../geo/region.ts";
import { check } from "./check.ts";

/**
 * "There will be a lot of info and we need to ensure it is all correct."
 *
 * Correctness at this scale is not a matter of being careful while writing the
 * data — it is a matter of making carelessness fail the build. These are the
 * assertions that do that.
 */
describe("the dialect areas", () => {
  const areas = areasOf(PACK);

  test("every German-speaking canton is covered exactly once", () => {
    // The list a Swiss reader will check first, and the reason this work
    // started: Graubünden was missing from a map of Switzerland.
    const expected = [
      "AG", "AI", "AR", "BE", "BL", "BS", "FR", "GL", "GR",
      "LU", "NW", "OW", "SG", "SH", "SO", "SZ", "TG", "UR", "VS", "ZG", "ZH",
    ];

    const covered = areas.flatMap((a) => a.cantons);
    assert.deepEqual([...covered].sort(), expected, "a canton is missing, doubled, or misspelled");
  });

  test("Graubünden is there, with a German-speaking town", () => {
    // Named because it is the specific omission that prompted all of this, and
    // a test naming the bug is a test nobody deletes by accident.
    const gr = areas.find((a) => a.cantons.includes("GR"));
    assert.ok(gr, "Graubünden has Alemannic dialects throughout and belongs on any map of Swiss German");
    assert.equal(gr.town, "Chur");
  });

  test("Valais is named after the half that speaks German", () => {
    // Sion is the cantonal capital and French-speaking. Naming a German
    // dialect after a town that does not speak it is the kind of error that
    // looks like a detail and reads to a local as not knowing the country.
    const vs = areas.find((a) => a.cantons.includes("VS"));
    assert.equal(vs?.town, "Brig");
  });

  test("every area names a source that exists", () => {
    // An unsourced claim about where a dialect is spoken is the "science is
    // mostly lip service" complaint, one page over.
    for (const area of areas) {
      assert.ok(area.sources.length > 0, `${area.id} claims to be a dialect area and cites nothing`);
      for (const id of area.sources) {
        assert.ok(id in SOURCES, `${area.id} cites "${id}", which is not in lib/research/sources.ts`);
      }
    }
  });

  test("ids are URL-safe and unique", () => {
    const ids = areas.map((a) => a.id);
    assert.equal(new Set(ids).size, ids.length, "two areas share an id, so one page would shadow the other");
    for (const id of ids) assert.match(id, /^[a-z][a-z0-9-]*$/, `"${id}" is not a usable URL segment`);
  });

  test("every area lands ON the drawing, not off its edge", () => {
    // Projected rather than range-checked in degrees, because the drawing is
    // what a reader sees: a point outside the viewBox is a dot that silently
    // does not appear, which looks like a rendering bug and is a data bug.
    const region = REGIONS[PACK.family!.atlas!.region];
    for (const area of areas) {
      const { x, y } = project(area.place, region);
      assert.ok(x >= 0 && x <= region.width, `${area.id} falls off the map horizontally (x=${x.toFixed(1)})`);
      assert.ok(y >= 0 && y <= region.height, `${area.id} falls off the map vertically (y=${y.toFixed(1)})`);
    }
  });

  test("no two areas sit on the same point", () => {
    // Two dots in one place is one dot, and the reader silently loses an area.
    const seen = new Set(areas.map((a) => `${a.place.lon},${a.place.lat}`));
    assert.equal(seen.size, areas.length);
  });

  test("exactly one area is the one Heidi teaches", () => {
    const taught = areas.filter((a) => isTaught(PACK, a));
    assert.equal(taught.length, 1);
    assert.equal(taught[0].cantons[0], "ZH");
  });

  test("an endonym is real dialect, and passes our own gate", () => {
    // These are the names on the page. If Heidi's own checker rejects the name
    // of a dialect Heidi is describing, one of the two is wrong.
    for (const area of areas) {
      assert.ok(area.endonym.trim(), `${area.id} has no endonym`);
      const verdict = check(area.endonym, PACK);
      assert.equal(verdict.ok, true, `${area.endonym} — ${verdict.findings.map((f) => f.form).join(", ")}`);
    }
  });
});

describe("marks are read from the gate, never listed twice", () => {
  test("an area with rules shows exactly what the checker enforces", () => {
    const bern = areaById(PACK, "baerndueuetsch")!;
    const marks = marksFor(PACK, bern);

    assert.ok(marks.length > 0);
    for (const mark of marks) {
      // The claim on the page and the behaviour of the checker are the same
      // fact: their form is refused, ours is not.
      assert.equal(check(mark.theirs, PACK).ok, false, `${mark.theirs} is shown as Bernese but the gate allows it`);
      assert.equal(check(mark.ours, PACK).ok, true, `${mark.ours} is offered as the Zurich form and the gate refuses it`);
    }
  });

  test("an area the gate cannot place yet shows nothing, rather than something invented", () => {
    // The honest state of "we have not written those rules". A page that filled
    // the gap with plausible forms would be the exact failure the dialect gate
    // exists to prevent, committed by us instead of by a model.
    const gr = areaById(PACK, "buendnerdueuetsch")!;
    assert.deepEqual(marksFor(PACK, gr), []);
  });

  test("a pattern rule is never printed at a reader", () => {
    // A RegExp rule would render as `(?<!\\p{L})tüü?tsch(?!\\p{L})`, which is
    // what `VarietyRule.display` was added to stop happening on the method page.
    for (const area of areasOf(PACK)) {
      for (const mark of marksFor(PACK, area)) {
        assert.ok(!/[\\[\](){}?*+^$|]/.test(mark.theirs), `${mark.theirs} looks like a pattern, not a word`);
      }
    }
  });

  test("an unknown id is undefined rather than a crash", () => {
    assert.equal(areaById(PACK, "atlantis"), undefined);
  });
});
