import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { db, dbConfigured } from "../../db/index.ts";
import { schemaProblems } from "../../db/usable.ts";
import {
  addMember,
  createGroup,
  groupById,
  groupByToken,
  groupsFor,
  membersOf,
  messagesIn,
  postMessage,
  removeMember,
  rotateInvite,
} from "./store.ts";
import { groupThread, mayJoin, mayPost } from "./rules.ts";
import { HEIDI_ID } from "./types.ts";

/**
 * These run against a REAL Postgres, because every bug this layer can have is
 * a bug the database has an opinion about — an upsert that violates a primary
 * key, a cascade that does not, a timestamp that comes back as a string in one
 * driver and a Date in another. A mocked `db` would assert that my mock agrees
 * with itself.
 *
 * CI provides one as a service container. Locally:
 *
 *   createdb heidi_test
 *   psql -f drizzle/0000_*.sql heidi_test
 *   DATABASE_URL='postgresql:///heidi_test?host=/var/run/postgresql' pnpm test
 *
 * The `host=` matters: with an empty host `pg` connects over TCP and asks for
 * a password, rather than using the unix socket where peer auth applies.
 *
 * With no DATABASE_URL they skip rather than fail, so `pnpm test` still works
 * on a machine with no Postgres — but CI does have one, so a skip there would
 * be a lie and the suite is not allowed to pass vacuously.
 */

const HAS_DB = dbConfigured();

describe("group store", { skip: HAS_DB ? false : "DATABASE_URL unset" }, () => {
  before(async () => {
    // A clean slate per run; cascade proves the foreign keys do their job.
    await db.execute(sql`truncate table study_groups cascade`);
  });

  after(async () => {
    await db.execute(sql`truncate table study_groups cascade`);
  });

  test("the application can actually use its own tables", async () => {
    // The check that would have caught the postgres-owns-the-table failure.
    assert.deepEqual(await schemaProblems(), []);
  });

  test("creating a group puts its author in it, with a usable invite token", async () => {
    const group = await createGroup({ name: "Züri Mittwoch", actorId: "alice", displayName: "Alice" });
    assert.equal(group.name, "Züri Mittwoch");
    assert.equal(group.createdBy, "alice");
    assert.ok(group.inviteToken);

    const members = await membersOf(group.id);
    assert.deepEqual(members.map((m) => m.actorId), ["alice"]);

    // And the token resolves back to the same group.
    const found = await groupByToken(group.inviteToken!);
    assert.equal(found?.id, group.id);
  });

  test("an unknown token resolves to nothing rather than throwing", async () => {
    assert.equal(await groupByToken("Zm9vYmFyYmF6cXV4MTIzNDU2Nzg5MGFiY2RlZg"), null);
  });

  test("the group list never carries the invite token", async () => {
    // It is rendered for every member, and only the organiser holds the key.
    const group = await createGroup({ name: "Leaky", actorId: "alice", displayName: "Alice" });
    await addMember({ groupId: group.id, actorId: "bob", displayName: "Bob" });

    const forBob = await groupsFor("bob");
    const row = forBob.find((g) => g.id === group.id);
    assert.ok(row, "bob should see the group he joined");
    assert.equal("inviteToken" in row!, false, "the token must not reach a member's list");
    assert.equal(row!.memberCount, 2);
  });

  test("someone who left stops seeing the group, and frees a seat", async () => {
    const group = await createGroup({ name: "Comings and goings", actorId: "alice", displayName: "Alice" });
    await addMember({ groupId: group.id, actorId: "bob", displayName: "Bob" });

    await removeMember(group.id, "bob");
    assert.equal((await groupsFor("bob")).some((g) => g.id === group.id), false);

    const members = await membersOf(group.id);
    assert.equal(mayPost(members, "bob"), false, "a departed member cannot post");
    // But the row survives, so their messages keep an author.
    assert.ok(members.some((m) => m.actorId === "bob"));
  });

  test("following the invite link twice does not explode", async () => {
    // (group_id, actor_id) is the primary key, so a plain insert would 500 on
    // a returning member — which is a thing that should simply work.
    const group = await createGroup({ name: "Revolving door", actorId: "alice", displayName: "Alice" });
    await addMember({ groupId: group.id, actorId: "bob", displayName: "Bob" });
    await removeMember(group.id, "bob");
    await addMember({ groupId: group.id, actorId: "bob", displayName: "Bob Again" });

    const members = await membersOf(group.id);
    const bob = members.find((m) => m.actorId === "bob");
    assert.equal(bob?.leftAt, null, "re-joining clears the departure");
    assert.equal(bob?.displayName, "Bob Again", "and refreshes the name");
    assert.equal(members.filter((m) => m.actorId === "bob").length, 1, "one row, not two");
    assert.deepEqual(mayJoin(members, "bob"), { ok: false, reason: "already-member" });
  });

  test("re-joining does NOT reset how far back you can read", async () => {
    // `joinedAt` is what threadkit gates visibility on. Refreshing it on
    // re-join would hand a returning member a blank thread.
    const group = await createGroup({ name: "Memory", actorId: "alice", displayName: "Alice" });
    await addMember({ groupId: group.id, actorId: "bob", displayName: "Bob" });
    const before = (await membersOf(group.id)).find((m) => m.actorId === "bob")!.joinedAt;

    await removeMember(group.id, "bob");
    await addMember({ groupId: group.id, actorId: "bob", displayName: "Bob" });
    const after = (await membersOf(group.id)).find((m) => m.actorId === "bob")!.joinedAt;

    assert.equal(after, before);
  });

  test("messages come back oldest first, and Heidi's answer survives the round trip", async () => {
    const group = await createGroup({ name: "Talking", actorId: "alice", displayName: "Alice" });
    await postMessage({ groupId: group.id, authorId: "alice", body: "Chunnsch au?" });
    await postMessage({
      groupId: group.id,
      authorId: HEIDI_ID,
      body: "Sie fragen, ob jemand mitkommt.",
      answer: { glosses: [{ form: "Chunnsch", standard: "kommst du" }], model: "test" },
    });

    const messages = await messagesIn(group.id);
    assert.deepEqual(messages.map((m) => m.authorId), ["alice", HEIDI_ID]);
    const answer = messages[1].answer as { glosses: Array<{ form: string }> };
    assert.equal(answer.glosses[0].form, "Chunnsch", "jsonb must come back as an object, not a string");
    assert.equal(messages[0].answer, undefined, "a human message carries no answer");
  });

  test("deleting a group takes its messages and members with it", async () => {
    const group = await createGroup({ name: "Doomed", actorId: "alice", displayName: "Alice" });
    await postMessage({ groupId: group.id, authorId: "alice", body: "hoi" });

    await db.execute(sql`delete from study_groups where id = ${group.id}::uuid`);

    assert.equal(await groupById(group.id), null);
    assert.deepEqual(await messagesIn(group.id), []);
    assert.deepEqual(await membersOf(group.id), []);
  });

  test("rotating the link invalidates the old one", async () => {
    const group = await createGroup({ name: "Rotate", actorId: "alice", displayName: "Alice" });
    const old = group.inviteToken!;
    const next = await rotateInvite(group.id);

    assert.notEqual(next, old);
    assert.equal(await groupByToken(old), null, "the link already in someone's chat must stop working");
    assert.equal((await groupByToken(next))?.id, group.id);
  });

  test("a real group builds a thread Heidi is in", async () => {
    const group = await createGroup({ name: "Threaded", actorId: "alice", displayName: "Alice" });
    await addMember({ groupId: group.id, actorId: "bob", displayName: "Bob" });

    const thread = groupThread(group, await membersOf(group.id));
    assert.equal(thread.participants.length, 3, "alice, bob and Heidi");
    assert.ok(thread.participants.some((p) => p.actorId === HEIDI_ID && p.kind === "ai"));
  });
});
