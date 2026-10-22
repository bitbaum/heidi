import { requireActor } from "../../../../lib/domain/actor.ts";
import { markSeen } from "../../../../lib/channels/store.ts";
import { FEATURE } from "../route.ts";

export const dynamic = "force-dynamic";

/**
 * POST — the learner has looked at their channels page. What "new" means from
 * now on is "published after this moment". Sent by the page after it
 * rendered, so the markers the person is looking at stay put until they come
 * back; done in the render it would clear the very markers it was drawing.
 */
export async function POST() {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  await markSeen(who.actorId);
  return new Response(null, { status: 204 });
}
