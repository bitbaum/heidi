import { requireActor } from "../../../../lib/domain/actor.ts";
import { remindersOn, setReminders } from "../../../../lib/mail/store.ts";

export const dynamic = "force-dynamic";

const FEATURE = { name: "Reminders", toDo: "to get reminders" };

/** GET — are reminders on for this person? */
export async function GET() {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  return Response.json({ reminders: await remindersOn(who.actorId) });
}

/**
 * POST `{ reminders: boolean, tz?: string }` — switch reminders on or off.
 * `tz` is the browser's own IANA zone, read when they switch it on, so the
 * mail arrives in their evening.
 */
export async function POST(request: Request) {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const body = (await request.json().catch(() => null)) as { reminders?: unknown; tz?: unknown } | null;
  if (typeof body?.reminders !== "boolean") return Response.json({ error: "reminders must be true or false" }, { status: 400 });
  await setReminders(who.actorId, body.reminders, typeof body.tz === "string" ? body.tz.slice(0, 64) : null);
  return Response.json({ reminders: body.reminders });
}
