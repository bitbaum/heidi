import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { DASHBOARD_SEGMENT, SESSION_COOKIES, landingFor } from "./landing.ts";
import { LOCALES } from "./locales.ts";
import { ROUTES } from "./routes.ts";

describe("what the locale root shows", () => {
  test("signed in, the root is the dashboard", () => {
    assert.equal(landingFor("/de", true), "/de/portal");
  });

  test("every locale root behaves the same way", () => {
    for (const locale of LOCALES) {
      assert.equal(landingFor(`/${locale}`, true), `/${locale}/${DASHBOARD_SEGMENT}`, `${locale} should rewrite`);
    }
  });

  test("signed out, the root is the marketing page", () => {
    // Crawlers are always signed out, which is the whole reason this lives in
    // middleware rather than in the page: `/` stays statically rendered and
    // keeps its priority: 1.
    for (const locale of LOCALES) assert.equal(landingFor(`/${locale}`, false), null);
  });

  test("the dashboard is not rewritten onto itself", () => {
    // The loop this exists to prevent. A rule matching one path too many would
    // rewrite /de/portal to /de/portal forever, and a browser reports that as
    // a site refusing to load rather than as our bug.
    assert.equal(landingFor(`/de/${DASHBOARD_SEGMENT}`, true), null);
  });

  test("no other page is touched", () => {
    for (const route of ROUTES) {
      if (route.segment === "") continue;
      assert.equal(landingFor(`/de/${route.segment}`, true), null, `/de/${route.segment} should be left alone`);
    }
    assert.equal(landingFor("/de/chat/8f14e45f-ceea-467a-9b1c-4c1a1b2b3c4d", true), null);
  });

  test("the dashboard segment is a route that actually exists", () => {
    // Otherwise the rewrite target is a 404 and every signed-in visitor lands
    // on it, with the address bar still cheerfully showing `/de`.
    assert.ok(
      ROUTES.some((r) => r.segment === DASHBOARD_SEGMENT),
      `${DASHBOARD_SEGMENT} is not in ROUTES`,
    );
  });

  test("a path with no locale is not this function's business", () => {
    // The locale redirect runs first and sends it back through.
    assert.equal(landingFor("/", true), null);
    assert.equal(landingFor("/api/conversations", true), null);
    assert.equal(landingFor("/nonsense", true), null);
  });

  test("a trailing slash is still the locale root", () => {
    assert.equal(landingFor("/de/", true), "/de/portal");
  });

  test("both spellings of the session cookie are checked", () => {
    // The `__Secure-` prefix appears over HTTPS and the bare name locally.
    // Missing one means the feature silently does nothing in that environment.
    assert.deepEqual([...SESSION_COOKIES].sort(), ["__Secure-authjs.session-token", "authjs.session-token"]);
  });
});
