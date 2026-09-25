import { EMPTY_MODEL, type LearnerModel, type Trace } from "../practice/model.ts";
import type { History } from "../practice/history.ts";
import { EMPTY_STREAK, type Streak } from "./streak.ts";

/**
 * Progress on more than one device — how the pieces combine.
 *
 * THE RULE THAT MAKES IT CORRECT: a device only ever stores what IT observed.
 * The server keeps each device's contribution separately, and a page shows
 * this device's own record combined with the others'. Nothing fetched is ever
 * written back into the local record, so however often two devices sync,
 * nothing is counted twice — the failure a "merge everything into everything"
 * sync produces on its second round.
 *
 * Each kind of record combines the way its meaning demands:
 *
 *   model     SUM. A trace is counts of questions asked and missed; two
 *             devices answered different questions, so their counts add.
 *   history   UNION. The questions seen recently, to avoid repeats.
 *   streak    The record with the latest practice day, and the best of all.
 *             A streak stores no list of dates (on purpose — see streak.ts),
 *             so two devices practising on alternate days cannot be stitched
 *             into one run; the newest record is the honest answer.
 *   saved     NOT combined here. The word list is edited in place — a removal
 *             must stay removed — so the newest list is adopted as this
 *             device's own (`newestSaved`), rather than unioned into a list
 *             that would bring deleted words back.
 */

export type SyncKey = "model" | "history" | "streak" | "saved";
export const SYNC_KEYS: readonly SyncKey[] = ["model", "history", "streak", "saved"];

function addTraces(a: Record<string, Trace>, b: Record<string, Trace>): Record<string, Trace> {
  const out: Record<string, Trace> = { ...a };
  for (const [k, t] of Object.entries(b)) {
    const cur = out[k];
    out[k] = cur ? { asked: cur.asked + t.asked, missed: cur.missed + t.missed } : t;
  }
  return out;
}

export function sumModels(models: readonly LearnerModel[]): LearnerModel {
  return models.reduce<LearnerModel>(
    (acc, m) => ({
      topics: addTraces(acc.topics, m.topics),
      scenes: addTraces(acc.scenes, m.scenes),
      groups: addTraces(acc.groups, m.groups),
      words: addTraces(acc.words, m.words),
      lines: addTraces(acc.lines, m.lines),
    }),
    EMPTY_MODEL,
  );
}

export function unionHistory(histories: readonly History[]): History {
  return [...new Set(histories.flat())];
}

export function combineStreaks(streaks: readonly Streak[]): Streak {
  if (streaks.length === 0) return EMPTY_STREAK;
  const newest = [...streaks].sort(
    (a, b) => (b.lastDay ?? "").localeCompare(a.lastDay ?? "") || b.current - a.current,
  )[0];
  return { ...newest, best: Math.max(...streaks.map((s) => s.best), newest.current) };
}

/** One device's pushed record of one key, as the server returns it. */
export type Snapshot<T> = { value: T; updatedAt: string };

/**
 * The saved list to keep: another device's, if it changed after this one last
 * did; otherwise this device's own. Returns null when nothing should change.
 */
export function newestSaved<T>(ownChangedAt: string | null, others: readonly Snapshot<T>[]): T | null {
  const newest = [...others].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (!newest) return null;
  return ownChangedAt === null || newest.updatedAt > ownChangedAt ? newest.value : null;
}

// ---------------------------------------------------------------------------
// What the browser keeps about syncing
// ---------------------------------------------------------------------------

/**
 * Whether this browser syncs, and as which device.
 *
 * OFF UNTIL THE LEARNER TURNS IT ON, on the settings page, signed in. `device`
 * is random and names nothing but "this browser"; `savedChangedAt` is when the
 * saved list last changed HERE, so a newer list from elsewhere can be told
 * from an older one.
 */
export type SyncSetting = { on: boolean; device: string; savedChangedAt: string | null };

const DEVICE = /^[A-Za-z0-9_-]{16,64}$/;

export function decodeSyncSetting(raw: string): SyncSetting | null {
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (!o || typeof o !== "object" || typeof o.device !== "string" || !DEVICE.test(o.device)) return null;
    return {
      on: o.on === true,
      device: o.device,
      savedChangedAt: typeof o.savedChangedAt === "string" ? o.savedChangedAt : null,
    };
  } catch {
    return null;
  }
}

export function isDeviceId(value: unknown): value is string {
  return typeof value === "string" && DEVICE.test(value);
}

/**
 * The other devices' records, as last fetched — a cache, so a page shows the
 * combined view without waiting for the network, and a reload offline still
 * shows everything. Never merged into this device's own records.
 */
export type OtherDevices = { model: LearnerModel[]; history: History[]; streak: Streak[] };
export const NO_OTHERS: OtherDevices = { model: [], history: [], streak: [] };

export function decodeOthers(
  raw: string,
  decode: { model(raw: string): LearnerModel; history(raw: string): History | null; streak(raw: string): Streak | null },
): OtherDevices | null {
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (!o || typeof o !== "object") return null;
    const each = <T>(v: unknown, d: (raw: string) => T | null): T[] =>
      Array.isArray(v) ? v.map((x) => d(JSON.stringify(x))).filter((x): x is T => x !== null) : [];
    return { model: each(o.model, decode.model), history: each(o.history, decode.history), streak: each(o.streak, decode.streak) };
  } catch {
    return null;
  }
}
