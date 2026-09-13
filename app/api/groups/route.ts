import { caller } from "../../../lib/domain/groups/session.ts";
import { checkName } from "../../../lib/domain/groups/rules.ts";
import { createGroup, groupsFor } from "../../../lib/domain/groups/store.ts";
import { callerKey, groupWrite, tooMany } from "../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

/** The groups you are in. Never carries an invite token — see `groupsFor`. */
export async function GET() {
  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  return Response.json({ groups: await groupsFor(who.actorId) });
}

/** Make a group. You are its organiser and its first member. */
export async function POST(request: Request) {
  const allowed = groupWrite.check(callerKey(request, "group-write"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  const raw = (body as { name?: unknown })?.name;
  const name = checkName(typeof raw === "string" ? raw : "");
  if (!name.ok) {
    return Response.json({ error: `That name is ${name.problem.replace("-", " ")}.` }, { status: 400 });
  }

  const group = await createGroup({ name: name.name, actorId: who.actorId, displayName: who.displayName });
  // The organiser gets the token back because they are the one who invites.
  return Response.json({ group }, { status: 201 });
}
