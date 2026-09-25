import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { certificates, progressDevices } from "../../db/schema.ts";
import { decodeModel, type LearnerModel } from "../practice/model.ts";
import type { SituationStrength } from "../practice/situation-strength.ts";
import { SYNC_KEYS, type SyncKey } from "./sync.ts";

export type DeviceRecords = {
  device: string;
  values: Partial<Record<SyncKey, unknown>>;
  updatedAt: Partial<Record<SyncKey, string>>;
};

/** This learner's OTHER devices, each with its records. */
export async function otherDevices(actorId: string, deviceId: string): Promise<DeviceRecords[]> {
  const rows = await db
    .select()
    .from(progressDevices)
    .where(and(eq(progressDevices.actorId, actorId), ne(progressDevices.deviceId, deviceId)));
  const byDevice = new Map<string, DeviceRecords>();
  for (const r of rows) {
    const key = r.key as SyncKey;
    if (!SYNC_KEYS.includes(key)) continue;
    const d = byDevice.get(r.deviceId) ?? { device: r.deviceId, values: {}, updatedAt: {} };
    d.values[key] = r.value;
    d.updatedAt[key] = r.updatedAt.toISOString();
    byDevice.set(r.deviceId, d);
  }
  return [...byDevice.values()];
}

/**
 * Store this device's records. A value that has not changed keeps its
 * `updated_at` — which is what lets another device tell a saved list edited
 * here from one merely pushed again.
 */
export async function putRecords(
  actorId: string,
  deviceId: string,
  values: Partial<Record<SyncKey, unknown>>,
): Promise<void> {
  for (const [key, value] of Object.entries(values)) {
    await db
      .insert(progressDevices)
      .values({ actorId, deviceId, key, value })
      .onConflictDoUpdate({
        target: [progressDevices.actorId, progressDevices.deviceId, progressDevices.key],
        set: {
          value,
          updatedAt: sql`CASE WHEN ${progressDevices.value} = excluded.value THEN ${progressDevices.updatedAt} ELSE now() END`,
        },
      });
  }
}

/** Turning sync off on one device, or "delete everything synced" with no device. */
export async function forget(actorId: string, deviceId?: string): Promise<void> {
  await db
    .delete(progressDevices)
    .where(deviceId ? and(eq(progressDevices.actorId, actorId), eq(progressDevices.deviceId, deviceId)) : eq(progressDevices.actorId, actorId));
}

/** Every device's learner model for this learner — the certificate's evidence. */
export async function deviceModels(actorId: string): Promise<LearnerModel[]> {
  const rows = await db
    .select({ value: progressDevices.value })
    .from(progressDevices)
    .where(and(eq(progressDevices.actorId, actorId), eq(progressDevices.key, "model")));
  return rows.map((r) => decodeModel(JSON.stringify(r.value)));
}

export type Certificate = typeof certificates.$inferSelect;

/**
 * Issue a certificate, or return the one already issued for this situation at
 * this size — asking twice is one certificate, and a scene that has grown
 * since gets a new one that says so.
 */
export async function issueCertificate(actorId: string, s: SituationStrength): Promise<Certificate> {
  const [existing] = await db
    .select()
    .from(certificates)
    .where(and(eq(certificates.actorId, actorId), eq(certificates.sceneId, s.scene), eq(certificates.askable, s.askable)))
    .orderBy(desc(certificates.issuedAt))
    .limit(1);
  if (existing) return existing;
  const [row] = await db
    .insert(certificates)
    .values({ actorId, sceneId: s.scene, askable: s.askable, held: s.held, stuck: s.stuck })
    .returning();
  return row;
}

export async function certificateById(id: string): Promise<Certificate | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db.select().from(certificates).where(eq(certificates.id, id));
  return row ?? null;
}
