import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { groupMembers, groupMessages, studyGroups } from "../../db/schema.ts";
import { newInviteToken } from "./invite.ts";
import type { GroupMember, GroupMessage, StudyGroup } from "./types.ts";

/**
 * Every query a group needs, and nothing else.
 *
 * Kept apart from `rules.ts` on purpose: the rules are decisions and are
 * tested with no database at all, while this file is plumbing and is tested
 * by using it. Mixing them would make the decisions untestable, which is how
 * an authorisation rule ends up asserted only by the route that happens to
 * call it.
 *
 * Nothing here decides who may do what — callers ask `rules.ts` first. The
 * one exception is `groupByToken`, where the lookup IS the check.
 */

const iso = (d: Date | string): string => (d instanceof Date ? d.toISOString() : d);

/** Create the group and put its author in it, or neither. */
export async function createGroup(args: {
  name: string;
  actorId: string;
  displayName: string;
}): Promise<StudyGroup> {
  return db.transaction(async (tx) => {
    const [group] = await tx
      .insert(studyGroups)
      .values({ name: args.name, createdBy: args.actorId, inviteToken: newInviteToken() })
      .returning();

    await tx.insert(groupMembers).values({
      groupId: group.id,
      actorId: args.actorId,
      displayName: args.displayName,
    });

    return {
      id: group.id,
      name: group.name,
      createdBy: group.createdBy,
      createdAt: iso(group.createdAt),
      inviteToken: group.inviteToken,
    };
  });
}

/** The groups this actor is currently in, newest first. */
export async function groupsFor(actorId: string): Promise<Array<StudyGroup & { memberCount: number }>> {
  const rows = await db
    .select({
      id: studyGroups.id,
      name: studyGroups.name,
      createdBy: studyGroups.createdBy,
      createdAt: studyGroups.createdAt,
      memberCount: sql<number>`(
        select count(*)::int from ${groupMembers} m
         where m.group_id = ${studyGroups.id} and m.left_at is null
      )`,
    })
    .from(studyGroups)
    .innerJoin(
      groupMembers,
      and(eq(groupMembers.groupId, studyGroups.id), eq(groupMembers.actorId, actorId), isNull(groupMembers.leftAt)),
    )
    .orderBy(asc(studyGroups.createdAt));

  // The invite token is deliberately absent: this list is rendered for every
  // member, and only the organiser may see the key to the room.
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    createdBy: r.createdBy,
    createdAt: iso(r.createdAt),
    memberCount: Number(r.memberCount),
  }));
}

/** The group itself, with no permission implied. */
export async function groupById(id: string): Promise<StudyGroup | null> {
  const [row] = await db.select().from(studyGroups).where(eq(studyGroups.id, id)).limit(1);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    createdBy: row.createdBy,
    createdAt: iso(row.createdAt),
    inviteToken: row.inviteToken,
  };
}

/**
 * Resolve an invite link.
 *
 * Here the lookup IS the authorisation: holding the token is what entitles
 * someone to see the group exists. Callers must have run `looksLikeToken`
 * first so that a hostile string never reaches the query at all.
 */
export async function groupByToken(token: string): Promise<StudyGroup | null> {
  const [row] = await db.select().from(studyGroups).where(eq(studyGroups.inviteToken, token)).limit(1);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    createdBy: row.createdBy,
    createdAt: iso(row.createdAt),
    inviteToken: row.inviteToken,
  };
}

/** Everyone who has ever been in the group, including those who left. */
export async function membersOf(groupId: string): Promise<GroupMember[]> {
  const rows = await db
    .select()
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(asc(groupMembers.joinedAt));

  return rows.map((r) => ({
    actorId: r.actorId,
    displayName: r.displayName,
    joinedAt: iso(r.joinedAt),
    leftAt: r.leftAt ? iso(r.leftAt) : null,
  }));
}

/**
 * Add a member, or bring a returning one back.
 *
 * Upsert rather than insert: the primary key is (group, actor), so someone who
 * left and followed the link again would otherwise hit a constraint violation
 * — a 500 for a thing that should simply work. Re-joining clears `leftAt` and
 * refreshes the display name, and does NOT reset `joinedAt`, because that
 * timestamp is what threadkit uses to decide how far back they can read.
 */
export async function addMember(args: { groupId: string; actorId: string; displayName: string }): Promise<void> {
  await db
    .insert(groupMembers)
    .values({ groupId: args.groupId, actorId: args.actorId, displayName: args.displayName })
    .onConflictDoUpdate({
      target: [groupMembers.groupId, groupMembers.actorId],
      set: { leftAt: null, displayName: args.displayName },
    });
}

export async function removeMember(groupId: string, actorId: string): Promise<void> {
  await db
    .update(groupMembers)
    .set({ leftAt: new Date() })
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.actorId, actorId)));
}

/** The whole thread, oldest first. Visibility is applied by the caller. */
export async function messagesIn(groupId: string): Promise<GroupMessage[]> {
  const rows = await db
    .select()
    .from(groupMessages)
    .where(eq(groupMessages.groupId, groupId))
    .orderBy(asc(groupMessages.createdAt));

  return rows.map((r) => ({
    id: r.id,
    authorId: r.authorId,
    body: r.body,
    createdAt: iso(r.createdAt),
    ...(r.answer ? { answer: r.answer } : {}),
  }));
}

export async function postMessage(args: {
  groupId: string;
  authorId: string;
  body: string;
  answer?: unknown;
}): Promise<GroupMessage> {
  const [row] = await db
    .insert(groupMessages)
    .values({
      groupId: args.groupId,
      authorId: args.authorId,
      body: args.body,
      answer: args.answer ?? null,
    })
    .returning();

  return {
    id: row.id,
    authorId: row.authorId,
    body: row.body,
    createdAt: iso(row.createdAt),
    ...(row.answer ? { answer: row.answer } : {}),
  };
}

/** Rotate the link, which is the only way to un-invite someone's WhatsApp. */
export async function rotateInvite(groupId: string): Promise<string> {
  const token = newInviteToken();
  await db.update(studyGroups).set({ inviteToken: token }).where(eq(studyGroups.id, groupId));
  return token;
}
