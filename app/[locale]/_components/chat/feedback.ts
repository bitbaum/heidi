import type { AnswerFeedback } from "@bitbaum/chatkit";
import { DRAFT_CONVERSATION } from "@/lib/domain/chat-review/feedback";

/**
 * A thumb, on its way to `/api/chat/feedback`.
 *
 * Fire and forget. The row is for the nightly review, not for the person who
 * pressed it — chatkit has already said "Thanks, noted" — so a failed post
 * costs one data point and must not cost them an error under the answer they
 * were reading. The signed-out chat files under `draft`: it has no
 * conversation row, and a bad answer there is still a bad answer.
 */
export function postFeedback(conversationId: string | null, feedback: AnswerFeedback): void {
  void fetch("/api/chat/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ conversationId: conversationId ?? DRAFT_CONVERSATION, ...feedback }),
    keepalive: true,
  }).catch(() => {});
}

/** The signed-out surfaces: the home box, the dock, the full chat before sign-in. */
export function draftFeedback(feedback: AnswerFeedback): void {
  postFeedback(null, feedback);
}
