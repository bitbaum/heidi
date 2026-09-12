import { complete } from "@bitbaum/ai-kit";
import { byokChain, readByok, redact } from "@/lib/domain/model/byok";
import { findProvider } from "@/lib/domain/model/providers";
import { callerKey, modelCheck, tooMany } from "@/lib/domain/limits";

export const dynamic = "force-dynamic";

/**
 * Does this key actually work, right now?
 *
 * Saving a credential and showing a green tick without ever using it is the
 * standard way to build this, and it is a lie told at the exact moment someone
 * is deciding whether to trust you. ai-kit's own doctrine says it plainly:
 * absence of failure is not evidence of success. So this makes one real call,
 * as small as one can be, and reports what happened.
 *
 * The key is used and dropped. It is not stored, not logged, and not echoed
 * back — including in the error path, which is where credentials usually leak.
 */
export async function POST(request: Request) {
  // Tighter than the chat: this makes a real outbound call with whatever key
  // it is handed, which makes it the one endpoint here that could be used to
  // test stolen credentials in bulk.
  const allowed = modelCheck.check(callerKey(request, "model-check"));
  if (!allowed.allowed) return tooMany(allowed);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "Could not read that request." }, { status: 400 });
  }

  const parsed = readByok((body as { byok?: unknown })?.byok);
  if (!parsed.ok) return Response.json({ ok: false, reason: parsed.reason }, { status: 400 });

  const links = byokChain(parsed.config);
  if (!links) return Response.json({ ok: false, reason: "unknown provider" }, { status: 400 });

  try {
    const { text, id } = await complete({
      chain: links.chain,
      env: links.env,
      // Small on purpose: this is someone else's money, and one word proves the
      // credential, the model id and the endpoint all line up.
      maxTokens: 64,
      temperature: 0,
      timeoutMs: 20_000,
      signal: request.signal,
      messages: [{ role: "user", content: "Reply with the single word: ok" }],
    });

    return Response.json({
      ok: true,
      model: id ?? parsed.config.model,
      vision: Boolean(findProvider(parsed.config.provider)?.visionModel),
      sample: text.trim().slice(0, 40),
    });
  } catch (error) {
    const message = redact(error instanceof Error ? error.message : String(error));
    console.error("[heidi/model-check]", message);
    // The vendor's own words are genuinely the most useful thing here — "model
    // not found", "insufficient credit" — so they are passed on, redacted.
    return Response.json({ ok: false, reason: message.slice(0, 300) }, { status: 200 });
  }
}
