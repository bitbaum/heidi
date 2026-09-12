import { test } from "node:test";
import assert from "node:assert/strict";
import { project } from "./region.ts";
import { SWITZERLAND } from "./regions/switzerland.ts";

/**
 * The projection here must stay the inverse of the one in
 * `scripts/build-region.mjs`. If the two drift apart, cities slide off the
 * country — and a map with Zurich in Lake Constance does not look like a bug,
 * it looks like a deliberate abstract figure. So it is pinned by geography a
 * reader would notice: which cities are north of which, and how far east.
 */

const CITIES = {
  Genève: { lon: 6.1432, lat: 46.2044 },
  Basel: { lon: 7.5886, lat: 47.5596 },
  Bern: { lon: 7.4474, lat: 46.948 },
  Zürich: { lon: 8.5417, lat: 47.3769 },
  Luzern: { lon: 8.3093, lat: 47.0502 },
  "St. Gallen": { lon: 9.3767, lat: 47.4245 },
  Chur: { lon: 9.5329, lat: 46.8499 },
  Lugano: { lon: 8.9511, lat: 46.0037 },
};

const at = (name: keyof typeof CITIES) => project(CITIES[name], SWITZERLAND);

test("every city lands inside the outline's box", () => {
  for (const [name, place] of Object.entries(CITIES)) {
    const { x, y } = project(place, SWITZERLAND);
    assert.ok(x > 0 && x < SWITZERLAND.width, `${name} x=${x} outside 0..${SWITZERLAND.width}`);
    assert.ok(y > 0 && y < SWITZERLAND.height, `${name} y=${y} outside 0..${SWITZERLAND.height}`);
  }
});

test("north is up and east is right", () => {
  // Basel is the northern city, Lugano the southern one.
  assert.ok(at("Basel").y < at("Zürich").y, "Basel is north of Zurich");
  assert.ok(at("Lugano").y > at("Luzern").y, "Lugano is south of Lucerne");
  // Geneva is the western tip, St. Gallen and Chur the eastern side.
  assert.ok(at("Genève").x < at("Bern").x, "Geneva is west of Bern");
  assert.ok(at("Bern").x < at("Zürich").x, "Bern is west of Zurich");
  assert.ok(at("Zürich").x < at("St. Gallen").x, "Zurich is west of St. Gallen");
});

test("the aspect ratio is Switzerland's, not a square", () => {
  // ~348km east-west by ~220km north-south.
  const ratio = SWITZERLAND.width / SWITZERLAND.height;
  assert.ok(ratio > 1.45 && ratio < 1.7, `aspect ${ratio.toFixed(2)} is not Switzerland-shaped`);
});

test("Geneva sits in the south-west corner, where the country actually ends", () => {
  // The single strongest check that the projection did not flip or offset:
  // Geneva is the extreme west AND well south of the northern border.
  const geneva = at("Genève");
  assert.ok(geneva.x < SWITZERLAND.width * 0.12, "Geneva should be in the western tenth");
  assert.ok(geneva.y > SWITZERLAND.height * 0.6, "Geneva should be in the southern half");
});

test("the outline is a closed path in viewBox units", () => {
  assert.match(SWITZERLAND.outline, /^M[\d.]+ [\d.]+L/, "starts with a move then a line");
  assert.match(SWITZERLAND.outline, /Z$/, "is closed");
  assert.ok(SWITZERLAND.outline.length > 1000, "is not a degenerate two-point collapse");
});
