import { FEEDBACK_REASONS } from "@bitbaum/chatkit";
import { z } from "zod";
import { chatFeedback } from "../../db/schema.ts";
import type { ReviewDb } from "./db.ts";

/**
 * A thumb under an answer, as the client posts it: chatkit's `AnswerFeedback`
 * plus the conversation it belongs to.
 *
 * The conversation id is either a saved conversation's uuid or the literal
 * `draft` — the signed-out chat, which keeps its thread in the browser and
 * has no row here to point at. The route decides what each one requires
 * (ownership for a uuid, nothing for a draft); this only says what a
 * well-formed thumb is.
 */
export const DRAFT_CONVERSATION = "draft";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const feedbackSchema = z.object({
  conversationId: z
    .string()
    .max(64)
    .refine((v) => v === DRAFT_CONVERSATION || UUID.test(v), "a conversation id or 'draft'"),
  messageId: z.string().trim().min(1).max(64),
  verdict: z.enum(["up", "down"]),
  reason: z.enum(FEEDBACK_REASONS).optional(),
  text: z.string().trim().max(1000).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

/**
 * A browser's own request, as far as a header can say.
 *
 * The thumb needs no account (the chat needs none), so this is the one gate
 * between a stranger's script and a row: `Sec-Fetch-Site` is set by every
 * current browser and cannot be set by page script, and `none` is the person
 * typing the URL. A client that sends no such header (curl, an old browser)
 * is let through — this is a rate-limited write of one row with no reader
 * attached, not a credential.
 */
export function isSameOrigin(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  return site === null || site === "same-origin" || site === "none";
}

export async function recordFeedback(db: ReviewDb, input: FeedbackInput): Promise<void> {
  await db.insert(chatFeedback).values({
    conversationId: input.conversationId,
    messageId: input.messageId,
    verdict: input.verdict,
    reason: input.reason ?? null,
    text: input.text || null,
  });
}
