import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_STREAK, touch, view, isoWeek, daysBetween, decodeStreak, withWeekGoal, localDay, MAX_FREEZES } from "./streak.ts";

const run = (days: string[]) => days.reduce((s, d) => touch(s, d), EMPTY_STREAK);

describe("a streak, counted as gain", () => {
  test("consecutive days build a run", () => {
    const s = run(["2026-09-21", "2026-09-22", "2026-09-23"]);
    assert.equal(s.current, 3);
    assert.equal(s.best, 3);
  });

  test("practising twice in a day counts the day once", () => {
    assert.equal(run(["2026-09-21", "2026-09-21", "2026-09-21"]).current, 1);
  });

  test("one missed day is bridged by a freeze, automatically", () => {
    const s = run(["2026-09-21", "2026-09-22", "2026-09-24"]);
    assert.equal(s.current, 3, "the missed 23rd should have been covered");
    assert.equal(s.freezes, 0);
  });

  test("a longer gap starts a new run — and the best is kept", () => {
    const s = run(["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-10"]);
    assert.equal(s.current, 1);
    assert.equal(s.best, 3);
  });

  test("a week in a row earns a freeze, up to the cap", () => {
    const days = Array.from({ length: 21 }, (_, i) => `2026-09-${String(i + 1).padStart(2, "0")}`);
    assert.equal(run(days).freezes, MAX_FREEZES);
  });

  test("an ended run shows as a fresh start, never a loss", () => {
    const s = run(["2026-09-01", "2026-09-02", "2026-09-03"]);
    const v = view(s, "2026-09-20");
    assert.equal(v.current, 0, "an ended run shows 0 — rendered as 'start today'");
    assert.equal(v.best, 3, "and the best run is still shown");
  });

  test("a run is still alive the day after, and with a freeze the day after that", () => {
    const s = run(["2026-09-21", "2026-09-22"]);
    assert.equal(view(s, "2026-09-23").current, 2);
    assert.equal(view(s, "2026-09-24").current, 2, "a freeze is left, so the run still stands");
    assert.equal(view(s, "2026-09-25").current, 0);
  });
});

describe("the weekly goal", () => {
  test("counts days this week, and resets on Monday", () => {
    const s = run(["2026-09-21", "2026-09-23", "2026-09-25"]); // Mon, Wed, Fri
    assert.equal(view(s, "2026-09-25").weekDays, 3);
    assert.equal(view(s, "2026-09-25").weekReached, true, "default goal is 3");
    assert.equal(view(s, "2026-09-28").weekDays, 0, "a new week starts on Monday");
  });

  test("the goal stays within 1-7", () => {
    assert.equal(withWeekGoal(EMPTY_STREAK, 0).weekGoal, 1);
    assert.equal(withWeekGoal(EMPTY_STREAK, 12).weekGoal, 7);
  });
});

describe("calendar arithmetic", () => {
  test("ISO weeks, including the year boundaries", () => {
    assert.equal(isoWeek("2026-09-25"), "2026-W39");
    assert.equal(isoWeek("2026-01-01"), "2026-W01");
    assert.equal(isoWeek("2027-01-01"), "2026-W53");
    assert.equal(isoWeek("2021-01-03"), "2020-W53");
    assert.equal(isoWeek("2021-01-04"), "2021-W01");
  });

  test("days between are calendar days, not hours", () => {
    assert.equal(daysBetween("2026-10-24", "2026-10-26"), 2, "across the autumn clock change");
    assert.equal(daysBetween("2026-12-31", "2027-01-01"), 1);
  });

  test("a local day is the learner's own calendar day", () => {
    assert.equal(localDay(new Date(2026, 8, 25, 23, 59)), "2026-09-25");
  });
});

describe("storage", () => {
  test("round-trips through JSON, as the store writes it", () => {
    const s = run(["2026-09-21", "2026-09-22"]);
    assert.deepEqual(decodeStreak(JSON.stringify(s)), s);
  });

  test("garbage decodes to nothing, never a crash", () => {
    for (const raw of ["", "x", "null", "[]", "{"]) assert.doesNotThrow(() => decodeStreak(raw));
    assert.equal(decodeStreak("x"), null);
  });

  test("nothing stored can reconstruct a history of days", () => {
    // The privacy promise in `history.ts`: no list of dates, ever.
    const s = run(["2026-09-01", "2026-09-02", "2026-09-05", "2026-09-06"]);
    const days = JSON.stringify(s).match(/\d{4}-\d{2}-\d{2}/g) ?? [];
    assert.ok(days.length <= 1, `the stored streak holds ${days.length} dates`);
  });
});
