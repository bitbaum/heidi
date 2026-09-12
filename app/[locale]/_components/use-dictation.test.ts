import { test } from "node:test";
import assert from "node:assert/strict";
import { canRecord, problemFor, problemForRecording } from "./use-dictation.ts";

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
