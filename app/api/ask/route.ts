import { complete, freeChain, usableChain, createHealthTracker } from "@bitbaum/ai-kit";
import { VARIETY } from "@/lib/variety/active";
import { systemPrompt, understandPrompt, producePrompt } from "@/lib/variety/prompt";
import { parseAnswer } from "@/lib/domain/ask/parse";
import type { Intent } from "@/lib/domain/ask/types";

export const dynamic = "force-dynamic";

/**
 * One per process, exported so a future /api/health/ai route reports the same
 * tracker this route feeds rather than a second, always-empty one.
 */
export const llmHealth = createHealthTracker();

/** Long enough for a real message, short enough that nobody pastes a novel. */
const MAX_INPUT = 2000;

/** Per link, not shared — a shared deadline is spent by the first vendor. */
const TIMEOUT_MS = 20_000;

function bad(error: string, status: number, operator = false) {
  return Response.json({ error, operator }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad("Could not read that request.", 400);
  }

  const { input, intent } = (body ?? {}) as { input?: unknown; intent?: unknown };

  const text = typeof input === "string" ? input.trim() : "";
  if (!text) return bad("Give Heidi something to work with.", 400);
  if (text.length > MAX_INPUT) return bad(`That is longer than ${MAX_INPUT} characters.`, 400);

  const mode: Intent = intent === "produce" ? "produce" : "understand";

  const chain = usableChain(freeChain("HEIDI"), process.env);
  if (chain.length === 0) {
    // The honest answer, not a crash and not a fake one. The deterministic
    // half of Heidi still works without a key; this half cannot.
    return bad("Heidi's language model is not configured on this deployment yet.", 503, true);
  }

  try {
    const { text: raw, id } = await complete({
      chain,
      env: process.env,
      health: llmHealth,
      temperature: 0.3,
      // The chain leads with reasoning models, which spend budget on hidden
      // thinking before emitting a visible token. At 1200 a six-gloss answer
      // hit the ceiling mid-array on the first live request.
      maxTokens: 2400,
      timeoutMs: TIMEOUT_MS,
      signal: request.signal,
      messages: [
        { role: "system", content: systemPrompt(VARIETY) },
        {
          role: "user",
          content:
            mode === "produce" ? producePrompt(VARIETY, text) : understandPrompt(VARIETY, text),
        },
      ],
    });

    return Response.json(parseAnswer(raw, VARIETY, mode, id ?? "unknown"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // A caller who navigated away is not an outage.
    if (request.signal.aborted) return bad("Cancelled.", 499);
    console.error("[heidi/ask]", message);
    return bad("Heidi could not answer that just now. Try again in a moment.", 502, true);
  }
}
