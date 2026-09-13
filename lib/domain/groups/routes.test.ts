import { test, before, after, describe, mock } from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { db, dbConfigured } from "../../db/index.ts";

/**
 * The route glue.
 *
 * The rules are tested pure and the queries are tested against Postgres; what
 * neither covers is whether a route calls the right rule with the right
 * arguments — which is exactly where an authorisation check goes missing. A
 * route that simply forgets to ask `mayPost` passes every other test in this
 * repository.
 *
 * `caller()` is the seam. It is the one function that turns a request into an
 * identity, so stubbing it lets the real handlers run against the real
 * database as any actor we like, including a stranger.
 *
 * Needs `--experimental-test-module-mocks`, which the test script passes.
 */

const HAS_DB = dbConfigured();

let current: { ok: true; actorId: string; displayName: string } | { ok: false; status: number; error: string } = {
  ok: true,
  actorId: "alice",
  displayName: "Alice",
};

function beCaller(actorId: string, displayName = actorId) {
  current = { ok: true, actorId, displayName };
}

describe("group routes", { skip: HAS_DB ? false : "DATABASE_URL unset" }, () => {
  let routes: {
    create: typeof import("../../../app/api/groups/route.ts");
    join: typeof import("../../../app/api/groups/join/route.ts");
    messages: typeof import("../../../app/api/groups/[id]/messages/route.ts");
    invite: typeof import("../../../app/api/groups/[id]/invite/route.ts");
  };

  before(async () => {
    // The routes import this by relative path (see the note in each route),
    // so the mock is registered against the resolved file URL.
    mock.module(new URL("./session.ts", import.meta.url).href, {
      namedExports: { caller: async () => current },
    });

    routes = {
      create: await import("../../../app/api/groups/route.ts"),
      join: await import("../../../app/api/groups/join/route.ts"),
      messages: await import("../../../app/api/groups/[id]/messages/route.ts"),
      invite: await import("../../../app/api/groups/[id]/invite/route.ts"),
    };

    await db.execute(sql`truncate table study_groups cascade`);
  });

  after(async () => {
    await db.execute(sql`truncate table study_groups cascade`);
    mock.reset();
  });

  const post = (url: string, body: unknown) =>
    new Request(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

  async function makeGroup(name = "Test") {
    beCaller("alice", "Alice");
    const res = await routes.create.POST(post("https://x/api/groups", { name }));
    assert.equal(res.status, 201, "creating a group should succeed");
    const { group } = (await res.json()) as { group: { id: string; inviteToken: string } };
    return group;
  }

  test("a stranger cannot read a group's messages", async () => {
    const group = await makeGroup("Private");

    beCaller("mallory");
    const res = await routes.messages.GET(new Request("https://x"), { params: Promise.resolve({ id: group.id }) });

    // 404, not 403: whether that id is a real group is not theirs to learn.
    assert.equal(res.status, 404);
  });

  test("a stranger cannot post into a group", async () => {
    const group = await makeGroup("Closed");

    beCaller("mallory");
    const res = await routes.messages.POST(post("https://x", { text: "hoi" }), {
      params: Promise.resolve({ id: group.id }),
    });
    assert.equal(res.status, 404);
  });

  test("a member can read and post", async () => {
    const group = await makeGroup("Open");

    beCaller("bob", "Bob");
    const joined = await routes.join.POST(post("https://x", { token: group.inviteToken }));
    assert.equal(joined.status, 200);

    const posted = await routes.messages.POST(post("https://x", { text: "hoi zäme" }), {
      params: Promise.resolve({ id: group.id }),
    });
    assert.equal(posted.status, 201);

    const read = await routes.messages.GET(new Request("https://x"), { params: Promise.resolve({ id: group.id }) });
    assert.equal(read.status, 200);
    const body = (await read.json()) as { messages: Array<{ body: string }> };
    assert.ok(body.messages.some((m) => m.body === "hoi zäme"));
  });

  test("a member is NOT an inviter", async () => {
    const group = await makeGroup("Organised");
    beCaller("bob", "Bob");
    await routes.join.POST(post("https://x", { token: group.inviteToken }));

    const res = await routes.invite.GET(new Request("https://x"), { params: Promise.resolve({ id: group.id }) });
    assert.equal(res.status, 404, "only the organiser may see or rotate the link");

    const rotate = await routes.invite.POST(post("https://x", {}), { params: Promise.resolve({ id: group.id }) });
    assert.equal(rotate.status, 404);
  });

  test("the organiser can see and rotate the link", async () => {
    const group = await makeGroup("Mine");
    beCaller("alice", "Alice");

    const got = await routes.invite.GET(new Request("https://x"), { params: Promise.resolve({ id: group.id }) });
    assert.equal(got.status, 200);
    assert.equal(((await got.json()) as { token: string }).token, group.inviteToken);

    const rotated = await routes.invite.POST(post("https://x", {}), { params: Promise.resolve({ id: group.id }) });
    assert.equal(rotated.status, 200);
    assert.notEqual(((await rotated.json()) as { token: string }).token, group.inviteToken);
  });

  test("a rotated link stops letting anyone in", async () => {
    const group = await makeGroup("Rotating");
    beCaller("alice", "Alice");
    await routes.invite.POST(post("https://x", {}), { params: Promise.resolve({ id: group.id }) });

    beCaller("bob", "Bob");
    const res = await routes.join.POST(post("https://x", { token: group.inviteToken }));
    assert.equal(res.status, 404, "the old link must be dead");
  });

  test("a malformed token never reaches the database", async () => {
    beCaller("bob", "Bob");
    const res = await routes.join.POST(post("https://x", { token: "'; drop table study_groups; --" }));
    assert.equal(res.status, 400);
    // And the table is still there.
    assert.ok((await makeGroup("Still here")).id);
  });

  test("an unreadable body is a 400, not a 500", async () => {
    beCaller("alice", "Alice");
    const res = await routes.create.POST(
      new Request("https://x", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }),
    );
    assert.equal(res.status, 400);
  });

  test("a blank group name is refused", async () => {
    beCaller("alice", "Alice");
    const res = await routes.create.POST(post("https://x", { name: "   " }));
    assert.equal(res.status, 400);
  });

  test("signed out, every group route refuses", async () => {
    const group = await makeGroup("Guarded");
    current = { ok: false, status: 401, error: "Sign in." };

    for (const [what, run] of [
      ["list", () => routes.create.GET()],
      ["create", () => routes.create.POST(post("https://x", { name: "x" }))],
      ["join", () => routes.join.POST(post("https://x", { token: "a".repeat(40) }))],
      ["read", () => routes.messages.GET(new Request("https://x"), { params: Promise.resolve({ id: group.id }) })],
      ["invite", () => routes.invite.GET(new Request("https://x"), { params: Promise.resolve({ id: group.id }) })],
    ] as const) {
      const res = await run();
      assert.equal(res.status, 401, `${what} should refuse a signed-out caller`);
    }
  });
});
