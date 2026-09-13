import { visibleMessages } from "threadkit";
import { caller } from "../../../../../lib/domain/groups/session.ts";
import { checkBody, groupThread, mayPost } from "../../../../../lib/domain/groups/rules.ts";
import { groupById, membersOf, messagesIn, postMessage } from "../../../../../lib/domain/groups/store.ts";
import { HEIDI_ID } from "../../../../../lib/domain/groups/types.ts";
import { respondInThread } from "../../../../../lib/domain/chat/respond.ts";
import { redact } from "../../../../../lib/domain/model/byok.ts";
import { DEFAULT_LOCALE, isLocale, type Locale } from "../../../../../lib/i18n/locales.ts";
import { callerKey, groupMessage, tooMany } from "../../../../../lib/domain/limits.ts";
import type { ChatMessage } from "../../../../../lib/domain/chat/types.ts";
import type { GroupMessage } from "../../../../../lib/domain/groups/types.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

/** A uuid, before it is allowed near a query. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The thread as THIS reader may see it.
 *
 * Visibility is threadkit's, applied on the way out rather than in SQL. A
 * `WHERE created_at > joined_at` would be the same rule written a second time
 * in a place no test can reach, and it would be the copy that goes stale when
 * the rule changes.
 */
function readable(
  group: { id: string; createdBy: string; createdAt: string },
  members: Awaited<ReturnType<typeof membersOf>>,
  messages: GroupMessage[],
  actorId: string,
): GroupMessage[] {
  const thread = groupThread(group, members);
  const visible = visibleMessages(
    thread,
    actorId,
    messages.map((m) => ({
      id: m.id,
      threadId: group.id,
      authorId: m.authorId,
      body: m.body,
      createdAt: new Date(m.createdAt),
    })),
  );
  const allowed = new Set(visible.map((m) => m.id));
  return messages.filter((m) => allowed.has(m.id));
}

async function load(id: string, actorId: string) {
  if (!UUID.test(id)) return { error: "No such group.", status: 404 as const };
  const group = await groupById(id);
  if (!group) return { error: "No such group.", status: 404 as const };

  const members = await membersOf(group.id);
  // A stranger gets the same answer as for a group that does not exist:
  // whether a given id is a real group is not theirs to learn.
  if (!mayPost(members, actorId)) return { error: "No such group.", status: 404 as const };

  return { group, members };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const { id } = await params;
  const found = await load(id, who.actorId);
  if ("error" in found) return Response.json({ error: found.error }, { status: found.status });

  const messages = await messagesIn(found.group.id);
  return Response.json({
    group: { id: found.group.id, name: found.group.name, createdBy: found.group.createdBy },
    members: found.members.filter((m) => !m.leftAt).map((m) => ({ actorId: m.actorId, displayName: m.displayName })),
    messages: readable(found.group, found.members, messages, who.actorId),
  });
}

/**
 * Say something, and let Heidi decide whether to answer.
 *
 * She is not called on every message. threadkit's rule — which this product
 * wants and would otherwise have got wrong — is that in a thread of three or
 * more the assistant waits to be addressed by name, because two humans talking
 * to each other is not an invitation. So most posts here cost nothing.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const allowed = groupMessage.check(callerKey(request, "group-message"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const { id } = await params;
  const found = await load(id, who.actorId);
  if ("error" in found) return Response.json({ error: found.error }, { status: found.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  const { text, locale, byok } = (body ?? {}) as { text?: unknown; locale?: unknown; byok?: unknown };
  const checked = checkBody(typeof text === "string" ? text : "");
  if (!checked.ok) {
    return Response.json({ error: `That message is ${checked.problem.replace("-", " ")}.` }, { status: 400 });
  }

  const mine = await postMessage({ groupId: found.group.id, authorId: who.actorId, body: checked.body });

  // Heidi reads the thread from its start, so she is given every message
  // rather than the asker's view of it.
  const history = await messagesIn(found.group.id);
  const asChat: ChatMessage[] = history.map((m) => ({
    id: m.id,
    authorId: m.authorId,
    body: m.body,
    createdAt: m.createdAt,
  }));

  const reader: Locale = typeof locale === "string" && isLocale(locale) ? locale : DEFAULT_LOCALE;

  let reply: GroupMessage | null = null;
  try {
    const turn = await respondInThread({
      thread: groupThread(found.group, found.members),
      messages: asChat,
      locale: reader,
      byok,
      signal: request.signal,
    });

    if (turn.status === "answered") {
      reply = await postMessage({
        groupId: found.group.id,
        authorId: HEIDI_ID,
        body: turn.answer.text,
        answer: turn.answer,
      });
    }
    // "silent" and "unconfigured" both mean the group carries on without her.
    // Neither is an error: the humans' message is already saved, and failing
    // the request would make it look like it was not.
  } catch (error) {
    // redact(): a vendor error can echo the request, and the request may have
    // carried somebody's key.
    console.error("[heidi/groups]", redact(error instanceof Error ? error.message : String(error)));
  }

  return Response.json({ messages: reply ? [mine, reply] : [mine] }, { status: 201 });
}
