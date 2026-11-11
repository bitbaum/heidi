import { paymentsConfig } from "../../../../lib/config/payments.ts";
import { dbConfigured } from "../../../../lib/db/index.ts";
import { providerFor, settle } from "../../../../lib/pay/service.ts";

export const dynamic = "force-dynamic";

/**
 * POST — OrangeCat's `payment.settled`, for the endpoint registered against
 * the account that owns the paid entity.
 *
 * The body is read as text and handed over untouched: the signature is over
 * the bytes, and a parsed-and-reserialised body no longer matches it.
 *
 * What it answers:
 *   503  payments are not switched on here, or there is no webhook secret
 *   400  not authentic (and no reason given)
 *   200  authentic: settled, already settled, or a payment that is not one of
 *        Heidi's checkouts. The same account receives every payment to the
 *        entity, including ones made on OrangeCat's own page, and answering
 *        those with an error would make OrangeCat retry them for a day.
 */
export async function POST(request: Request) {
  const config = paymentsConfig();
  if (!config || !config.webhookSecret || !dbConfigured()) {
    return Response.json({ error: "Payments are not switched on." }, { status: 503 });
  }

  const raw = await request.text();
  const verdict = providerFor(config).verifyWebhook(raw, request.headers);
  if (!verdict.ok) return Response.json({ error: "Bad signature." }, { status: 400 });
  if (!verdict.event) return Response.json({ received: true, outcome: "ignored" });

  const result = await settle(verdict.event, config);
  if (result.outcome === "underpaid" || result.outcome === "wrong-product" || result.outcome === "unknown-plan") {
    console.warn(`[pay] settlement not granted: ${result.outcome} (${verdict.event.externalId})`);
  }
  return Response.json({ received: true, outcome: result.outcome });
}
