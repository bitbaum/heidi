import { requireActor } from "../../../lib/domain/actor.ts";
import { forget, otherDevices, putRecords } from "../../../lib/domain/progress/store.ts";
import { isDeviceId, SYNC_KEYS, type SyncKey } from "../../../lib/domain/progress/sync.ts";
import { decodeModel } from "../../../lib/domain/practice/model.ts";
import { decodeHistory } from "../../../lib/domain/practice/history.ts";
import { decodeStreak } from "../../../lib/domain/progress/streak.ts";
import { decode as decodeSaved } from "../../../lib/domain/saved/collection.ts";
import { callerKey, progressSync, tooMany } from "../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

const feature = { name: "Progress on every device", toDo: "to sync your progress" };

/** Per record. A learner model of a busy year is a few tens of kilobytes. */
const MAX_BYTES = 256 * 1024;

/**
 * Every value goes through the SAME decoder the browser uses on its own
 * storage, and the decoded form is what is stored. The server never keeps
 * anything a browser would not accept, and a hostile client cannot plant a
 * record that breaks another device's page.
 */
const DECODE: Record<SyncKey, (raw: string) => unknown> = {
  model: decodeModel,
  history: decodeHistory,
  streak: decodeStreak,
  saved: decodeSaved,
};

function deviceOf(request: Request): string | null {
  const d = request.headers.get("x-heidi-device");
  return isDeviceId(d) ? d : null;
}

/** The learner's other devices. */
export async function GET(request: Request) {
  const allowed = progressSync.check(callerKey(request, "progress"));
  if (!allowed.allowed) return tooMany(allowed);
  const who = await requireActor(feature);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const device = deviceOf(request);
  if (!device) return Response.json({ error: "x-heidi-device missing or malformed" }, { status: 400 });
  return Response.json({ devices: await otherDevices(who.actorId, device) });
}

/** This device's own records. */
export async function PUT(request: Request) {
  const allowed = progressSync.check(callerKey(request, "progress"));
  if (!allowed.allowed) return tooMany(allowed);
  const who = await requireActor(feature);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const device = deviceOf(request);
  if (!device) return Response.json({ error: "x-heidi-device missing or malformed" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
  }
  const raw = (body as { values?: unknown })?.values;
  if (!raw || typeof raw !== "object") return Response.json({ error: '"values" must be an object' }, { status: 400 });

  const values: Partial<Record<SyncKey, unknown>> = {};
  for (const key of SYNC_KEYS) {
    const v = (raw as Record<string, unknown>)[key];
    if (v === undefined || v === null) continue;
    const json = JSON.stringify(v);
    if (json.length > MAX_BYTES) return Response.json({ error: `"${key}" is too large` }, { status: 413 });
    const decoded = DECODE[key](json);
    if (decoded === null) return Response.json({ error: `"${key}" is not a valid record` }, { status: 400 });
    values[key] = decoded;
  }
  await putRecords(who.actorId, device, values);
  return Response.json({ ok: true });
}

/**
 * With `?device=`, this device stops syncing and its copy leaves the server.
 * Without, every synced record of this learner is deleted.
 */
export async function DELETE(request: Request) {
  const allowed = progressSync.check(callerKey(request, "progress"));
  if (!allowed.allowed) return tooMany(allowed);
  const who = await requireActor(feature);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const device = new URL(request.url).searchParams.get("device");
  if (device !== null && !isDeviceId(device)) return Response.json({ error: "malformed device" }, { status: 400 });
  await forget(who.actorId, device ?? undefined);
  return Response.json({ ok: true });
}
