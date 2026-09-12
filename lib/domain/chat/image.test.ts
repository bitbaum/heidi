import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_BYTES, readImage, visionMessage } from "./image.ts";

const png = (payload = "iVBORw0KGgo=") => `data:image/png;base64,${payload}`;

test("a base64 image data URL is accepted", () => {
  const r = readImage(png());
  assert.equal(r.ok, true);
});

test("only image types are accepted", () => {
  assert.equal(readImage("data:text/html;base64,PHNjcmlwdD4=").ok, false);
  assert.equal(readImage("data:application/pdf;base64,JVBERi0=").ok, false);
  assert.equal(readImage("data:image/svg+xml;base64,PHN2Zz4=").ok, false);
});

test("a remote URL is refused", () => {
  // Only what the browser downscaled and inlined. A URL would make our server
  // fetch whatever someone names — the hole the provider allowlist closes
  // elsewhere, reopened here.
  assert.equal(readImage("https://example.com/a.png").ok, false);
  assert.equal(readImage("http://169.254.169.254/meta").ok, false);
});

test("a non-string is refused rather than coerced", () => {
  assert.equal(readImage(undefined).ok, false);
  assert.equal(readImage(null).ok, false);
  assert.equal(readImage(42).ok, false);
  assert.equal(readImage({}).ok, false);
  assert.equal(readImage("").ok, false);
});

test("a malformed data URL is refused", () => {
  assert.equal(readImage("data:image/png;base64,").ok, false);
  assert.equal(readImage("data:image/png,notbase64").ok, false);
  assert.equal(readImage("data:image/png;base64,not valid!!").ok, false);
});

test("an oversized image is refused even though the browser downscales", () => {
  // The browser is not a security boundary. "The client already checked" is
  // how an unbounded body gets accepted.
  const huge = "A".repeat(Math.ceil((MAX_BYTES * 4) / 3) + 64);
  assert.equal(readImage(png(huge)).ok, false);
});

test("a vision message puts the text first, then each picture", () => {
  const parts = visionMessage("what does this say?", [png(), png("iVBORw0KGgoB")]);
  assert.equal(parts.length, 3);
  assert.deepEqual(parts[0], { type: "text", text: "what does this say?" });
  assert.equal(parts[1].type, "image_url");
  assert.equal(parts[2].type, "image_url");
});

test("a message with no pictures is still well-formed", () => {
  const parts = visionMessage("hello", []);
  assert.deepEqual(parts, [{ type: "text", text: "hello" }]);
});
