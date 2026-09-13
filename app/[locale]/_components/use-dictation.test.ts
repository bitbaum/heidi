import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canRecord,
  deadRecogniserStillTrusted,
  fallbackCanRescue,
  mayKeepWaitingForPermission,
  problemFor,
  problemForRecording,
} from "./use-dictation.ts";

test("a refused or unopenable microphone is reported as a microphone problem", () => {
  for (const error of ["not-allowed", "service-not-allowed", "audio-capture"]) {
    assert.equal(problemFor(error), "mic", error);
  }
});

test("listening and hearing nothing gets its own message", () => {
  assert.equal(problemFor("no-speech"), "silence");
});

test("a cancelled session is not reported as a failure", () => {
  assert.equal(problemFor("aborted"), null);
});

test("every other failure is reported — dictation never fails silently", () => {
  for (const error of ["network", "language-not-supported", "bad-grammar", "something-new", undefined]) {
    assert.equal(problemFor(error), "unavailable", String(error));
  }
});

// ── The fallback ────────────────────────────────────────────────────────────
//
// The browser recogniser is a promise the browser does not always keep. On the
// live site, 2026-09-12, a Chromium without Google's speech service accepted
// start() and fired nothing for nine seconds. Saying "this browser cannot" was
// honest and still left the person unable to dictate, so the same button now
// records and the server transcribes.

/** `navigator` is a getter-only global in Node, so it cannot simply be assigned. */
function withBrowser(
  globals: Record<string, unknown>,
  body: () => void,
): void {
  const g = globalThis as Record<string, unknown>;
  const saved = new Map<string, PropertyDescriptor | undefined>();
  for (const [k, v] of Object.entries(globals)) {
    saved.set(k, Object.getOwnPropertyDescriptor(g, k));
    Object.defineProperty(g, k, { value: v, configurable: true, writable: true });
  }
  try {
    body();
  } finally {
    for (const [k, d] of saved) {
      if (d) Object.defineProperty(g, k, d);
      else delete g[k];
    }
  }
}

test("a browser that can record is supported, even with no recogniser", () => {
  // Firefox: no SpeechRecognition at all, but MediaRecorder and getUserMedia.
  withBrowser(
    {
      window: {},
      MediaRecorder: function () {},
      navigator: { mediaDevices: { getUserMedia: () => {} } },
    },
    () => assert.equal(canRecord(), true),
  );
});

test("a browser with no recorder is honestly unsupported", () => {
  withBrowser(
    { window: {}, MediaRecorder: undefined, navigator: { mediaDevices: { getUserMedia: () => {} } } },
    () => assert.equal(canRecord(), false, "no MediaRecorder"),
  );
  withBrowser({ window: {}, MediaRecorder: function () {}, navigator: {} }, () =>
    assert.equal(canRecord(), false, "no getUserMedia"),
  );
});

test("recording failures speak the same three words as the recogniser", () => {
  // One vocabulary for one situation: a refused microphone reads the same
  // whichever path asked for it.
  for (const name of ["NotAllowedError", "SecurityError", "NotFoundError", "NotReadableError"]) {
    assert.equal(problemForRecording({ name }), "mic", name);
  }
  for (const other of [{ name: "AbortError" }, {}, undefined, new Error("boom")]) {
    assert.equal(problemForRecording(other), "unavailable", JSON.stringify(other ?? null));
  }
});

// ── The wait that never ended ───────────────────────────────────────────────
//
// `permissions.query` answers "prompt" in two situations that look identical
// from code: a dialog is open and the person is reading it, and no dialog will
// ever appear because the recogniser behind it does not work. Waiting on the
// first is correct. Waiting on the second is forever — the button said
// "Ich höre …" and the fallback never ran. Reproduced on the live site
// 2026-09-12: twenty-two seconds, no timeout, nothing at all.
test("waiting for a permission answer is bounded, always", () => {
  assert.equal(mayKeepWaitingForPermission(0, true), true, "someone may be reading the dialog");
  assert.equal(mayKeepWaitingForPermission(5_000, true), true);
  assert.equal(
    mayKeepWaitingForPermission(60_000, true),
    false,
    "a prompt that never appears must not hold the fallback forever",
  );
  assert.equal(
    mayKeepWaitingForPermission(0, false),
    false,
    "nothing pending — go straight to the fallback",
  );
});

// ── Which failures the fallback can rescue ──────────────────────────────────
//
// Wiring the fallback only to SILENCE left the commonest real failure
// unrescued: the recogniser erroring. Measured on the live site 2026-09-12
// against the bounded-wait fix — the control gave up at 15 s with "Diktieren
// funktioniert in diesem Browser nicht" instead of recording, because an
// `onerror` had already closed the session before the timeout could fall back.
test("a recogniser that cannot do the job hands over; a microphone problem does not", () => {
  assert.equal(fallbackCanRescue("unavailable"), true, "no speech service, network refused — recording works");
  assert.equal(fallbackCanRescue("mic"), false, "their microphone or a denied permission — recording fails the same way");
  assert.equal(fallbackCanRescue("silence"), false, "they were heard and said nothing — telling them twice helps nobody");
  assert.equal(fallbackCanRescue(null), false, "a clean end is not a failure");
});

// ── Learning it once ────────────────────────────────────────────────────────
//
// Discovering that a browser's recogniser is dead costs ten seconds of a button
// that says "Ich höre …" and does nothing visible. On a browser with no speech
// service that discovery is identical every time, so it is remembered — but a
// browser can GAIN the capability, so the verdict expires.
test("a remembered dead recogniser is trusted, but not forever", () => {
  const now = Date.UTC(2026, 8, 12, 19, 0, 0);
  const daysAgo = (d: number) => now - d * 24 * 60 * 60 * 1000;

  assert.equal(deadRecogniserStillTrusted(now, now), true, "just learned");
  assert.equal(deadRecogniserStillTrusted(daysAgo(29), now), true);
  assert.equal(deadRecogniserStillTrusted(daysAgo(31), now), false, "a browser can gain the capability");
  assert.equal(deadRecogniserStillTrusted(null, now), false, "never learned — try the recogniser");
  assert.equal(deadRecogniserStillTrusted(Number.NaN, now), false, "unreadable storage is not a verdict");
  assert.equal(
    deadRecogniserStillTrusted(now + 60_000, now),
    false,
    "a timestamp from the future is a clock change, not a verdict",
  );
});
