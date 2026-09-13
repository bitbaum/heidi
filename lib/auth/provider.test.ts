import { test } from "node:test";
import assert from "node:assert/strict";
import { orangecatProvider } from "./provider.ts";
import { LOCALES } from "../i18n/locales.ts";
import { getDictionary } from "../i18n/index.ts";
import { ROUTES } from "../i18n/routes.ts";

/**
 * The OIDC config's quirks, asserted rather than remembered. Both of these
 * were paid for once by Loki's debugging; a silent revert here would
 * surface as an opaque 400 at the code exchange, which is the single least
 * debuggable place for it to appear.
 */

const provider = orangecatProvider("test-id", "test-secret");

test("the token endpoint auth method is client_secret_post", () => {
  // Auth.js defaults to client_secret_basic. OrangeCat rejects that with a
  // 400 reading "client_id is required", which points at the wrong problem.
  assert.equal(provider.client.token_endpoint_auth_method, "client_secret_post");
});

test("PKCE and state are both checked", () => {
  // PKCE is required even for a confidential client holding a secret.
  assert.ok(provider.checks.includes("pkce"));
  assert.ok(provider.checks.includes("state"));
});

test("Heidi asks for identity scopes only", () => {
  // Heidi never acts on OrangeCat's behalf. If this ever grows a capability
  // scope, that is a deliberate decision that also has to be made in
  // OrangeCat's CLIENT_SPECS — the registered ceiling would refuse it here.
  assert.equal(provider.authorization.params.scope, "openid profile email");
});

test("the provider is OIDC against OrangeCat, discovered from the issuer", () => {
  assert.equal(provider.type, "oidc");
  assert.equal(provider.id, "orangecat");
  assert.ok(provider.issuer.startsWith("https://"), "the issuer must be https");
});

test("the issuer is overridable for a non-production OrangeCat", () => {
  // So a staging OC can be pointed at without editing code.
  const before = process.env.ORANGECAT_OAUTH_ISSUER;
  process.env.ORANGECAT_OAUTH_ISSUER = "https://staging.example";
  assert.equal(orangecatProvider("a", "b").issuer, "https://staging.example");
  if (before === undefined) delete process.env.ORANGECAT_OAUTH_ISSUER;
  else process.env.ORANGECAT_OAUTH_ISSUER = before;
});

test("the portal exists as a route but stays out of the main navigation", () => {
  const portal = ROUTES.find((r) => r.key === "portal");
  assert.ok(portal, "portal route is missing");
  assert.equal(portal?.segment, "portal");
  assert.equal(portal?.group, undefined, "a personal space in the nav reads as a locked door");
});

test("every language can name the portal and the sign-in control", () => {
  for (const locale of LOCALES) {
    const dict = getDictionary(locale);
    assert.ok(dict.nav.portal?.length > 0, `${locale} has no portal label`);
    assert.ok(dict.auth.signIn?.length > 0, `${locale} has no sign-in label`);
    assert.ok(dict.auth.signInWith?.includes("OrangeCat"), `${locale} should name the identity provider`);
  }
});
