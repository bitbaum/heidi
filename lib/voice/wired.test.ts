import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * The defect this file exists for: the correction level was offered on the
 * settings page, written to storage, read back on reload — and consulted by
 * NOTHING. Every unit test passed, because each half worked. A learner could
 * set it to "say nothing" and be corrected anyway.
 *
 * A setting that changes no behaviour is worse than a missing one: it is a
 * promise the product does not keep, and the whole file it lives in is about
 * not making those.
 *
 * These are source-level assertions, in the shape `display.test.ts` uses for
 * "no component imports the full variety pack". A behaviour test would need a
 * running route and a browser; what actually failed here was that two ends
 * were never joined, and a join is exactly what a source check can see.
 */

const read = (rel: string) => readFileSync(new URL(rel, import.meta.url), "utf8");

test("something actually reads the correction level", () => {
  const route = read("../../app/api/speaking/take/route.ts");
  assert.match(
    route,
    /isCorrectionLevel\(correction\)/,
    "the take route does not read the learner's correction level",
  );
  assert.match(
    route,
    /level === "off" \? \[\] : languageNotes\(/,
    "`off` does not silence the word notes — the setting would be decorative",
  );
});

test("the browser sends it, or the route can only ever see the default", () => {
  const client = read("../../app/[locale]/_components/speaking-practice.tsx");
  assert.match(client, /correction: voice\.settings\.correction/, "the take request omits the correction level");
});

test("`off` is honoured before the gate runs, not after", () => {
  // Judging a learner's sentence and then discarding the verdict would be the
  // same product behaviour and a worse promise: they asked not to be assessed.
  const route = read("../../app/api/speaking/take/route.ts");
  const offIndex = route.indexOf('level === "off"');
  const notesIndex = route.indexOf("languageNotes(text");
  assert.ok(offIndex > 0 && offIndex <= notesIndex, "the level is checked after the gate has already judged");
});

test("the copy says where corrections apply, in every language", () => {
  // It applied nowhere and the copy said "what you wrote", which a reader
  // would read as the chat. Naming the surface is what makes it true.
  const dictionaries = ["de", "en", "fr", "gsw", "it", "rm", "ru"];
  for (const locale of dictionaries) {
    const source = read(`../i18n/dictionaries/${locale}.ts`);
    const body = source.match(/correctionBody:\s*\n?\s*"([^"]+)"/)?.[1];
    assert.ok(body, `${locale} has no correctionBody`);
    assert.ok(
      body.length > 120,
      `${locale}: correctionBody is too short to name the surface it governs`,
    );
  }
});
