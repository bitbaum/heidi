import { and, count, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { certificates, groupMembers, progressDevices, studyGroups } from "../../db/schema.ts";
import { decodeModel, type LearnerModel } from "../practice/model.ts";
import type { MemberInput } from "./overview.ts";

export async function setFocus(groupId: string, focus: string | null): Promise<void> {
  await db.update(studyGroups).set({ focus }).where(eq(studyGroups.id, groupId));
}

export async function setSharing(groupId: string, actorId: string, share: boolean): Promise<void> {
  await db
    .update(groupMembers)
    .set({ sharesProgress: share })
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.actorId, actorId)));
}

/**
 * The organiser's view of the current members: who shares, and — only for
 * those who do — their synced models and certificate count. A member who does
 * not share contributes their name and nothing is read for them.
 */
export async function teamInputs(groupId: string, organiser: string): Promise<MemberInput[]> {
  const members = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), isNull(groupMembers.leftAt)));
  const sharing = members.filter((m) => m.sharesProgress && m.actorId !== organiser).map((m) => m.actorId);

  const models = new Map<string, LearnerModel[]>();
  const certs = new Map<string, number>();
  if (sharing.length > 0) {
    const rows = await db
      .select({ actorId: progressDevices.actorId, value: progressDevices.value })
      .from(progressDevices)
      .where(and(inArray(progressDevices.actorId, sharing), eq(progressDevices.key, "model")));
    for (const r of rows) models.set(r.actorId, [...(models.get(r.actorId) ?? []), decodeModel(JSON.stringify(r.value))]);
    const counts = await db
      .select({ actorId: certificates.actorId, n: count() })
      .from(certificates)
      .where(inArray(certificates.actorId, sharing))
      .groupBy(certificates.actorId);
    for (const c of counts) certs.set(c.actorId, c.n);
  }

  return members
    .filter((m) => m.actorId !== organiser)
    .map((m) => ({
      actorId: m.actorId,
      displayName: m.displayName,
      shares: m.sharesProgress,
      models: m.sharesProgress ? (models.get(m.actorId) ?? []) : [],
      certificates: m.sharesProgress ? (certs.get(m.actorId) ?? 0) : 0,
    }));
}

/** Whether this member currently shows the organiser their standings. */
export async function isSharing(groupId: string, actorId: string): Promise<boolean> {
  const [row] = await db
    .select({ shares: groupMembers.sharesProgress })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.actorId, actorId)));
  return row?.shares ?? false;
}
