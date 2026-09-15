import { requireActor } from "../../../lib/domain/actor.ts";
import { mayCreate } from "../../../lib/domain/conversations/rules.ts";
import { conversationsFor, countFor, createConversation } from "../../../lib/domain/conversations/store.ts";
import { DEFAULT_LOCALE, isLocale } from "../../../lib/i18n/locales.ts";
import { callerKey, conversationWrite, tooMany } from "../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

const chatFeature = { name: "The chat history", toDo: "to keep your conversations" };

/** The sidebar. Newest activity first; deleted conversations are gone. */
export async function GET() {
  const who = await requireActor(chatFeature);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  return Response.json({ conversations: await conversationsFor(who.actorId) });
}

/** Start a conversation. Empty — the first message names it. */
export async function POST(request: Request) {
  const allowed = conversationWrite.check(callerKey(request, "conversation-create"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await requireActor(chatFeature);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const raw = (body as { locale?: unknown })?.locale;
  const locale = typeof raw === "string" && isLocale(raw) ? raw : DEFAULT_LOCALE;

  // A ceiling, not a pruner: at the limit this refuses rather than deleting
  // somebody's oldest thread to make room for a new one.
  const room = mayCreate(await countFor(who.actorId));
  if (!room.ok) return Response.json({ error: room.problem }, { status: 409 });

  const conversation = await createConversation({ actorId: who.actorId, locale });
  return Response.json({ conversation }, { status: 201 });
}
