import { test } from "node:test";
import assert from "node:assert/strict";
import { localeIn, safeReturn, signInPath } from "./paths.ts";

test("the sign-in page speaks the language of the page the person came from", () => {
  assert.equal(localeIn("/fr/chat"), "fr");
  assert.equal(localeIn("/api/account/language?next=%2Fru%2Fportal"), "ru");
  assert.equal(localeIn("/api/account/language?next=%2Fgsw%2Fsettings"), "gsw");
  assert.equal(localeIn("/nowhere"), "de");
});

test("the return path is always on this site", () => {
  assert.equal(safeReturn("//evil.example"), "/de");
  assert.equal(safeReturn("/\\evil.example"), "/de");
  assert.equal(safeReturn("https://evil.example"), "/de");
  assert.equal(safeReturn("/it/groups/1"), "/it/groups/1");
});

test("signing in from a page lands on that language's sign-in screen and comes back", () => {
  assert.equal(
    signInPath("/api/account/language?next=%2Fit%2Fchat"),
    "/it/sign-in?next=%2Fapi%2Faccount%2Flanguage%3Fnext%3D%252Fit%252Fchat",
  );
});
