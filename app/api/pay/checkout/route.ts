import { requireActor } from "../../../../lib/domain/actor.ts";
import { callerKey, payCheckout, tooMany } from "../../../../lib/domain/limits.ts";
import { startCheckout } from "../../../../lib/pay/service.ts";

export const dynamic = "force-dynamic";

const FEATURE = { name: "Passes", toDo: "to buy a pass" };

/**
 * POST `{ plan }` — an invoice for a pass, for the signed-in person.
 *
 * Answers the checkout's id and nothing secret; the page at
 * `/pass/checkout/<id>` shows it. 503 `off` while payments are not switched on.
 */
export async function POST(request: Request) {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const allowed = payCheckout.check(callerKey(request, "pay"));
  if (!allowed.allowed) return tooMany(allowed);

  const body = (await request.json().catch(() => null)) as { plan?: unknown } | null;
  if (typeof body?.plan !== "string") return Response.json({ error: "unknown-plan" }, { status: 400 });

  const started = await startCheckout(who.actorId, body.plan);
  if (!started.ok) return Response.json({ error: started.error, message: started.message }, { status: started.status });
  return Response.json({ id: started.checkout.id }, { status: 201 });
}
