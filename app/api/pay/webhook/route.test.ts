import { test } from "node:test";
import assert from "node:assert/strict";
import { signOrangeCatPayload } from "@bitbaum/paykit/orangecat";
import { POST } from "./route.ts";

const ENV = ["ORANGECAT_PAY_ENTITY_ID", "ORANGECAT_WEBHOOK_SECRET", "HEIDI_PASS_30_SATS", "DATABASE_URL"] as const;

function withEnv(values: Partial<Record<(typeof ENV)[number], string>>, run: () => Promise<void>) {
  const before = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
  for (const k of ENV) delete process.env[k];
  Object.assign(process.env, values);
  return run().finally(() => {
    for (const k of ENV) {
      if (before[k] === undefined) delete process.env[k];
      else process.env[k] = before[k];
    }
  });
}

const on = {
  ORANGECAT_PAY_ENTITY_ID: "01affb7e-b5f6-45d8-a9a4-20bff670d013",
  ORANGECAT_WEBHOOK_SECRET: "ock_whk_test",
  HEIDI_PASS_30_SATS: "21000",
  // Never connected to: every case below is answered before a query.
  DATABASE_URL: "postgres://unused.invalid/heidi",
};

const post = (body: string, signature?: string) =>
  POST(new Request("https://heidi.orangecat.ch/api/pay/webhook", { method: "POST", body, headers: signature ? { "x-orangecat-signature": signature } : {} }));

test("with payments not switched on the webhook says so and touches nothing", async () => {
  await withEnv({}, async () => {
    assert.equal((await post("{}")).status, 503);
  });
  // Configured but with no secret, nothing can be authentic.
  await withEnv({ ...on, ORANGECAT_WEBHOOK_SECRET: "" }, async () => {
    assert.equal((await post("{}")).status, 503);
  });
});

test("an unsigned or forged call is refused; an authentic one about something else is acknowledged", async () => {
  await withEnv(on, async () => {
    const settled = JSON.stringify({ type: "payment.settled", externalId: "pi-1", amountBtc: "0.00021" });
    assert.equal((await post(settled)).status, 400);
    assert.equal((await post(settled, signOrangeCatPayload(settled, "forged"))).status, 400);

    const other = JSON.stringify({ type: "project.created" });
    const response = await post(other, signOrangeCatPayload(other, "ock_whk_test"));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { received: true, outcome: "ignored" });
  });
});
