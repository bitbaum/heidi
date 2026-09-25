import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { DISPLAY } from "./display.ts";
import { branchSiblings, distanceKm, nearestRecognised, neighboursOf } from "./neighbours.ts";

/**
 * Derivations, checked against distances anybody can verify on a map.
 *
 * The whole point of this module is that it adds page without adding claims,
 * so the tests are about the arithmetic being right rather than about a
 * dialect fact being true — there are no new dialect facts to be wrong about.
 */
describe("where an area sits among the others", () => {
  const areas = DISPLAY.areas;
  const find = (id: string) => {
    const area = areas.find((a) => a.id === id);
    assert.ok(area, `${id} missing from the pack`);
    return area;
  };

  test("distance matches the map", () => {
    const zurich = find("zueriduetsch");
    const bern = find("baerndueuetsch");
    const basel = find("baseldytsch");

    // Zurich–Bern is about 95km as the crow flies, Zurich–Basel about 75km.
    // Generous bands: this asserts the formula is not wrong by a factor, not
    // that somebody typed the coordinates to four decimal places.
    const zhBe = distanceKm(zurich.place, bern.place);
    const zhBs = distanceKm(zurich.place, basel.place);
    assert.ok(zhBe > 80 && zhBe < 110, `Zurich–Bern came out at ${zhBe}km`);
    assert.ok(zhBs > 60 && zhBs < 90, `Zurich–Basel came out at ${zhBs}km`);

    // And the order is the thing a reader would notice being wrong.
    assert.ok(zhBs < zhBe, "Basel should be nearer to Zurich than Bern is");
  });

  test("distance is symmetric and zero to itself", () => {
    const a = find("zueriduetsch");
    const b = find("wallisertitsch");
    assert.equal(distanceKm(a.place, b.place), distanceKm(b.place, a.place));
    assert.equal(distanceKm(a.place, a.place), 0);
  });

  test("an area is never its own neighbour", () => {
    for (const area of areas) {
      for (const neighbour of neighboursOf(area, areas)) {
        assert.notEqual(neighbour.area.id, area.id, `${area.id} is listed next to itself`);
      }
      assert.ok(!branchSiblings(area, areas).some((s) => s.id === area.id));
    }
  });

  test("neighbours come back nearest first", () => {
    for (const area of areas) {
      const km = neighboursOf(area, areas).map((n) => n.km);
      assert.deepEqual(km, [...km].sort((a, b) => a - b), `${area.id} neighbours out of order`);
    }
  });

  test("an unclassified area shares a branch with nobody", () => {
    /**
     * `group` is absent where an area genuinely spans two branches, and the
     * pack's own comment says absent is an answer rather than a hole. Treating
     * two absences as a match would turn "we did not classify this" into
     * "these two are related" — a dialect claim invented by a `===`.
     */
    for (const area of areas.filter((a) => !a.group)) {
      assert.deepEqual(branchSiblings(area, areas), []);
      assert.ok(!neighboursOf(area, areas).some((n) => n.sameBranch));
    }
  });

  test("the nearest recognised area is one Heidi actually has forms for", () => {
    const walliser = find("wallisertitsch");
    assert.equal(walliser.marks.length, 0, "this test is about an area with no forms");

    const nearest = nearestRecognised(walliser, areas);
    assert.ok(nearest, "somewhere in this pack has forms");
    assert.ok(nearest.area.marks.length > 0, "pointed at an area with nothing in the gate");
  });
});
