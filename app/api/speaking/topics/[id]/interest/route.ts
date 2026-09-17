import { caller } from "../../../../../../lib/domain/speaking/session.ts";
import { addInterest, removeInterest, topicExists } from "../../../../../../lib/domain/speaking/store.ts";
import { callerKey, speakingWrite, tooMany } from "../../../../../../lib/domain/limits.ts";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * "I would come to that", and taking it back.
 *
 * Both idempotent. A double tap on a phone is the normal case rather than an
 * error, and a button that reports a failure for pressing it twice teaches
 * people the feature is broken.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return setInterest(request, params, true);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return setInterest(request, params, false);
}

async function setInterest(request: Request, params: Promise<{ id: string }>, wanted: boolean) {
  const allowed = speakingWrite.check(callerKey(request, "speaking-interest"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const { id } = await params;
  // Checked before the write rather than relying on the foreign key, so a bad
  // id answers 404 instead of a constraint violation dressed up as a 500.
  if (!UUID.test(id) || !(await topicExists(id))) {
    return Response.json({ error: "No such topic." }, { status: 404 });
  }

  if (wanted) await addInterest(id, who.actorId);
  else await removeInterest(id, who.actorId);

  return Response.json({ ok: true });
}
