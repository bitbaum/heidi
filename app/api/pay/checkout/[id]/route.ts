import { requireActor } from "../../../../../lib/domain/actor.ts";
import { checkoutView } from "../../../../../lib/pay/service.ts";

export const dynamic = "force-dynamic";

const FEATURE = { name: "Passes", toDo: "to see your payment" };

/** GET — where this person's checkout stands. Asks OrangeCat, and settles when it says paid. */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const { id } = await context.params;
  const view = await checkoutView(id, who.actorId);
  if (!view) return Response.json({ error: "not-found" }, { status: 404 });
  return Response.json(view, { headers: { "cache-control": "no-store" } });
}
