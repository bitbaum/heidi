import { index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Study groups — the first thing in Heidi that outlives a browser tab.
 *
 * THERE IS NO USERS TABLE, AND THAT IS DELIBERATE.
 *
 * Identity is federated to OrangeCat; the OIDC `sub` claim is the actor id and
 * the only thing we hold. So `created_by`, `actor_id` and `author_id` are that
 * claim, stored as text, with no foreign key to anywhere — because the row
 * they would point at lives in another product. A `users` table here would be
 * a second copy of an identity we do not own, and the copy is the thing that
 * goes stale.
 *
 * The consequence is that a display name has to be DENORMALISED onto the
 * membership row. There is nothing to join to. It is captured at join time
 * from the OIDC profile and may drift if someone renames themselves upstream;
 * that is a real cost, accepted knowingly, and much cheaper than mirroring an
 * identity provider.
 *
 * Heidi herself is NOT a member row. She participates in every group by
 * construction, so storing her would be a row that must be written correctly
 * for every group forever and can only ever say the same thing. She is
 * composed into the threadkit participant list at read time instead.
 */

export const studyGroups = pgTable("study_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  /** OIDC `sub` of whoever made it. They see the thread from its start. */
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  /**
   * The invite link's secret. Unguessable and rotatable — knowing a group's
   * id must never be enough to join it, because ids travel in URLs and logs.
   * Unique so a link resolves to exactly one group.
   */
  inviteToken: text("invite_token").notNull().unique(),
});

export const groupMembers = pgTable(
  "group_members",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => studyGroups.id, { onDelete: "cascade" }),
    /** OIDC `sub`. No foreign key: the person lives in OrangeCat, not here. */
    actorId: text("actor_id").notNull(),
    /** Denormalised from the OIDC profile — see the note above. */
    displayName: text("display_name").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    /**
     * Set rather than deleted. threadkit gates visibility on `leftAt`, so a
     * departure has to be a fact with a time on it; a deleted row would make
     * the messages they wrote authorless.
     */
    leftAt: timestamp("left_at", { withTimezone: true }),
  },
  (t) => [
    primaryKey({ columns: [t.groupId, t.actorId] }),
    // "Which groups am I in" is the portal's first query on every page load.
    index("group_members_actor_idx").on(t.actorId),
  ],
);

export const groupMessages = pgTable(
  "group_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => studyGroups.id, { onDelete: "cascade" }),
    /** An OIDC `sub`, or the assistant's fixed id. */
    authorId: text("author_id").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    /**
     * Heidi's structured answer — glosses, suggestions, the model that wrote
     * it — kept whole rather than shredded into columns.
     *
     * It is a rendering detail of one message, never queried across rows, and
     * its shape is owned by `lib/domain/chat/types.ts`, which changes when the
     * prompt changes. Columns would turn every prompt revision into a
     * migration. Null for anything a human wrote.
     */
    answer: jsonb("answer"),
  },
  // Every read is "this group's messages, oldest first".
  (t) => [index("group_messages_group_created_idx").on(t.groupId, t.createdAt)],
);

/**
 * A private conversation with Heidi, and its messages.
 *
 * NOT the group tables with one member. That was the tempting reuse and it
 * fails on the two things that matter: `study_groups.invite_token` is
 * `NOT NULL UNIQUE` and is a CREDENTIAL, so every private chat would mint a
 * joinable room key nobody asked for — and deletion means the opposite in each
 * case. A group departure sets `left_at` precisely so the messages someone
 * wrote keep an author; deleting a conversation means destroying the text. One
 * table cannot honour both.
 *
 * Same identity rule as everywhere else here: `actor_id` is the OIDC `sub`,
 * stored as bare text with no foreign key, because the row it would point at
 * lives in OrangeCat.
 */
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id").notNull(),
    /**
     * Derived from the first message, never asked for. Every product that asks
     * collects a thousand "Untitled"; what someone pasted is also the best
     * possible label, because it is how they will recognise the thread later.
     */
    title: text("title").notNull().default(""),
    /**
     * Which language Heidi explained in.
     *
     * On the conversation rather than the request: re-opening a six-month-old
     * thread from a browser negotiated to French and having Heidi continue in
     * French mid-conversation is a bug you only find in production.
     */
    locale: text("locale").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    /** Bumped on every message. The sidebar's sort key. */
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    /**
     * A tombstone, and the messages are GONE.
     *
     * Deleting sets this and hard-deletes every `conversation_messages` row in
     * the same transaction. A `deleted_at` that leaves the text sitting in the
     * table forever is exactly the lie the privacy section would then have to
     * tell. What the tombstone buys is worth keeping: a deleted id answers a
     * stable 404 rather than one that might be a permissions bug, and the
     * per-actor count survives a delete loop.
     */
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("conversations_actor_updated_idx").on(t.actorId, t.updatedAt)],
);

export const conversationMessages = pgTable(
  "conversation_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    /** An OIDC `sub`, or the assistant's fixed id. */
    authorId: text("author_id").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    /** Heidi's structured answer, kept whole. Null for anything a human wrote. */
    answer: jsonb("answer"),
    /**
     * HOW MANY pictures rode along, never the pictures.
     *
     * Attachments are downscaled data URLs: they would be the largest rows in
     * this database and the single most private artefact the product touches.
     * The count is enough for a re-opened thread to say "2 pictures" honestly
     * without Heidi holding them, and it is what keeps the privacy section
     * short.
     */
    imageCount: integer("image_count").notNull().default(0),
  },
  (t) => [index("conversation_messages_conversation_created_idx").on(t.conversationId, t.createdAt)],
);
