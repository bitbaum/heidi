import { probeByokKey } from "@bitbaum/ai-kit/byok-probe";
import { redact } from "../../../../lib/domain/model/byok.ts";
import { findProvider } from "../../../../lib/domain/model/providers.ts";
import { callerKey, modelCheck, tooMany } from "../../../../lib/domain/limits.ts";

export const dynamic = "force-dynamic";

const MAX_KEY = 400;
/** A picker, not a catalogue dump: the best-ranked first, and plenty of them. */
const MAX_MODELS = 200;

/**
 * Does this key work, and which models can it use?
 *
 * ai-kit's `probeByokKey` asks the vendor itself — the key's own models list
 * (OpenRouter: its `/key` endpoint, because its `/models` answers 200 to any
 * key). It spends no tokens, which the old check here did: one real
 * completion per test. It never throws, never echoes the key, and reports a
 * vendor it could not reach as "could not check", not as a bad key.
 *
 * The answer carries the models, best suggestion first, so the settings sheet
 * offers a choice from what this reader can actually use rather than a text
 * box and a guess.
 */
export async function POST(request: Request) {
  const allowed = modelCheck.check(callerKey(request, "model-check"));
  if (!allowed.allowed) return tooMany(allowed);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "bad request", models: [], suggested: null }, { status: 400 });
  }

  const b = (body ?? {}) as { provider?: unknown; key?: unknown };
  const provider = typeof b.provider === "string" ? findProvider(b.provider) : undefined;
  const key = typeof b.key === "string" ? b.key.trim() : "";
  if (!provider || !key || key.length > MAX_KEY || /[\r\n]/.test(key)) {
    return Response.json({ ok: false, message: "bad request", models: [], suggested: null }, { status: 400 });
  }

  const probe = await probeByokKey(provider.id, key);
  return Response.json({
    ok: probe.ok,
    // "Could not check" and "wrong key" are different answers to a reader.
    reachable: probe.status !== null,
    // The vendor's own words, with any credential-shaped string removed again
    // on our side — ai-kit redacts, and this is the belt to its braces.
    message: redact(probe.message).slice(0, 300),
    models: probe.models.slice(0, MAX_MODELS),
    suggested: probe.suggested,
  });
}
