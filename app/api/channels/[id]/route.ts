import { requireActor } from "../../../../lib/domain/actor.ts";
import { actorKey, channelWrite, tooMany } from "../../../../lib/domain/limits.ts";
import { unfollow } from "../../../../lib/channels/store.ts";
import { isChannelId } from "../../../../lib/channels/youtube.ts";
import { FEATURE } from "../route.ts";

export const dynamic = "force-dynamic";

/** DELETE — stop following. The channel row stays for whoever else follows it. */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const allowed = channelWrite.check(actorKey(who.actorId, "channel-write"));
  if (!allowed.allowed) return tooMany(allowed);

  const { id } = await context.params;
  if (!isChannelId(id)) return Response.json({ error: "invalid" }, { status: 400 });
  await unfollow(who.actorId, id);
  return new Response(null, { status: 204 });
}
