import { mayRead } from "../../../../lib/domain/conversations/rules.ts";
import { conversationById } from "../../../../lib/domain/conversations/store.ts";
import { DRAFT_CONVERSATION, feedbackSchema, isSameOrigin, recordFeedback } from "../../../../lib/domain/chat-review/feedback.ts";
import { db, dbConfigured } from "../../../../lib/db/index.ts";
import { callerKey, chatFeedback, tooMany } from "../../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// this handler directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

const chatFeature = { name: "Answer feedback", toDo: "to rate an answer in a saved conversation" };

/**
 * A thumb under one of Heidi's answers.
 *
 * Needs exactly what the chat it sits under needs: a saved conversation's
 * thumb needs its owner (the id would otherwise be a way to file words under
 * somebody else's thread); a draft's needs nobody, because there is nobody.
 * Both need a database, because a thumb that is not stored was never given.
 */
export async function POST(request: Request) {
  const allowed = chatFeedback.check(callerKey(request, "chat-feedback"));
  if (!allowed.allowed) return tooMany(allowed);

  if (!isSameOrigin(request)) return Response.json({ error: "Not from this site." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "That is not a thumb Heidi understands." }, { status: 400 });

  if (!dbConfigured()) {
    return Response.json({ error: "Answer feedback is not configured on this deployment." }, { status: 503 });
  }

  if (parsed.data.conversationId !== DRAFT_CONVERSATION) {
    // Resolved here, not at the top: `actor.ts` reaches `next/headers`, which
    // exists only inside Next — and every guard above it is asserted by node's
    // test runner, which has no Next to resolve it in. A draft never needs it.
    const { requireActor } = await import("../../../../lib/domain/actor.ts");
    const who = await requireActor(chatFeature);
    if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
    const conversation = await conversationById(parsed.data.conversationId);
    if (!mayRead(conversation, who.actorId)) return Response.json({ error: "No such conversation." }, { status: 404 });
  }

  await recordFeedback(db, parsed.data);
  return Response.json({ ok: true }, { status: 201 });
}
