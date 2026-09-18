import { test } from "node:test";
import assert from "node:assert/strict";
import { dayCursor } from "./today.ts";
import { flow } from "./flow.ts";

test("the cursor advances by exactly one per day", () => {
  const noon = Date.UTC(2026, 8, 18, 12, 0, 0);
  assert.equal(dayCursor(noon + 86_400_000) - dayCursor(noon), 1);
});

test("every hour of a day gives the same cursor", () => {
  // The property the daily rotation rests on: the page is revalidated
  // hourly, and a cursor that moved between two revalidations inside one day
  // would reshuffle the picks under a reader who came back after lunch.
  const midnight = Date.UTC(2026, 8, 18, 0, 0, 0);
  const cursors = new Set(Array.from({ length: 24 }, (_, h) => dayCursor(midnight + h * 3_600_000)));
  assert.equal(cursors.size, 1, "the picks change partway through the day");
});

test("it crosses a year boundary without going backwards into the same picks", () => {
  // 31 December and 1 January must not collide. They do not have to be
  // consecutive — the sequence restarts — they just have to differ.
  const dec31 = Date.UTC(2026, 11, 31, 12);
  const jan1 = Date.UTC(2027, 0, 1, 12);
  assert.notEqual(dayCursor(dec31), dayCursor(jan1));
});

test("the picks actually differ from one day to the next", () => {
  // The end of the chain the cursor exists for. A cursor that advanced but
  // landed on the same three sources would be a rotation nobody could see.
  const day = Date.UTC(2026, 8, 18, 12);
  const todays = flow({ inSwitzerland: false }, { take: 3, cursor: dayCursor(day) }).map((s) => s.id);
  const tomorrows = flow({ inSwitzerland: false }, { take: 3, cursor: dayCursor(day + 86_400_000) }).map((s) => s.id);
  assert.notDeepEqual(todays, tomorrows);
});

test("what is offered to a reader we cannot place always plays where they are", () => {
  const picks = flow({ inSwitzerland: false }, { take: 3, cursor: dayCursor(Date.UTC(2026, 8, 18)) });
  assert.ok(picks.length > 0);
  assert.ok(
    picks.every((s) => s.reach === "open"),
    "a geo-blocked source reached the daily picks, where it will read as a broken product",
  );
});
