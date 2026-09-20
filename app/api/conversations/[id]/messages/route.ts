import { requireActor } from "../../../../../lib/domain/actor.ts";
import { checkBody, mayAppend, mayWrite } from "../../../../../lib/domain/conversations/rules.ts";
import {
  appendMessage,
  asSoloMessages,
  asSoloStored,
  conversationById,
  countMessages,
  messagesIn,
} from "../../../../../lib/domain/conversations/store.ts";
import { soloThread } from "../../../../../lib/domain/chat/thread.ts";
import { respondInThread } from "../../../../../lib/domain/chat/respond.ts";
import { MAX_IMAGES, readImage } from "../../../../../lib/domain/chat/image.ts";
import { HEIDI_ID } from "../../../../../lib/domain/chat/types.ts";
import { redact } from "../../../../../lib/domain/model/byok.ts";
import { DEFAULT_LOCALE, isLocale, type Locale } from "../../../../../lib/i18n/locales.ts";
import { actorKey, conversationMessage, tooMany } from "../../../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const chatFeature = { name: "The chat history", toDo: "to keep your conversations" };

/**
 * Say something, and get Heidi's answer stored beside it.
 *
 * This is `/api/groups/[id]/messages` with the membership check replaced by an
 * ownership one, and it keeps that route's posture deliberately: if the model
 * fails, the learner's message is ALREADY SAVED and the request still
 * succeeds. Failing the whole request would make a message that is safely in
 * the database look like one that was lost.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const who = await requireActor(chatFeature);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  // By actor, not by IP: a signed-in person should not be rationed by whoever
  // else is behind their office's address.
  const allowed = conversationMessage.check(actorKey(who.actorId, "conversation-message"));
  if (!allowed.allowed) return tooMany(allowed);

  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "No such conversation." }, { status: 404 });

  const conversation = await conversationById(id);
  if (!mayWrite(conversation, who.actorId) || !conversation) {
    return Response.json({ error: "No such conversation." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  const { text, byok, images } = (body ?? {}) as { text?: unknown; byok?: unknown; images?: unknown };
  const checked = checkBody(text);
  if (!checked.ok) {
    return Response.json({ error: `That message is ${checked.problem.replace("-", " ")}.` }, { status: 400 });
  }

  const room = mayAppend(await countMessages(conversation.id));
  if (!room.ok) return Response.json({ error: room.problem }, { status: 409 });

  // Validated so a malformed data URL never reaches a vendor — then COUNTED
  // and dropped. The pictures are answered from and never stored.
  const pictures: string[] = [];
  for (const candidate of Array.isArray(images) ? images.slice(0, MAX_IMAGES) : []) {
    const image = readImage(candidate);
    if (image.ok) pictures.push(image.dataUrl);
  }

  const mine = await appendMessage({
    conversationId: conversation.id,
    authorId: who.actorId,
    body: checked.body,
    imageCount: pictures.length,
  });

  // The conversation's own locale, not the request's: re-opening a thread in a
  // differently negotiated browser must not switch Heidi mid-conversation.
  const locale: Locale = isLocale(conversation.locale) ? conversation.locale : DEFAULT_LOCALE;

  const stored = await messagesIn(conversation.id);
  let reply = null;
  try {
    const turn = await respondInThread({
      thread: soloThread(new Date(conversation.createdAt)),
      messages: asSoloMessages(stored, who.actorId),
      locale,
      byok,
      pictures,
      signal: request.signal,
    });

    if (turn.status === "answered") {
      reply = await appendMessage({
        conversationId: conversation.id,
        authorId: HEIDI_ID,
        body: turn.answer.text,
        answer: turn.answer,
      });
    }
  } catch (error) {
    // redact(): a vendor error can echo the request, and the request may have
    // carried somebody's key.
    console.error("[heidi/conversations]", redact(error instanceof Error ? error.message : String(error)));
  }

  /**
   * MAPPED, like every other way a message leaves this module.
   *
   * `appendMessage` returns the ROW, and a row carries the OIDC `sub` as its
   * author. The transcript is built on the fixed `LEARNER_ID`, so an unmapped
   * row is not the reader's own message as far as the UI is concerned: it
   * renders left-aligned, in the shell reserved for a third person, with the
   * raw actor UUID printed above it as that person's name. Reported from a
   * phone — someone signed in, sent a line, and watched their own sentence
   * come back attributed to `C9E52937-6020-4CC0-…`.
   *
   * It survived because the mapping was in the two places anybody looks: the
   * page that server-renders a saved thread, and the history this route hands
   * the model a few lines above. This was the third boundary, and the only one
   * a reader sees live. `conversations.test.ts` pins it.
   */
  const sent = asSoloStored(reply ? [mine, reply] : [mine], who.actorId);
  return Response.json({ messages: sent }, { status: 201 });
}
