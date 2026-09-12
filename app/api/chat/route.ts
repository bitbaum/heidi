import { complete, freeChain, usableChain, createHealthTracker } from "@bitbaum/ai-kit";
import { VARIETY } from "@/lib/variety/active";
import { systemPrompt } from "@/lib/variety/prompt";
import { DEFAULT_LOCALE, EXPLANATION_LANGUAGE, isLocale, type Locale } from "@/lib/i18n/locales";
import { heidiTurn, soloThread } from "@/lib/domain/chat/thread";
import { parseAnswer } from "@/lib/domain/chat/parse";
import { HEIDI_ID, LEARNER_ID, type ChatMessage } from "@/lib/domain/chat/types";

export const dynamic = "force-dynamic";

/** One per process, so a future /api/health/ai reports the tracker this route feeds. */
export const llmHealth = createHealthTracker();

/** Long enough for a pasted conversation, short enough that nobody pastes a novel. */
const MAX_INPUT = 2000;
/** Enough context for a follow-up; beyond this the oldest turns stop earning their tokens. */
const MAX_HISTORY = 20;
/** Per link, not shared — a shared deadline is spent by the first vendor. */
const TIMEOUT_MS = 25_000;

function bad(error: string, status: number, operator = false) {
  return Response.json({ error, operator }, { status });
}

/** Trust nothing from the client: ids, authors and timestamps are all rebuilt here. */
function sanitise(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-MAX_HISTORY)
    .map((m, i) => {
      if (typeof m !== "object" || m === null) return null;
      const v = m as Record<string, unknown>;
      const body = typeof v.body === "string" ? v.body.slice(0, MAX_INPUT) : "";
      if (!body) return null;
      // Only two authors exist today, and a client cannot invent a third.
      const authorId = v.authorId === HEIDI_ID ? HEIDI_ID : LEARNER_ID;
      const createdAt =
        typeof v.createdAt === "string" && !Number.isNaN(Date.parse(v.createdAt))
          ? v.createdAt
          : new Date(Date.now() - (MAX_HISTORY - i) * 1000).toISOString();
      return { id: `h${i}`, authorId, body, createdAt } satisfies ChatMessage;
    })
    .filter((m): m is ChatMessage => m !== null);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad("Could not read that request.", 400);
  }

  const { input, history, locale } = (body ?? {}) as {
    input?: unknown;
    history?: unknown;
    locale?: unknown;
  };

  const text = typeof input === "string" ? input.trim() : "";
  if (!text) return bad("Give Heidi something to work with.", 400);
  if (text.length > MAX_INPUT) return bad(`That is longer than ${MAX_INPUT} characters.`, 400);

  const reader: Locale = typeof locale === "string" && isLocale(locale) ? locale : DEFAULT_LOCALE;
  const explainIn = EXPLANATION_LANGUAGE[reader];

  const chain = usableChain(freeChain("HEIDI"), process.env);
  if (chain.length === 0) {
    // The honest answer, not a crash and not a fake one. The deterministic half
    // of Heidi — the dialect check — still works without a key; this half cannot.
    return bad("Heidi's language model is not configured on this deployment yet.", 503, true);
  }

  const now = new Date();
  const messages: ChatMessage[] = [
    ...sanitise(history),
    { id: "now", authorId: LEARNER_ID, body: text, createdAt: now.toISOString() },
  ];

  try {
    // threadkit decides WHETHER Heidi speaks and assembles the transcript;
    // ai-kit decides WHICH model and survives a vendor going down. Neither
    // package knows the other exists — the seam is this callback.
    const turn = await heidiTurn(soloThread(new Date(messages[0].createdAt)), messages, {
      systemPrompt: systemPrompt(VARIETY, explainIn),
      model: chain[0]?.model ?? "unknown",
      complete: async ({ system, prompt, maxTokens, temperature }) => {
        const { text: raw } = await complete({
          chain,
          env: process.env,
          health: llmHealth,
          temperature,
          maxTokens,
          timeoutMs: TIMEOUT_MS,
          signal: request.signal,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        });
        return raw;
      },
    });

    if (turn.status === "skipped") {
      // Cannot happen in a two-party thread, but a silent turn is a normal
      // outcome in the group case this model is built for — so it is handled
      // rather than assumed away.
      return Response.json({ skipped: true, reason: turn.reason });
    }

    return Response.json(parseAnswer(turn.raw, VARIETY, turn.model));
  } catch (error) {
    if (request.signal.aborted) return bad("Cancelled.", 499);
    console.error("[heidi/chat]", error instanceof Error ? error.message : String(error));
    return bad("Heidi could not answer that just now. Try again in a moment.", 502, true);
  }
}
