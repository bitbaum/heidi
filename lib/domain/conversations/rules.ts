/**
 * What may happen to a private conversation, decided without a database.
 *
 * Shorter than the group rules, and that is the point: a conversation has
 * exactly one owner, so "may I read this" is one comparison rather than a
 * membership question. Keeping it here anyway means the route asks rather than
 * decides, which is what stops an authorisation check from living only inside
 * the `if` that happens to call it.
 */

/** Long enough for a pasted thread, short enough that it is not a file. */
export const MAX_BODY = 2000;

/**
 * How many conversations one actor may hold.
 *
 * A ceiling, not a pruner: at the limit, creation is REFUSED with something
 * the person can act on. Silently deleting their oldest thread to make room
 * would be destroying data they never asked us to destroy.
 */
export const MAX_CONVERSATIONS = 200;

/** How long one conversation may get before it should become a new one. */
export const MAX_MESSAGES = 400;

export type Owned = { actorId: string; deletedAt?: string | null };

/**
 * Only the owner, and a tombstoned conversation belongs to nobody.
 *
 * Read and write are the same question here. They are separate functions
 * because they will not stay the same question — a shared conversation is an
 * obvious next feature — and a route that called `mayRead` for both would be
 * the thing that quietly grants writes on the day it changes.
 */
export function mayRead(conversation: Owned | null, actorId: string): boolean {
  if (!conversation || conversation.deletedAt) return false;
  return conversation.actorId === actorId;
}

export function mayWrite(conversation: Owned | null, actorId: string): boolean {
  if (!conversation || conversation.deletedAt) return false;
  return conversation.actorId === actorId;
}

export type BodyProblem = "empty" | "too-long";

export function checkBody(raw: unknown): { ok: true; body: string } | { ok: false; problem: BodyProblem } {
  const body = typeof raw === "string" ? raw.trim() : "";
  if (!body) return { ok: false, problem: "empty" };
  if (body.length > MAX_BODY) return { ok: false, problem: "too-long" };
  return { ok: true, body };
}

export type RoomProblem = "too-many-conversations" | "conversation-full";

export function mayCreate(count: number): { ok: true } | { ok: false; problem: RoomProblem } {
  return count >= MAX_CONVERSATIONS ? { ok: false, problem: "too-many-conversations" } : { ok: true };
}

export function mayAppend(messageCount: number): { ok: true } | { ok: false; problem: RoomProblem } {
  return messageCount >= MAX_MESSAGES ? { ok: false, problem: "conversation-full" } : { ok: true };
}
