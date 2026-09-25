import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * The chat is openable from every page — a promise that broke once without
 * any test noticing, because the rule that hid it was CSS and read as
 * deliberate: the home page and group pages hid the dock, and "the chat is
 * gone" is what a visitor concluded.
 *
 * So every rule that hides the dock is listed here by its selector, and a new
 * one fails until somebody argues for it in this file.
 */
const css = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

test("the dock is hidden only where the page IS the chat window", () => {
  const hiding = [...css.matchAll(/([^{}]*\[data-dock="heidi"\][^{}]*)\{[^}]*display:\s*none/g)]
    .map((m) => m[1].replace(/\/\*[\s\S]*?\*\//g, "").trim())
    .filter((sel) => !sel.includes(" [role=\"dialog\"]") || !sel.includes("#loki"));
  assert.deepEqual(hiding, ['body:has([data-chrome="chat"]) [data-dock="heidi"]']);
});

test("Loki's widget steps aside while the dock is open, not the other way round", () => {
  assert.match(css, /body:has\(\[data-dock="heidi"\] \[role="dialog"\]\) #loki-feedback-host\s*\{\s*display:\s*none/);
});
