import type { Region, RegionId } from "../region.ts";
import { SWITZERLAND } from "./switzerland.ts";

/**
 * Every outline the atlas can draw, by id.
 *
 * A pack names a region; this is where that name resolves. Adding Ukraine is
 * `node scripts/build-region.mjs ukraine`, one line in `RegionId`, and one
 * line here — no component changes, which is the test of whether the seam
 * between "a dialect" and "a map" was cut in the right place.
 */
export const REGIONS: Record<RegionId, Region> = {
  switzerland: SWITZERLAND,
};
