import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkMeetingUrl,
  checkRound,
  checkStart,
  checkTimeZone,
  checkTitle,
  checkPitch,
  mayAttend,
  mayEditRound,
  mayHost,
  MAX_AHEAD_MS,
} from "./rules.ts";
import { CIRCLE_CAPACITY, MAX_PITCH_LENGTH, MAX_TITLE_LENGTH, WEBINAR_CAPACITY } from "./types.ts";
import { DEFAULT_TIME_ZONE } from "./schedule.ts";

const NOW = new Date("2026-09-17T12:00:00.000Z");

const draft = (over: Record<string, unknown> = {}) => ({
  title: "Züri Slang am Bahnhof",
  format: "circle",
  cadence: "weekly",
  durationMinutes: 45,
  startsAt: "2026-09-22T17:00:00.000Z",
  timeZone: DEFAULT_TIME_ZONE,
  meetingUrl: "https://meet.example.ch/zueri",
  ...over,
});

test("titles are trimmed, collapsed and bounded", () => {
  const ok = checkTitle("  Züri   Slang  ");
  assert.deepEqual(ok, { ok: true, text: "Züri Slang" });
  assert.deepEqual(checkTitle("   "), { ok: false, problem: "empty" });
  assert.deepEqual(checkTitle(undefined), { ok: false, problem: "empty" });
  assert.deepEqual(checkTitle("x".repeat(MAX_TITLE_LENGTH + 1)), { ok: false, problem: "too-long" });
  assert.equal(checkPitch("x".repeat(MAX_PITCH_LENGTH)).ok, true);
  assert.deepEqual(checkPitch("x".repeat(MAX_PITCH_LENGTH + 1)), { ok: false, problem: "too-long" });
});

/**
 * The meeting link is the one field a stranger supplies and everybody else
 * clicks. This is the test that keeps it from being an XSS hole.
 */
test("a meeting link must be https, and javascript: is not a meeting link", () => {
  assert.deepEqual(checkMeetingUrl("https://meet.example.ch/a"), { ok: true, url: "https://meet.example.ch/a" });

  for (const hostile of [
    "javascript:alert(document.cookie)",
    "JavaScript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ]) {
    const result = checkMeetingUrl(hostile);
    assert.equal(result.ok, false, `${hostile} must be refused`);
  }

  // Plain http is refused too — no video product issues one, and accepting a
  // second scheme is how the allowlist stops being an allowlist.
  assert.deepEqual(checkMeetingUrl("http://meet.example.ch/a"), { ok: false, problem: "not-https" });
  assert.deepEqual(checkMeetingUrl("not a url at all"), { ok: false, problem: "not-a-url" });
});

test("no meeting link is legitimate — a round can be scheduled before the room exists", () => {
  assert.deepEqual(checkMeetingUrl(""), { ok: true, url: null });
  assert.deepEqual(checkMeetingUrl("   "), { ok: true, url: null });
  assert.deepEqual(checkMeetingUrl(undefined), { ok: true, url: null });
});

test("a round cannot start in the past or be parked in the next decade", () => {
  assert.equal(checkStart("2026-09-18T17:00:00.000Z", NOW).ok, true);
  assert.deepEqual(checkStart("2026-09-16T17:00:00.000Z", NOW), { ok: false, problem: "in-the-past" });
  assert.deepEqual(checkStart("nonsense", NOW), { ok: false, problem: "not-a-date" });
  assert.deepEqual(checkStart(new Date(NOW.getTime() + MAX_AHEAD_MS + 60_000).toISOString(), NOW), {
    ok: false,
    problem: "too-far-ahead",
  });
});

test("a form submitted a minute before the hour still posts", () => {
  // 18:59 for a 19:00 round. A strict comparison would refuse it and the
  // organiser would have no idea why.
  const at = new Date(NOW.getTime() - 60_000).toISOString();
  assert.equal(checkStart(at, NOW).ok, true);
});

test("an unknown time zone falls back rather than being stored and failing months later", () => {
  assert.equal(checkTimeZone("Europe/Kyiv", DEFAULT_TIME_ZONE), "Europe/Kyiv");
  assert.equal(checkTimeZone("Mars/Olympus", DEFAULT_TIME_ZONE), DEFAULT_TIME_ZONE);
  assert.equal(checkTimeZone("", DEFAULT_TIME_ZONE), DEFAULT_TIME_ZONE);
  assert.equal(checkTimeZone(42, DEFAULT_TIME_ZONE), DEFAULT_TIME_ZONE);
});

test("capacity is read from the format, never accepted from the client", () => {
  const circle = checkRound(draft({ format: "circle" }), NOW, DEFAULT_TIME_ZONE);
  assert.ok(circle.ok);
  assert.equal(circle.draft.capacity, CIRCLE_CAPACITY);

  const webinar = checkRound(draft({ format: "webinar" }), NOW, DEFAULT_TIME_ZONE);
  assert.ok(webinar.ok);
  assert.equal(webinar.draft.capacity, WEBINAR_CAPACITY);

  // A capacity on the request is ignored entirely. Typed as the route sees it
  // — a parsed JSON body, where nothing stops a caller sending extra fields.
  const wire: Record<string, unknown> = { ...draft(), capacity: 9999 };
  const forged = checkRound(wire, NOW, DEFAULT_TIME_ZONE);
  assert.ok(forged.ok);
  assert.equal(forged.draft.capacity, CIRCLE_CAPACITY);
});

test("every field is checked in one place, so a new one cannot be skipped", () => {
  assert.deepEqual(checkRound(draft({ title: "" }), NOW, DEFAULT_TIME_ZONE), {
    ok: false,
    problem: { field: "title", problem: "empty" },
  });
  assert.deepEqual(checkRound(draft({ format: "seminar" }), NOW, DEFAULT_TIME_ZONE), {
    ok: false,
    problem: { field: "format", problem: "unknown" },
  });
  assert.deepEqual(checkRound(draft({ cadence: "daily" }), NOW, DEFAULT_TIME_ZONE), {
    ok: false,
    problem: { field: "cadence", problem: "unknown" },
  });
  assert.deepEqual(checkRound(draft({ durationMinutes: 7 }), NOW, DEFAULT_TIME_ZONE), {
    ok: false,
    problem: { field: "duration", problem: "unknown" },
  });
  assert.deepEqual(checkRound(draft({ meetingUrl: "javascript:alert(1)" }), NOW, DEFAULT_TIME_ZONE), {
    ok: false,
    problem: { field: "meetingUrl", problem: "not-https" },
  });
});

test("a good draft comes back normalised", () => {
  const result = checkRound(draft({ title: "  Züri  Slang  " }), NOW, DEFAULT_TIME_ZONE);
  assert.ok(result.ok);
  assert.equal(result.draft.title, "Züri Slang");
  assert.equal(result.draft.format, "circle");
  assert.equal(result.draft.cadence, "weekly");
  assert.equal(result.draft.durationMinutes, 45);
  assert.equal(result.draft.timeZone, DEFAULT_TIME_ZONE);
  assert.equal(result.draft.startsAt.toISOString(), "2026-09-22T17:00:00.000Z");
});

test("a full circle refuses one more, and someone already coming is told so", () => {
  assert.deepEqual(mayAttend({ attending: 3, capacity: CIRCLE_CAPACITY, alreadyAttending: false }), { ok: true });
  assert.deepEqual(mayAttend({ attending: CIRCLE_CAPACITY, capacity: CIRCLE_CAPACITY, alreadyAttending: false }), {
    ok: false,
    reason: "full",
  });
  // Checked before capacity, so a full round still tells its own attendees
  // that they are in it rather than that it is full.
  assert.deepEqual(mayAttend({ attending: CIRCLE_CAPACITY, capacity: CIRCLE_CAPACITY, alreadyAttending: true }), {
    ok: false,
    reason: "already-attending",
  });
});

test("only the host moves the round; anybody signed in may open one", () => {
  assert.equal(mayEditRound("alice", "alice"), true);
  assert.equal(mayEditRound("alice", "bob"), false);
  assert.equal(mayHost("bob"), true);
  assert.equal(mayHost(null), false);
  assert.equal(mayHost(""), false);
});
