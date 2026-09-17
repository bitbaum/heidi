import { test } from "node:test";
import assert from "node:assert/strict";
import { isLive, nextSitting, nextSittings, wallClockIn, zonedToUtc, DEFAULT_TIME_ZONE } from "./schedule.ts";

const ZURICH = DEFAULT_TIME_ZONE;

/**
 * The dates are real and the offsets are definitional, not copied from what
 * this code happens to print. Switzerland moves its clocks on the last Sunday
 * in March and the last Sunday in October; CET is UTC+1 and CEST is UTC+2. In
 * 2026 that is 29 March and 25 October.
 *
 * Asserting against the code's own output would make these tests a recording
 * of the current behaviour, which is exactly the test that cannot catch the
 * bug it was written for.
 */

test("a wall clock in Zurich is read in Zurich, not in UTC", () => {
  // 18:00 UTC in January is 19:00 in Zurich (CET, UTC+1).
  const winter = wallClockIn(new Date("2026-01-20T18:00:00.000Z"), ZURICH);
  assert.deepEqual(winter, { year: 2026, month: 1, day: 20, hour: 19, minute: 0 });

  // 17:00 UTC in July is 19:00 in Zurich (CEST, UTC+2).
  const summer = wallClockIn(new Date("2026-07-21T17:00:00.000Z"), ZURICH);
  assert.deepEqual(summer, { year: 2026, month: 7, day: 21, hour: 19, minute: 0 });
});

test("a Zurich wall clock converts to the right instant on both sides of the changeover", () => {
  const winter = zonedToUtc({ year: 2026, month: 3, day: 24, hour: 19, minute: 0 }, ZURICH);
  assert.equal(winter.toISOString(), "2026-03-24T18:00:00.000Z", "19:00 CET is 18:00 UTC");

  const summer = zonedToUtc({ year: 2026, month: 3, day: 31, hour: 19, minute: 0 }, ZURICH);
  assert.equal(summer.toISOString(), "2026-03-31T17:00:00.000Z", "19:00 CEST is 17:00 UTC");
});

test("the hour that does not exist resolves forward instead of throwing", () => {
  // 29 March 2026, 02:30 in Zurich never happens — the clocks jump 02:00 to
  // 03:00. Somebody scheduling a round must not meet a stack trace for it.
  const missing = zonedToUtc({ year: 2026, month: 3, day: 29, hour: 2, minute: 30 }, ZURICH);
  assert.ok(!Number.isNaN(missing.getTime()), "it resolves to some real instant");
  assert.equal(missing.toISOString(), "2026-03-29T01:30:00.000Z", "which is the moment 03:30 CEST names");
});

test("SPRING FORWARD: a weekly round keeps its wall-clock time, so the interval is not seven days", () => {
  const round = { startsAt: "2026-03-24T18:00:00.000Z", cadence: "weekly" as const, timeZone: ZURICH };
  // Tuesday 24 March, 19:00 Zurich. The next sitting is Tuesday 31 March,
  // still 19:00 Zurich — but the clocks moved on the 29th.
  const next = nextSitting(round, new Date("2026-03-25T00:00:00.000Z"));
  assert.ok(next);
  assert.equal(next.toISOString(), "2026-03-31T17:00:00.000Z");
  assert.deepEqual(wallClockIn(next, ZURICH), { year: 2026, month: 3, day: 31, hour: 19, minute: 0 });

  // Naive arithmetic would have produced this, and an empty room.
  const naive = new Date(Date.parse(round.startsAt) + 7 * 24 * 3600 * 1000);
  assert.notEqual(next.toISOString(), naive.toISOString(), "adding a week of milliseconds is the bug");
  assert.equal(wallClockIn(naive, ZURICH).hour, 20, "it would have moved the round to 20:00");
});

test("FALL BACK: the same invariant in the other direction", () => {
  const round = { startsAt: "2026-10-20T17:00:00.000Z", cadence: "weekly" as const, timeZone: ZURICH };
  // Tuesday 20 October, 19:00 Zurich (CEST). Clocks go back on the 25th.
  const next = nextSitting(round, new Date("2026-10-21T00:00:00.000Z"));
  assert.ok(next);
  assert.equal(next.toISOString(), "2026-10-27T18:00:00.000Z");
  assert.deepEqual(wallClockIn(next, ZURICH), { year: 2026, month: 10, day: 27, hour: 19, minute: 0 });
});

test("every sitting of a year-long weekly round reads 19:00 in Zurich", () => {
  const round = { startsAt: "2026-01-06T18:00:00.000Z", cadence: "weekly" as const, timeZone: ZURICH };
  const sittings = nextSittings(round, new Date("2026-01-06T00:00:00.000Z"), 52);
  assert.equal(sittings.length, 52);
  for (const sitting of sittings) {
    const wall = wallClockIn(sitting.at, ZURICH);
    assert.equal(wall.hour, 19, `sitting ${sitting.index} drifted to ${wall.hour}:00`);
    assert.equal(wall.minute, 0);
  }
  // And they are still Tuesdays, a year and two changeovers later.
  for (const sitting of sittings) {
    assert.equal(sitting.at.getUTCDay(), 2, "every sitting is a Tuesday");
  }
});

test("fortnightly steps a fortnight", () => {
  const round = { startsAt: "2026-05-05T17:00:00.000Z", cadence: "fortnightly" as const, timeZone: ZURICH };
  const [a, b] = nextSittings(round, new Date("2026-05-05T00:00:00.000Z"), 2);
  assert.equal(a.at.toISOString(), "2026-05-05T17:00:00.000Z");
  assert.equal(b.at.toISOString(), "2026-05-19T17:00:00.000Z");
});

test("a one-off that has happened has no next sitting", () => {
  const round = { startsAt: "2026-02-10T18:00:00.000Z", cadence: "once" as const, timeZone: ZURICH };
  assert.equal(nextSitting(round, new Date("2026-02-09T00:00:00.000Z"))?.toISOString(), "2026-02-10T18:00:00.000Z");
  assert.equal(nextSitting(round, new Date("2026-02-11T00:00:00.000Z")), null, "it is over, and says so");
  assert.deepEqual(nextSittings(round, new Date("2026-02-11T00:00:00.000Z"), 3), []);
});

test("a weekly round abandoned three years ago still answers quickly and correctly", () => {
  const round = { startsAt: "2023-01-03T18:00:00.000Z", cadence: "weekly" as const, timeZone: ZURICH };
  const started = Date.now();
  const next = nextSitting(round, new Date("2026-09-17T12:00:00.000Z"));
  assert.ok(next);
  assert.ok(next.getTime() >= Date.parse("2026-09-17T12:00:00.000Z"), "the next sitting is in the future");
  assert.ok(next.getTime() < Date.parse("2026-09-25T00:00:00.000Z"), "and within the week");
  assert.equal(wallClockIn(next, ZURICH).hour, 19, "still 19:00 after three years of changeovers");
  assert.ok(Date.now() - started < 200, "and it did not step 190 weeks to get there");
});

test("the sitting index counts repeats from the first one ever", () => {
  const round = { startsAt: "2026-06-02T17:00:00.000Z", cadence: "weekly" as const, timeZone: ZURICH };
  const [first] = nextSittings(round, new Date("2026-06-01T00:00:00.000Z"), 1);
  assert.equal(first.index, 0);
  const [later] = nextSittings(round, new Date("2026-06-23T00:00:00.000Z"), 1);
  assert.equal(later.index, 3, "fourth sitting");
  assert.equal(later.at.toISOString(), "2026-06-23T17:00:00.000Z");
});

test("a round is joinable a little before it starts and until it ends", () => {
  const round = {
    startsAt: "2026-06-02T17:00:00.000Z",
    cadence: "weekly" as const,
    timeZone: ZURICH,
    durationMinutes: 60,
  };
  assert.equal(isLive(round, new Date("2026-06-02T16:30:00.000Z")), false, "half an hour early is not live");
  assert.equal(isLive(round, new Date("2026-06-02T16:55:00.000Z")), true, "five minutes early is");
  assert.equal(isLive(round, new Date("2026-06-02T17:30:00.000Z")), true, "during it");
  assert.equal(isLive(round, new Date("2026-06-02T18:30:00.000Z")), false, "after it ends");
  assert.equal(isLive(round, new Date("2026-06-05T12:00:00.000Z")), false, "and not on a day it does not sit");
});

test("a corrupt start date is answered with nothing rather than a crash", () => {
  const round = { startsAt: "not a date", cadence: "weekly" as const, timeZone: ZURICH };
  assert.deepEqual(nextSittings(round, new Date("2026-01-01T00:00:00.000Z"), 3), []);
  assert.equal(nextSitting(round, new Date("2026-01-01T00:00:00.000Z")), null);
});
