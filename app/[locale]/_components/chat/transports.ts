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
