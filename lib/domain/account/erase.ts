import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "../../db/index.ts";
import {
  channelFollows,
  certificates,
  chatFeedback,
  conversations,
  entitlements,
  groupMembers,
  groupMessages,
  mailPreferences,
  payCheckouts,
  preferences,
  progressDevices,
  pushSubscriptions,
  roundAttendance,
  speakingTopics,
  studyGroups,
  topicInterest,
} from "../../db/schema.ts";

/**
 * WHAT DELETING AN ACCOUNT LEAVES BEHIND, and why this exists.
 *
 * accountkit deletes the login (the user, its accounts, its sessions). Every
 * table of Heidi's own is keyed by `actor_id` with no foreign key to it — the
 * person "lives" in the account service — so deleting an account used to leave
 * their synced progress, reminder setting, saved conversations, group
 * memberships, follows, push subscriptions and certificates behind, attached
 * to nobody. Found 2026-11-10 by deleting a test account and counting rows.
 *
 * `ERASED` is every table that holds a person, and says what happens to it.
 * `erase.test.ts` walks the schema and fails when a table with a person
 * column is missing here, so the next feature cannot forget.
 */
export const ERASED = {
  progress_devices: "deleted",
  mail_preferences: "deleted",
  preferences: "deleted",
  entitlements: "deleted: a pass ends with the account",
  pay_checkouts: "deleted; the payment itself is OrangeCat's record, which holds no Heidi account",
  certificates: "deleted",
  channel_follows: "deleted",
  push_subscriptions: "deleted",
  topic_interest: "deleted",
  round_attendance: "deleted",
  group_members: "deleted: they leave every group",
  conversations: "deleted with their messages (cascade) and their message feedback",
  conversation_messages: "deleted with their conversation (cascade)",
  group_messages: "kept for the others in the group, no longer attributed to anybody",
  study_groups: "a group they made passes to its longest-standing member, or is deleted when nobody is left",
  speaking_topics: "kept, no longer attributed to anybody",
} as const;

/** What a deleted person's rows are attributed to afterwards: nobody. */
export const NOBODY = "deleted-account";

export async function eraseActorData(actorId: string): Promise<void> {
  if (!actorId) return;
  await db.transaction(async (tx) => {
    // Their conversations take their messages with them (ON DELETE CASCADE);
    // thumbs on those messages are keyed by id with no foreign key, so by hand.
    const owned = await tx.select({ id: conversations.id }).from(conversations).where(eq(conversations.actorId, actorId));
    if (owned.length) {
      await tx.delete(chatFeedback).where(inArray(chatFeedback.conversationId, owned.map((c) => c.id)));
      await tx.delete(conversations).where(eq(conversations.actorId, actorId));
    }

    // Groups they made: hand over to whoever has been in longest, else delete.
    const made = await tx.select({ id: studyGroups.id }).from(studyGroups).where(eq(studyGroups.createdBy, actorId));
    for (const group of made) {
      const [next] = await tx
        .select({ actorId: groupMembers.actorId })
        .from(groupMembers)
        .where(and(eq(groupMembers.groupId, group.id), ne(groupMembers.actorId, actorId)))
        .orderBy(sql`${groupMembers.joinedAt} asc`)
        .limit(1);
      if (next) await tx.update(studyGroups).set({ createdBy: next.actorId }).where(eq(studyGroups.id, group.id));
      else await tx.delete(studyGroups).where(eq(studyGroups.id, group.id));
    }

    await tx.update(groupMessages).set({ authorId: NOBODY }).where(eq(groupMessages.authorId, actorId));
    await tx.update(speakingTopics).set({ proposedBy: NOBODY, proposerName: "—" }).where(eq(speakingTopics.proposedBy, actorId));

    await tx.delete(groupMembers).where(eq(groupMembers.actorId, actorId));
    await tx.delete(topicInterest).where(eq(topicInterest.actorId, actorId));
    await tx.delete(roundAttendance).where(eq(roundAttendance.actorId, actorId));
    await tx.delete(progressDevices).where(eq(progressDevices.actorId, actorId));
    await tx.delete(certificates).where(eq(certificates.actorId, actorId));
    await tx.delete(channelFollows).where(eq(channelFollows.actorId, actorId));
    await tx.delete(pushSubscriptions).where(eq(pushSubscriptions.actorId, actorId));
    await tx.delete(mailPreferences).where(eq(mailPreferences.actorId, actorId));
    await tx.delete(entitlements).where(eq(entitlements.actorId, actorId));
    await tx.delete(payCheckouts).where(eq(payCheckouts.actorId, actorId));
    await tx.delete(preferences).where(eq(preferences.actorId, actorId));
  });
}
