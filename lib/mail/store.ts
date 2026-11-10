import { and, eq, inArray } from "drizzle-orm";
import { isDeliverable } from "@bitbaum/accountkit/auth";
import { db } from "../db/index.ts";
import { mailPreferences, preferences, progressDevices, user } from "../db/schema.ts";
import { combineMemories, decodeMemory, dueCount, type Memory } from "../domain/practice/memory.ts";
import { DEFAULT_LOCALE, isLocale, type Locale } from "../i18n/locales.ts";
import { validTimeZone } from "./reminder-policy.ts";

/** Whether this person has agreed to reminders. No row is the same as off. */
export async function remindersOn(actorId: string): Promise<boolean> {
  const [row] = await db.select({ on: mailPreferences.reminders }).from(mailPreferences).where(eq(mailPreferences.actorId, actorId));
  return row?.on === true;
}

/**
 * Switch reminders on or off. Turning on records the browser's time zone, so
 * the mail arrives in their evening; turning off keeps the row (and the
 * reminder history) and changes nothing else.
 */
export async function setReminders(actorId: string, on: boolean, tz?: string | null): Promise<void> {
  const zone = on ? validTimeZone(tz) : undefined;
  await db
    .insert(mailPreferences)
    .values({ actorId, reminders: on, tz: zone ?? null })
    .onConflictDoUpdate({
      target: mailPreferences.actorId,
      set: { reminders: on, ...(zone ? { tz: zone } : {}), ...(on ? { ignored: 0 } : {}), updatedAt: new Date() },
    });
}

export type Candidate = {
  actorId: string;
  email: string;
  emailVerified: boolean;
  deliverable: boolean;
  createdAt: Date;
  locale: Locale;
  tz: string | null;
  lastReminderAt: Date | null;
  ignored: number;
  /** What the synced devices say. */
  due: number;
  memory: Memory;
  lastActiveAt: Date | null;
  streak: number;
};

/**
 * Everyone who has switched reminders on, with what the sweep needs to decide.
 *
 * Only people with synced progress can ever be due: the question schedule
 * lives in the browser unless sync is on (HEIDI.md), so without it there is
 * nothing here to read, `due` is 0, and the policy says «few». Asking for
 * reminders does not by itself move anything off a device.
 */
export async function reminderCandidates(now: Date): Promise<Candidate[]> {
  const rows = await db
    .select({
      actorId: mailPreferences.actorId,
      tz: mailPreferences.tz,
      lastReminderAt: mailPreferences.lastReminderAt,
      ignored: mailPreferences.ignored,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      locale: preferences.locale,
    })
    .from(mailPreferences)
    .innerJoin(user, eq(user.id, mailPreferences.actorId))
    .leftJoin(preferences, eq(preferences.actorId, mailPreferences.actorId))
    .where(eq(mailPreferences.reminders, true));
  if (rows.length === 0) return [];

  const records = await db
    .select()
    .from(progressDevices)
    .where(
      and(
        inArray(
          progressDevices.actorId,
          rows.map((r) => r.actorId),
        ),
        inArray(progressDevices.key, ["memory", "streak"]),
      ),
    );

  return rows.map((r) => {
    const mine = records.filter((x) => x.actorId === r.actorId);
    const memories = mine
      .filter((x) => x.key === "memory")
      .map((x) => decodeMemory(JSON.stringify(x.value)))
      .filter((m): m is Memory => m !== null);
    const memory = memories.length ? combineMemories(memories) : {};
    const seen = Object.values(memory).map((c) => c.seen);
    const streaks = mine
      .filter((x) => x.key === "streak")
      .map((x) => (x.value as { current?: unknown })?.current)
      .filter((n): n is number => typeof n === "number");
    return {
      actorId: r.actorId,
      email: r.email,
      emailVerified: r.emailVerified,
      deliverable: isDeliverable(r.email),
      createdAt: r.createdAt,
      locale: r.locale && isLocale(r.locale) ? r.locale : DEFAULT_LOCALE,
      tz: r.tz,
      lastReminderAt: r.lastReminderAt,
      ignored: r.ignored,
      due: dueCount(memory, now),
      memory,
      lastActiveAt: seen.length ? new Date(Math.max(...seen)) : null,
      streak: streaks.length ? Math.max(...streaks) : 0,
    };
  });
}

/** Written only AFTER the mail was accepted, so a failed send is retried next hour. */
export async function markReminded(actorId: string, at: Date, ignored: number): Promise<void> {
  await db
    .update(mailPreferences)
    .set({ lastReminderAt: at, ignored, updatedAt: at })
    .where(eq(mailPreferences.actorId, actorId));
}
