import { caller } from "../../../../../lib/domain/groups/session.ts";
import { mayInvite } from "../../../../../lib/domain/groups/rules.ts";
import { groupById, rotateInvite } from "../../../../../lib/domain/groups/store.ts";
import { callerKey, groupWrite, tooMany } from "../../../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The invite link, and the ability to burn it.
 *
 * Only the organiser, and that is narrow on purpose: a group is a room
 * somebody opened, and if every member can re-share the key then "who can get
 * in" is unknowable to the person responsible for it. Widening this later is a
 * decision; starting wide cannot be undone for links already in the world.
 *
 * A non-organiser gets 404, not 403 — there is nothing here for them and
 * confirming the group exists is not a courtesy they need.
 */
async function organiserGroup(id: string, actorId: string) {
  if (!UUID.test(id)) return null;
  const group = await groupById(id);
  if (!group || !mayInvite(group.createdBy, actorId)) return null;
  return group;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const { id } = await params;
  const group = await organiserGroup(id, who.actorId);
  if (!group) return Response.json({ error: "No such group." }, { status: 404 });

  return Response.json({ token: group.inviteToken });
}

/** Rotate it. The only way to un-invite a link already sitting in a chat. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const allowed = groupWrite.check(callerKey(request, "group-invite"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const { id } = await params;
  const group = await organiserGroup(id, who.actorId);
  if (!group) return Response.json({ error: "No such group." }, { status: 404 });

  return Response.json({ token: await rotateInvite(group.id) });
}
