import { applySettlement, isActive, type Entitlement, type PaymentProvider, type Payee, type SettlementOutcome } from "@bitbaum/paykit/checkout";
import { orangeCatProvider } from "@bitbaum/paykit/orangecat";
import { paymentsConfig, type PaymentsConfig } from "../config/payments.ts";
import { dbConfigured } from "../db/index.ts";
import { entitlementOf, entitlementStore, openCheckout, ownCheckout, saveCheckout, type CheckoutRow } from "./store.ts";

/**
 * Selling a pass. Everything that moves or checks money is
 * `@bitbaum/paykit`; this file only joins it to Heidi's config and database.
 */

export function providerFor(config: PaymentsConfig): PaymentProvider {
  return orangeCatProvider({
    baseUrl: config.baseUrl,
    entityType: config.entityType,
    ...(config.webhookSecret ? { webhookSecret: config.webhookSecret } : {}),
  });
}

/**
 * Can somebody pay right now, and if not, why not.
 *
 *   off  no config: payments are not switched on
 *   on   configured. `payee` is OrangeCat's own record of who is paid, or
 *        null when OrangeCat could not be asked just now.
 *
 * Whether the payee can actually receive is not decided here: the wallet the
 * owner connected is not on OrangeCat's public record, so the only honest
 * test is asking for an invoice, and OrangeCat's own sentence is shown when
 * it declines.
 */
export type PaymentsState = { state: "off" } | { state: "on"; config: PaymentsConfig; payee: Payee | null };

let cached: { at: number; key: string; payee: Payee | null } | null = null;
const PAYEE_TTL_MS = 60_000;

export async function paymentsState(now: Date = new Date()): Promise<PaymentsState> {
  const config = paymentsConfig();
  if (!config || !dbConfigured()) return { state: "off" };

  const key = `${config.baseUrl}|${config.entityType}|${config.entityId}`;
  if (!cached || cached.key !== key || now.getTime() - cached.at > PAYEE_TTL_MS) {
    const payee = await providerFor(config).payee?.(config.entityId).catch(() => null);
    cached = { at: now.getTime(), key, payee: payee ?? null };
  }
  return { state: "on", config, payee: cached.payee };
}

export type StartResult =
  | { ok: true; checkout: CheckoutRow }
  | { ok: false; status: 400 | 502 | 503; error: "off" | "unknown-plan" | "provider"; message?: string };

/** An invoice for this person and plan: the one still open, or a new one. */
export async function startCheckout(actorId: string, planId: string): Promise<StartResult> {
  const config = paymentsConfig();
  if (!config || !dbConfigured()) return { ok: false, status: 503, error: "off" };
  const plan = config.plans.find((p) => p.id === planId);
  if (!plan) return { ok: false, status: 400, error: "unknown-plan" };

  const open = await openCheckout(actorId, plan.id);
  if (open && open.amount === plan.price.amount) return { ok: true, checkout: open };

  try {
    const checkout = await providerFor(config).createCheckout({ plan, reference: actorId });
    await saveCheckout(checkout);
    const row = await ownCheckout(checkout.id, actorId);
    if (!row) return { ok: false, status: 502, error: "provider" };
    return { ok: true, checkout: row };
  } catch (error) {
    // OrangeCat's own message is written for the payer ("The owner has not
    // connected a Bitcoin wallet yet."), so it is the honest thing to show.
    return { ok: false, status: 502, error: "provider", message: error instanceof Error ? error.message : undefined };
  }
}

export type CheckoutView = {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  invoice: string | null;
  payUrl: string | null;
  expiresAt: string | null;
  state: "pending" | "paid" | "expired" | "failed";
  entitlement: Entitlement | null;
};

/**
 * Where a checkout stands, asking OrangeCat when Heidi does not know yet.
 *
 * This is the fallback for a webhook that is late, not registered or lost:
 * the page the buyer is looking at asks, and a `paid` answer settles through
 * the same `applySettlement` the webhook uses, so whichever arrives first
 * grants the pass and the other is a duplicate.
 */
export async function checkoutView(id: string, actorId: string): Promise<CheckoutView | null> {
  const row = await ownCheckout(id, actorId);
  if (!row) return null;
  const base = {
    id: row.id,
    planId: row.planId,
    amount: row.amount,
    currency: row.currency,
    invoice: row.invoice,
    payUrl: row.payUrl,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
  };
  if (row.settledAt) return { ...base, state: "paid", entitlement: await entitlementOf(actorId) };

  const config = paymentsConfig();
  if (!config) return { ...base, state: "pending", entitlement: null };

  let state: CheckoutView["state"] = "pending";
  try {
    const status = await providerFor(config).status({ id: row.id, ...(row.handle ? { handle: row.handle } : {}) });
    state = status.state;
    if (status.state === "paid") {
      await settle(
        { provider: row.provider, externalId: row.id, amount: null, providerRef: null, eventId: null },
        config,
        status.paidAt ? new Date(status.paidAt) : new Date(),
      );
    }
  } catch {
    // OrangeCat could not be asked. Past its expiry the invoice is dead either way.
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) state = "expired";
  }
  return { ...base, state, entitlement: state === "paid" ? await entitlementOf(actorId) : null };
}

export function settle(
  event: Parameters<typeof applySettlement>[0]["event"],
  config: PaymentsConfig,
  paidAt: Date = new Date(),
): Promise<SettlementOutcome> {
  return applySettlement({ event, plans: config.plans, store: entitlementStore, paidAt });
}

/** Does this person hold a pass that has not run out. False whenever payments are off. */
export async function hasPass(actorId: string | null | undefined): Promise<boolean> {
  if (!actorId || !paymentsConfig() || !dbConfigured()) return false;
  return isActive(await entitlementOf(actorId).catch(() => null));
}

/**
 * Does whoever is making this request hold a pass.
 *
 * The session is only read when payments are switched on, and the account
 * module is imported at that moment rather than at the top: while payments
 * are off a request pays nothing for this question, not even the import.
 */
export async function callerHasPass(): Promise<boolean> {
  if (!paymentsConfig() || !dbConfigured()) return false;
  const { auth, authEnabled } = await import("../auth/index.ts");
  if (!authEnabled) return false;
  return hasPass((await auth())?.actorId);
}
