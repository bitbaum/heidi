import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_SAID_LENGTH, MAX_TAKES, decodeTakes, previousTake, withTake, withoutTake, type Take } from "./take.ts";
import type { Delivery } from "./delivery.ts";

const delivery = (over: Partial<Delivery> = {}): Delivery => ({
  totalMs: 30_000,
  speechMs: 24_000,
  pauseMs: 4_000,
  pauseCount: 4,
  longestPauseMs: 1_200,
  runCount: 12,
  meanRunMs: 2_000,
  phonationRatio: 0.85,
  clippedRatio: 0,
  problems: [],
  ...over,
});

const take = (id: string, over: Partial<Take> = {}): Take => ({
  id,
  at: "2026-09-17T12:00:00.000Z",
  delivery: delivery(),
  said: "",
  roundId: null,
  topicId: null,
  ...over,
});

/**
 * localStorage is writable by anything that ever ran on this origin, and by an
 * older build of this product. A learner opening the page to practise must
 * meet "no history" rather than a crash, so every one of these has to decode
 * to something usable or to nothing.
 */
test("rubbish in storage decodes to nothing rather than throwing", () => {
  for (const raw of ["", "null", "{}", "[", "not json", '"a string"', "42", '{"takes":[]}']) {
    assert.doesNotThrow(() => decodeTakes(raw), `threw on ${raw}`);
  }
  assert.equal(decodeTakes("not json"), null);
  assert.equal(decodeTakes('{"takes":[]}'), null, "an object is not the array this stores");
  assert.deepEqual(decodeTakes("[]"), []);
});

test("a take missing its measurements is dropped, not half-loaded", () => {
  const rows = JSON.stringify([
    take("good"),
    { id: "no-delivery", at: "2026-09-17T12:00:00.000Z", said: "" },
    { id: "bad-delivery", at: "2026-09-17T12:00:00.000Z", delivery: { totalMs: "thirty" } },
    { at: "2026-09-17T12:00:00.000Z", delivery: delivery() },
    null,
    "nope",
  ]);
  const decoded = decodeTakes(rows);
  assert.ok(decoded);
  assert.equal(decoded.length, 1);
  assert.equal(decoded[0].id, "good");
});

test("a take from an older build keeps what it has and drops what it does not", () => {
  const decoded = decodeTakes(
    JSON.stringify([{ id: "old", at: "2026-01-01T00:00:00.000Z", delivery: delivery(), somethingRemoved: true }]),
  );
  assert.ok(decoded);
  assert.equal(decoded[0].said, "", "a missing field becomes its empty value");
  assert.equal(decoded[0].roundId, null);
  assert.ok(!("somethingRemoved" in decoded[0]), "unknown fields are not carried through");
});

test("an over-long write-up is truncated on the way in, not just on the way out", () => {
  const decoded = decodeTakes(JSON.stringify([take("long", { said: "x".repeat(MAX_SAID_LENGTH + 500) })]));
  assert.ok(decoded);
  assert.equal(decoded[0].said.length, MAX_SAID_LENGTH);
});

test("storage cannot creep past the cap", () => {
  let takes: Take[] = [];
  for (let i = 0; i < MAX_TAKES + 20; i++) takes = withTake(takes, take(`t${i}`));
  assert.equal(takes.length, MAX_TAKES);
  assert.equal(takes[0].id, `t${MAX_TAKES + 19}`, "newest first");

  const overflowing = JSON.stringify(Array.from({ length: MAX_TAKES + 30 }, (_, i) => take(`s${i}`)));
  assert.equal(decodeTakes(overflowing)?.length, MAX_TAKES, "and a file that already overflowed is trimmed");
});

test("keeping a take twice updates it rather than duplicating it", () => {
  const first = withTake([], take("a"));
  const second = withTake(first, take("a", { said: "Das isch guet gsi" }));
  assert.equal(second.length, 1);
  assert.equal(second[0].said, "Das isch guet gsi");
});

test("removing one take leaves the rest", () => {
  const takes = withTake(withTake([], take("a")), take("b"));
  assert.deepEqual(withoutTake(takes, "b").map((t) => t.id), ["a"]);
  assert.equal(withoutTake(takes, "missing").length, 2, "removing what is not there is not an error");
});

/**
 * The comparison is the whole reason takes are stored at all, and comparing a
 * take with ITSELF would look exactly like a learner who never improves.
 */
test("the previous take is the one before it in time, never itself", () => {
  const takes = [take("newest"), take("middle"), take("oldest")];
  assert.equal(previousTake(takes, "newest")?.id, "middle");
  assert.equal(previousTake(takes, "middle")?.id, "oldest");
  assert.equal(previousTake(takes, "oldest"), undefined, "the first take has nothing to compare against");
  assert.equal(previousTake(takes, "unknown"), undefined);
});

test("a too-short take is skipped when looking for something to compare against", () => {
  const takes = [
    take("newest"),
    take("stub", { delivery: delivery({ problems: ["too-short"], totalMs: 900 }) }),
    take("real"),
  ];
  assert.equal(previousTake(takes, "newest")?.id, "real", "a false start is not last time's performance");
});

test("where somebody went silent is used on screen and never written to storage", async () => {
  const { withTake } = await import("./take.ts");
  const delivery = {
    totalMs: 6000,
    speechMs: 3000,
    pauseMs: 1800,
    pauseCount: 1,
    longestPauseMs: 1800,
    runCount: 2,
    meanRunMs: 1500,
    phonationRatio: 0.62,
    clippedRatio: 0,
    problems: [],
    pauseSpans: [{ startMs: 2000, endMs: 3800 }],
  };
  const [stored] = withTake([], { id: "t", at: "2026-09-25T10:00:00Z", delivery, said: "" });
  assert.equal("pauseSpans" in stored!.delivery, false);
  assert.equal(stored!.delivery.pauseMs, 1800, "the numbers are kept");
  assert.ok("pauseSpans" in delivery, "and the caller's object is not mutated");
});
