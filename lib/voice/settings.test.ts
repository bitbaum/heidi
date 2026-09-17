import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clampRate,
  decodeVoiceSettings,
  DEFAULT_VOICE_SETTINGS,
  RATE_RANGE,
  VOICE_SETTINGS_KEY,
} from "./settings.ts";

test("a page does not start talking at somebody", () => {
  // On a tram, in an open-plan office, next to a sleeping child. Speech is
  // something you ask for, and this is the assertion that keeps it that way.
  assert.equal(DEFAULT_VOICE_SETTINGS.speak, false);
});

test("the default rate is under natural speed, because everyone here is a learner", () => {
  assert.ok(DEFAULT_VOICE_SETTINGS.rate < 1);
  assert.ok(DEFAULT_VOICE_SETTINGS.rate >= RATE_RANGE.min);
});

test("the rate cannot be pushed out of the range that still sounds like speech", () => {
  assert.equal(clampRate(19), RATE_RANGE.max);
  assert.equal(clampRate(0), RATE_RANGE.min);
  assert.equal(clampRate(Number.NaN), DEFAULT_VOICE_SETTINGS.rate);
  assert.equal(clampRate(Number.POSITIVE_INFINITY), DEFAULT_VOICE_SETTINGS.rate);
});

test("one unintelligible field does not throw away the others", () => {
  // Storage holds what an older version of this code wrote. Rejecting the
  // whole object over one unknown value is how a person's settings vanish on
  // the day we deploy.
  const decoded = decodeVoiceSettings(JSON.stringify({ speak: true, rate: "fast", correction: "brutal" }));
  assert.deepEqual(decoded, {
    speak: true,
    rate: DEFAULT_VOICE_SETTINGS.rate,
    correction: DEFAULT_VOICE_SETTINGS.correction,
  });
});

test("nonsense in storage reads as nothing stored", () => {
  assert.equal(decodeVoiceSettings("not json"), null);
  assert.equal(decodeVoiceSettings("null"), null);
  assert.equal(decodeVoiceSettings("[1,2]")?.speak, false);
});

test("a stored rate outside the range is brought back in", () => {
  assert.equal(decodeVoiceSettings(JSON.stringify({ rate: 4 }))?.rate, RATE_RANGE.max);
});

test("the key is versioned, so a future shape need not read this one", () => {
  assert.match(VOICE_SETTINGS_KEY, /\.v\d+$/);
});
