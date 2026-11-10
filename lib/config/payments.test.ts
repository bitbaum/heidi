import { test } from "node:test";
import assert from "node:assert/strict";
import { payee } from "./payments.ts";

test("the pay button's address is Heidi's public OrangeCat project, built from config", () => {
  assert.equal(payee({}).url, "https://orangecat.ch/projects/01affb7e-b5f6-45d8-a9a4-20bff670d013");
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
