import { test } from "node:test";
import assert from "node:assert/strict";
import { problemFor } from "./use-dictation.ts";

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
