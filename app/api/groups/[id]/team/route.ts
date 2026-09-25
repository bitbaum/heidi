import { caller } from "../../../../../lib/domain/groups/session.ts";
import { mayInvite } from "../../../../../lib/domain/groups/rules.ts";
import { groupById } from "../../../../../lib/domain/groups/store.ts";
import { setFocus, teamInputs } from "../../../../../lib/domain/teams/store.ts";
import { teamOverview } from "../../../../../lib/domain/teams/overview.ts";
import { askableLines } from "../../../../../lib/domain/practice/situation-strength.ts";
import { PACK_ITEMS } from "../../../../../lib/domain/practice/published.ts";
import { DOMAINS } from "../../../../../lib/situations/display.ts";
import { callerKey, groupWrite, tooMany } from "../../../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function organiserGroup(id: string, actorId: string) {
  if (!UUID.test(id)) return null;
  const group = await groupById(id);
  if (!group || !mayInvite(group.createdBy, actorId)) return null;
  return group;
}

/**
 * The team overview — for the ORGANISER only, and only of members who chose
 * to share. Everyone else gets the same 404 as a group that does not exist.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const { id } = await params;
  const group = await organiserGroup(id, who.actorId);
  if (!group) return Response.json({ error: "No such group." }, { status: 404 });

  const domain = DOMAINS.find((d) => d.id === group.focus);
  if (!domain) return Response.json({ focus: null, members: [] });
  const focus = domain.scenes.map((s) => s.id);
  const members = teamOverview(await teamInputs(group.id, who.actorId), focus, askableLines(PACK_ITEMS));
  return Response.json({ focus: domain.id, scenes: focus, members });
}

/** Make the group a team with a focus, or back into a study group (`null`). */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const allowed = groupWrite.check(callerKey(request, "team-focus"));
  if (!allowed.allowed) return tooMany(allowed);
  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const { id } = await params;
  const group = await organiserGroup(id, who.actorId);
  if (!group) return Response.json({ error: "No such group." }, { status: 404 });

  let focus: unknown;
  try {
    focus = ((await request.json()) as { focus?: unknown })?.focus;
  } catch {
    return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
  }
  if (focus !== null && !(typeof focus === "string" && DOMAINS.some((d) => d.id === focus))) {
    return Response.json({ error: "unknown focus" }, { status: 400 });
  }
  await setFocus(group.id, focus);
  return Response.json({ focus });
}
