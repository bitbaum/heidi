import { caller } from "../../../../lib/domain/groups/session.ts";
import { looksLikeToken } from "../../../../lib/domain/groups/invite.ts";
import { mayJoin } from "../../../../lib/domain/groups/rules.ts";
import { addMember, groupByToken, membersOf } from "../../../../lib/domain/groups/store.ts";
import { callerKey, groupWrite, tooMany } from "../../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

/**
 * Join by invite token.
 *
 * The token IS the credential — a self-organised group has no approval step —
 * so the order here matters: rate limit, then shape, then lookup. A hostile
 * string never reaches the query, and a script cannot walk the token space.
 *
 * An unknown token and a full group answer differently on purpose. "This link
 * doesn't work" and "this group is full" send a person to different places,
 * and neither reveals anything to someone who did not already hold a link.
 */
export async function POST(request: Request) {
  const allowed = groupWrite.check(callerKey(request, "group-join"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  const token = (body as { token?: unknown })?.token;
  if (!looksLikeToken(token)) {
    return Response.json({ error: "That invite link is not valid." }, { status: 400 });
  }

  const group = await groupByToken(token);
  if (!group) return Response.json({ error: "That invite link is not valid." }, { status: 404 });

  const members = await membersOf(group.id);
  const verdict = mayJoin(members, who.actorId);

  if (!verdict.ok && verdict.reason === "group-full") {
    return Response.json({ error: "That group is full." }, { status: 409 });
  }

  // "already-member" is not an error for the PERSON — they followed their own
  // link twice, or came back after leaving. Skip the write, send them in.
  if (verdict.ok) {
    await addMember({ groupId: group.id, actorId: who.actorId, displayName: who.displayName });
  }

  // Deliberately no invite token in the response: joining does not make you
  // an inviter.
  return Response.json({
    group: { id: group.id, name: group.name, createdBy: group.createdBy, createdAt: group.createdAt },
  });
}
