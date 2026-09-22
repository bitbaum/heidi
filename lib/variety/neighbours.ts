import type { DisplayArea } from "./display.ts";

/**
 * Where an area sits among the others — derived, never asserted.
 *
 * WHY THIS FILE EXISTS. A dialect page was reported as too thin, and it is:
 * for Wallisertitsch it shows a branch, one diagnostic pair, a television
 * programme, and then "Heidi cannot yet recognise this dialect by specific
 * forms." That last line is HONEST — there are no Walliser rules in the gate —
 * and the temptation it creates is the most dangerous one available to this
 * product: to write some plausible dialect facts and cite the atlas generally.
 *
 * So nothing here is a new claim about any dialect. Every value below is
 * COMPUTED from data the pack already vouches for: which branch an area
 * belongs to, which cantons it covers, and where its reference town is. A
 * reader gets substantially more page and we assert nothing new, which is the
 * only trade this repo is allowed to make.
 *
 * WHAT IT ANSWERS, and these are real learner questions the site could not
 * answer before:
 *
 *   "What else sounds like this?"      — the branch siblings
 *   "How far is this from what I
 *    am learning?"                     — kilometres, and they are a real
 *                                        proxy: the Alemannic dialect
 *                                        landscape is a continuum, so
 *                                        distance and difficulty track each
 *                                        other more closely here than they
 *                                        would between two national languages
 *   "If this one is too hard, where
 *    should I go instead?"             — the nearest area that Heidi can
 *                                        actually recognise forms from
 */

/** Mean Earth radius in kilometres. */
const EARTH_KM = 6371;

/**
 * Great-circle distance between two towns, in kilometres.
 *
 * Haversine rather than a flat approximation — not because the error matters
 * over 200km of Switzerland (it does not), but because the flat version needs
 * a latitude correction that somebody always forgets, and then Valais quietly
 * reads as closer than Bern.
 */
export function distanceKm(a: { lon: number; lat: number }, b: { lon: number; lat: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(EARTH_KM * 2 * Math.asin(Math.sqrt(h)));
}

export type Neighbour = {
  area: DisplayArea;
  km: number;
  /** True when this one shares the subject area's Alemannic branch. */
  sameBranch: boolean;
};

/**
 * The areas closest to this one, nearest first.
 *
 * `limit` is three because this is a sidebar fact and not a list to study: a
 * reader wants "and what is next door", not a ranked table of eleven.
 *
 * An area with no `group` is never reported as sharing a branch — absent is an
 * answer in this data (`DialectArea.group` says so), and treating it as a
 * match would turn "we did not classify this" into "these two are related".
 */
export function neighboursOf(area: DisplayArea, all: readonly DisplayArea[], limit = 3): Neighbour[] {
  return all
    .filter((other) => other.id !== area.id)
    .map((other) => ({
      area: other,
      km: distanceKm(area.place, other.place),
      sameBranch: Boolean(area.group) && other.group === area.group,
    }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

/**
 * The other areas in the same Alemannic branch, wherever they are.
 *
 * Distinct from `neighboursOf` on purpose, and the two disagree usefully:
 * Wallisertitsch is a long way from Glarus and shares its branch with it,
 * while Aargau is close to Zurich and in the same branch — so "near" and
 * "sounds related" are two different answers to two different questions, and a
 * page that collapsed them would be telling a learner that geography is
 * dialectology.
 */
export function branchSiblings(area: DisplayArea, all: readonly DisplayArea[]): DisplayArea[] {
  if (!area.group) return [];
  return all.filter((other) => other.id !== area.id && other.group === area.group);
}

/**
 * The nearest area whose forms Heidi can actually recognise.
 *
 * THE POINT OF THE WHOLE FILE. A page that says "no forms for this dialect
 * yet" is a dead end, and a dead end on a reference page is where a reader
 * leaves. This turns it into a direction: Wallisertitsch has nothing in the
 * gate, and the nearest area that does is a real next step rather than an
 * apology.
 *
 * Undefined when nothing qualifies, which is a state the page must render —
 * a deployment whose pack has no rules with an origin has no answer here and
 * should say nothing rather than point somewhere arbitrary.
 */
export function nearestRecognised(area: DisplayArea, all: readonly DisplayArea[]): Neighbour | undefined {
  return all
    .filter((other) => other.id !== area.id && other.marks.length > 0)
    .map((other) => ({
      area: other,
      km: distanceKm(area.place, other.place),
      sameBranch: Boolean(area.group) && other.group === area.group,
    }))
    .sort((a, b) => a.km - b.km)[0];
}
