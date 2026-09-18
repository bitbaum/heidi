import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_PROGRESS, localDay, progressFrom, spokenMinutes } from "./progress.ts";
import type { Take } from "./take.ts";

const ZURICH = "Europe/Zurich";

function take(at: string, speechMs = 5000): Take {
  return {
    id: at,
    at,
    delivery: {
      totalMs: speechMs + 2000,
      speechMs,
      pauseMs: 2000,
      pauseCount: 2,
      longestPauseMs: 900,
      runCount: 3,
      meanRunMs: 1200,
      phonationRatio: 0.7,
      clippedRatio: 0,
      problems: [],
    },
    said: "",
    roundId: null,
    topicId: null,
  };
}

test("nothing recorded is zero, not a missing number", () => {
  assert.deepEqual(progressFrom([], ZURICH), EMPTY_PROGRESS);
});

test("several takes in one sitting are ONE day of speaking", () => {
  // Counting them separately would reward re-recording the same sentence over
  // coming back tomorrow, which is the opposite of what the number is for.
  const sitting = [
    take("2026-09-18T19:00:00Z"),
    take("2026-09-18T19:04:00Z"),
    take("2026-09-18T19:11:00Z"),
  ];
  const progress = progressFrom(sitting, ZURICH);
  assert.equal(progress.daysSpoken, 1);
  assert.equal(progress.takes, 3);
});

/**
 * THE ONE THAT DEFINES THE FEATURE.
 *
 * If this ever fails, somebody has turned the count into a streak — and the
 * header of `progress.ts` is the argument for why that is not a small change.
 */
test("A GAP COSTS NOTHING: days spoken never falls", () => {
  const before = [take("2026-08-01T10:00:00Z"), take("2026-08-02T10:00:00Z"), take("2026-08-03T10:00:00Z")];
  assert.equal(progressFrom(before, ZURICH).daysSpoken, 3);

  // A month away, then one take. A streak would now read 1.
  const after = [...before, take("2026-09-18T10:00:00Z")];
  assert.equal(progressFrom(after, ZURICH).daysSpoken, 4, "returning after a month must ADD to the number, not reset it");
});

test("days are local days, so a late-evening take does not land on tomorrow", () => {
  // 23:30 in Zurich is 21:30 UTC in summer. Counting in UTC would be right
  // here by luck; the case that matters is the one just after midnight.
  const lateEvening = take("2026-07-14T21:30:00Z"); // 23:30 Zurich, the 14th
  const justAfter = take("2026-07-14T22:30:00Z"); // 00:30 Zurich, the 15th
  const progress = progressFrom([lateEvening, justAfter], ZURICH);
  assert.equal(progress.daysSpoken, 2, "two calendar days in Zurich, whatever UTC thinks");
  assert.equal(progress.lastDay, "2026-07-15");
});

test("the same two instants are ONE day in a zone where they do not straddle midnight", () => {
  // The same input, a different zone, a different answer — which is the whole
  // reason the zone is a parameter rather than whatever the runtime is set to.
  const progress = progressFrom([take("2026-07-14T21:30:00Z"), take("2026-07-14T22:30:00Z")], "UTC");
  assert.equal(progress.daysSpoken, 1);
});

test("time spoken is phonation, not time with the recorder open", () => {
  // `totalMs` includes deciding what to say. Reporting that as practice would
  // inflate the one number a learner might quote to somebody else.
  const progress = progressFrom([take("2026-09-18T10:00:00Z", 30_000)], ZURICH);
  assert.equal(progress.spokenMs, 30_000, "not 32000");
});

test("a broken take contributes nothing rather than destroying the total", () => {
  const good = take("2026-09-18T10:00:00Z", 20_000);
  const broken = take("2026-09-18T11:00:00Z", Number.NaN);
  const progress = progressFrom([good, broken], ZURICH);
  assert.equal(progress.spokenMs, 20_000, "NaN must not swallow the sum");
  assert.equal(progress.takes, 2, "it is still a take that happened");
});

test("an unparseable timestamp does not count as a day", () => {
  const progress = progressFrom([take("not a date"), take("2026-09-18T10:00:00Z")], ZURICH);
  assert.equal(progress.daysSpoken, 1);
  assert.equal(localDay("not a date", ZURICH), null);
});

test("minutes round DOWN, so a half-minute take is not reported as one", () => {
  assert.equal(spokenMinutes({ ...EMPTY_PROGRESS, spokenMs: 30_000 }), 0);
  assert.equal(spokenMinutes({ ...EMPTY_PROGRESS, spokenMs: 119_000 }), 1);
  assert.equal(spokenMinutes({ ...EMPTY_PROGRESS, spokenMs: 120_000 }), 2);
});

test("an unknown zone degrades to a date rather than throwing", () => {
  // A settings page that crashes is worse than one that is an hour out at
  // midnight for somebody who has corrupted their own stored zone.
  assert.equal(localDay("2026-09-18T10:00:00Z", "Mars/Olympus"), "2026-09-18");
});
