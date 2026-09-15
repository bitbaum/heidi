import { requireActor } from "../../../../lib/domain/actor.ts";
import { mayRead, mayWrite } from "../../../../lib/domain/conversations/rules.ts";
import {
  conversationById,
  deleteConversation,
  messagesIn,
  renameConversation,
} from "../../../../lib/domain/conversations/store.ts";
import { callerKey, conversationWrite, tooMany } from "../../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const chatFeature = { name: "The chat history", toDo: "to keep your conversations" };

/**
 * Whether a given id is a real conversation is not a stranger's to learn, and
 * a deleted one is nobody's. Both answer 404 — the same answer an id that
 * never existed gets.
 */
async function owned(id: string, actorId: string) {
  if (!UUID.test(id)) return null;
  const conversation = await conversationById(id);
  return mayRead(conversation, actorId) ? conversation : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const who = await requireActor(chatFeature);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const { id } = await params;
  const conversation = await owned(id, who.actorId);
  if (!conversation) return Response.json({ error: "No such conversation." }, { status: 404 });

  return Response.json({ conversation, messages: await messagesIn(conversation.id) });
}

/** Rename. The only edit a conversation supports. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const allowed = conversationWrite.check(callerKey(request, "conversation-patch"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await requireActor(chatFeature);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const { id } = await params;
  const conversation = await owned(id, who.actorId);
  if (!conversation || !mayWrite(conversation, who.actorId)) {
    return Response.json({ error: "No such conversation." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  const title = (body as { title?: unknown })?.title;
  if (typeof title !== "string" || !title.trim()) {
    return Response.json({ error: "A title cannot be empty." }, { status: 400 });
  }

  await renameConversation(conversation.id, title);
  return Response.json({ ok: true });
}

/** Delete, and mean it — the messages are destroyed, not flagged. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const allowed = conversationWrite.check(callerKey(request, "conversation-delete"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await requireActor(chatFeature);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const { id } = await params;
  const conversation = await owned(id, who.actorId);
  if (!conversation) return Response.json({ error: "No such conversation." }, { status: 404 });

  await deleteConversation(conversation.id);
  return Response.json({ ok: true });
}
