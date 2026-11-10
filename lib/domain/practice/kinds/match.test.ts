import { test } from "node:test";
import assert from "node:assert/strict";
import { VARIETY } from "../../../variety/active.ts";
import { closenessOf, levelOf } from "../../vocabulary/distance.ts";
import { matchItems } from "./vocabulary.ts";

test("no grid is answered by the shape of its words", () => {
  // Walked through on 2026-11-09: «bringe, finde, frage, rede» against
  // «bringen, finden, fragen, reden» — four times "add an n", solved without
  // knowing one word. A grid holds at least two the German does not give away.
  const level = new Map((VARIETY.vocabulary ?? []).map((w) => [w.target.trim(), levelOf(closenessOf(w, VARIETY.correspondences))]));
  const grids = matchItems(VARIETY);
  assert.ok(grids.length > 0);
  for (const grid of grids) {
    const hard = grid.targets.filter((t) => level.get(t) !== 1).length;
    assert.ok(hard >= 2, `${grid.id}: ${grid.targets.join(", ")}`);
  }
});

test("no grid offers the same meaning twice", () => {
  for (const grid of matchItems(VARIETY)) {
    assert.equal(new Set(grid.bridges.map((b) => b.toLocaleLowerCase("de"))).size, grid.bridges.length, `${grid.id}: ${grid.bridges.join(", ")}`);
  }
});
