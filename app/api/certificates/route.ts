import { requireActor } from "../../../lib/domain/actor.ts";
import { deviceModels, issueCertificate } from "../../../lib/domain/progress/store.ts";
import { evidenceFor, qualifies } from "../../../lib/domain/progress/certificate.ts";
import { askableLines } from "../../../lib/domain/practice/situation-strength.ts";
import { PACK_ITEMS } from "../../../lib/domain/practice/published.ts";
import { callerKey, progressSync, tooMany } from "../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

const feature = { name: "Certificates", toDo: "to get a certificate" };

/**
 * Issue a certificate for one situation — from the SERVER's copy of the
 * learner's progress, which exists only if they switched sync on.
 *
 *   201 / 200   issued (or already issued at this size): `{ id }`
 *   412         no synced progress at all — sync is off
 *   409         synced progress does not reach "sure" yet: `{ held, askable }`
 */
export async function POST(request: Request) {
  const allowed = progressSync.check(callerKey(request, "certificate"));
  if (!allowed.allowed) return tooMany(allowed);
  const who = await requireActor(feature);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  let scene: unknown;
  try {
    scene = ((await request.json()) as { scene?: unknown })?.scene;
  } catch {
    return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
  }
  const askable = typeof scene === "string" ? askableLines(PACK_ITEMS).get(scene) : undefined;
  if (typeof scene !== "string" || !askable || askable.size === 0) {
    return Response.json({ error: "unknown situation" }, { status: 404 });
  }

  const models = await deviceModels(who.actorId);
  if (models.length === 0) return Response.json({ error: "no synced progress" }, { status: 412 });

  const s = evidenceFor(scene, models, askable);
  if (!qualifies(s)) return Response.json({ held: s.held, askable: s.askable }, { status: 409 });

  const cert = await issueCertificate(who.actorId, s);
  return Response.json({ id: cert.id }, { status: 201 });
}
