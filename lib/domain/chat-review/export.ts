import type { AnswerFeedback, ChatTranscript, ChatTranscriptTurn } from "@bitbaum/chatkit";
import { and, asc, desc, gte, inArray, isNull } from "drizzle-orm";
import { chatFeedback, conversationMessages, conversations } from "../../db/schema.ts";
import { decodeAnswer } from "../chat/answer.ts";
import { HEIDI_ID, type Answer } from "../chat/types.ts";
import type { ReviewDb } from "./db.ts";

/**
 * A day of conversations, in the shape the fleet's reviewer reads
 * (chatkit `ChatTranscript`).
 *
 * WHAT LEAVES. Conversation and message ids (Heidi's own uuids), the turns,
 * the thumbs. WHAT DOES NOT: the actor id on every row, the display names, the
 * email on the account — nothing in a transcript names a person, and the
 * reviewer has no use for one. A saved conversation already belongs to
 * somebody who can delete it; the export is read by Loki's nightly judge,
 * over a bearer token, and filed as findings about the ANSWERS.
 *
 * Only saved conversations. The signed-out chat keeps its thread in the
 * browser and never reaches this table, which is the privacy section's
 * promise and is kept here by construction, not by a filter.
 */

/** The reviewer reads at most this many conversations per call. */
export const MAX_TRANSCRIPTS = 50;
/** The last turns of a long thread; the start stopped mattering long ago. */
export const MAX_TURNS = 30;
/** Enough for an answer with its lines and glosses; a pasted novel is cut. */
export const MAX_CONTENT = 4000;
/** When `since` is not given: the night's window. */
export const DEFAULT_WINDOW_MS = 24 * 60 * 60_000;

export type StoredTurn = {
  id: string;
  authorId: string;
  body: string;
  answer: unknown;
  createdAt: Date | string;
};

export type StoredFeedback = {
  messageId: string;
  verdict: string;
  reason: string | null;
  text: string | null;
};

/**
 * One turn as the judge should see it. Heidi's own turns are more than their
 * `body` — the explanation is one field, the sendable line and the
 * alternatives are others — and a review of the explanation alone would score
 * her for answers she gave in a field the reviewer could not see.
 */
export function toTurn(row: StoredTurn): ChatTranscriptTurn {
  if (row.authorId !== HEIDI_ID) {
    return { id: row.id, role: "user", content: clip(row.body) };
  }
  const answer = decodeAnswer(row.answer);
  if (!answer) return { id: row.id, role: "assistant", content: clip(row.body) };
  return { id: row.id, role: "assistant", content: clip(answerText(answer)), steps: answerSteps(answer) };
}

function answerText(a: Answer): string {
  const parts = [a.text];
  if (a.dialect) parts.push(a.dialect);
  for (const s of a.suggestions) parts.push(`- ${s.label}${s.variety === "bridge" ? " (written standard)" : ""}: ${s.text}`);
  if (a.note) parts.push(a.note);
  return parts.join("\n");
}

/** The status lines Heidi produced for this answer: what she decided, what the gate said. */
function answerSteps(a: Answer): string[] {
  const steps = [`mode: ${a.mode}`, `model: ${a.model}`];
  const flagged = [
    ...(a.dialectClean === false ? a.dialectFlags ?? [] : []),
    ...(a.textClean === false ? a.textFlags ?? [] : []),
    ...a.suggestions.filter((s) => s.variety !== "bridge" && !s.clean).flatMap((s) => s.flags),
  ];
  steps.push(flagged.length ? `gate: flagged ${flagged.join(", ")}` : "gate: clean");
  if (a.next?.length) steps.push(`offered: ${a.next.map((m) => m.id).join(", ")}`);
  return steps;
}

function clip(text: string): string {
  return text.length > MAX_CONTENT ? `${text.slice(0, MAX_CONTENT - 1)}…` : text;
}

export function toFeedback(rows: StoredFeedback[]): AnswerFeedback[] {
  return rows.flatMap((r) => {
    if (r.verdict !== "up" && r.verdict !== "down") return [];
    return [
      {
        messageId: r.messageId,
        verdict: r.verdict,
        ...(r.reason ? { reason: r.reason as AnswerFeedback["reason"] } : {}),
        ...(r.text ? { text: r.text } : {}),
      },
    ];
  });
}

/** The last `MAX_TURNS` of a thread, oldest first. */
export function lastTurns(rows: StoredTurn[]): ChatTranscriptTurn[] {
  return rows.slice(-MAX_TURNS).map(toTurn);
}

/** Clamp a caller's `limit` to what the export will ship. */
export function clampLimit(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return MAX_TRANSCRIPTS;
  return Math.min(Math.floor(n), MAX_TRANSCRIPTS);
}

/** A caller's `since`, or the start of the night's window. */
export function sinceFrom(raw: string | null, now = Date.now()): Date {
  const t = raw ? Date.parse(raw) : NaN;
  return Number.isNaN(t) ? new Date(now - DEFAULT_WINDOW_MS) : new Date(t);
}

export async function collectTranscripts(
  db: ReviewDb,
  args: { since: Date; limit: number },
): Promise<ChatTranscript[]> {
  const limit = Math.min(Math.max(1, args.limit), MAX_TRANSCRIPTS);
  const threads = await db
    .select({ id: conversations.id, locale: conversations.locale, updatedAt: conversations.updatedAt })
    .from(conversations)
    .where(and(isNull(conversations.deletedAt), gte(conversations.updatedAt, args.since)))
    .orderBy(desc(conversations.updatedAt))
    .limit(limit);
  if (threads.length === 0) return [];

  const ids = threads.map((t) => t.id);
  const [messages, thumbs] = await Promise.all([
    db
      .select({
        id: conversationMessages.id,
        conversationId: conversationMessages.conversationId,
        authorId: conversationMessages.authorId,
        body: conversationMessages.body,
        answer: conversationMessages.answer,
        createdAt: conversationMessages.createdAt,
      })
      .from(conversationMessages)
      .where(inArray(conversationMessages.conversationId, ids))
      .orderBy(asc(conversationMessages.createdAt)),
    db
      .select({
        conversationId: chatFeedback.conversationId,
        messageId: chatFeedback.messageId,
        verdict: chatFeedback.verdict,
        reason: chatFeedback.reason,
        text: chatFeedback.text,
      })
      .from(chatFeedback)
      .where(inArray(chatFeedback.conversationId, ids))
      .orderBy(asc(chatFeedback.createdAt)),
  ]);

  return threads.map((t) => {
    const turns = lastTurns(messages.filter((m) => m.conversationId === t.id));
    const feedback = toFeedback(thumbs.filter((f) => f.conversationId === t.id));
    return {
      id: t.id,
      at: (t.updatedAt instanceof Date ? t.updatedAt : new Date(t.updatedAt)).toISOString(),
      surface: `/${t.locale}/chat`,
      turns,
      ...(feedback.length ? { feedback } : {}),
    };
  });
}

