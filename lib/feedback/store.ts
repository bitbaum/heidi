import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import type { FeedbackComment, FeedbackStore, Stance, Suggestion, Tally } from "bip-kit";
import { db } from "../db/index.ts";
import { feedbackComments, feedbackStances, feedbackSuggestions, feedbackSupport } from "../db/schema.ts";

/**
 * bip-kit's `FeedbackStore` over Heidi's Postgres.
 *
 * The contract, and its tests, live in bip-kit; this file only says where the
 * rows go. Two rules the database enforces rather than this code:
 *
 *   one stance per voter per target   the primary key, written as an upsert
 *   one support per voter             the primary key, `ON CONFLICT DO NOTHING`
 *
 * so a double click, a retry, or two tabs can never count twice.
 */
export const feedbackStore: FeedbackStore = {
  async tallies(targetIds) {
    const out: Record<string, Tally> = {};
    if (targetIds.length === 0) return out;
    for (const id of targetIds) out[id] = { needed: 0, notNeeded: 0, comments: 0 };

    const votes = await db
      .select({ targetId: feedbackStances.targetId, stance: feedbackStances.stance, n: count() })
      .from(feedbackStances)
      .where(inArray(feedbackStances.targetId, [...targetIds]))
      .groupBy(feedbackStances.targetId, feedbackStances.stance);
    for (const v of votes) {
      if (v.stance === "needed") out[v.targetId].needed = v.n;
      else if (v.stance === "not-needed") out[v.targetId].notNeeded = v.n;
    }

    const said = await db
      .select({ targetId: feedbackComments.targetId, n: count() })
      .from(feedbackComments)
      .where(inArray(feedbackComments.targetId, [...targetIds]))
      .groupBy(feedbackComments.targetId);
    for (const c of said) out[c.targetId].comments = c.n;
    return out;
  },

  async stances(targetIds, voter) {
    if (targetIds.length === 0) return {};
    const rows = await db
      .select({ targetId: feedbackStances.targetId, stance: feedbackStances.stance })
      .from(feedbackStances)
      .where(and(eq(feedbackStances.voter, voter), inArray(feedbackStances.targetId, [...targetIds])));
    return Object.fromEntries(rows.map((r) => [r.targetId, r.stance as Stance]));
  },

  async setStance(targetId, voter, stance) {
    if (stance === null) {
      await db
        .delete(feedbackStances)
        .where(and(eq(feedbackStances.targetId, targetId), eq(feedbackStances.voter, voter)));
      return;
    }
    await db
      .insert(feedbackStances)
      .values({ targetId, voter, stance })
      .onConflictDoUpdate({
        target: [feedbackStances.targetId, feedbackStances.voter],
        set: { stance, updatedAt: sql`now()` },
      });
  },

  async addComment(targetId, voter, body) {
    const [row] = await db.insert(feedbackComments).values({ targetId, voter, body }).returning();
    return toComment(row);
  },

  async comments(targetId, limit) {
    const rows = await db
      .select()
      .from(feedbackComments)
      .where(eq(feedbackComments.targetId, targetId))
      .orderBy(asc(feedbackComments.createdAt))
      .limit(limit);
    return rows.map(toComment);
  },

  async addSuggestion(voter, body) {
    return db.transaction(async (tx) => {
      const [row] = await tx.insert(feedbackSuggestions).values({ body }).returning();
      await tx.insert(feedbackSupport).values({ suggestionId: row.id, voter });
      return { id: row.id, body: row.body, createdAt: row.createdAt.toISOString(), support: 1 };
    });
  },

  async support(suggestionId, voter) {
    // Not a uuid is not a suggestion — and Postgres would throw on the cast.
    if (!/^[0-9a-f-]{36}$/i.test(suggestionId)) return false;
    const [exists] = await db
      .select({ id: feedbackSuggestions.id })
      .from(feedbackSuggestions)
      .where(eq(feedbackSuggestions.id, suggestionId));
    if (!exists) return false;
    await db.insert(feedbackSupport).values({ suggestionId, voter }).onConflictDoNothing();
    return true;
  },

  async suggestions(limit) {
    const support = count(feedbackSupport.voter);
    const rows = await db
      .select({
        id: feedbackSuggestions.id,
        body: feedbackSuggestions.body,
        createdAt: feedbackSuggestions.createdAt,
        support,
      })
      .from(feedbackSuggestions)
      .leftJoin(feedbackSupport, eq(feedbackSupport.suggestionId, feedbackSuggestions.id))
      .groupBy(feedbackSuggestions.id)
      .orderBy(desc(support), desc(feedbackSuggestions.createdAt))
      .limit(limit);
    return rows.map(
      (r): Suggestion => ({ id: r.id, body: r.body, createdAt: r.createdAt.toISOString(), support: r.support }),
    );
  },
};

function toComment(row: typeof feedbackComments.$inferSelect): FeedbackComment {
  return { id: row.id, targetId: row.targetId, body: row.body, createdAt: row.createdAt.toISOString() };
}
