import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { conversationMessages, conversations } from "../../db/schema.ts";
import { decodeAnswer } from "../chat/answer.ts";
import { HEIDI_ID, LEARNER_ID, type ChatMessage } from "../chat/types.ts";
import { titleFrom } from "../chat/title.ts";

/**
 * Every query a private conversation needs.
 *
 * Kept apart from `rules.ts` for the same reason the groups code is: the rules
 * are decisions and are tested with no database; this is plumbing and is tested
 * by using it. Nothing here decides who may do what — callers ask the rules.
 */

const iso = (d: Date | string): string => (d instanceof Date ? d.toISOString() : d);

export type Conversation = {
  id: string;
  actorId: string;
  title: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type StoredMessage = ChatMessage & { imageCount: number };

export async function createConversation(args: { actorId: string; locale: string }): Promise<Conversation> {
  const [row] = await db
    .insert(conversations)
    .values({ actorId: args.actorId, locale: args.locale })
    .returning();
  return toConversation(row);
}

/** The sidebar: newest activity first, tombstones excluded. */
export async function conversationsFor(actorId: string): Promise<Conversation[]> {
  const rows = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.actorId, actorId), isNull(conversations.deletedAt)))
    .orderBy(desc(conversations.updatedAt));
  return rows.map(toConversation);
}

export async function countFor(actorId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(conversations)
    .where(and(eq(conversations.actorId, actorId), isNull(conversations.deletedAt)));
  return Number(row?.n ?? 0);
}

/**
 * One conversation, with no permission implied.
 *
 * A tombstone comes back rather than being filtered out, so the caller can ask
 * `mayRead` and get a stable 404 — the alternative is a deleted id looking
 * exactly like an id that never existed, which is the same answer for two very
 * different situations.
 */
export async function conversationById(id: string): Promise<Conversation | null> {
  const [row] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return row ? toConversation(row) : null;
}

export async function messagesIn(conversationId: string): Promise<StoredMessage[]> {
  const rows = await db
    .select()
    .from(conversationMessages)
    .where(eq(conversationMessages.conversationId, conversationId))
    .orderBy(asc(conversationMessages.createdAt));

  return rows.map((r) => {
    const answer = decodeAnswer(r.answer);
    return {
      id: r.id,
      authorId: r.authorId,
      body: r.body,
      createdAt: iso(r.createdAt),
      imageCount: r.imageCount,
      ...(answer ? { answer } : {}),
    };
  });
}

export async function countMessages(conversationId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(conversationMessages)
    .where(eq(conversationMessages.conversationId, conversationId));
  return Number(row?.n ?? 0);
}

/**
 * Write a message and mark the conversation as having moved.
 *
 * The title is set here, on the first message, in the same transaction —
 * deriving it at read time would need a lateral join to the first message on
 * every sidebar render, and storing it also gives a later rename somewhere to
 * live.
 */
export async function appendMessage(args: {
  conversationId: string;
  authorId: string;
  body: string;
  answer?: unknown;
  imageCount?: number;
}): Promise<StoredMessage> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(conversationMessages)
      .values({
        conversationId: args.conversationId,
        authorId: args.authorId,
        body: args.body,
        answer: args.answer ?? null,
        imageCount: args.imageCount ?? 0,
      })
      .returning();

    await tx
      .update(conversations)
      .set({
        updatedAt: new Date(),
        // Only a learner's line names a thread, and only when it has no name:
        // titling it after Heidi's answer would label every conversation with
        // our own words rather than theirs.
        ...(args.authorId !== HEIDI_ID ? { title: sql`case when ${conversations.title} = '' then ${titleFrom(args.body)} else ${conversations.title} end` } : {}),
      })
      .where(eq(conversations.id, args.conversationId));

    const answer = decodeAnswer(row.answer);
    return {
      id: row.id,
      authorId: row.authorId,
      body: row.body,
      createdAt: iso(row.createdAt),
      imageCount: row.imageCount,
      ...(answer ? { answer } : {}),
    };
  });
}

export async function renameConversation(id: string, title: string): Promise<void> {
  await db.update(conversations).set({ title: titleFrom(title) }).where(eq(conversations.id, id));
}

/**
 * Delete means the text is gone.
 *
 * Tombstone the conversation, hard-delete its messages, one transaction. A
 * soft delete that leaves the words in the table is not a delete, and the
 * privacy page would have to be written around it.
 */
export async function deleteConversation(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(conversationMessages).where(eq(conversationMessages.conversationId, id));
    await tx.update(conversations).set({ deletedAt: new Date(), title: "" }).where(eq(conversations.id, id));
  });
}

/**
 * Messages in the shape the two-party thread expects.
 *
 * Rows carry the OIDC `sub`; `soloThread()` is built on the fixed
 * `LEARNER_ID`. Mapping at this boundary keeps the thread two-party and
 * unparameterised — if a third participant ever joins a private chat it has
 * become a group, which is a different object with different rules.
 */
export function asSoloMessages(rows: StoredMessage[], actorId: string): ChatMessage[] {
  return rows.map((m) => ({
    id: m.id,
    authorId: soloAuthor(m, actorId),
    body: m.body,
    createdAt: m.createdAt,
    ...(m.answer ? { answer: m.answer } : {}),
  }));
}

/**
 * The same mapping, for a reply that also carries the row's own fields.
 *
 * `asSoloMessages` narrows to `ChatMessage`, which is right for the thread
 * handed to the model — it should see two participants and nothing else. An
 * API response is the other case: it is read by the transcript, so the author
 * must be mapped, and it also carries `imageCount`, which is a fact about the
 * row rather than about who is talking.
 *
 * Two functions, one rule: `soloAuthor` below is the rule, and it is the only
 * place a row's author becomes a participant.
 */
export function asSoloStored(rows: StoredMessage[], actorId: string): StoredMessage[] {
  return rows.map((m) => ({ ...m, authorId: soloAuthor(m, actorId) }));
}

/**
 * Who a stored row is, in a two-party thread.
 *
 * Anyone who is not the reader is Heidi, because in a private conversation
 * there is nobody else — and a row that somehow carried a third author must
 * not be rendered as a stranger in the room with their id for a name. That is
 * precisely what shipped: an unmapped row reached the transcript and printed
 * the reader's own actor UUID above their own sentence.
 */
function soloAuthor(row: StoredMessage, actorId: string): string {
  return row.authorId === actorId ? LEARNER_ID : HEIDI_ID;
}

function toConversation(row: typeof conversations.$inferSelect): Conversation {
  return {
    id: row.id,
    actorId: row.actorId,
    title: row.title,
    locale: row.locale,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    deletedAt: row.deletedAt ? iso(row.deletedAt) : null,
  };
}
