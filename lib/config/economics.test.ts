import { test } from "node:test";
import assert from "node:assert/strict";
import { CHURN_RANGE, INPUTS, MARKET, NOT_MODELLED, economics, sensitivity } from "./economics.ts";

/**
 * The data room's rule, applied to the half of it that is a model: a figure
 * without a stated basis is an assertion wearing a decimal point.
 */
test("every assumption says where it came from", () => {
  for (const a of [...MARKET, ...INPUTS]) {
    assert.ok(a.basis.trim().length > 20, `${a.id} has no real basis`);
    assert.ok(a.label.trim().length > 0, `${a.id} has no label`);
    assert.ok(Number.isFinite(a.value), `${a.id} has no value`);
    assert.ok(a.unit.trim().length > 0, `${a.id} has no unit`);
  }
});

test("anything claimed as MEASURED is checkable by the reader", () => {
  // `measured` is the strongest word available here and the only one that
  // implies somebody could catch us. A measured figure with nowhere to check
  // it is the exact shape of the claim this data room refuses to make.
  for (const a of MARKET) {
    if (a.kind !== "measured") continue;
    assert.ok(a.source?.startsWith("https://"), `${a.id} is called measured and names no source`);
  }
});

test("the one input nobody can know is labelled as unknown, not as measured", () => {
  const churn = INPUTS.find((a) => a.id === "monthly-churn");
  assert.ok(churn);
  assert.equal(churn.kind, "assumed", "there are no subscribers to churn");
  assert.match(churn.basis, /no data/i);

  const price = INPUTS.find((a) => a.id === "price");
  assert.equal(price?.kind, "assumed", "nobody has been asked to pay anything");
});

test("the model computes, and agrees with itself", () => {
  const e = economics(8);
  // 12 CHF at 85% margin = 10.20 contribution a month.
  assert.equal(e.contributionPerMonth, 10.2);
  // 8% monthly churn is a 12.5 month expected life.
  assert.equal(e.lifetimeMonths, 12.5);
  assert.equal(e.ltv, 127.5, "10.20 x 12.5");
  assert.equal(e.cacCeiling, 42.5, "a third of LTV, at the 3x target");
  // And the ceiling is earned back in a bit over four months.
  assert.ok(e.paybackMonths > 4 && e.paybackMonths < 4.3, `payback ${e.paybackMonths}`);
});

/**
 * The point of the whole file: CAC is not estimated, it is bounded. We have
 * never spent a franc, so any CAC figure would be invented — but the ceiling
 * it must come in under is arithmetic.
 */
test("CAC is a ceiling derived from LTV, never a number we made up", () => {
  const e = economics(8);
  assert.equal(e.cacCeiling * 3, e.ltv, "the ceiling is exactly LTV over the target ratio");
  assert.ok(!INPUTS.some((a) => a.id.includes("cac")), "there is no CAC input to invent");
});

test("churn is what the business turns on, and the range shows it", () => {
  const rows = sensitivity();
  assert.equal(rows.length, CHURN_RANGE.length);

  const low = rows.find((r) => r.churnPct === 5);
  const high = rows.find((r) => r.churnPct === 12);
  assert.ok(low && high);

  assert.ok(low.ltv > high.ltv * 2, `LTV ${high.ltv} to ${low.ltv} — a factor of more than two`);
  assert.equal(low.ltv, 204, "10.20 over 5%");
  assert.equal(high.ltv, 85, "10.20 over 12%");
});

test("the sensitivity table and the headline run the same arithmetic", () => {
  // Two implementations of one formula is how a deck contradicts its appendix.
  const headline = economics(8);
  const row = sensitivity().find((r) => r.churnPct === 8);
  assert.ok(row);
  const { churnPct, ...same } = row;
  assert.equal(churnPct, 8);
  assert.deepEqual(same, headline);
});

test("zero churn does not produce an infinite customer", () => {
  const e = economics(0);
  assert.ok(Number.isFinite(e.ltv), "an immortal subscriber is a division by zero, not a business");
  assert.equal(e.lifetimeMonths, 0);
});

test("the holes are named, because that is where a model's credibility is", () => {
  assert.ok(NOT_MODELLED.length >= 4);
  const all = NOT_MODELLED.join(" ").toLowerCase();
  assert.match(all, /conversion/, "no paid funnel exists");
  assert.match(all, /cac|acquisition/, "nothing has been spent");
});

/**
 * The sharpest fact in the pitch is the market's COMPOSITION, not its size.
 */
test("the market names the population a German-teaching app cannot help", () => {
  const germans = MARKET.find((a) => a.id === "german-nationals");
  assert.ok(germans, "the largest foreign nationality in Zurich belongs in the model");
  assert.ok(germans.value > 30_000);
  assert.match(germans.basis, /bridge variety/i, "and the reason they are the ideal customer");
});
