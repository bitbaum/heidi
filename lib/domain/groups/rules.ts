/**
 * What may happen in a group, decided without a database.
 *
 * Every rule here is one an API route would otherwise express as an `if` next
 * to a query, where it cannot be tested and tends to be written twice with a
 * difference. Pure functions instead: the route reads rows, asks these, and
 * does what it is told.
 */

import type { Thread } from "threadkit";
import { HEIDI_ID, MAX_BODY_LENGTH, MAX_MEMBERS, MAX_NAME_LENGTH, type GroupMember } from "./types.ts";

/** An actor currently in the group — not one who has left. */
export function isActiveMember(members: GroupMember[], actorId: string): boolean {
  return members.some((m) => m.actorId === actorId && !m.leftAt);
}

export function activeMembers(members: GroupMember[]): GroupMember[] {
  return members.filter((m) => !m.leftAt);
}

export type JoinRefusal = "unknown-invite" | "group-full" | "already-member";

/**
 * May this actor join?
 *
 * Re-joining with a valid link is allowed and is NOT an error: someone who
 * left and came back, or who opened the link twice, should land in the group
 * rather than read a failure. The caller distinguishes the two so it can skip
 * the insert, which is why "already-member" is reported rather than silently
 * treated as success.
 */
export function mayJoin(members: GroupMember[], actorId: string): { ok: true } | { ok: false; reason: JoinRefusal } {
  if (isActiveMember(members, actorId)) return { ok: false, reason: "already-member" };
  if (activeMembers(members).length >= MAX_MEMBERS) return { ok: false, reason: "group-full" };
  return { ok: true };
}

/** Only a member may read or write. Absence of a row is the whole check. */
export function mayPost(members: GroupMember[], actorId: string): boolean {
  return isActiveMember(members, actorId);
}

/**
 * Only the person who made the group may hand out or rotate its link.
 *
 * The narrow rule on purpose: a group is a room someone opened, and letting
 * every member re-share the key makes "who can get in" unknowable to the one
 * person responsible for it. Widening this later is a decision; starting wide
 * cannot be undone for links already in the world.
 */
export function mayInvite(createdBy: string, actorId: string): boolean {
  return createdBy === actorId;
}

export type NameProblem = "empty" | "too-long";

export function checkName(raw: string): { ok: true; name: string } | { ok: false; problem: NameProblem } {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, problem: "empty" };
  if (name.length > MAX_NAME_LENGTH) return { ok: false, problem: "too-long" };
  return { ok: true, name };
}

export type BodyProblem = "empty" | "too-long";

export function checkBody(raw: string): { ok: true; body: string } | { ok: false; problem: BodyProblem } {
  const body = raw.trim();
  if (!body) return { ok: false, problem: "empty" };
  if (body.length > MAX_BODY_LENGTH) return { ok: false, problem: "too-long" };
  return { ok: true, body };
}

/**
 * The group as threadkit sees it.
 *
 * Heidi is composed in here rather than stored as a member row: she is in
 * every group by construction, so a row for her could only ever say the same
 * thing and would be one more thing to write correctly forever.
 *
 * Visibility is the honest part. The person who made the group sees it from
 * the start because there was nothing before them. Everyone else sees from
 * the moment they joined — threadkit's safe default — so inviting someone
 * into an ongoing conversation does not hand them its back catalogue by
 * accident. Heidi sees from the start because she has to answer "why did they
 * say it like that?" about a message three turns up.
 */
export function groupThread(
  group: { id: string; createdBy: string; createdAt: string },
  members: GroupMember[],
): Thread {
  const createdAt = new Date(group.createdAt);
  return {
    id: group.id,
    createdAt,
    participants: [
      ...activeMembers(members).map((m) => ({
        actorId: m.actorId,
        kind: "human" as const,
        role: m.actorId === group.createdBy ? "organiser" : "learner",
        joinedAt: new Date(m.joinedAt),
        ...(m.actorId === group.createdBy ? { visibleFrom: "thread-start" as const } : {}),
      })),
      {
        actorId: HEIDI_ID,
        kind: "ai" as const,
        role: "assistant",
        joinedAt: createdAt,
        visibleFrom: "thread-start" as const,
      },
    ],
  };
}
