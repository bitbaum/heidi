import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCALES } from "./locales.ts";

/**
 * The retired `/:locale/check` URL redirects to the method page, and the
 * locales in that rule are spelled out rather than matched with a bare
 * `:locale` wildcard.
 *
 * They have to be. A bare param matches ANY first segment, so `/:locale/check`
 * also matched `/api/check` — the checker's own endpoint — and 308'd it to
 * `/api/method`. The page rendered perfectly and the button did nothing, which
 * is the kind of break that ships because everything LOOKS right; it was found
 * by clicking it, not by reading it.
 *
 * Spelling them out trades one failure for another — a list that drifts from
 * LOCALES — so this test closes that: add a locale without touching the
 * redirect and the build fails here, with the reason.
 */
test("the /check redirect covers exactly the locales that exist", () => {
  const config = readFileSync("next.config.mjs", "utf8");

  const match = config.match(/source:\s*"\/:locale\(([^)]+)\)\/check"/);
  assert.ok(match, "the /check redirect should name its locales explicitly, not use a bare :locale");

  assert.deepEqual(
    match![1].split("|").sort(),
    [...LOCALES].sort(),
    "the redirect's locale list has drifted from LOCALES",
  );
});

test("the redirect cannot swallow an API route", () => {
  const config = readFileSync("next.config.mjs", "utf8");
  // `api` must not be reachable as a locale segment in any redirect source.
  for (const line of config.split("\n")) {
    const src = line.match(/source:\s*"([^"]+)"/);
    if (!src) continue;
    assert.ok(
      !/^\/:[a-zA-Z]+\//.test(src[1]),
      `redirect source "${src[1]}" starts with an unconstrained wildcard, which also matches /api/...`,
    );
  }
});
