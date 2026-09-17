import { createHealthTracker } from "@bitbaum/ai-kit";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { soloThread } from "@/lib/domain/chat/thread";
import { respondInThread } from "@/lib/domain/chat/respond";
import { HEIDI_ID, LEARNER_ID, type ChatMessage } from "@/lib/domain/chat/types";
import { readByok, redact } from "@/lib/domain/model/byok";
import { MAX_IMAGES, readImage } from "@/lib/domain/chat/image";
import { callerKey, chat as chatLimit, tooMany } from "@/lib/domain/limits";

export const dynamic = "force-dynamic";

/** One per process, so a future /api/health/ai reports the tracker this route feeds. */
export const llmHealth = createHealthTracker();

/** Long enough for a pasted conversation, short enough that nobody pastes a novel. */
const MAX_INPUT = 2000;
/** Enough context for a follow-up; beyond this the oldest turns stop earning their tokens. */
const MAX_HISTORY = 20;

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
  // Before the body is even read: each call spends from a free-tier budget
  // shared with every other visitor, so the ceiling protects them, not us.
  const allowed = chatLimit.check(callerKey(request, "chat"));
  if (!allowed.allowed) return tooMany(allowed);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad("Could not read that request.", 400);
  }

  const { input, history, locale, byok, images } = (body ?? {}) as {
    input?: unknown;
    history?: unknown;
    locale?: unknown;
    byok?: unknown;
    images?: unknown;
  };

  const text = typeof input === "string" ? input.trim() : "";
  if (!text) return bad("Give Heidi something to work with.", 400);
  if (text.length > MAX_INPUT) return bad(`That is longer than ${MAX_INPUT} characters.`, 400);

  const reader: Locale = typeof locale === "string" && isLocale(locale) ? locale : DEFAULT_LOCALE;

  // Whether a key was brought decides one thing HERE — whether a picture can
  // be read at all. Which chain that key produces is `respondInThread`'s
  // business, not this route's.
  const own = readByok(byok);

  const pictures: string[] = [];
  for (const candidate of Array.isArray(images) ? images.slice(0, MAX_IMAGES) : []) {
    const checked = readImage(candidate);
    if (!checked.ok) return bad(`That image could not be used: ${checked.reason}`, 400);
    pictures.push(checked.dataUrl);
  }
  if (pictures.length > 0 && !own.ok) {
    return bad("Reading a picture needs your own model.", 400);
  }

  const now = new Date();
  const messages: ChatMessage[] = [
    ...sanitise(history),
    { id: "now", authorId: LEARNER_ID, body: text, createdAt: now.toISOString() },
  ];

  try {
    const result = await respondInThread({
      thread: soloThread(new Date(messages[0].createdAt)),
      messages,
      locale: reader,
      byok,
      pictures,
      health: llmHealth,
      signal: request.signal,
    });

    if (result.status === "unconfigured") {
      // The honest answer, not a crash and not a fake one. The deterministic
      // half of Heidi — the dialect check — still works without a key; this
      // half cannot.
      return bad("Heidi's language model is not configured on this deployment yet.", 503, true);
    }

    if (result.status === "silent") {
      // Cannot happen in a two-party thread, but a silent turn is a normal
      // outcome in the group case this model is built for — so it is handled
      // rather than assumed away.
      return Response.json({ skipped: true, reason: result.reason });
    }

    return Response.json(result.answer);
  } catch (error) {
    if (request.signal.aborted) return bad("Cancelled.", 499);
    // redact(): a vendor error can echo the request, and the request carried
    // somebody's credential. A key must never reach a log line.
    console.error("[heidi/chat]", redact(error instanceof Error ? error.message : String(error)));
    return bad("Heidi could not answer that just now. Try again in a moment.", 502, true);
  }
}
