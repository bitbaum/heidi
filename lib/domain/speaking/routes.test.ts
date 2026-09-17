import { test, before, after, describe, mock } from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { db, dbConfigured } from "../../db/index.ts";
import { CIRCLE_CAPACITY } from "./types.ts";

/**
 * The route glue, against a real database.
 *
 * The rules are tested pure and the recurrence is tested pure; what neither
 * covers is whether a route calls the right rule with the right arguments —
 * which is exactly where an authorisation check goes missing. A route that
 * forgets to ask `mayEditRound` passes every other test in this repository.
 *
 * `caller()` is the seam, the same one the group routes use: it is the single
 * function turning a request into an identity, so stubbing it runs the real
 * handlers against the real database as any actor we like, including a
 * stranger.
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

describe("speaking routes", { skip: HAS_DB ? false : "DATABASE_URL unset" }, () => {
  let routes: {
    topics: typeof import("../../../app/api/speaking/topics/route.ts");
    interest: typeof import("../../../app/api/speaking/topics/[id]/interest/route.ts");
    rounds: typeof import("../../../app/api/speaking/rounds/route.ts");
    round: typeof import("../../../app/api/speaking/rounds/[id]/route.ts");
  };

  before(async () => {
    // Registered against the resolved file URL, because the routes import this
    // module by relative path — see the note at the top of each route.
    mock.module(new URL("./session.ts", import.meta.url).href, {
      namedExports: {
        caller: async () => current,
        optionalActor: async () => (current.ok ? current.actorId : null),
      },
    });

    routes = {
      topics: await import("../../../app/api/speaking/topics/route.ts"),
      interest: await import("../../../app/api/speaking/topics/[id]/interest/route.ts"),
      rounds: await import("../../../app/api/speaking/rounds/route.ts"),
      round: await import("../../../app/api/speaking/rounds/[id]/route.ts"),
    };

    await db.execute(sql`truncate table speaking_topics, speaking_rounds cascade`);
  });

  after(async () => {
    await db.execute(sql`truncate table speaking_topics, speaking_rounds cascade`);
    mock.reset();
  });

  const post = (url: string, body: unknown) =>
    new Request(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

  const del = (url: string, body?: unknown) =>
    new Request(url, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  const params = (id: string) => ({ params: Promise.resolve({ id }) });

  /** A Response body may only be read once, so read it once and assert on that. */
  async function body<T>(res: Response): Promise<T> {
    return (await res.json()) as T;
  }

  async function makeTopic(title = "Züri Slang am Bahnhof") {
    beCaller("alice", "Alice");
    const res = await routes.topics.POST(
      post("https://x/api/speaking/topics", { title, pitch: "Was man am Bahnhof wirklich hört." }),
    );
    const payload = await body<{ topic?: { id: string; interest: number }; error?: string }>(res);
    assert.equal(res.status, 201, payload.error ?? "creating a topic should succeed");
    assert.ok(payload.topic);
    return payload.topic;
  }

  const future = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

  async function makeRound(over: Record<string, unknown> = {}) {
    const res = await routes.rounds.POST(
      post("https://x/api/speaking/rounds", {
        title: "Dienstagsrunde",
        format: "circle",
        cadence: "weekly",
        durationMinutes: 45,
        startsAt: future(3),
        timeZone: "Europe/Zurich",
        meetingUrl: "https://meet.example.ch/zueri",
        ...over,
      }),
    );
    return res;
  }

  test("proposing a topic counts the proposer as interested in their own idea", async () => {
    const topic = await makeTopic("Wie man im Tram flucht");
    assert.equal(topic.interest, 1, "a board that opens at zero is a board nobody backs");
  });

  test("the board is readable signed out", async () => {
    await makeTopic("Znüni und Zvieri");
    current = { ok: false, status: 401, error: "Sign in" };
    const res = await routes.topics.GET();
    assert.equal(res.status, 200, "a wall in front of the board hides the reason to sign up");
    const { topics } = (await res.json()) as { topics: Array<{ mine?: boolean }> };
    assert.ok(topics.length > 0);
    assert.equal(topics[0].mine, undefined, "and nothing personal leaks into it");
    beCaller("alice", "Alice");
  });

  test("interest is idempotent in both directions — a double tap is not an error", async () => {
    const topic = await makeTopic("Dialekt am Telefon");
    beCaller("bob", "Bob");

    const url = `https://x/api/speaking/topics/${topic.id}/interest`;
    assert.equal((await routes.interest.POST(post(url, {}), params(topic.id))).status, 200);
    assert.equal((await routes.interest.POST(post(url, {}), params(topic.id))).status, 200, "twice is fine");

    const after1 = await countInterest(topic.id);
    assert.equal(after1, 2, "alice and bob, counted once each");

    assert.equal((await routes.interest.DELETE(del(url), params(topic.id))).status, 200);
    assert.equal((await routes.interest.DELETE(del(url), params(topic.id))).status, 200, "and twice off is fine");
    assert.equal(await countInterest(topic.id), 1);
  });

  test("an unknown topic answers 404 rather than a constraint violation", async () => {
    const id = "00000000-0000-4000-8000-000000000000";
    const res = await routes.interest.POST(post(`https://x/i`, {}), params(id));
    assert.equal(res.status, 404);
    const bad = await routes.interest.POST(post(`https://x/i`, {}), params("not-a-uuid"));
    assert.equal(bad.status, 404);
  });

  test("opening a round puts the host in it", async () => {
    beCaller("alice", "Alice");
    const res = await makeRound();
    const payload = await body<{
      round?: { attending: number; capacity: number; mine: boolean };
      error?: string;
    }>(res);
    assert.equal(res.status, 201, payload.error ?? "opening a round should succeed");
    const round = payload.round;
    assert.ok(round);
    assert.equal(round.attending, 1, "somebody has to be there");
    assert.equal(round.mine, true);
    assert.equal(round.capacity, CIRCLE_CAPACITY, "read from the format, not from the request");
  });

  test("a hostile meeting link is refused by the route, not only by the form", async () => {
    beCaller("alice", "Alice");
    const res = await makeRound({ meetingUrl: "javascript:alert(document.cookie)" });
    assert.equal(res.status, 400, "this string is rendered as a link for every attendee");
  });

  test("a round in the past is refused", async () => {
    beCaller("alice", "Alice");
    const res = await makeRound({ startsAt: new Date(Date.now() - 86_400_000).toISOString() });
    assert.equal(res.status, 400);
  });

  test("saying you will come, and taking it back", async () => {
    beCaller("alice", "Alice");
    const created = await makeRound({ title: "Mitkommen" });
    const { round } = (await created.json()) as { round: { id: string } };

    beCaller("bob", "Bob");
    const url = `https://x/api/speaking/rounds/${round.id}`;
    assert.equal((await routes.round.POST(post(url, {}), params(round.id))).status, 200);
    assert.equal(await countAttending(round.id), 2);

    // Pressing it again is success, because the button wanted them in the
    // round and they are in it.
    assert.equal((await routes.round.POST(post(url, {}), params(round.id))).status, 200);
    assert.equal(await countAttending(round.id), 2);

    assert.equal((await routes.round.DELETE(del(url), params(round.id))).status, 200);
    assert.equal(await countAttending(round.id), 1);
  });

  test("a full circle refuses the ninth person", async () => {
    beCaller("alice", "Alice");
    const created = await makeRound({ title: "Volle Runde" });
    const { round } = (await created.json()) as { round: { id: string } };
    const url = `https://x/api/speaking/rounds/${round.id}`;

    // The host is already one of the eight.
    for (let i = 1; i < CIRCLE_CAPACITY; i++) {
      beCaller(`person-${i}`, `Person ${i}`);
      const res = await routes.round.POST(post(url, {}), params(round.id));
      assert.equal(res.status, 200, `person ${i} should fit`);
    }
    assert.equal(await countAttending(round.id), CIRCLE_CAPACITY);

    beCaller("one-too-many", "Nine");
    const refused = await routes.round.POST(post(url, {}), params(round.id));
    assert.equal(refused.status, 409);
  });

  test("ONLY THE HOST CALLS A ROUND OFF, and a stranger is told nothing", async () => {
    beCaller("alice", "Alice");
    const created = await makeRound({ title: "Absage" });
    const { round } = (await created.json()) as { round: { id: string } };
    const url = `https://x/api/speaking/rounds/${round.id}`;

    beCaller("mallory", "Mallory");
    const refused = await routes.round.DELETE(del(url, { cancel: true }), params(round.id));
    assert.equal(refused.status, 404, "404, not 403 — whether it exists is not theirs to learn");
    assert.equal(await isCancelled(round.id), false, "and it is still on");

    beCaller("alice", "Alice");
    const done = await routes.round.DELETE(del(url, { cancel: true }), params(round.id));
    assert.equal(done.status, 200);
    assert.equal(await isCancelled(round.id), true);
  });

  test("a cancelled round is gone from the list and from lookup", async () => {
    beCaller("alice", "Alice");
    const created = await makeRound({ title: "Verschwunden" });
    const { round } = (await created.json()) as { round: { id: string } };
    await routes.round.DELETE(del(`https://x/r`, { cancel: true }), params(round.id));

    const res = await routes.rounds.GET();
    const { rounds } = (await res.json()) as { rounds: Array<{ id: string }> };
    assert.ok(!rounds.some((r) => r.id === round.id));

    const gone = await routes.round.POST(post("https://x/r", {}), params(round.id));
    assert.equal(gone.status, 404);
  });

  /**
   * The one that a plain `starts_at > now` gets wrong, and the reason the list
   * query is not one line. This is the recurrence and the database meeting.
   */
  test("A WEEKLY ROUND OPENED MONTHS AGO IS STILL UPCOMING, with a future sitting", async () => {
    beCaller("alice", "Alice");
    // Inserted directly: the route refuses a start in the past, correctly, and
    // the row this tests is one that has simply been running for a while.
    //
    // 68 days, NOT 70. Seventy is exactly ten weeks, which puts the occurrence
    // on this very instant and makes "is the next sitting in the future?"
    // a coin toss decided by milliseconds. 68 is nine weeks and five days, so
    // the next sitting is unambiguously two days out.
    const past = new Date(Date.now() - 68 * 86_400_000);
    const [row] = await db
      .insert((await import("../../db/schema.ts")).speakingRounds)
      .values({
        title: "Läuft seit Februar",
        format: "circle",
        hostId: "alice",
        hostName: "Alice",
        startsAt: past,
        durationMinutes: 45,
        cadence: "weekly",
        timeZone: "Europe/Zurich",
        meetingUrl: null,
        capacity: CIRCLE_CAPACITY,
      })
      .returning();

    const res = await routes.rounds.GET();
    const { rounds } = (await res.json()) as { rounds: Array<{ id: string; startsAt: string }> };
    const found = rounds.find((r) => r.id === row.id);
    assert.ok(found, "a repeat that has been running is still upcoming");
    assert.ok(
      Date.parse(found.startsAt) > Date.now(),
      "and the date shown is the NEXT sitting, not the one in February",
    );
    assert.ok(
      Date.parse(found.startsAt) < Date.now() + 8 * 86_400_000,
      "which is within the week, because it is weekly",
    );
  });

  /**
   * The bug this pins: asking for "the next sitting at NOW" drops a round that
   * started five minutes ago — which is exactly when somebody running late
   * opens the page looking for the link.
   */
  test("A ROUND HAPPENING RIGHT NOW IS STILL ON THE LIST, and says so", async () => {
    const { speakingRounds } = await import("../../db/schema.ts");
    const [row] = await db
      .insert(speakingRounds)
      .values({
        title: "Läuft gerade",
        format: "circle",
        hostId: "alice",
        hostName: "Alice",
        // Started five minutes ago, runs for 45.
        startsAt: new Date(Date.now() - 5 * 60_000),
        durationMinutes: 45,
        cadence: "once",
        timeZone: "Europe/Zurich",
        meetingUrl: "https://meet.example.ch/now",
        capacity: CIRCLE_CAPACITY,
      })
      .returning();

    const res = await routes.rounds.GET();
    const { rounds } = (await res.json()) as { rounds: Array<{ id: string; live?: boolean }> };
    const found = rounds.find((r) => r.id === row.id);
    assert.ok(found, "somebody arriving late must still find the room");
    assert.equal(found.live, true, "and be told it is on now rather than shown a past date");

    // And it is still reachable directly, not only in the list.
    const joinable = await routes.round.POST(post("https://x/r", {}), params(row.id));
    assert.equal(joinable.status, 200);
  });

  test("a weekly round in progress shows THIS sitting, not next week's", async () => {
    const { speakingRounds } = await import("../../db/schema.ts");
    const started = new Date(Date.now() - 10 * 60_000);
    const [row] = await db
      .insert(speakingRounds)
      .values({
        title: "Wöchentlich, läuft",
        format: "circle",
        hostId: "alice",
        hostName: "Alice",
        startsAt: started,
        durationMinutes: 60,
        cadence: "weekly",
        timeZone: "Europe/Zurich",
        meetingUrl: null,
        capacity: CIRCLE_CAPACITY,
      })
      .returning();

    const res = await routes.rounds.GET();
    const { rounds } = (await res.json()) as { rounds: Array<{ id: string; startsAt: string; live?: boolean }> };
    const found = rounds.find((r) => r.id === row.id);
    assert.ok(found);
    assert.equal(found.live, true);
    assert.ok(
      Math.abs(Date.parse(found.startsAt) - started.getTime()) < 60_000,
      "the sitting shown is the one happening, not the one in seven days",
    );
  });

  test("a one-off that has finished drops off the list", async () => {
    const { speakingRounds } = await import("../../db/schema.ts");
    const [row] = await db
      .insert(speakingRounds)
      .values({
        title: "Einmalig und vorbei",
        format: "webinar",
        hostId: "alice",
        hostName: "Alice",
        startsAt: new Date(Date.now() - 10 * 86_400_000),
        durationMinutes: 60,
        cadence: "once",
        timeZone: "Europe/Zurich",
        meetingUrl: null,
        capacity: 60,
      })
      .returning();

    const res = await routes.rounds.GET();
    const { rounds } = (await res.json()) as { rounds: Array<{ id: string }> };
    assert.ok(!rounds.some((r) => r.id === row.id), "it happened; it is not upcoming");
  });

  test("deleting a topic leaves the round people are coming to", async () => {
    beCaller("alice", "Alice");
    const topic = await makeTopic("Wird gelöscht");
    const created = await makeRound({ title: "Bleibt", topicId: topic.id });
    assert.equal(created.status, 201);
    const { round } = (await created.json()) as { round: { id: string; topicId: string | null } };
    assert.equal(round.topicId, topic.id);

    const { speakingTopics } = await import("../../db/schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.delete(speakingTopics).where(eq(speakingTopics.id, topic.id));

    const still = await routes.round.POST(post("https://x/r", {}), params(round.id));
    assert.notEqual(still.status, 404, "the meeting survives its proposal");
  });

  async function countInterest(topicId: string): Promise<number> {
    const rows = await db.execute<{ n: number }>(
      sql`select count(*)::int as n from topic_interest where topic_id = ${topicId}`,
    );
    return Number(rows.rows[0].n);
  }

  async function countAttending(roundId: string): Promise<number> {
    const rows = await db.execute<{ n: number }>(
      sql`select count(*)::int as n from round_attendance where round_id = ${roundId}`,
    );
    return Number(rows.rows[0].n);
  }

  async function isCancelled(roundId: string): Promise<boolean> {
    const rows = await db.execute<{ cancelled_at: string | null }>(
      sql`select cancelled_at from speaking_rounds where id = ${roundId}`,
    );
    return rows.rows[0].cancelled_at !== null;
  }
});
