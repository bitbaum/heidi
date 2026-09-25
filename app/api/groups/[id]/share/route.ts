import { caller } from "../../../../../lib/domain/groups/session.ts";
import { mayPost } from "../../../../../lib/domain/groups/rules.ts";
import { groupById, membersOf } from "../../../../../lib/domain/groups/store.ts";
import { setSharing } from "../../../../../lib/domain/teams/store.ts";
import { callerKey, groupWrite, tooMany } from "../../../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A member turns sharing with the organiser on or off — for THEMSELVES only;
 * there is no way to set it for somebody else.
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const allowed = groupWrite.check(callerKey(request, "team-share"));
  if (!allowed.allowed) return tooMany(allowed);
  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "No such group." }, { status: 404 });
  const group = await groupById(id);
  if (!group || !mayPost(await membersOf(group.id), who.actorId)) {
    return Response.json({ error: "No such group." }, { status: 404 });
  }
  let share: unknown;
  try {
    share = ((await request.json()) as { share?: unknown })?.share;
  } catch {
    return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
  }
  if (typeof share !== "boolean") return Response.json({ error: '"share" must be true or false' }, { status: 400 });
  await setSharing(group.id, who.actorId, share);
  return Response.json({ share });
}
