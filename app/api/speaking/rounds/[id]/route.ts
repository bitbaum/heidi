import { caller } from "../../../../../lib/domain/speaking/session.ts";
import { mayAttend, mayEditRound } from "../../../../../lib/domain/speaking/rules.ts";
import { attend, cancelRound, hostOf, roundById, unattend } from "../../../../../lib/domain/speaking/store.ts";
import { callerKey, speakingWrite, tooMany } from "../../../../../lib/domain/limits.ts";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * One round: coming, not coming, and calling it off.
 *
 * `POST` says you are coming and `DELETE` with `{ attending: false }` takes it
 * back; `DELETE` from the host cancels the round itself. Two verbs rather than
 * three routes because they are the same object — and the host case is
 * distinguished by who is asking, not by a flag a stranger could set.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const allowed = speakingWrite.check(callerKey(request, "speaking-attend"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "No such round." }, { status: 404 });

  const round = await roundById(id, { actorId: who.actorId, now: new Date() });
  if (!round) return Response.json({ error: "No such round." }, { status: 404 });

  const allowedToJoin = mayAttend({
    attending: round.attending,
    capacity: round.capacity,
    alreadyAttending: round.mine === true,
  });
  if (!allowedToJoin.ok) {
    // Already coming is success from the caller's point of view: the button
    // they pressed wanted them in the round, and they are in it.
    if (allowedToJoin.reason === "already-attending") return Response.json({ ok: true });
    return Response.json({ error: "This round is full." }, { status: 409 });
  }

  await attend({ roundId: id, actorId: who.actorId, displayName: who.displayName });
  return Response.json({ ok: true });
}

/** Stop coming — or, if you are the host, call the round off. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const allowed = speakingWrite.check(callerKey(request, "speaking-attend"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "No such round." }, { status: 404 });

  const host = await hostOf(id);
  if (!host) return Response.json({ error: "No such round." }, { status: 404 });

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // A DELETE with no body is the common case and is not an error.
  }
  const wantsCancel = (body as { cancel?: unknown })?.cancel === true;

  if (wantsCancel) {
    if (!mayEditRound(host, who.actorId)) {
      // 404 rather than 403: whether somebody else's round exists is not a
      // stranger's to learn from a failed attempt to cancel it.
      return Response.json({ error: "No such round." }, { status: 404 });
    }
    await cancelRound(id);
    return Response.json({ ok: true, cancelled: true });
  }

  await unattend(id, who.actorId);
  return Response.json({ ok: true });
}
