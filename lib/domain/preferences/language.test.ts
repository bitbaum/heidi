import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { afterSignIn, inLocale, localeOf, safeNext, worthSeeding, LANGUAGE_ROUTE } from "./language.ts";

describe("the language that follows a learner", () => {
  test("a sign-in returns through the language route, carrying where it came from", () => {
    assert.equal(afterSignIn("/de/portal"), `${LANGUAGE_ROUTE}?next=%2Fde%2Fportal`);
    const next = new URL(afterSignIn("/de/join/abc?x=1"), "https://heidi.test").searchParams.get("next");
    assert.equal(next, "/de/join/abc?x=1");
  });

  test("only a path on this site is a place to return to", () => {
    assert.equal(safeNext("/de/portal"), "/de/portal");
    for (const bad of [null, "", "https://evil.example", "//evil.example", "/\\evil.example", "de/portal", "/de\r\nSet-Cookie: x=1"]) {
      assert.equal(safeNext(bad), null, `accepted ${JSON.stringify(bad)}`);
    }
  });

  test("the same page in the saved language — swapped, never doubled", () => {
    assert.equal(inLocale("/de/portal", "gsw"), "/gsw/portal");
    assert.equal(inLocale("/de", "gsw"), "/gsw");
    assert.equal(inLocale("/fr/groups/1?tab=a#x", "gsw"), "/gsw/groups/1?tab=a#x");
    assert.equal(inLocale("/portal", "gsw"), "/gsw/portal");
    assert.equal(inLocale("/", "gsw"), "/gsw");
    assert.equal(inLocale("/gsw/chat", "gsw"), "/gsw/chat");
  });

  test("the page's language is read from its first segment only", () => {
    assert.equal(localeOf("/gsw/portal"), "gsw");
    assert.equal(localeOf("/fr?x"), "fr");
    assert.equal(localeOf("/portal/gsw"), null);
  });

  test("German says nothing about a choice; any other language does", () => {
    assert.equal(worthSeeding("de"), false);
    assert.equal(worthSeeding(null), false);
    assert.equal(worthSeeding("gsw"), true);
    assert.equal(worthSeeding("fr"), true);
  });
});
