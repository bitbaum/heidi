import { requireActor } from "../../../../lib/domain/actor.ts";
import { publicKey } from "../../../../lib/push/send.ts";

export const dynamic = "force-dynamic";

/**
 * GET — the key a browser subscribes with, read from the server at request
 * time so it is the key the server signs with. 503 when notifications are
 * not configured here, which the settings page turns into a sentence.
 */
export async function GET() {
  const who = await requireActor({ name: "Notifications", toDo: "to turn on notifications" });
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const key = publicKey();
  if (!key) return Response.json({ error: "unconfigured" }, { status: 503 });
  return Response.json({ publicKey: key });
}
