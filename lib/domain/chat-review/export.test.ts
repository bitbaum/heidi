import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../../db/schema.ts";
import { HEIDI_ID } from "../chat/types.ts";
import { feedbackSchema, isSameOrigin, recordFeedback } from "./feedback.ts";
import { MAX_CONTENT, MAX_TRANSCRIPTS, MAX_TURNS, clampLimit, collectTranscripts, sinceFrom, toTurn } from "./export.ts";
import { chatScope } from "./scope.ts";

/**
 * The export is the one place a day of conversations leaves this database, so
 * what it carries is asserted against a REAL Postgres (in memory) with Heidi's
 * own migrations applied — which also proves `0009_chat_feedback.sql` creates
 * the table the code writes to.
 */
async function database() {
  const pg = new PGlite();
  const dir = join(process.cwd(), "drizzle");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    for (const statement of readFileSync(join(dir, file), "utf8").split("--> statement-breakpoint")) {
      if (statement.trim()) await pg.exec(statement);
    }
  }
  return { pg, db: drizzle(pg, { schema }) };
}

const answer = (text: string, extra: Record<string, unknown> = {}) => ({
  mode: "understand",
  text,
  glosses: [],
  suggestions: [],
  model: "test/model",
  ...extra,
});

describe("one turn", () => {
  test("the learner's words travel as written, the author id does not", () => {
    const turn = toTurn({ id: "m1", authorId: "actor-uuid", body: "Was heisst nöd?", answer: null, createdAt: new Date() });
    assert.deepEqual(turn, { id: "m1", role: "user", content: "Was heisst nöd?" });
  });

  test("Heidi's turn carries the lines the reader saw and the gate's verdict as steps", () => {
    const turn = toTurn({
      id: "m2",
      authorId: HEIDI_ID,
      body: "They ask whether you are coming.",
      answer: answer("They ask whether you are coming.", {
        mode: "produce",
        dialect: "Ja, ich chume.",
        dialectClean: false,
        dialectFlags: ["bernese: chume"],
        suggestions: [{ label: "formal", text: "Ja, ich komme.", english: "", variety: "bridge", clean: true, flags: [] }],
        next: [{ id: "reply" }],
      }),
      createdAt: new Date(),
    });
    assert.equal(turn.role, "assistant");
    assert.match(turn.content, /They ask whether you are coming\.\nJa, ich chume\.\n- formal \(written standard\): Ja, ich komme\./);
    assert.deepEqual(turn.steps, ["mode: produce", "model: test/model", "gate: flagged bernese: chume", "offered: reply"]);
  });

  test("content is cut at the ceiling", () => {
    const turn = toTurn({ id: "m3", authorId: "a", body: "x".repeat(MAX_CONTENT + 500), answer: null, createdAt: new Date() });
    assert.equal(turn.content.length, MAX_CONTENT);
    assert.ok(turn.content.endsWith("…"));
  });
});

describe("the query parameters", () => {
  test("limit is capped, floored and defaulted", () => {
    assert.equal(clampLimit(null), MAX_TRANSCRIPTS);
    assert.equal(clampLimit("500"), MAX_TRANSCRIPTS);
    assert.equal(clampLimit("0"), MAX_TRANSCRIPTS);
    assert.equal(clampLimit("7.9"), 7);
    assert.equal(clampLimit("abc"), MAX_TRANSCRIPTS);
  });

  test("since defaults to the last day and reads ISO", () => {
    const now = Date.parse("2026-10-22T03:40:00Z");
    assert.equal(sinceFrom(null, now).toISOString(), "2026-10-21T03:40:00.000Z");
    assert.equal(sinceFrom("2026-10-20T00:00:00Z", now).toISOString(), "2026-10-20T00:00:00.000Z");
    assert.equal(sinceFrom("yesterday", now).toISOString(), "2026-10-21T03:40:00.000Z");
  });
});

describe("the export against Heidi's own migrations", () => {
  test("ships the night's saved conversations, newest first, with thumbs and without people", async () => {
    const { pg, db } = await database();
    const now = Date.now();
    const at = (hoursAgo: number) => new Date(now - hoursAgo * 60 * 60_000);

    const [fresh] = await db.insert(schema.conversations).values({ actorId: "actor-A", locale: "de", updatedAt: at(1) }).returning();
    const [older] = await db.insert(schema.conversations).values({ actorId: "actor-B", locale: "fr", updatedAt: at(5) }).returning();
    const [stale] = await db.insert(schema.conversations).values({ actorId: "actor-A", locale: "de", updatedAt: at(48) }).returning();
    const [gone] = await db
      .insert(schema.conversations)
      .values({ actorId: "actor-A", locale: "de", updatedAt: at(2), deletedAt: at(1) })
      .returning();

    // A long thread: more turns than the export keeps.
    for (let i = 0; i < MAX_TURNS + 6; i++) {
      await db.insert(schema.conversationMessages).values({
        conversationId: fresh.id,
        authorId: i % 2 === 0 ? "actor-A" : HEIDI_ID,
        body: `turn ${i}`,
        answer: i % 2 === 0 ? null : answer(`turn ${i}`),
        createdAt: new Date(now - (MAX_TURNS + 6 - i) * 60_000),
      });
    }
    const [q] = await db
      .insert(schema.conversationMessages)
      .values({ conversationId: older.id, authorId: "actor-B", body: "Comment dire bonjour ?", createdAt: at(5) })
      .returning();
    const [a] = await db
      .insert(schema.conversationMessages)
      .values({ conversationId: older.id, authorId: HEIDI_ID, body: "Grüezi.", answer: answer("Grüezi."), createdAt: at(5) })
      .returning();
    for (const id of [stale.id, gone.id]) {
      await db.insert(schema.conversationMessages).values({ conversationId: id, authorId: "actor-A", body: "old" });
    }

    await recordFeedback(db, feedbackSchema.parse({ conversationId: older.id, messageId: a.id, verdict: "down", reason: "vague", text: "  trop court  " }));
    await recordFeedback(db, feedbackSchema.parse({ conversationId: "draft", messageId: "heidi-3", verdict: "up" }));

    const transcripts = await collectTranscripts(db, { since: at(24), limit: 50 });

    assert.deepEqual(
      transcripts.map((t) => t.id),
      [fresh.id, older.id],
      "the stale and the deleted conversation stay home; newest first",
    );

    const [first, second] = transcripts;
    assert.equal(first.turns.length, MAX_TURNS, "only the last turns of a long thread");
    assert.equal(first.turns[0].content, "turn 6");
    assert.equal(first.surface, "/de/chat");
    assert.equal(first.feedback, undefined);

    assert.equal(second.surface, "/fr/chat");
    assert.deepEqual(
      second.turns.map((t) => [t.id, t.role]),
      [
        [q.id, "user"],
        [a.id, "assistant"],
      ],
    );
    assert.deepEqual(second.feedback, [{ messageId: a.id, verdict: "down", reason: "vague", text: "trop court" }]);

    // Nothing that names a person, at any depth.
    const text = JSON.stringify(transcripts);
    assert.ok(!text.includes("actor-A") && !text.includes("actor-B"), "an actor id left the export");
    for (const key of ["actorId", "displayName", "email", "name"]) {
      assert.ok(!new RegExp(`"${key}"`).test(text), `a "${key}" field left the export`);
    }

    // The limit holds, and an empty window is an empty array rather than an error.
    assert.equal((await collectTranscripts(db, { since: at(24), limit: 1 })).length, 1);
    assert.deepEqual(await collectTranscripts(db, { since: new Date(now + 60_000), limit: 50 }), []);

    await pg.close();
  });
});

describe("a thumb as the client posts it", () => {
  test("is a conversation id or 'draft', a verdict, and at most a reason and a thousand characters", () => {
    assert.ok(feedbackSchema.safeParse({ conversationId: "draft", messageId: "heidi-1", verdict: "up" }).success);
    assert.ok(
      feedbackSchema.safeParse({
        conversationId: "0f8fad5b-d9cb-469f-a165-70867728950e",
        messageId: "0f8fad5b-d9cb-469f-a165-70867728950e",
        verdict: "down",
        reason: "dead_end",
        text: "x".repeat(1000),
      }).success,
    );
    for (const bad of [
      { conversationId: "mine", messageId: "m", verdict: "up" },
      { conversationId: "draft", messageId: "", verdict: "up" },
      { conversationId: "draft", messageId: "m", verdict: "meh" },
      { conversationId: "draft", messageId: "m", verdict: "down", reason: "because" },
      { conversationId: "draft", messageId: "m", verdict: "down", text: "x".repeat(1001) },
    ]) {
      assert.equal(feedbackSchema.safeParse(bad).success, false, JSON.stringify(bad));
    }
  });

  test("comes from this site, as far as the browser says", () => {
    const with_ = (site?: string) => new Request("http://localhost/api/chat/feedback", { method: "POST", headers: site ? { "sec-fetch-site": site } : {} });
    assert.equal(isSameOrigin(with_("same-origin")), true);
    assert.equal(isSameOrigin(with_("none")), true);
    assert.equal(isSameOrigin(with_()), true);
    assert.equal(isSameOrigin(with_("cross-site")), false);
    assert.equal(isSameOrigin(with_("same-site")), false);
  });
});

describe("the scope the judge reads", () => {
  test("comes from the prompt — three to six sentences that name what Heidi is and is not", () => {
    const scope = chatScope();
    const sentences = scope.split(/(?<=[.!?])\s+(?=[A-Z])/);
    assert.ok(sentences.length >= 3 && sentences.length <= 6, `${sentences.length} sentences`);
    assert.match(scope, /^You are Heidi, a Zurich German/);
    assert.match(scope, /understand — .*; produce — .*; answer — /);
    assert.match(scope, /no web search/);
    assert.ok(!scope.includes("\n"), "one paragraph");
  });
});
