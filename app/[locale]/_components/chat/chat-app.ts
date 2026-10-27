import type { Attachment, StoredMessage } from "@bitbaum/chatkit";
import type { ChatTurnResult } from "@bitbaum/chatkit/react";
import type { Answer, ChatMessage } from "../../../../lib/domain/chat/types.ts";
import { HEIDI_ID, LEARNER_ID } from "../../../../lib/domain/chat/types.ts";
import { decodeAnswer } from "../../../../lib/domain/chat/answer.ts";

/**
 * The seam between Heidi and chatkit's `ChatApp`, apart from React so each
 * rule is tested.
 *
 * ChatApp keeps a conversation as `{ id, role, content }` messages and lets a
 * product put more on them. Heidi puts two things on an answer:
 *
 *   `answer` — the whole checked `Answer` (dialect line, glosses, suggestions,
 *              the variety gate's verdicts). The footer under the answer draws
 *              it; `content` is only the explanation, so Copy and Listen read
 *              the reader's language and never the dialect.
 *   `asked`  — the learner's line it answers, so a word kept from the answer
 *              carries the sentence it came from.
 *
 * Both travel through the device store and come back from the server, where
 * the row already holds the `Answer` as `jsonb`.
 */
export type HeidiMessage = StoredMessage & { answer?: Answer; asked?: string };

/** What the composer sent, as Heidi's routes take it: words, and pictures as data URLs. */
export function fromWire(text: string, attachments: readonly Attachment[]): [string, string[]] {
  const pictures: string[] = [];
  const words = [text];
  for (const a of attachments) {
    if (a.kind === "image") pictures.push(`data:${a.mimeType};base64,${a.dataBase64}`);
    else words.push(a.content);
  }
  return [words.filter((w) => w.trim()).join("\n\n"), pictures];
}

/**
 * ChatApp's history as Heidi's stateless route reads a thread. A reply keeps
 * its dialect line, because her `body` is only the explanation.
 */
export function toThread(history: readonly { id: string; role: string; content: string; answer?: unknown }[]): ChatMessage[] {
  const at = new Date().toISOString();
  return history.map((m) => {
    const answer = m.role === "assistant" ? decodeAnswer(m.answer) : null;
    return {
      id: m.id,
      authorId: m.role === "user" ? LEARNER_ID : HEIDI_ID,
      body: m.content,
      createdAt: at,
      ...(answer ? { answer } : {}),
    };
  });
}

/** A checked answer, as the message ChatApp keeps. Replies are chatkit's row. */
export function toAnswer(answer: Answer, asked: string): ChatTurnResult {
  // Built, then returned: ChatApp keeps every field of the result on the
  // message, but its type names only its own.
  const message = {
    content: answer.text,
    ...(answer.replies?.length ? { replies: answer.replies } : {}),
    answer,
    asked,
  };
  return message;
}

/**
 * Heidi's rows (the server's, or a signed-out draft) as ChatApp messages.
 *
 * The author is already mapped to the two-party thread — `me` or `heidi` — by
 * `asSoloStored` on the server and by the draft itself. The answer is DECODED,
 * not cast: a row written by an older prompt is exactly what makes
 * `a.glosses.map(...)` throw in somebody's browser.
 */
export function fromRows(rows: unknown): HeidiMessage[] {
  if (!Array.isArray(rows)) return [];
  const out: HeidiMessage[] = [];
  let asked = "";
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || typeof r.authorId !== "string") continue;
    const body = typeof r.body === "string" ? r.body : "";
    if (r.authorId === LEARNER_ID) {
      asked = body;
      out.push({ id: r.id, role: "user", content: body });
      continue;
    }
    const answer = decodeAnswer(r.answer);
    out.push({
      id: r.id,
      role: "assistant",
      content: answer?.text ?? body,
      ...(answer ? { answer, asked } : {}),
      ...(answer?.replies?.length ? { replies: answer.replies } : {}),
    });
  }
  return out;
}

/** Why a turn brought no answer, as the four sentences the reader can act on. */
export type FailureKind = "unconfigured" | "failed" | "unreachable" | "blind";

export function failureSentence(
  kind: FailureKind,
  t: { notConfigured: string; unreachable: string; cannotSeePicture: string; failed: string },
): string {
  // `blind` has its own sentence: `failed` says "try again in a moment",
  // which cannot work when nothing in reach has eyes.
  if (kind === "unconfigured") return t.notConfigured;
  if (kind === "unreachable") return t.unreachable;
  if (kind === "blind") return t.cannotSeePicture;
  return t.failed;
}
