import { test } from "node:test";
import assert from "node:assert/strict";
import { byokChain, readByok, redact } from "./byok.ts";
import { BYOK_PROVIDERS, findProvider } from "./providers.ts";

/**
 * A route that accepts a key and a URL from the browser is a server-side
 * request forgery hole with a friendly form around it. These assert the
 * defences, because the failure is silent and expensive.
 *
 * Every fixture below is UNMISTAKABLY fake. A realistic-looking one trips the
 * repository's secret scanner — which is the scanner working, not a nuisance —
 * so the fixtures announce what they are rather than argue with it.
 */

const good = { provider: "openrouter", key: "sk-or-EXAMPLE-NOT-A-REAL-KEY", model: "openai/gpt-5-mini" };

test("a well-formed config is accepted", () => {
  const r = readByok(good);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.config.provider, "openrouter");
});

test("the endpoint is never taken from the request", () => {
  // The whole SSRF defence: a caller names a provider, and the base URL comes
  // from OUR allowlist. Anything else is refused rather than dialled.
  const r = readByok({ ...good, provider: "http://169.254.169.254/latest/meta-data" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.reason, /unknown provider/);
});

test("an unlisted provider is refused even if it looks plausible", () => {
  assert.equal(readByok({ ...good, provider: "localhost" }).ok, false);
  assert.equal(readByok({ ...good, provider: "evil.example" }).ok, false);
  assert.equal(readByok({ ...good, provider: "" }).ok, false);
});

test("a key containing a line break is refused", () => {
  // Where a header injection starts.
  assert.equal(readByok({ ...good, key: "sk-or-EXAMPLE\r\nX-Evil: 1" }).ok, false);
  assert.equal(readByok({ ...good, key: "sk-or-EXAMPLE\nmore" }).ok, false);
});

test("an implausibly long key or model is refused", () => {
  assert.equal(readByok({ ...good, key: "s".repeat(401) }).ok, false);
  assert.equal(readByok({ ...good, model: "m".repeat(121) }).ok, false);
});

test("a missing key or model is refused rather than defaulted", () => {
  assert.equal(readByok({ ...good, key: "" }).ok, false);
  assert.equal(readByok({ ...good, model: "" }).ok, false);
  assert.equal(readByok({}).ok, false);
  assert.equal(readByok(undefined).ok, false);
  assert.equal(readByok("sk-or-abc").ok, false);
});

test("the chain is one link, with no fallback to our own models", () => {
  // Falling through to the free chain after someone's paid model failed would
  // answer a picture with a model that cannot see, and bill our budget for it.
  const built = byokChain({ provider: "openrouter", key: "sk-or-EXAMPLE-NOT-REAL", model: "m" });
  assert.ok(built);
  assert.equal(built?.chain.length, 1);
  assert.equal(built?.chain[0].model, "m");
});

test("the chain's base URL comes from the allowlist, not the caller", () => {
  const built = byokChain({ provider: "openai", key: "sk-EXAMPLE-NOT-REAL", model: "gpt-5-mini" });
  assert.equal(built?.chain[0].provider.baseUrl, findProvider("openai")?.baseUrl);
  assert.ok(built?.chain[0].provider.baseUrl.startsWith("https://"));
});

test("someone else's key claims none of our rationed capacity", () => {
  // dailyTokens feeds the fair-share pool. Their key, their quota — telling
  // the pool it has capacity it does not own produces the exact wall that
  // rationing exists to prevent.
  // ai-kit >= 1.18 marks the link as the reader's own and claims no tokens.
  // Kept here so a regression upstream turns Heidi red, not just ai-kit.
  const provider = byokChain({ provider: "groq", key: "gsk_EXAMPLENOTREAL", model: "m" })?.chain[0].provider;
  assert.equal(provider?.dailyTokens, 0);
  assert.equal(provider?.byok, true);
});

test("every allowlisted provider is https and has no trailing slash", () => {
  for (const p of BYOK_PROVIDERS) {
    assert.ok(p.baseUrl.startsWith("https://"), `${p.id} is not https`);
    assert.ok(!p.baseUrl.endsWith("/"), `${p.id} has a trailing slash`);
  }
});

test("the list is ai-kit's, so a vendor added there reaches Heidi", () => {
  // Heidi kept its own five vendors; the shared list has more, Anthropic and
  // Google among them. Asserted so a local copy cannot quietly return.
  const ids = BYOK_PROVIDERS.map((p) => p.id);
  for (const id of ["openrouter", "openai", "anthropic", "google", "groq"]) assert.ok(ids.includes(id as never), id);
});

test("keys are redacted before anything is logged", () => {
  // A vendor error can echo the request, and the request carried a credential.
  assert.match(redact("bad key sk-EXAMPLENOTAREALKEY rejected"), /<key>/);
  assert.match(redact("gsk_EXAMPLENOTAREALKEY is invalid"), /<key>/);
  assert.match(redact("sk-or-EXAMPLENOTAREALKEY expired"), /<key>/);
  assert.match(redact("sk-ant-EXAMPLENOTAREALKEY expired"), /<key>/);
  assert.match(redact("key AIzaEXAMPLENOTAREALKEY0123456789 invalid"), /<key>/);
  assert.match(redact("xai-EXAMPLENOTAREALKEY invalid"), /<key>/);
  assert.doesNotMatch(redact("bad key sk-EXAMPLENOTAREALKEY"), /EXAMPLENOTAREALKEY/);
});

test("redaction leaves ordinary text alone", () => {
  assert.equal(redact("model not found"), "model not found");
});
