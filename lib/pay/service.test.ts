import { test, before, after, mock } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../db/schema.ts";

/**
 * The whole path a learner's payment takes, against Heidi's own migrations on
 * a real Postgres and an OrangeCat that answers as the real one does:
 * an invoice is asked for once, the open page polls, OrangeCat says paid, and
 * the pass is granted exactly once.
 */

const ENV = { HEIDI_PASS_30_SATS: "21000", DATABASE_URL: "postgres://pglite.invalid/heidi" };
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;

let pg: PGlite;
let service: typeof import("./service.ts");
let orangecat: { created: number; status: string; calls: string[] };

before(async () => {
  for (const [k, v] of Object.entries(ENV)) {
    saved[k] = process.env[k];
    process.env[k] = v;
  }
  pg = new PGlite();
  const dir = join(process.cwd(), "drizzle");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    for (const statement of readFileSync(join(dir, file), "utf8").split("--> statement-breakpoint")) {
      if (statement.trim()) await pg.exec(statement);
    }
  }
  const db = drizzle(pg, { schema });
  mock.module(new URL("../db/index.ts", import.meta.url).href, {
    namedExports: { db, getDb: () => db, dbConfigured: () => true, schema },
  });

  orangecat = { created: 0, status: "invoice_ready", calls: [] };
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    orangecat.calls.push(`${init?.method ?? "GET"} ${new URL(url).pathname}`);
    const json = (status: number, data: unknown) =>
      new Response(JSON.stringify({ success: true, data }), { status, headers: { "content-type": "application/json" } });
    if (url.endsWith("/api/v1/payments/public") && init?.method === "POST") {
      orangecat.created++;
      return json(201, {
        payment_intent: { id: `00000000-0000-4000-8000-00000000000${orangecat.created}`, expires_at: new Date(Date.now() + 600_000).toISOString() },
        status_token: "t".repeat(43),
        qr_data: "LNBC210U1TEST",
        expires_in_seconds: 600,
      });
    }
    return json(200, { status: orangecat.status, paid_at: orangecat.status === "paid" ? new Date().toISOString() : null });
  }) as typeof fetch;

  service = await import("./service.ts");
});

after(async () => {
  globalThis.fetch = realFetch;
  for (const k of Object.keys(ENV)) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  await pg.close();
});

test("one invoice per learner and plan: a second press shows the one still open", async () => {
  const first = await service.startCheckout("actor-1", "month");
  assert.ok(first.ok);
  const again = await service.startCheckout("actor-1", "month");
  assert.ok(again.ok);
  assert.equal(again.ok && again.checkout.id, first.ok && first.checkout.id);
  assert.equal(orangecat.created, 1);
  // Heidi's project is paid, with no key: the account-less call.
  assert.equal(orangecat.calls[0], "POST /api/v1/payments/public");

  const unknown = await service.startCheckout("actor-1", "lifetime");
  assert.deepEqual(unknown.ok ? null : [unknown.status, unknown.error], [400, "unknown-plan"]);
});

test("the checkout is only the buyer's, waits while unpaid, and the poll grants the pass once", async () => {
  const started = await service.startCheckout("actor-2", "month");
  assert.ok(started.ok);
  const id = started.ok ? started.checkout.id : "";

  assert.equal(await service.checkoutView(id, "somebody-else"), null);
  assert.equal(await service.hasPass("actor-2"), false);

  const waiting = await service.checkoutView(id, "actor-2");
  assert.equal(waiting?.state, "pending");
  assert.equal(waiting?.entitlement, null);
  // Nothing secret reaches the page.
  assert.equal(JSON.stringify(waiting).includes("t".repeat(43)), false);

  orangecat.status = "paid";
  const [a, b] = await Promise.all([service.checkoutView(id, "actor-2"), service.checkoutView(id, "actor-2")]);
  assert.equal(a?.state, "paid");
  assert.equal(b?.state, "paid");
  assert.equal(await service.hasPass("actor-2"), true);

  const rows = await pg.query<{ expires_at: Date }>("select expires_at from entitlements where actor_id = 'actor-2'");
  assert.equal(rows.rows.length, 1);
  const days = (new Date(rows.rows[0].expires_at).getTime() - Date.now()) / 86_400_000;
  assert.ok(days > 29.9 && days < 30.1, `the pass runs ${days} days, not 30`);

  // A later look asks OrangeCat nothing: the checkout is settled here.
  const before = orangecat.calls.length;
  assert.equal((await service.checkoutView(id, "actor-2"))?.state, "paid");
  assert.equal(orangecat.calls.length, before);
  orangecat.status = "invoice_ready";
});

test("the webhook's settlement for a checkout that the poll already settled is a duplicate", async () => {
  const config = (await import("../config/payments.ts")).paymentsConfig();
  assert.ok(config);
  const rows = await pg.query<{ id: string }>("select id from pay_checkouts where actor_id = 'actor-2'");
  const outcome = await service.settle(
    { provider: "orangecat", externalId: rows.rows[0].id, amount: { amount: 21000, currency: "SAT" }, providerRef: config.entityId, eventId: "evt" },
    config,
  );
  assert.equal(outcome.outcome, "duplicate");
});
