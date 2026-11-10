import type { Plan } from "@bitbaum/paykit/checkout";

/**
 * Who is paid and what Heidi sells, read from config and nowhere else.
 *
 * Learners pay Heidi in Bitcoin on OrangeCat, straight into the wallet behind
 * Heidi's own OrangeCat project. The payee is that project's ID: OrangeCat
 * resolves the wallet, and no wallet address is written in this repository or
 * copied by hand anywhere. No price is written here either: a price in the
 * code is a claim nobody decided.
 *
 * TWO THINGS HANG ON THIS FILE.
 *
 * 1. THE LINK, always there: the button on /pass that opens the payee's
 *    public page on OrangeCat (`payee().url`). It needs no configuration.
 *
 * 2. THE AUTOMATIC PASS, off until configured: Heidi asks OrangeCat for an
 *    invoice through `@bitbaum/paykit`, remembers which learner it was for,
 *    and grants a time-boxed pass when OrangeCat reports the payment settled.
 *    It is ON when at least one price is set; until then /pass says it is not
 *    switched on, and no route creates anything.
 *
 *   ORANGECAT_PAY_ENTITY_ID     the OrangeCat entity that is paid
 *                               (default: Heidi's project)
 *   ORANGECAT_PAY_ENTITY_TYPE   what kind it is; default `project`
 *   ORANGECAT_BASE_URL          default https://orangecat.ch
 *   HEIDI_PASS_30_SATS          price of 30 days, in whole sats
 *   HEIDI_PASS_365_SATS         price of 365 days, in whole sats (optional)
 *   ORANGECAT_API_KEY           an `ock_…` integration key with the scopes
 *                               payments.write and payments.read (optional:
 *                               without it, and whenever the key's owner is
 *                               the payee, paykit uses OrangeCat's
 *                               account-less payment call)
 *   ORANGECAT_WEBHOOK_SECRET    the `ock_whk_…` secret of the endpoint that
 *                               delivers `payment.settled` to
 *                               /api/pay/webhook (optional: without it the
 *                               checkout page's own poll settles)
 */
const HEIDI_ORANGECAT_PROJECT = "01affb7e-b5f6-45d8-a9a4-20bff670d013";

type Env = Record<string, string | undefined>;

export type Payee = {
  entityId: string;
  entityType: string;
  baseUrl: string;
  /** The payee's public page on OrangeCat, where a payment is made by hand. */
  url: string;
};

export function payee(env: Env = process.env): Payee {
  const configured = env.ORANGECAT_PAY_ENTITY_ID?.trim();
  const entityId = configured && /^[0-9a-f-]{36}$/i.test(configured) ? configured : HEIDI_ORANGECAT_PROJECT;
  const entityType = env.ORANGECAT_PAY_ENTITY_TYPE?.trim() || "project";
  const baseUrl = (env.ORANGECAT_BASE_URL?.trim() || "https://orangecat.ch").replace(/\/+$/, "");
  return { entityId, entityType, baseUrl, url: `${baseUrl}/${entityType}s/${entityId}` };
}

/** The passes that can exist. Which of them are sold is decided by which have a price. */
const PASSES = [
  { id: "month", days: 30, env: "HEIDI_PASS_30_SATS" },
  { id: "year", days: 365, env: "HEIDI_PASS_365_SATS" },
] as const;

/** How long a pass lasts, by its id. Null for an id that is not a pass. */
export function passDays(planId: string): number | null {
  return PASSES.find((p) => p.id === planId)?.days ?? null;
}

export type PaymentsConfig = Payee & {
  apiKey: string | null;
  webhookSecret: string | null;
  plans: Plan[];
};

function sats(value: string | undefined): number | null {
  if (!value || !/^\d{1,12}$/.test(value.trim())) return null;
  const n = Number(value.trim());
  return n > 0 ? n : null;
}

/** null: the automatic pass is not switched on. */
export function paymentsConfig(env: Env = process.env): PaymentsConfig | null {
  const to = payee(env);
  const plans: Plan[] = [];
  for (const pass of PASSES) {
    const amount = sats(env[pass.env]);
    if (amount) plans.push({ id: pass.id, days: pass.days, price: { amount, currency: "SAT" }, providerRef: to.entityId });
  }
  if (!plans.length) return null;

  return {
    ...to,
    apiKey: env.ORANGECAT_API_KEY?.trim() || null,
    webhookSecret: env.ORANGECAT_WEBHOOK_SECRET?.trim() || null,
    plans,
  };
}

/**
 * What a pass changes. One thing, and it is real: the chat allowance.
 * Everything else in Heidi is the same with and without a pass.
 */
export const PASS_CHAT_MULTIPLIER = 3;
