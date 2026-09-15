import { requireActor } from "../../../../lib/domain/actor.ts";
import { checkBody, mayCreate } from "../../../../lib/domain/conversations/rules.ts";
import { appendMessage, countFor, createConversation } from "../../../../lib/domain/conversations/store.ts";
import { decodeAnswer } from "../../../../lib/domain/chat/answer.ts";
import { HEIDI_ID } from "../../../../lib/domain/chat/types.ts";
import { DEFAULT_LOCALE, isLocale } from "../../../../lib/i18n/locales.ts";
import { callerKey, conversationWrite, tooMany } from "../../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

/** A draft longer than this is not a conversation someone wants adopted. */
const MAX_IMPORT = 40;

const chatFeature = { name: "The chat history", toDo: "to keep your conversations" };

/**
 * Adopt the conversation someone had before they signed in.
 *
 * Offered, never automatic. Silent adoption is what the big chat apps do and
 * nobody is surprised by it — but Heidi's own privacy section says a person's
 * chats are among the most private things they own, and the first act of a new
 * account should not be to quietly upload the transcript that was device-local
 * a second ago.
 *
 * EVERYTHING the client sends is rebuilt. Ids are regenerated, authorship is
 * collapsed to the two roles a private thread can have, timestamps come from
 * the database, and `answer` is decoded rather than trusted — a draft lives in
 * localStorage, which is a place anyone can edit with a dev console.
 */
export async function POST(request: Request) {
  const allowed = conversationWrite.check(callerKey(request, "conversation-import"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await requireActor(chatFeature);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  const { messages, locale: rawLocale } = (body ?? {}) as { messages?: unknown; locale?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Nothing to keep." }, { status: 400 });
  }

  const room = mayCreate(await countFor(who.actorId));
  if (!room.ok) return Response.json({ error: room.problem }, { status: 409 });

  const locale = typeof rawLocale === "string" && isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const conversation = await createConversation({ actorId: who.actorId, locale });

  for (const candidate of messages.slice(0, MAX_IMPORT)) {
    if (!candidate || typeof candidate !== "object") continue;
    const m = candidate as Record<string, unknown>;

    const checked = checkBody(m.body);
    if (!checked.ok) continue;

    // Two roles exist in a private thread and a client cannot invent a third.
    const fromHeidi = m.authorId === HEIDI_ID;
    const answer = fromHeidi ? decodeAnswer(m.answer) : null;

    await appendMessage({
      conversationId: conversation.id,
      authorId: fromHeidi ? HEIDI_ID : who.actorId,
      body: checked.body,
      // Timestamps are the database's. A clock the client controls could
      // reorder a thread, and the order is the only thing that makes it one.
      ...(answer ? { answer } : {}),
    });
  }

  return Response.json({ conversation }, { status: 201 });
}
