import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { SESSION_COOKIES, landingFor } from "./landing.ts";
import { LOCALES } from "./locales.ts";
import { ROUTES } from "./routes.ts";

describe("where a visitor lands", () => {
  test("a signed-in visitor on the locale root goes to the chat", () => {
    assert.equal(landingFor("/de", true), "/de/chat");
  });

  test("every locale root behaves the same way", () => {
    for (const locale of LOCALES) {
      assert.equal(landingFor(`/${locale}`, true), `/${locale}/chat`, `${locale} should redirect`);
    }
  });

  test("the chat itself is NOT redirected", () => {
    // The loop this test exists to prevent: a rule matching one path too many
    // would bounce /de/chat to itself forever, and a browser reports that as a
    // site refusing to load rather than as our bug.
    assert.equal(landingFor("/de/chat", true), null);
    assert.equal(landingFor("/de/chat/8f14e45f-ceea-467a-9b1c-4c1a1b2b3c4d", true), null);
  });

  test("no other page is redirected either", () => {
    for (const route of ROUTES) {
      if (route.segment === "") continue;
      assert.equal(landingFor(`/de/${route.segment}`, true), null, `/de/${route.segment} should be left alone`);
    }
  });

  test("a signed-out visitor gets the home page", () => {
    // Crawlers are always signed out, which is the whole reason this lives in
    // middleware: `/` stays statically rendered and keeps its priority: 1.
    for (const locale of LOCALES) assert.equal(landingFor(`/${locale}`, false), null);
  });

  test("a path with no locale is not this function's business", () => {
    // The locale redirect runs first and sends it back through.
    assert.equal(landingFor("/", true), null);
    assert.equal(landingFor("/api/conversations", true), null);
    assert.equal(landingFor("/nonsense", true), null);
  });

  test("a trailing slash is still the locale root", () => {
    assert.equal(landingFor("/de/", true), "/de/chat");
  });

  test("both spellings of the session cookie are checked", () => {
    // The `__Secure-` prefix appears over HTTPS and the bare name locally.
    // Missing one means the feature silently does nothing in that environment.
    assert.deepEqual([...SESSION_COOKIES].sort(), ["__Secure-authjs.session-token", "authjs.session-token"]);
  });
});
