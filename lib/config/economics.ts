/**
 * The unit-economics model, and the word MODEL is doing all the work.
 *
 * `investors.ts` holds METRICS: things true today that a reader can check by
 * opening something. This file holds the opposite kind of number — nothing
 * here has happened. Heidi has no users, no revenue and has never spent a
 * franc on acquisition, so an LTV printed as a fact would be the single
 * fastest way to tell an investor what every other number in the room is
 * worth.
 *
 * So the two are separate files and render as separate sections, and every
 * input below carries where it came from. The discipline is the same one
 * `Metric.verify` enforces: a figure without a stated basis is an assertion
 * wearing a decimal point.
 *
 * WHAT THIS IS ACTUALLY FOR. Not to claim a return. To show which number the
 * business turns on — and it is churn, by a wide margin — and to convert the
 * one figure nobody can know yet into something useful: a CEILING. We cannot
 * say what acquisition will cost. We can say exactly what it must come in
 * under, which is a testable target rather than a hopeful one.
 *
 * EVERY DERIVED NUMBER IS COMPUTED HERE, never typed. A hardcoded LTV is a
 * number that stops agreeing with its own inputs the first time one changes,
 * and the person who notices is the one you were pitching.
 */

/** How much weight a number can bear. */
export type Basis = "measured" | "comparable" | "assumed";

export type Assumption = {
  id: string;
  label: string;
  value: number;
  unit: string;
  kind: Basis;
  /** Where the number came from. Required — see the header. */
  basis: string;
  /** A URL where a reader can check it, when one exists. */
  source?: string;
};

/**
 * The market, anchored on a published count rather than a total-addressable
 * rectangle.
 *
 * The sharpest fact in the pitch is the composition rather than the size: the
 * largest single foreign nationality in the city of Zurich is GERMAN. Those
 * people arrive with the bridge variety already fluent and still cannot follow
 * the lunch table — they are §2's trap in person, and they are the hardest
 * group for a generic language app to serve, because every such app assumes
 * the thing they are missing is German.
 */
export const MARKET: readonly Assumption[] = [
  {
    id: "city-residents",
    label: "Residents, city of Zurich",
    value: 452_421,
    unit: "people",
    kind: "measured",
    basis: "City of Zurich population at end of 2025.",
    source: "https://www.thelocal.ch/20260206/what-we-know-about-zurichs-population-of-foreign-residents-in-2026",
  },
  {
    id: "foreign-share",
    label: "Foreign nationals, city of Zurich",
    value: 33.9,
    unit: "%",
    kind: "measured",
    basis: "Share of the city's population without a Swiss passport, end of 2025.",
    source: "https://www.thelocal.ch/20260206/what-we-know-about-zurichs-population-of-foreign-residents-in-2026",
  },
  {
    id: "german-nationals",
    label: "German nationals in the city",
    value: 32_600,
    unit: "people",
    kind: "measured",
    basis:
      "The largest single foreign nationality in Zurich. They arrive with the bridge variety fluent and still cannot follow the dialect, which is the exact population a German-teaching app cannot help.",
    source: "https://www.thelocal.ch/20260206/what-we-know-about-zurichs-population-of-foreign-residents-in-2026",
  },
];

/**
 * The inputs. Three of the four have never been tested, and they say so.
 */
export const INPUTS: readonly Assumption[] = [
  {
    id: "price",
    label: "Price",
    value: 12,
    unit: "CHF / month",
    kind: "assumed",
    basis:
      "Chosen, not tested. Nobody has been asked to pay anything and there is no pricing page. Swiss consumer subscriptions carry more than EU equivalents; this sits deliberately below what a single hour of tutoring costs here.",
  },
  {
    id: "gross-margin",
    label: "Gross margin",
    value: 85,
    unit: "%",
    kind: "measured",
    basis:
      "Marginal cost per active learner is dominated by model calls, and HEIDI.md §9 records one measured at roughly five hundredths of a rappen. Hosting is a shared box, not per-tenant. 85% is deliberately below what the measurement implies, to leave room for the paid models a scaled product would need.",
  },
  {
    id: "monthly-churn",
    label: "Monthly churn",
    value: 8,
    unit: "%",
    kind: "assumed",
    basis:
      "No data whatsoever — there are no subscribers to churn. This is the input the whole model turns on, which is why the sensitivity range is published beside the headline rather than in an appendix.",
  },
  {
    id: "target-ratio",
    label: "Target LTV to CAC",
    value: 3,
    unit: "x",
    kind: "comparable",
    basis: "The conventional floor for a consumer subscription business. A convention, not a finding.",
  },
];

const value = (list: readonly Assumption[], id: string): number => {
  const found = list.find((a) => a.id === id);
  if (!found) throw new Error(`no assumption ${id}`);
  return found.value;
};

export type Economics = {
  /** Monthly revenue per subscriber, after cost of serving them. */
  contributionPerMonth: number;
  /** Expected months a subscriber stays, at the modelled churn. */
  lifetimeMonths: number;
  /** Contribution over that lifetime. */
  ltv: number;
  /** What acquisition must cost at most, to hit the target ratio. */
  cacCeiling: number;
  /** Months to earn that ceiling back. */
  paybackMonths: number;
};

const round = (n: number): number => Math.round(n * 100) / 100;

/**
 * The model, computed from the inputs above.
 *
 * `churnPct` is a parameter so the sensitivity table calls the same arithmetic
 * the headline does. Two implementations of one formula is how a pitch deck
 * comes to contradict its own appendix.
 */
export function economics(churnPct = value(INPUTS, "monthly-churn")): Economics {
  const price = value(INPUTS, "price");
  const margin = value(INPUTS, "gross-margin") / 100;
  const ratio = value(INPUTS, "target-ratio");
  const churn = churnPct / 100;

  const contributionPerMonth = price * margin;
  const lifetimeMonths = churn > 0 ? 1 / churn : 0;
  const ltv = contributionPerMonth * lifetimeMonths;
  const cacCeiling = ratio > 0 ? ltv / ratio : 0;

  return {
    contributionPerMonth: round(contributionPerMonth),
    lifetimeMonths: round(lifetimeMonths),
    ltv: round(ltv),
    cacCeiling: round(cacCeiling),
    paybackMonths: contributionPerMonth > 0 ? round(cacCeiling / contributionPerMonth) : 0,
  };
}

/**
 * The churn rates worth showing, because the honest headline is a range.
 *
 * Published beside the single number rather than instead of it: one figure
 * invites the reader to believe it, and three invite them to ask which one we
 * think we can hit — which is the conversation actually worth having.
 */
export const CHURN_RANGE: readonly number[] = [5, 8, 12];

export function sensitivity(): Array<{ churnPct: number } & Economics> {
  return CHURN_RANGE.map((churnPct) => ({ churnPct, ...economics(churnPct) }));
}

/**
 * What is NOT modelled, named so a reader does not have to work out what is
 * missing.
 *
 * A model's credibility comes from its stated holes far more than from its
 * arithmetic, and every one of these would move the answer.
 */
export const NOT_MODELLED: readonly string[] = [
  "Free-to-paid conversion: there is no paid tier, so no funnel and no rate.",
  "Acquisition channel: nothing has been spent, so CAC is a ceiling here and not an estimate.",
  "Expansion revenue: no second product, no seats, no upsell.",
  "Group and institutional pricing, which is the likeliest real route and is unpriced.",
  "The cost of the recorded-speaker corpus §7 argues for, which is a capital cost and not a per-user one.",
];
