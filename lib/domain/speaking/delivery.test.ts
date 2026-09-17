import { test } from "node:test";
import assert from "node:assert/strict";
import { measure, usable, MIN_USEFUL_MS, type Delivery } from "./delivery.ts";

const RATE = 16_000;

/**
 * Synthetic audio with a KNOWN answer, which is the only way to test a
 * measurement. Real speech would make these tests a demonstration rather than
 * a check: nobody can say from a wav file how many pauses it "really" has, so
 * a failure would be unfalsifiable and the test would be deleted the first
 * time it went red for a good reason.
 *
 * `noise` is the room, `voice` is somebody talking. The voice is a noisy tone
 * rather than a pure one because a pure sine has an RMS that never varies, and
 * measuring that would prove the code works on a signal it will never meet.
 */
function build(parts: Array<{ ms: number; level: number }>): Float32Array {
  const total = parts.reduce((n, p) => n + Math.round((p.ms / 1000) * RATE), 0);
  const out = new Float32Array(total);
  let at = 0;
  let phase = 0;
  for (const part of parts) {
    const length = Math.round((part.ms / 1000) * RATE);
    for (let i = 0; i < length; i++) {
      phase += (2 * Math.PI * 140) / RATE;
      // A tone plus a little hiss, shaped so the level is the RMS we asked for.
      const tone = Math.sin(phase) * 0.8 + (pseudoRandom(at + i) - 0.5) * 0.4;
      out[at + i] = tone * part.level;
    }
    at += length;
  }
  return out;
}

/** Deterministic, so a failing test fails the same way twice. */
function pseudoRandom(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const ROOM = 0.0008;
const VOICE = 0.22;

const silence = (ms: number) => ({ ms, level: ROOM });
const speech = (ms: number, level = VOICE) => ({ ms, level });

test("a recording of nothing is reported as a recording problem, not as a person who never speaks", () => {
  const d = measure(build([silence(6000)]), RATE);
  assert.ok(d.problems.includes("too-quiet"), "silence is too quiet");
  assert.equal(usable(d), false, "and there is nothing to report about it");
  assert.equal(d.pauseCount, 0, "a silent recording must not be described as full of pauses");
  assert.equal(d.phonationRatio, 0);
});

test("a recording too short to say anything about says so", () => {
  const d = measure(build([speech(1500)]), RATE);
  assert.ok(d.problems.includes("too-short"));
  assert.equal(usable(d), false);
  assert.ok(d.totalMs < MIN_USEFUL_MS);
});

test("unbroken speech is one run and no pauses", () => {
  const d = measure(build([speech(6000)]), RATE);
  assert.equal(usable(d), true);
  assert.equal(d.runCount, 1, "one continuous run");
  assert.equal(d.pauseCount, 0, "and nothing to call a pause");
  assert.equal(d.phonationRatio, 1);
  assert.ok(Math.abs(d.speechMs - 6000) < 200, `speech time near the whole clip, got ${d.speechMs}`);
});

test("pauses between runs are counted, and the longest one is reported", () => {
  const d = measure(
    build([speech(2000), silence(800), speech(2000), silence(1600), speech(2000)]),
    RATE,
  );
  assert.equal(d.pauseCount, 2, "two gaps, both over the threshold");
  assert.equal(d.runCount, 3);
  assert.ok(Math.abs(d.longestPauseMs - 1600) < 200, `longest pause near 1600ms, got ${d.longestPauseMs}`);
  assert.ok(d.phonationRatio > 0.6 && d.phonationRatio < 0.8, `ratio ${d.phonationRatio}`);
});

test("silence at the ends is not a pause — that is somebody finding the button", () => {
  const withEnds = measure(build([silence(1500), speech(3000), silence(1500)]), RATE);
  assert.equal(withEnds.pauseCount, 0, "leading and trailing silence is not hesitation");
  assert.equal(withEnds.runCount, 1);
  // And the ratio is about the speaking stretch, not about the whole file,
  // or leaving the recorder running would look like hesitating.
  assert.equal(withEnds.phonationRatio, 1);
});

test("a gap shorter than a real pause is a consonant, not a hesitation", () => {
  // 120ms of silence is roughly a stop closure. Reporting it would mean
  // telling somebody their `t` sounds were hesitation.
  const d = measure(build([speech(2000), silence(120), speech(2000), silence(120), speech(2000)]), RATE);
  assert.equal(d.pauseCount, 0, "short gaps are bridged");
  assert.equal(d.runCount, 1, "and the run is not broken by them");
});

test("the threshold survives a recording that is wall-to-wall speech", () => {
  // The 10th percentile here is itself a quiet vowel, so a floor-relative
  // threshold alone would carve pauses out of continuous speech.
  const d = measure(build([speech(2000, 0.30), speech(2000, 0.08), speech(2000, 0.30)]), RATE);
  assert.equal(d.pauseCount, 0, "quieter speech is still speech");
  assert.equal(d.runCount, 1);
});

test("clipping is reported as a microphone problem and does not become a verdict on the speaker", () => {
  const loud = build([speech(5000, 0.9)]);
  for (let i = 0; i < loud.length; i += 3) loud[i] = 1;
  const d = measure(loud, RATE);
  assert.ok(d.problems.includes("clipped"));
  assert.ok(d.clippedRatio > 0.005);
  // Still usable: the person spoke, the recording is just hot.
  assert.equal(usable(d), true);
});

test("mean run length is the mean of the runs, and absent when there are none", () => {
  const d = measure(build([speech(1000), silence(600), speech(3000)]), RATE);
  assert.equal(d.runCount, 2);
  assert.ok(Math.abs(d.meanRunMs - 2000) < 250, `mean run near 2000ms, got ${d.meanRunMs}`);

  const nothing = measure(build([silence(6000)]), RATE);
  assert.equal(nothing.meanRunMs, 0);
});

test("degenerate input does not throw", () => {
  assert.doesNotThrow(() => measure(new Float32Array(0), RATE));
  assert.doesNotThrow(() => measure(new Float32Array(10), 0));
  assert.doesNotThrow(() => measure(new Float32Array(10), Number.NaN));
  const d = measure(new Float32Array(0), RATE);
  assert.equal(usable(d), false);
});

/**
 * THE §8 TEST.
 *
 * The register forbids a pronunciation score by name, and the way that ban
 * gets broken is not by somebody re-reading the rule and disagreeing — it is
 * by a well-meaning `score` field appearing on this type because a designer
 * wanted one number for the card. This asserts the shape, so adding one fails
 * the build with the reason attached.
 */
test("no measurement is a rating", () => {
  const d: Delivery = measure(build([speech(5000)]), RATE);
  const banned = ["score", "rating", "grade", "accuracy", "nativeness", "pronunciation", "level", "percent"];
  for (const key of Object.keys(d)) {
    for (const word of banned) {
      assert.ok(
        !key.toLowerCase().includes(word),
        `Delivery.${key} reads as a rating. §8 forbids a pronunciation score; this file measures the signal and says only what the signal says.`,
      );
    }
  }
  // Every number here is a duration, a count, or a ratio of two durations.
  assert.equal(typeof d.speechMs, "number");
  assert.equal(typeof d.pauseCount, "number");
  assert.ok(d.phonationRatio >= 0 && d.phonationRatio <= 1);
});
