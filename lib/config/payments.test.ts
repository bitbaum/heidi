import { test } from "node:test";
import assert from "node:assert/strict";
import { passDays, payee, paymentsConfig } from "./payments.ts";

const HEIDI = "01affb7e-b5f6-45d8-a9a4-20bff670d013";

test("the pay button's address is Heidi's public OrangeCat project, built from config", () => {
  assert.equal(payee({}).url, `https://orangecat.ch/projects/${HEIDI}`);
});

test("another entity, kind or OrangeCat host is a matter of environment", () => {
  const other = payee({
    ORANGECAT_PAY_ENTITY_ID: "11111111-1111-4111-8111-111111111111",
    ORANGECAT_PAY_ENTITY_TYPE: "product",
    ORANGECAT_BASE_URL: "https://staging.example/",
  });
  assert.equal(other.url, "https://staging.example/products/11111111-1111-4111-8111-111111111111");
  // Something that is not an id is not followed anywhere.
  assert.equal(payee({ ORANGECAT_PAY_ENTITY_ID: "javascript:alert(1)" }).entityId, payee({}).entityId);
});

test("the automatic pass is off until there is a price", () => {
  assert.equal(paymentsConfig({}), null);
  assert.equal(paymentsConfig({ ORANGECAT_API_KEY: "ock_x", ORANGECAT_WEBHOOK_SECRET: "ock_whk_x" }), null);
  assert.equal(paymentsConfig({ HEIDI_PASS_30_SATS: "0" }), null);
  assert.equal(paymentsConfig({ HEIDI_PASS_30_SATS: "free" }), null);
});

test("only the passes that have a price are sold, to the configured payee", () => {
  const config = paymentsConfig({ HEIDI_PASS_30_SATS: " 21000 " });
  assert.deepEqual(config?.plans, [{ id: "month", days: 30, price: { amount: 21000, currency: "SAT" }, providerRef: HEIDI }]);
  assert.equal(config?.entityType, "project");
  assert.equal(config?.apiKey, null);
  assert.equal(config?.webhookSecret, null);

  const both = paymentsConfig({
    ORANGECAT_API_KEY: "ock_live",
    ORANGECAT_WEBHOOK_SECRET: "ock_whk_x",
    HEIDI_PASS_30_SATS: "21000",
    HEIDI_PASS_365_SATS: "210000",
  });
  assert.deepEqual(both?.plans.map((p) => [p.id, p.days, p.price.amount]), [["month", 30, 21000], ["year", 365, 210000]]);
  assert.equal(both?.apiKey, "ock_live");
  assert.equal(both?.webhookSecret, "ock_whk_x");
});

test("a pass's length comes from one list", () => {
  assert.equal(passDays("month"), 30);
  assert.equal(passDays("year"), 365);
  assert.equal(passDays("forever"), null);
});
