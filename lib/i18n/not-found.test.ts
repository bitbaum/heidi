import { test } from "node:test";
import assert from "node:assert/strict";
import { LOCALES } from "./locales.ts";
import { notFoundLocale } from "./not-found.ts";

const pick = (path: string, browser: string[] = []) => notFoundLocale(LOCALES, path, browser);

test("the path's own language wins, then the browser's, then German", () => {
  assert.equal(pick("/fr/typo", ["ru-RU"]), "fr");
  assert.equal(pick("/xx/typo", ["ru-RU", "en"]), "ru");
  assert.equal(pick("/typo", ["ja", "it-CH"]), "it");
  assert.equal(pick("/typo", ["ja"]), "de");
  assert.equal(pick("/", []), "de");
  assert.equal(pick("", []), "de");
});

test("Swiss German browsers get Swiss German", () => {
  assert.equal(pick("/typo", ["gsw-CH"]), "gsw");
});
