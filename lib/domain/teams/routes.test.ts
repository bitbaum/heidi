import { test, before, after, describe, mock } from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { db, dbConfigured } from "../../db/index.ts";
import { progressDevices } from "../../db/schema.ts";
import { EMPTY_MODEL, lineKey } from "../practice/model.ts";
import { askableLines } from "../practice/situation-strength.ts";
import { PACK_ITEMS } from "../practice/published.ts";
import { DOMAINS } from "../../situations/display.ts";

/**
 * Teams against the real database, as whichever member we like — the group
 * route tests' arrangement (see there). What is under test is mostly WHO
 * SEES WHAT: nothing by default, standings only by choice, organiser only.
 */
const HAS_DB = dbConfigured();
let current: { ok: true; actorId: string; displayName: string } | { ok: false; status: number; error: string } = {
  ok: true,
  actorId: "lea",
  displayName: "Lea",
};
const be = (actorId: string, displayName = actorId) => (current = { ok: true, actorId, displayName });

describe("team routes", { skip: HAS_DB ? false : "DATABASE_URL unset" }, () => {
  let r: {
    create: typeof import("../../../app/api/groups/route.ts");
    join: typeof import("../../../app/api/groups/join/route.ts");
    team: typeof import("../../../app/api/groups/[id]/team/route.ts");
    share: typeof import("../../../app/api/groups/[id]/share/route.ts");
  };
  const care = DOMAINS.find((d) => d.id === "care") ?? DOMAINS[0];
  const json = (method: string, body: unknown) =>
    new Request("https://x", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const at = (id: string) => ({ params: Promise.resolve({ id }) });

  before(async () => {
    mock.module(new URL("../groups/session.ts", import.meta.url).href, {
      namedExports: { caller: async () => current },
    });
    r = {
      create: await import("../../../app/api/groups/route.ts"),
      join: await import("../../../app/api/groups/join/route.ts"),
      team: await import("../../../app/api/groups/[id]/team/route.ts"),
      share: await import("../../../app/api/groups/[id]/share/route.ts"),
    };
    await db.execute(sql`truncate table study_groups, progress_devices, certificates cascade`);
  });
  after(async () => {
    await db.execute(sql`truncate table study_groups, progress_devices, certificates cascade`);
    mock.reset();
  });

  async function team() {
    be("lea", "Lea");
    const made = await r.create.POST(json("POST", { name: "Nachtschicht" }));
    const { group } = (await made.json()) as { group: { id: string; inviteToken: string } };
    assert.equal((await r.team.PUT(json("PUT", { focus: care.id }), at(group.id))).status, 200);
    be("tom", "Tom");
    await r.join.POST(json("POST", { token: group.inviteToken }));
    return group;
  }

  test("by default the organiser sees a name and nothing else", async () => {
    const g = await team();
    be("lea", "Lea");
    const body = await (await r.team.GET(new Request("https://x"), at(g.id))).json();
    assert.equal(body.focus, care.id);
    assert.deepEqual(body.members, [{ actorId: "tom", displayName: "Tom", state: "private" }]);
  });

  test("sharing without sync is 'cannot see'; with sync, standings — and only standings", async () => {
    const g = await team();
    be("tom", "Tom");
    assert.equal((await r.share.PUT(json("PUT", { share: true }), at(g.id))).status, 200);
    be("lea", "Lea");
    let body = await (await r.team.GET(new Request("https://x"), at(g.id))).json();
    assert.equal(body.members[0].state, "no-sync");

    const scene = care.scenes[0].id;
    const lines = [...(askableLines(PACK_ITEMS).get(scene) ?? [])];
    const model = { ...EMPTY_MODEL, lines: Object.fromEntries(lines.map((l) => [lineKey(scene, l), { asked: 3, missed: 0 }])) };
    await db.insert(progressDevices).values({ actorId: "tom", deviceId: "phone-aaaaaaaaaaaaaaaa", key: "model", value: model });

    body = await (await r.team.GET(new Request("https://x"), at(g.id))).json();
    const row = body.members[0];
    assert.equal(row.state, "shared");
    assert.equal(row.scenes.find((s: { scene: string }) => s.scene === scene).standing, "sure");
    assert.ok(!JSON.stringify(body).includes(`${scene}:`), "no line keys reach the organiser");
  });

  test("only the organiser sees the overview or sets the focus", async () => {
    const g = await team();
    be("tom", "Tom");
    assert.equal((await r.team.GET(new Request("https://x"), at(g.id))).status, 404);
    assert.equal((await r.team.PUT(json("PUT", { focus: null }), at(g.id))).status, 404);
  });

  test("a stranger cannot switch sharing, and nobody can for someone else", async () => {
    const g = await team();
    be("mallory");
    assert.equal((await r.share.PUT(json("PUT", { share: true }), at(g.id))).status, 404);
    be("tom", "Tom");
    assert.equal((await r.share.PUT(json("PUT", { share: "yes" }), at(g.id))).status, 400);
  });

  test("an unknown focus is refused", async () => {
    const g = await team();
    be("lea", "Lea");
    assert.equal((await r.team.PUT(json("PUT", { focus: "nonsense" }), at(g.id))).status, 400);
  });
});
