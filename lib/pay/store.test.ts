import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { applySettlement, type Plan, type SettledEvent } from "@bitbaum/paykit/checkout";
import * as schema from "../db/schema.ts";
import { entitlementStoreOn } from "./store.ts";

const month: Plan = { id: "month", days: 30, price: { amount: 21000, currency: "SAT" }, providerRef: "entity-1" };
const DAY = 86_400_000;

async function database() {
  const pg = new PGlite();
  const dir = join(process.cwd(), "drizzle");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    for (const statement of readFileSync(join(dir, file), "utf8").split("--> statement-breakpoint")) {
      if (statement.trim()) await pg.exec(statement);
    }
  }
  const db = drizzle(pg, { schema });
  return { pg, db, store: entitlementStoreOn(db as never) };
}

const settled = (externalId: string): SettledEvent => ({
  provider: "orangecat",
  externalId,
  amount: { amount: 21000, currency: "SAT" },
  providerRef: "entity-1",
  eventId: null,
});

/**
 * Against Heidi's own migrations on a real Postgres: the webhook is delivered
 * more than once and the buyer's page polls at the same moment, and the pass
 * is still granted exactly once.
 */
test("a payment reported twice, at once, grants its days once", async () => {
  const { pg, db, store } = await database();
  await db.insert(schema.payCheckouts).values({ id: "pi-1", actorId: "actor-1", provider: "orangecat", planId: "month", amount: 21000, currency: "SAT" });
  const paidAt = new Date("2026-11-10T12:00:00Z");

  const outcomes = await Promise.all([
    applySettlement({ event: settled("pi-1"), plans: [month], store, paidAt }),
    applySettlement({ event: settled("pi-1"), plans: [month], store, paidAt }),
    applySettlement({ event: settled("pi-1"), plans: [month], store, paidAt }),
  ]);
  assert.deepEqual(outcomes.map((o) => o.outcome).sort(), ["duplicate", "duplicate", "granted"]);

  const rows = await db.select().from(schema.entitlements);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].actorId, "actor-1");
  assert.equal(rows[0].expiresAt.getTime(), paidAt.getTime() + 30 * DAY);
  await pg.close();
});

test("a second payment adds its days to the end, and somebody else's payment grants nothing", async () => {
  const { pg, db, store } = await database();
  await db.insert(schema.payCheckouts).values([
    { id: "pi-1", actorId: "actor-1", provider: "orangecat", planId: "month", amount: 21000, currency: "SAT" },
    { id: "pi-2", actorId: "actor-1", provider: "orangecat", planId: "month", amount: 21000, currency: "SAT" },
  ]);
  const first = new Date("2026-11-10T12:00:00Z");
  await applySettlement({ event: settled("pi-1"), plans: [month], store, paidAt: first });
  await applySettlement({ event: settled("pi-2"), plans: [month], store, paidAt: new Date(first.getTime() + 5 * DAY) });
  // A payment to the same OrangeCat account that Heidi never created a checkout for.
  const stranger = await applySettlement({ event: settled("pi-unknown"), plans: [month], store });
  assert.equal(stranger.outcome, "unknown-checkout");
  // Less than the stored price: recorded as not settled.
  await db.insert(schema.payCheckouts).values({ id: "pi-3", actorId: "actor-2", provider: "orangecat", planId: "month", amount: 21000, currency: "SAT" });
  const short = await applySettlement({ event: { ...settled("pi-3"), amount: { amount: 100, currency: "SAT" } }, plans: [month], store });
  assert.equal(short.outcome, "underpaid");

  const rows = await db.select().from(schema.entitlements);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].expiresAt.getTime(), first.getTime() + 60 * DAY);
  await pg.close();
});
