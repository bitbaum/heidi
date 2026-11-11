import { and, desc, eq, isNull } from "drizzle-orm";
import type { Checkout, Entitlement, EntitlementStore, StoredCheckout } from "@bitbaum/paykit/checkout";
import { db } from "../db/index.ts";
import { entitlements, payCheckouts } from "../db/schema.ts";

/**
 * Where Heidi keeps checkouts and passes: the `EntitlementStore` that
 * `@bitbaum/paykit` settles through, on Postgres.
 */

export type CheckoutRow = typeof payCheckouts.$inferSelect;

export async function saveCheckout(checkout: Checkout): Promise<void> {
  await db.insert(payCheckouts).values({
    id: checkout.id,
    actorId: checkout.reference,
    provider: checkout.provider,
    planId: checkout.planId,
    amount: checkout.amount.amount,
    currency: checkout.amount.currency,
    invoice: checkout.invoice ?? null,
    payUrl: checkout.payUrl ?? null,
    handle: checkout.handle ?? null,
    expiresAt: checkout.expiresAt ? new Date(checkout.expiresAt) : null,
  });
}

/** A checkout, only for the person it was made for. */
export async function ownCheckout(id: string, actorId: string): Promise<CheckoutRow | null> {
  const [row] = await db
    .select()
    .from(payCheckouts)
    .where(and(eq(payCheckouts.id, id), eq(payCheckouts.actorId, actorId)));
  return row ?? null;
}

/** The newest unpaid checkout for this plan that can still be paid, so a second tap does not mint a second invoice. */
export async function openCheckout(actorId: string, planId: string, now: Date = new Date()): Promise<CheckoutRow | null> {
  const rows = await db
    .select()
    .from(payCheckouts)
    .where(and(eq(payCheckouts.actorId, actorId), eq(payCheckouts.planId, planId), isNull(payCheckouts.settledAt)))
    .orderBy(desc(payCheckouts.createdAt))
    .limit(1);
  const row = rows[0];
  // A minute of margin: an invoice about to lapse is not worth showing.
  return row && row.expiresAt && row.expiresAt.getTime() > now.getTime() + 60_000 ? row : null;
}

export async function entitlementOf(actorId: string): Promise<Entitlement | null> {
  const [row] = await db.select().from(entitlements).where(eq(entitlements.actorId, actorId));
  return row ? { planId: row.planId, expiresAt: row.expiresAt.toISOString() } : null;
}

/** The store on a given database: the app's own, or a test's. */
export function entitlementStoreOn(database: typeof db): EntitlementStore {
  return {
    async findCheckout(externalId: string): Promise<StoredCheckout | null> {
      const [row] = await database.select().from(payCheckouts).where(eq(payCheckouts.id, externalId));
      return row
        ? { id: row.id, reference: row.actorId, planId: row.planId, amount: { amount: row.amount, currency: row.currency } }
        : null;
    },

    /**
     * One transaction. The UPDATE claims the checkout only where `settled_at`
     * is still null, so of two callers arriving together exactly one gets a row
     * back; the other returns null and grants nothing. The entitlement row is
     * locked before it is read, so two different payments by one person add up
     * instead of overwriting each other.
     */
    async settleOnce(checkout, grant, paidAt): Promise<Entitlement | null> {
      return database.transaction(async (tx) => {
        const claimed = await tx
          .update(payCheckouts)
          .set({ settledAt: paidAt })
          .where(and(eq(payCheckouts.id, checkout.id), isNull(payCheckouts.settledAt)))
          .returning({ id: payCheckouts.id });
        if (!claimed.length) return null;

        const [current] = await tx.select().from(entitlements).where(eq(entitlements.actorId, checkout.reference)).for("update");
        const next = grant(current ? { planId: current.planId, expiresAt: current.expiresAt.toISOString() } : null);
        await tx
          .insert(entitlements)
          .values({ actorId: checkout.reference, planId: next.planId, expiresAt: new Date(next.expiresAt) })
          .onConflictDoUpdate({
            target: entitlements.actorId,
            set: { planId: next.planId, expiresAt: new Date(next.expiresAt), updatedAt: new Date() },
          });
        return next;
      });
    },
  };
}

export const entitlementStore: EntitlementStore = entitlementStoreOn(db);
