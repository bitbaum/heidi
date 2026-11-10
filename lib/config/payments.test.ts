import { test } from "node:test";
import assert from "node:assert/strict";
import { passDays, paymentsConfig } from "./payments.ts";

const ENTITY = "01affb7e-b5f6-45d8-a9a4-20bff670d013";

test("payments are off until there is a payee AND a price", () => {
  assert.equal(paymentsConfig({}), null);
  assert.equal(paymentsConfig({ ORANGECAT_PAY_ENTITY_ID: ENTITY }), null);
  assert.equal(paymentsConfig({ HEIDI_PASS_30_SATS: "21000" }), null);
  assert.equal(paymentsConfig({ ORANGECAT_PAY_ENTITY_ID: "not-an-id", HEIDI_PASS_30_SATS: "21000" }), null);
  assert.equal(paymentsConfig({ ORANGECAT_PAY_ENTITY_ID: ENTITY, HEIDI_PASS_30_SATS: "0" }), null);
  assert.equal(paymentsConfig({ ORANGECAT_PAY_ENTITY_ID: ENTITY, HEIDI_PASS_30_SATS: "free" }), null);
});

test("only the passes that have a price are sold, and the payee is the configured entity", () => {
  const config = paymentsConfig({ ORANGECAT_PAY_ENTITY_ID: ENTITY, HEIDI_PASS_30_SATS: " 21000 " });
  assert.deepEqual(config?.plans, [{ id: "month", days: 30, price: { amount: 21000, currency: "SAT" }, providerRef: ENTITY }]);
  assert.equal(config?.entityType, "project");
  assert.equal(config?.baseUrl, "https://orangecat.ch");
  assert.equal(config?.webhookSecret, null);

  const both = paymentsConfig({
    ORANGECAT_PAY_ENTITY_ID: ENTITY,
    ORANGECAT_PAY_ENTITY_TYPE: "product",
    ORANGECAT_WEBHOOK_SECRET: "ock_whk_x",
    HEIDI_PASS_30_SATS: "21000",
    HEIDI_PASS_365_SATS: "210000",
  });
  assert.deepEqual(both?.plans.map((p) => [p.id, p.days, p.price.amount]), [["month", 30, 21000], ["year", 365, 210000]]);
  assert.equal(both?.entityType, "product");
  assert.equal(both?.webhookSecret, "ock_whk_x");
});

test("a pass's length comes from one list", () => {
  assert.equal(passDays("month"), 30);
  assert.equal(passDays("year"), 365);
  assert.equal(passDays("forever"), null);
});
