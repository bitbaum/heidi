import { requireActor } from "../../../../lib/domain/actor.ts";
import { actorKey, pushWrite, tooMany } from "../../../../lib/domain/limits.ts";
import { subscribe, subscriptionCount, unsubscribe } from "../../../../lib/channels/store.ts";
import { DEFAULT_LOCALE, isLocale } from "../../../../lib/i18n/locales.ts";

export const dynamic = "force-dynamic";

const FEATURE = { name: "Notifications", toDo: "to turn on notifications" };

/** A push endpoint is an https URL at a push service; nothing else is stored. */
function endpointOf(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2000) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

/** GET — how many browsers of this person are subscribed. */
export async function GET() {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  return Response.json({ devices: await subscriptionCount(who.actorId) });
}

/** POST — this browser wants to be told. Idempotent on the endpoint. */
export async function POST(request: Request) {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const allowed = pushWrite.check(actorKey(who.actorId, "push"));
  if (!allowed.allowed) return tooMany(allowed);

  const body = (await request.json().catch(() => null)) as { subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }; locale?: unknown } | null;
  const endpoint = endpointOf(body?.subscription?.endpoint);
  const p256dh = body?.subscription?.keys?.p256dh;
  const auth = body?.subscription?.keys?.auth;
  if (!endpoint || typeof p256dh !== "string" || typeof auth !== "string" || !p256dh || !auth) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const locale = typeof body?.locale === "string" && isLocale(body.locale) ? body.locale : DEFAULT_LOCALE;
  await subscribe(who.actorId, { endpoint, p256dh: p256dh.slice(0, 500), auth: auth.slice(0, 200) }, locale);
  return Response.json({ ok: true }, { status: 201 });
}

/** DELETE — this browser no longer wants to be told. */
export async function DELETE(request: Request) {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const body = (await request.json().catch(() => null)) as { endpoint?: unknown } | null;
  const endpoint = endpointOf(body?.endpoint);
  if (!endpoint) return Response.json({ error: "invalid" }, { status: 400 });
  await unsubscribe(who.actorId, endpoint);
  return new Response(null, { status: 204 });
}
