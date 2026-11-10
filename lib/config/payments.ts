import type { Plan } from "@bitbaum/paykit/checkout";

/**
 * What Heidi sells and who is paid, read from the environment and nowhere
 * else. No price and no payee is written in this repository: a price in the
 * code is a claim nobody decided, and a wallet address in the code is the one
 * thing that must never be copied by hand.
 *
 * Learners pay Bitcoin to Heidi's own OrangeCat account. The payee is an
 * OrangeCat entity id; OrangeCat resolves the wallet behind it, and
 * `@bitbaum/paykit` reads the payee from there.
 *
 *   ORANGECAT_PAY_ENTITY_ID     the OrangeCat entity that is paid (required)
 *   ORANGECAT_PAY_ENTITY_TYPE   what kind it is; default `project`
 *   ORANGECAT_WEBHOOK_SECRET    the `ock_whk_…` secret of the endpoint that
 *                               delivers `payment.settled` (optional: without
 *                               it the checkout page's own poll settles)
 *   ORANGECAT_BASE_URL          default https://orangecat.ch
 *   HEIDI_PASS_30_SATS          price of 30 days, in sats
 *   HEIDI_PASS_365_SATS         price of 365 days, in sats
 *
 * Payments are ON when the entity id and at least one price are set. Until
 * then every surface says they are not switched on, and no route creates
 * anything.
 */

/** The passes that can exist. Which of them are sold is decided by which have a price. */
const PASSES = [
  { id: "month", days: 30, env: "HEIDI_PASS_30_SATS" },
  { id: "year", days: 365, env: "HEIDI_PASS_365_SATS" },
] as const;

/** How long a pass lasts, by its id. Null for an id that is not a pass. */
export function passDays(planId: string): number | null {
  return PASSES.find((p) => p.id === planId)?.days ?? null;
}

export type PassId = (typeof PASSES)[number]["id"];

export type PaymentsConfig = {
  entityId: string;
  entityType: string;
  baseUrl: string;
  webhookSecret: string | null;
  plans: Plan[];
};

type Env = Record<string, string | undefined>;

function sats(value: string | undefined): number | null {
  if (!value || !/^\d{1,12}$/.test(value.trim())) return null;
  const n = Number(value.trim());
  return n > 0 ? n : null;
}

/** null: payments are not switched on. */
export function paymentsConfig(env: Env = process.env): PaymentsConfig | null {
  const entityId = env.ORANGECAT_PAY_ENTITY_ID?.trim();
  if (!entityId || !/^[0-9a-f-]{36}$/i.test(entityId)) return null;

  const plans: Plan[] = [];
  for (const pass of PASSES) {
    const amount = sats(env[pass.env]);
    if (amount) plans.push({ id: pass.id, days: pass.days, price: { amount, currency: "SAT" }, providerRef: entityId });
  }
  if (!plans.length) return null;

  return {
    entityId,
    entityType: env.ORANGECAT_PAY_ENTITY_TYPE?.trim() || "project",
    baseUrl: (env.ORANGECAT_BASE_URL?.trim() || "https://orangecat.ch").replace(/\/+$/, ""),
    webhookSecret: env.ORANGECAT_WEBHOOK_SECRET?.trim() || null,
    plans,
  };
}

/**
 * What a pass changes. One thing, and it is real: the chat allowance.
 * Everything else in Heidi is the same with and without a pass.
 */
export const PASS_CHAT_MULTIPLIER = 3;
