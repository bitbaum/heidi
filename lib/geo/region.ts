/**
 * Drawing the world, kept apart from describing a dialect.
 *
 * A variety pack says WHERE a dialect is spoken, in longitude and latitude,
 * because that is a fact about the dialect. It does not say how to draw
 * Switzerland, because that is a fact about maps — and a Ukrainian pack would
 * need the same projection over a different outline.
 *
 * So the seam is here: packs carry places, `lib/geo` carries regions and the
 * projection between them. Adding Lesya means adding `regions/ukraine.ts` and
 * nothing else in this directory changes.
 */

export type RegionId = "switzerland";

/** A point on the earth, as a pack states it. */
export type Place = { lon: number; lat: number };

/**
 * An outline plus everything needed to put a place on it.
 *
 * The projection is a Mercator-style one held true at `trueLat`: longitude is
 * linear, latitude is scaled by 1/cos(trueLat) so the country is not squashed.
 * Fine for one country at this size, and it keeps `project` to two
 * multiplications with no dependency.
 */
export type Region = {
  id: RegionId;
  /** English name, for the figure's accessible description. */
  name: string;
  /** viewBox dimensions the outline is drawn in. */
  width: number;
  height: number;
  /** Latitude at which the scaling is exact. */
  trueLat: number;
  /** Real-world coordinates of the outline's north-west corner. */
  origin: Place;
  /** viewBox units per degree of longitude. */
  scale: number;
  /** The outline itself, an SVG path in viewBox units. */
  outline: string;
};

/**
 * A place, in the region's viewBox units.
 *
 * Must stay the inverse of what `scripts/build-region.mjs` did to the border,
 * or cities drift off the country — which is exactly the kind of bug that
 * looks like a design choice. `lib/geo/project.test.ts` pins it by checking
 * known cities land in the right part of the map.
 */
export function project(place: Place, region: Region): { x: number; y: number } {
  const k = 1 / Math.cos((region.trueLat * Math.PI) / 180);
  return {
    x: (place.lon - region.origin.lon) * region.scale,
    y: (region.origin.lat - place.lat) * k * region.scale,
  };
}
