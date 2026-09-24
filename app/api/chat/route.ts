import { createHealthTracker } from "@bitbaum/ai-kit";
import { sseResponse } from "@bitbaum/ai-kit/sse";
import type { StreamEvent } from "../../../lib/domain/chat/events.ts";
import { DEFAULT_LOCALE, isLocale, type Locale } from "../../../lib/i18n/locales.ts";
import { soloThread } from "../../../lib/domain/chat/thread.ts";
import { respondInThread } from "../../../lib/domain/chat/respond.ts";
import { HEIDI_ID, LEARNER_ID, type ChatMessage } from "../../../lib/domain/chat/types.ts";
import { redact } from "../../../lib/domain/model/byok.ts";
import { MAX_IMAGES, readImage } from "../../../lib/domain/chat/image.ts";
import { callerKey, chat as chatLimit, tooMany } from "../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// this handler directly, and the alias only resolves inside Next's build. Same
// reason as `app/api/check/route.ts`, and the reason the guards below can be
// asserted at all.

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

  const { input, history, locale, byok, images, stream } = (body ?? {}) as {
    input?: unknown;
    history?: unknown;
    locale?: unknown;
    byok?: unknown;
    images?: unknown;
    stream?: unknown;
  };

  const text = typeof input === "string" ? input.trim() : "";
  if (!text) return bad("Give Heidi something to work with.", 400);
  if (text.length > MAX_INPUT) return bad(`That is longer than ${MAX_INPUT} characters.`, 400);

  const reader: Locale = typeof locale === "string" && isLocale(locale) ? locale : DEFAULT_LOCALE;

  /**
   * Pictures are VALIDATED here and routed downstream. They are no longer
   * REFUSED here.
   *
   * This route used to answer 400 "Reading a picture needs your own model" for
   * any attachment without a brought key, and `byok.ts` stated as fact that
   * "the free chain has no model that can read a picture". Neither was true of
   * free models — `google/gemma-4-26b-a4b-it:free` was already in the chain
   * this app installs, and loki probed it live on 2026-08-13 reading an image
   * correctly. It was true of a CHAIN with no vision routing, which is a
   * different thing and was fixable in one place.
   *
   * ai-kit 1.11 routes on it, so whether a picture can be read is decided by
   * the chain rather than asserted by this route. If nothing reachable can
   * see, `respondInThread` says `blind` and the reader is told the one thing
   * that helps. Guessing that here, from the presence of a key, would be a
   * second opinion about a question the chain can answer for itself.
   */
  const pictures: string[] = [];
  for (const candidate of Array.isArray(images) ? images.slice(0, MAX_IMAGES) : []) {
    const checked = readImage(candidate);
    if (!checked.ok) return bad(`That image could not be used: ${checked.reason}`, 400);
    pictures.push(checked.dataUrl);
  }

  const now = new Date();
  const messages: ChatMessage[] = [
    ...sanitise(history),
    { id: "now", authorId: LEARNER_ID, body: text, createdAt: now.toISOString() },
  ];

  const turn = {
    thread: soloThread(new Date(messages[0].createdAt)),
    messages,
    locale: reader,
    byok,
    pictures,
    health: llmHealth,
    signal: request.signal,
  };

  /**
   * The same turn, reported as it happens.
   *
   * ONE route rather than two, because everything above this line — the rate
   * limit, the input ceiling, the picture checks, the history rebuild — is
   * identical and is the part that must not diverge. Only the shape of the
   * reply differs, and it differs at the last possible moment.
   *
   * What goes over the wire is a tagged union, not raw tokens: `text` events
   * carry the explanation so far, and exactly one terminal event says how it
   * ended. A stream that just stopped would be indistinguishable from a vendor
   * dying mid-sentence, which is the failure this is most likely to hit.
   */
  if (stream === true) {
    return sseResponse<StreamEvent>(
      async (emit) => {
        const result = await respondInThread({
          ...turn,
          // Deltas are dropped once empty: the model writes `mode` before
          // `text`, so the first few events would otherwise be "" and the
          // reader would see the thinking dots replaced by nothing.
          onText: (soFar) => {
            if (soFar) emit({ type: "text", text: soFar });
          },
        });

        if (result.status === "unconfigured") emit({ type: "error", kind: "unconfigured" });
        else if (result.status === "blind") emit({ type: "error", kind: "blind" });
        else if (result.status === "silent") emit({ type: "silent" });
        else emit({ type: "answer", answer: result.answer });
      },
      {
        signal: request.signal,
        // Without this a job that throws closes a 200 having said nothing, and
        // the client cannot tell that from an answer that never came.
        onError: (error) => {
          if (!request.signal.aborted) {
            console.error("[heidi/chat:stream]", redact(error instanceof Error ? error.message : String(error)));
          }
          return { type: "error", kind: "failed" };
        },
      },
    );
  }

  try {
    const result = await respondInThread(turn);

    if (result.status === "unconfigured") {
      // The honest answer, not a crash and not a fake one. The deterministic
      // half of Heidi — the dialect check — still works without a key; this
      // half cannot.
      return bad("Heidi's language model is not configured on this deployment yet.", 503, true);
    }

    if (result.status === "blind") {
      // 415 Unsupported Media Type, and the status is the whole signal: the
      // client keys its sentence on the STATUS and never on a flag in the body
      // (see `errorFor` in transports.ts, and the incident that taught it).
      // 503 would say "Heidi is unconfigured", which is false — everything
      // except reading pictures works.
      return bad("No model within reach can read a picture right now.", 415, true);
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
