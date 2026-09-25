import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { db, dbConfigured } from "../../db/index.ts";
import { schemaProblems } from "../../db/usable.ts";
import {
  appendMessage,
  asSoloMessages,
  conversationById,
  conversationsFor,
  countFor,
  countMessages,
  createConversation,
  deleteConversation,
  messagesIn,
  renameConversation,
} from "./store.ts";
import { mayRead, mayWrite } from "./rules.ts";
import { HEIDI_ID, LEARNER_ID } from "../chat/types.ts";

/**
 * Against a real Postgres, because every bug this layer can have is one the
 * database has an opinion about.
 *
 * NOTE: `--test-concurrency=1` in the test script is load-bearing and this
 * suite must truncate only ITS OWN tables. A `TRUNCATE` that reaches past them
 * wipes a sibling suite's fixtures mid-run and surfaces as an unrelated 404 in
 * a different file.
 *
 * Locally:
 *   createdb heidi_test
 *   for f in drizzle/[0-9]*.sql; do psql -f "$f" heidi_test; done
 *   DATABASE_URL='postgresql:///heidi_test?host=/var/run/postgresql' pnpm test
 */
const HAS_DB = dbConfigured();

describe("conversation store", { skip: HAS_DB ? false : "DATABASE_URL unset" }, () => {
  before(async () => {
    await db.execute(sql`truncate table conversations cascade`);
  });

  after(async () => {
    await db.execute(sql`truncate table conversations cascade`);
  });

  test("the application can use its own tables, including the new ones", async () => {
    // The check that catches the postgres-owns-the-table grant failure. It
    // only works if APP_TABLES knows about conversations — miss that and
    // /api/health stays green while every write 500s.
    assert.deepEqual(await schemaProblems(), []);
  });

  test("a conversation starts unnamed and is named by the first thing said", async () => {
    const c = await createConversation({ actorId: "alice", locale: "de" });
    assert.equal(c.title, "", "nobody titles a chat up front");

    await appendMessage({ conversationId: c.id, authorId: "alice", body: "Chunnsch au no verbi hüt Abig?" });
    assert.equal((await conversationById(c.id))?.title, "Chunnsch au no verbi hüt Abig?");
  });

  test("Heidi's answer does not rename the conversation", async () => {
    // Titling a thread after our own words rather than theirs would label
    // every conversation in the sidebar with Heidi's voice.
    const c = await createConversation({ actorId: "alice", locale: "de" });
    await appendMessage({ conversationId: c.id, authorId: "alice", body: "Was heisst gäll?" });
    await appendMessage({ conversationId: c.id, authorId: HEIDI_ID, body: "Eine Bestätigungsfrage." });
    assert.equal((await conversationById(c.id))?.title, "Was heisst gäll?");
  });

  test("the list is newest-activity-first and belongs to one actor", async () => {
    const mine = await createConversation({ actorId: "alice", locale: "de" });
    const theirs = await createConversation({ actorId: "bob", locale: "de" });
    await appendMessage({ conversationId: mine.id, authorId: "alice", body: "hoi" });

    const forAlice = await conversationsFor("alice");
    assert.ok(forAlice.some((c) => c.id === mine.id));
    assert.equal(forAlice.some((c) => c.id === theirs.id), false, "another actor's thread is not in my list");
  });

  test("a message bumps the conversation so it rises in the list", async () => {
    const older = await createConversation({ actorId: "carol", locale: "de" });
    const newer = await createConversation({ actorId: "carol", locale: "de" });
    // "Later" has to be later on the clock. On a fast CI runner the create and
    // the bump landed in the SAME millisecond, both rows carried one
    // `updatedAt`, and the order came out arbitrary — a failure about the test
    // racing the clock, not about the product (no person replies in 1 ms).
    await new Promise((resolve) => setTimeout(resolve, 5));
    await appendMessage({ conversationId: older.id, authorId: "carol", body: "later" });

    const list = await conversationsFor("carol");
    assert.equal(list[0].id, older.id, "the one just used comes first");
    assert.equal(list[1].id, newer.id);
  });

  test("images are COUNTED, never stored", async () => {
    const c = await createConversation({ actorId: "alice", locale: "de" });
    const m = await appendMessage({ conversationId: c.id, authorId: "alice", body: "was steht da?", imageCount: 2 });
    assert.equal(m.imageCount, 2);

    // And nothing resembling a data URL is anywhere in the row.
    const [row] = (await db.execute(sql`select * from conversation_messages where id = ${m.id}::uuid`)).rows;
    assert.equal(JSON.stringify(row).includes("data:image"), false, "a picture must not be in the database");
  });

  test("deleting DESTROYS the text and leaves a tombstone", async () => {
    const c = await createConversation({ actorId: "alice", locale: "de" });
    await appendMessage({ conversationId: c.id, authorId: "alice", body: "etwas Privates" });

    await deleteConversation(c.id);

    assert.equal(await countMessages(c.id), 0, "a soft delete that keeps the words is not a delete");
    const after = await conversationById(c.id);
    assert.ok(after?.deletedAt, "the tombstone stays, so a deleted id answers a stable 404");
    assert.equal(after?.title, "", "and the title, which was their words, goes too");
    assert.equal(mayRead(after, "alice"), false, "a tombstoned conversation belongs to nobody");
  });

  test("a stranger may neither read nor write", async () => {
    const c = await createConversation({ actorId: "alice", locale: "de" });
    const row = await conversationById(c.id);
    assert.equal(mayRead(row, "mallory"), false);
    assert.equal(mayWrite(row, "mallory"), false);
    assert.equal(mayRead(row, "alice"), true);
  });

  test("renaming keeps it to one line", async () => {
    const c = await createConversation({ actorId: "alice", locale: "de" });
    await renameConversation(c.id, "  zwei\nZeilen  ");
    assert.equal((await conversationById(c.id))?.title, "zwei Zeilen");
  });

  test("the per-actor count ignores other actors and deleted threads", async () => {
    const before = await countFor("dave");
    const c = await createConversation({ actorId: "dave", locale: "de" });
    assert.equal(await countFor("dave"), before + 1);
    await deleteConversation(c.id);
    assert.equal(await countFor("dave"), before, "a deleted thread frees its slot");
  });

  test("stored rows become a two-party thread, whoever the actor is", async () => {
    // Rows carry the OIDC sub; `soloThread()` is built on the fixed LEARNER_ID.
    // This mapping is the boundary, and getting it wrong would make Heidi read
    // her own answers as the learner's.
    const c = await createConversation({ actorId: "sub-abc-123", locale: "de" });
    await appendMessage({ conversationId: c.id, authorId: "sub-abc-123", body: "meine Frage" });
    await appendMessage({ conversationId: c.id, authorId: HEIDI_ID, body: "ihre Antwort" });

    const thread = asSoloMessages(await messagesIn(c.id), "sub-abc-123");
    assert.deepEqual(thread.map((m) => m.authorId), [LEARNER_ID, HEIDI_ID]);
  });

  test("an answer survives the round trip through jsonb", async () => {
    const c = await createConversation({ actorId: "alice", locale: "de" });
    await appendMessage({
      conversationId: c.id,
      authorId: HEIDI_ID,
      body: "Sie fragen, ob jemand vorbeikommt.",
      answer: { text: "Sie fragen, ob jemand vorbeikommt.", glosses: [{ form: "Chunnsch" }], model: "test" },
    });

    const [m] = await messagesIn(c.id);
    assert.equal(m.answer?.glosses[0].form, "Chunnsch");
    assert.equal(m.answer?.model, "test");
  });
});
