import { test } from "node:test";
import assert from "node:assert/strict";
import { decideReminder, MAX_UNHEARD, MIN_DUE, type ReminderFacts } from "./reminder-policy.ts";

// 18:00 in Zurich on 2026-11-10 (winter: UTC+1) is 17:00Z.
const NOW = new Date("2026-11-10T17:00:00Z");
const base: ReminderFacts = {
  reminders: true,
  emailVerified: true,
  deliverable: true,
  tz: "Europe/Zurich",
  accountCreatedAt: new Date("2026-10-01T10:00:00Z"),
  due: 8,
  lastActiveAt: new Date("2026-11-08T17:00:00Z"),
  lastReminderAt: null,
  unheard: 0,
  now: NOW,
};
const why = (f: Partial<ReminderFacts>) => {
  const v = decideReminder({ ...base, ...f });
  return v.send ? "send" : v.why;
};

test("a person who asked, with enough due, on their evening, is written to", () => {
  assert.equal(why({}), "send");
});

test("every rule errs toward silence", () => {
  assert.equal(why({ reminders: false }), "off");
  assert.equal(why({ emailVerified: false }), "unverified");
  assert.equal(why({ deliverable: false }), "undeliverable");
  assert.equal(why({ accountCreatedAt: new Date("2026-11-10T08:00:00Z") }), "new");
  assert.equal(why({ now: new Date("2026-11-10T16:00:00Z") }), "hour");
  assert.equal(why({ due: MIN_DUE - 1 }), "few");
  assert.equal(why({ due: MIN_DUE }), "send");
});

test("the hour is theirs, not the server's", () => {
  // 18:00 in Tokyo (UTC+9) is 09:00Z; the same instant is 10:00 in Zurich.
  const tokyo = new Date("2026-11-10T09:00:00Z");
  assert.equal(why({ tz: "Asia/Tokyo", now: tokyo }), "send");
  assert.equal(why({ tz: "Europe/Zurich", now: tokyo }), "hour");
  // A time zone nobody has falls back to UTC rather than failing.
  const utcEvening = new Date("2026-11-10T18:00:00Z");
  assert.equal(why({ tz: "Mars/Olympus", now: utcEvening }), "send");
  assert.equal(why({ tz: null, now: utcEvening }), "send");
});

test("never more often than every other day", () => {
  assert.equal(why({ lastReminderAt: new Date("2026-11-09T17:00:00Z") }), "recent");
  assert.equal(why({ lastReminderAt: new Date("2026-11-08T17:00:00Z"), lastActiveAt: new Date("2026-11-09T09:00:00Z") }), "send");
});

test("not if they have already practised today, in their own day", () => {
  assert.equal(why({ lastActiveAt: new Date("2026-11-10T07:00:00Z") }), "practised");
  // 23:30 yesterday in Zurich is a different day from 18:00 today.
  assert.equal(why({ lastActiveAt: new Date("2026-11-09T22:30:00Z") }), "send");
});

test("three reminders in a row that were not answered, then none until they come back", () => {
  const last = new Date("2026-11-08T17:00:00Z");
  // Two unheard before, the third send would be the third unheard: stop.
  assert.equal(why({ lastReminderAt: last, lastActiveAt: new Date("2026-11-01T10:00:00Z"), unheard: MAX_UNHEARD - 1 }), "quiet");
  assert.equal(why({ lastReminderAt: last, lastActiveAt: new Date("2026-11-01T10:00:00Z"), unheard: MAX_UNHEARD - 2 }), "send");
  // Practising after the last one resets the count.
  assert.equal(why({ lastReminderAt: last, lastActiveAt: new Date("2026-11-09T12:00:00Z"), unheard: MAX_UNHEARD }), "send");
  const v = decideReminder({ ...base, lastReminderAt: last, lastActiveAt: new Date("2026-11-01T10:00:00Z"), unheard: 1 });
  assert.deepEqual(v, { send: true, unheard: 2 });
});
