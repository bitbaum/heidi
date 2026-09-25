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

/**
 * Speaking rounds: the topics people propose, and the sittings they become.
 *
 * WHAT IS NOT HERE IS THE POINT.
 *
 * There is no audio table and no table of anybody's takes. A recording is
 * measured in the browser (`domain/speaking/delivery.ts`); the numbers, and
 * the learner's own write-up of what they said, are kept in their own
 * localStorage. Neither the sound nor the text ever reaches this database. §10
 * calls voice notes among the most private things a person owns, and the
 * cheapest way to honour that is to never hold one. It is the call
 * `image_count` already made for pictures, taken one step further because
 * there is not even a count worth keeping.
 *
 * So what is stored here is only the SOCIAL half — who proposed what, who is
 * coming, and when it sits. All of it is meant to be seen by the other people
 * in the round, which is exactly the property the private half does not have.
 *
 * Same identity rule as everywhere else: an actor id is the OIDC `sub`, bare
 * text, no foreign key, with the display name denormalised at write time.
 */

export const speakingTopics = pgTable(
  "speaking_topics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    /** One line of why it is worth an hour. */
    pitch: text("pitch").notNull(),
    proposedBy: text("proposed_by").notNull(),
    proposerName: text("proposer_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("speaking_topics_created_idx").on(t.createdAt)],
);

/**
 * "I would come to that."
 *
 * A row rather than a counter on the topic, because a count cannot answer the
 * question the page actually asks — whether YOU already said yes — and a
 * counter with no rows behind it can only ever go up.
 */
export const topicInterest = pgTable(
  "topic_interest",
  {
    topicId: uuid("topic_id")
      .notNull()
      .references(() => speakingTopics.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.topicId, t.actorId] })],
);

export const speakingRounds = pgTable(
  "speaking_rounds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /**
     * The proposal it came from. Nullable, and `set null` on delete: a round
     * people are coming to is a fact, and removing the topic it grew out of
     * must not remove the meeting.
     */
    topicId: uuid("topic_id").references(() => speakingTopics.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    /** `webinar` or `circle` — see domain/speaking/types.ts. */
    format: text("format").notNull(),
    hostId: text("host_id").notNull(),
    hostName: text("host_name").notNull(),
    /**
     * The first sitting, absolute. Every later one is COMPUTED from this plus
     * the cadence and the zone, never stored — see domain/speaking/schedule.ts.
     * A table of generated occurrences would have to be extended by a job
     * nobody would notice had stopped.
     */
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    /** `once`, `weekly` or `fortnightly`. */
    cadence: text("cadence").notNull(),
    /**
     * The zone the repeat is anchored in. Kept even though `starts_at` is
     * absolute: "every Tuesday at 19:00" survives a daylight-saving change and
     * an instant plus seven days does not.
     */
    timeZone: text("time_zone").notNull(),
    /** An https room somewhere else. Heidi carries no video. Validated on write. */
    meetingUrl: text("meeting_url"),
    capacity: integer("capacity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    /**
     * Called off, rather than deleted. People have it in their calendar; a row
     * that vanishes tells them nothing and a row that says cancelled does.
     */
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (t) => [index("speaking_rounds_starts_idx").on(t.startsAt)],
);

export const roundAttendance = pgTable(
  "round_attendance",
  {
    roundId: uuid("round_id")
      .notNull()
      .references(() => speakingRounds.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    /** Denormalised from the OIDC profile, like every other name here. */
    displayName: text("display_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.roundId, t.actorId] }), index("round_attendance_actor_idx").on(t.actorId)],
);

/**
 * Feedback on the roadmap and the changelog — the storage behind bip-kit's
 * `FeedbackStore` contract (`lib/feedback/store.ts`).
 *
 * `voter` is NOT an identity. It is the random key the reader's browser keeps
 * (bip-kit's `x-bip-voter`), so a vote needs no sign-in and says nothing about
 * who cast it. `target_id` is a bip-kit id (`roadmap:teams`,
 * `changelog:2026-09-25:1`), validated against the published roadmap and
 * changelog by the route before anything is written.
 */
export const feedbackStances = pgTable(
  "feedback_stances",
  {
    targetId: text("target_id").notNull(),
    voter: text("voter").notNull(),
    /** `needed` | `not-needed`. Withdrawing a stance deletes the row. */
    stance: text("stance").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.targetId, t.voter] })],
);

export const feedbackComments = pgTable(
  "feedback_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetId: text("target_id").notNull(),
    voter: text("voter").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("feedback_comments_target_idx").on(t.targetId, t.createdAt)],
);

export const feedbackSuggestions = pgTable("feedback_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** One row per voter who asked for a suggestion, its author included. */
export const feedbackSupport = pgTable(
  "feedback_support",
  {
    suggestionId: uuid("suggestion_id")
      .notNull()
      .references(() => feedbackSuggestions.id, { onDelete: "cascade" }),
    voter: text("voter").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.suggestionId, t.voter] })],
);

/**
 * Progress synced between a learner's devices — OPT-IN, signed in, off by
 * default (settings). One row per device per record kind; see
 * `lib/domain/progress/sync.ts` for why devices are kept apart rather than
 * merged into one row: a page adds them up when it shows them, and nothing is
 * ever counted twice.
 *
 * `device_id` is random and names only "a browser"; `actor_id` is the OIDC
 * subject, like everywhere else here. Turning sync off deletes this device's
 * rows; "delete synced progress" deletes all of them.
 */
export const progressDevices = pgTable(
  "progress_devices",
  {
    actorId: text("actor_id").notNull(),
    deviceId: text("device_id").notNull(),
    /** `model` | `history` | `streak` | `saved`. */
    key: text("key").notNull(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.actorId, t.deviceId, t.key] })],
);

/**
 * A certificate for one situation, issued by the SERVER from the learner's
 * synced progress — never from a browser's say-so, which is what makes the
 * public page worth showing to somebody else.
 *
 * It records what was measured when it was issued (`askable`, `held`,
 * `stuck`), because situations grow: a certificate from a 10-line scene says
 * 10, and stays true about what it certified after the scene has 20.
 * No name: the page is public, and a name there would be a directory of who
 * is learning Swiss German. The learner may type one for printing; it is not
 * stored.
 */
export const certificates = pgTable(
  "certificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id").notNull(),
    sceneId: text("scene_id").notNull(),
    askable: integer("askable").notNull(),
    held: integer("held").notNull(),
    stuck: integer("stuck").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("certificates_actor_scene_idx").on(t.actorId, t.sceneId)],
);
