import { serverVoiceConfigured, synthesize } from "../../../lib/voice/server-tts.ts";
import { callerKey, speak as speakLimit, tooMany } from "../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: the node test runner resolves
// neither, the same reason as `app/api/check/route.ts`.

export const dynamic = "force-dynamic";

/** One spoken answer, generously; past this nobody is listening, they are reading. */
const MAX_CHARS = 600;
/** The same line twice is one call. Bounded, so memory cannot grow with traffic. */
const CACHE_LIMIT = 200;
const cache = new Map<string, Uint8Array>();

/** GET — whether this deployment can speak at all, so the page can offer it. */
export function GET() {
  return Response.json({ available: serverVoiceConfigured() }, { headers: { "Cache-Control": "no-store" } });
}

/** POST { text } — the line as a WAV file, or 503 when no voice answered. */
export async function POST(request: Request) {
  const allowed = speakLimit.check(callerKey(request, "speak"));
  if (!allowed.allowed) return tooMany(allowed);
  if (!serverVoiceConfigured()) return Response.json({ error: "no server voice here" }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return Response.json({ error: "nothing to read" }, { status: 400 });
  if (text.length > MAX_CHARS) return Response.json({ error: "too long to read aloud" }, { status: 413 });

  let wav = cache.get(text);
  if (!wav) {
    wav = (await synthesize(text)) ?? undefined;
    if (!wav) return Response.json({ error: "no voice answered" }, { status: 503 });
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value as string);
    cache.set(text, wav);
  }
  return new Response(wav as BodyInit, {
    headers: { "Content-Type": "audio/wav", "Cache-Control": "private, max-age=86400" },
  });
}
