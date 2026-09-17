import { readEventStream } from "@bitbaum/ai-kit/sse";
import type { StreamEvent } from "@/lib/domain/chat/events";
import type { ChatMessage } from "@/lib/domain/chat/types";
import { HEIDI_ID } from "@/lib/domain/chat/types";
import { decodeAnswer } from "@/lib/domain/chat/answer";
import type { Locale } from "@/lib/i18n/locales";

/**
 * Where a message goes, and what comes back.
 *
 * The three chat surfaces differ by exactly this object. Everything else — the
 * optimistic append, the id counter, the retry that drops the failed turn, the
 * three error branches — is the same code, and used to be the same code twice
 * with one copy missing most of it.
 *
 * The result is a TAGGED union rather than a thrown error, because the caller
 * has to tell three failures apart and say something different for each. A
 * rejected promise collapses them into one `catch`, which is how "the model is
 * not configured here" ended up being reported as "try again in a moment".
 */
export type SendArgs = {
  text: string;
  /** The thread so far. A transport whose server already has it ignores this. */
  history: ChatMessage[];
  locale: Locale;
  byok: unknown;
  images: string[];
  signal?: AbortSignal;
  /**
   * The explanation so far, as it arrives. Each call carries the WHOLE of it,
   * not a fragment to append — so a dropped frame costs a moment of staleness
   * rather than a missing word, and the caller needs no accumulator.
   *
   * A transport that cannot stream simply never calls it, which is why this is
   * on the shared args rather than on a separate interface.
   */
  onText?: (soFar: string) => void;
};

export type SendResult =
  | { status: "ok"; messages: ChatMessage[] }
  /** Heidi declined to speak. Normal in a group; not an error anywhere. */
  | { status: "silent" }
  | { status: "error"; kind: "unconfigured" | "failed" | "unreachable" };

export type Transport = (args: SendArgs) => Promise<SendResult>;

/**
 * A row from one of our own APIs, turned into a message the transcript can
 * render.
 *
 * The server sends `answer` as whatever went into `jsonb`, so this is the
 * boundary where `unknown` becomes `Answer` — and it decodes rather than casts,
 * because a row written by an older prompt is exactly the thing that makes
 * `a.glosses.map(...)` throw in somebody's browser.
 */
export function fromApi(rows: unknown): ChatMessage[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || typeof r.authorId !== "string") return [];
    const answer = decodeAnswer(r.answer);
    return [
      {
        id: r.id,
        authorId: r.authorId,
        body: typeof r.body === "string" ? r.body : "",
        createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
        ...(answer ? { answer } : {}),
      },
    ];
  });
}

/** Ids for messages the client invents. A counter cannot collide; a clock can. */
let counter = 0;
export function localId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Keyed on the STATUS, never on the body's own flag.
 *
 * The route sets `operator` for both "no model configured" (503) and "the call
 * failed" (502), so reading the flag once told a visitor the product was
 * unconfigured when a vendor had merely blipped. Very different sentences.
 */
function errorFor(status: number): SendResult {
  return { status: "error", kind: status === 503 ? "unconfigured" : "failed" };
}

/**
 * The stateless route. The client owns the thread and posts it every time —
 * which is also why this one works with no database and no account.
 */
export function draftTransport(): Transport {
  return async ({ text, history, locale, byok, images, signal }) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          input: text,
          history: history.filter((m) => m.body).map((m) => ({ authorId: m.authorId, body: m.body, createdAt: m.createdAt })),
          locale,
          byok,
          images,
        }),
        signal,
      });

      if (!res.ok) return errorFor(res.status);

      const data = (await readJson(res)) as { skipped?: boolean } | null;
      if (!data) return { status: "error", kind: "failed" };
      if (data.skipped) return { status: "silent" };

      // /api/chat returns the Answer itself as the body. Decoded, not cast:
      // the parse guards run server-side, but the shape still crosses a wire.
      const answer = decodeAnswer(data);
      if (!answer) return { status: "error", kind: "failed" };

      return {
        status: "ok",
        messages: [
          {
            id: localId("heidi"),
            authorId: HEIDI_ID,
            body: answer.text,
            createdAt: new Date().toISOString(),
            answer,
          },
        ],
      };
    } catch {
      return { status: "error", kind: "unreachable" };
    }
  };
}

/**
 * The same stateless route, watched as it answers.
 *
 * WHY IT IS A SEPARATE TRANSPORT AND NOT A FLAG. A transport is exactly "where
 * a message goes and what comes back", and these two differ in both: one POSTs
 * and awaits JSON, the other POSTs and reads an event stream. Everything they
 * share — the optimistic append, the retry that drops the failed turn, the
 * three error branches — is in `useConversation` and is untouched.
 *
 * WHAT IS STREAMED IS ONLY THE EXPLANATION. The dialect line, the glosses and
 * the suggestions arrive with the final `answer` event, after the deterministic
 * variety gate has run on them. A learner cannot audit dialect, so a form shown
 * before it is checked is the one mistake that matters here — see `partial.ts`.
 *
 * Falls back to nothing: if the browser or a proxy cannot do event streams the
 * request fails like any other and the caller retries. There is no silent
 * downgrade to the blocking path, because a downgrade nobody can see is how you
 * end up not knowing whether the feature works.
 */
export function streamingDraftTransport(): Transport {
  return async ({ text, history, locale, byok, images, signal, onText }) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          input: text,
          history: history
            .filter((m) => m.body)
            .map((m) => ({ authorId: m.authorId, body: m.body, createdAt: m.createdAt })),
          locale,
          byok,
          images,
          stream: true,
        }),
        signal,
      });

      if (!res.ok) return errorFor(res.status);
      if (!res.body) return { status: "error", kind: "failed" };

      let outcome: SendResult | null = null;

      await readEventStream<StreamEvent>(res.body, (event) => {
        if (event.type === "text") {
          onText?.(event.text);
          return;
        }
        if (event.type === "silent") {
          outcome = { status: "silent" };
          return;
        }
        if (event.type === "error") {
          outcome = { status: "error", kind: event.kind };
          return;
        }

        // Decoded, not cast: the shape crossed a wire, and a row written by an
        // older prompt is exactly what makes `a.glosses.map(...)` throw in
        // somebody's browser.
        const answer = decodeAnswer(event.answer);
        outcome = answer
          ? {
              status: "ok",
              messages: [
                {
                  id: localId("heidi"),
                  authorId: HEIDI_ID,
                  body: answer.text,
                  createdAt: new Date().toISOString(),
                  answer,
                },
              ],
            }
          : { status: "error", kind: "failed" };
      });

      // A stream that ended without a terminal event is a vendor that died
      // mid-sentence, or a proxy that cut the connection. Silence is not a
      // status, so it is reported as the failure it is.
      return outcome ?? { status: "error", kind: "failed" };
    } catch {
      return { status: "error", kind: "unreachable" };
    }
  };
}

/** What the sidebar needs to know about a conversation. */
export type ConversationSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

/**
 * A private conversation that the server remembers.
 *
 * Like the group transport, the server owns the thread — so no history is sent
 * and both rows come back together. Unlike it, the conversation may not exist
 * yet: someone opens `/chat`, types, and only at that moment is there anything
 * worth a row. Creating it lazily is what keeps a "new chat" button that gets
 * pressed and abandoned from littering the sidebar with empty threads.
 *
 * WHICH row it writes to lives in this closure rather than in the component,
 * for two reasons. It is this transport's own business, and — more concretely
 * — React state is not visible to the second message of a fast double-send in
 * the same tick, which is exactly how one conversation becomes two. The
 * in-flight promise is the other half of that guard: two sends that arrive
 * together await the same creation instead of racing to make one each.
 *
 * The locale is sent only at CREATION. After that the conversation carries its
 * own, so reopening a thread in a differently negotiated browser cannot switch
 * Heidi mid-way.
 */
export function conversationTransport({
  conversationId,
  locale,
  onCreated,
}: {
  conversationId: string | null;
  locale: Locale;
  onCreated: (conversation: ConversationSummary) => void;
}): Transport {
  let id = conversationId;
  let creating: Promise<string | null> | null = null;

  async function ensure(): Promise<string | null> {
    if (id) return id;
    creating ??= (async () => {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ locale }),
        });
        if (!res.ok) return null;
        const { conversation } = (await res.json()) as { conversation: ConversationSummary };
        id = conversation.id;
        onCreated(conversation);
        return conversation.id;
      } catch {
        return null;
      } finally {
        // Cleared either way: a failed creation must be retryable, and a
        // successful one is now answered by `id` without awaiting anything.
        creating = null;
      }
    })();
    return creating;
  }

  return async ({ text, byok, images, signal }) => {
    try {
      const target = await ensure();
      if (!target) return { status: "error", kind: "failed" };

      const res = await fetch(`/api/conversations/${target}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, byok, images }),
        signal,
      });

      if (!res.ok) return errorFor(res.status);

      const data = (await readJson(res)) as { messages?: unknown } | null;
      return { status: "ok", messages: fromApi(data?.messages) };
    } catch {
      return { status: "error", kind: "unreachable" };
    }
  };
}

/**
 * A group. The server holds the thread, decides whether Heidi speaks, and
 * returns the rows it wrote — so no history goes up and both new messages come
 * back together.
 */
export function groupTransport(groupId: string): Transport {
  return async ({ text, locale, byok, signal }) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, locale, byok }),
        signal,
      });

      if (!res.ok) return errorFor(res.status);

      const data = (await readJson(res)) as { messages?: unknown } | null;
      return { status: "ok", messages: fromApi(data?.messages) };
    } catch {
      return { status: "error", kind: "unreachable" };
    }
  };
}
