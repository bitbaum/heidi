import { test, before, after, describe, mock } from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { db, dbConfigured } from "../../db/index.ts";
import { EMPTY_MODEL } from "../practice/model.ts";

/**
 * `/api/progress` against the real database, as any learner we like — the
 * same arrangement as the conversation and group route tests (module mocks for
 * the caller; see there).
 */
const HAS_DB = dbConfigured();
let current: { ok: true; actorId: string; displayName: string } | { ok: false; status: number; error: string } = {
  ok: true,
  actorId: "alice",
  displayName: "alice",
};
const PHONE = "phone-aaaaaaaaaaaaaaaa";
const LAPTOP = "laptop-bbbbbbbbbbbbbbb";

const model = { ...EMPTY_MODEL, lines: { "shopping:0": { asked: 2, missed: 1 } } };

describe("progress sync routes", { skip: HAS_DB ? false : "DATABASE_URL unset" }, () => {
  let route: typeof import("../../../app/api/progress/route.ts");
  const req = (method: string, device: string | null, body?: unknown, query = "") =>
    new Request(`https://heidi.test/api/progress${query}`, {
      method,
      headers: { "content-type": "application/json", ...(device ? { "x-heidi-device": device } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  before(async () => {
    mock.module(new URL("../actor.ts", import.meta.url).href, {
      namedExports: { requireActor: async () => current },
    });
    route = await import("../../../app/api/progress/route.ts");
    await db.execute(sql`truncate table progress_devices`);
  });
  after(async () => {
    await db.execute(sql`truncate table progress_devices`);
  });

  test("a device sees the others' records, never its own", async () => {
    current = { ok: true, actorId: "alice", displayName: "alice" };
    assert.equal((await route.PUT(req("PUT", PHONE, { values: { model } }))).status, 200);
    const fromLaptop = await (await route.GET(req("GET", LAPTOP))).json();
    assert.equal(fromLaptop.devices.length, 1);
    assert.equal(fromLaptop.devices[0].device, PHONE);
    assert.deepEqual(fromLaptop.devices[0].values.model.lines, model.lines);
    const fromPhone = await (await route.GET(req("GET", PHONE))).json();
    assert.deepEqual(fromPhone.devices, []);
  });

  test("another learner sees nothing of alice's", async () => {
    current = { ok: true, actorId: "bob", displayName: "bob" };
    const res = await (await route.GET(req("GET", LAPTOP))).json();
    assert.deepEqual(res.devices, []);
  });

  test("an unchanged value keeps its time, so an edit elsewhere can be told from a re-push", async () => {
    current = { ok: true, actorId: "alice", displayName: "alice" };
    const saved = { version: 1, words: [] };
    await route.PUT(req("PUT", PHONE, { values: { saved } }));
    const first = (await (await route.GET(req("GET", LAPTOP))).json()).devices[0].updatedAt.saved;
    await route.PUT(req("PUT", PHONE, { values: { saved } }));
    const second = (await (await route.GET(req("GET", LAPTOP))).json()).devices[0].updatedAt.saved;
    assert.equal(second, first);
  });

  test("garbage is refused, not stored", async () => {
    current = { ok: true, actorId: "alice", displayName: "alice" };
    assert.equal((await route.PUT(req("PUT", PHONE, { values: { history: "nope" } }))).status, 400);
    assert.equal((await route.PUT(req("PUT", null, { values: { model } }))).status, 400);
    assert.equal((await route.PUT(req("PUT", "short", { values: { model } }))).status, 400);
    const huge = { ...EMPTY_MODEL, words: Object.fromEntries(Array.from({ length: 20000 }, (_, i) => [`w${i}-padding`, { asked: 1, missed: 0 }])) };
    assert.equal((await route.PUT(req("PUT", PHONE, { values: { model: huge } }))).status, 413);
  });

  test("off deletes this device's copy; delete-all deletes every device's", async () => {
    current = { ok: true, actorId: "alice", displayName: "alice" };
    await route.PUT(req("PUT", LAPTOP, { values: { model } }));
    await route.DELETE(req("DELETE", null, undefined, `?device=${PHONE}`));
    let seen = (await (await route.GET(req("GET", "tablet-ccccccccccccccc"))).json()).devices;
    assert.deepEqual(seen.map((d: { device: string }) => d.device), [LAPTOP]);
    await route.DELETE(req("DELETE", null));
    seen = (await (await route.GET(req("GET", "tablet-ccccccccccccccc"))).json()).devices;
    assert.deepEqual(seen, []);
  });

  test("signed out is refused", async () => {
    current = { ok: false, status: 401, error: "sign in" };
    assert.equal((await route.GET(req("GET", PHONE))).status, 401);
    assert.equal((await route.PUT(req("PUT", PHONE, { values: { model } }))).status, 401);
  });
});

describe("certificate route", { skip: HAS_DB ? false : "DATABASE_URL unset" }, () => {
  let progress: typeof import("../../../app/api/progress/route.ts");
  let certs: typeof import("../../../app/api/certificates/route.ts");
  let scene: string;
  let lines: number[];

  before(async () => {
    const { askableLines } = await import("../practice/situation-strength.ts");
    const { PACK_ITEMS } = await import("../practice/published.ts");
    [scene, lines] = [...askableLines(PACK_ITEMS)].map(([s, l]) => [s, [...l]] as [string, number[]])[0];
    progress = await import("../../../app/api/progress/route.ts");
    certs = await import("../../../app/api/certificates/route.ts");
    await db.execute(sql`truncate table progress_devices, certificates`);
  });
  after(async () => {
    await db.execute(sql`truncate table progress_devices, certificates`);
  });

  const put = (device: string, m: unknown) =>
    progress.PUT(
      new Request("https://heidi.test/api/progress", {
        method: "PUT",
        headers: { "content-type": "application/json", "x-heidi-device": device },
        body: JSON.stringify({ values: { model: m } }),
      }),
    );
  const ask = () =>
    certs.POST(
      new Request("https://heidi.test/api/certificates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scene }),
      }),
    );
  const modelOf = (ls: number[], asked: number) => ({
    ...EMPTY_MODEL,
    lines: Object.fromEntries(ls.map((l) => [`${scene}:${l}`, { asked, missed: 0 }])),
  });

  test("with sync off there is nothing to certify from", async () => {
    current = { ok: true, actorId: "carol", displayName: "carol" };
    assert.equal((await ask()).status, 412);
  });

  test("half the lines is progress, not a certificate", async () => {
    current = { ok: true, actorId: "carol", displayName: "carol" };
    await put(PHONE, modelOf(lines.slice(0, Math.ceil(lines.length / 2)), 3));
    const res = await ask();
    assert.equal(res.status, 409);
    assert.equal((await res.json()).askable, lines.length);
  });

  test("two devices together reach it; asking twice is one certificate", async () => {
    current = { ok: true, actorId: "carol", displayName: "carol" };
    await put(LAPTOP, modelOf(lines.slice(Math.ceil(lines.length / 2)), 3));
    const first = await ask();
    assert.equal(first.status, 201);
    const { id } = await first.json();
    assert.equal((await (await ask()).json()).id, id);
  });

  test("an unknown situation is refused", async () => {
    current = { ok: true, actorId: "carol", displayName: "carol" };
    const res = await certs.POST(
      new Request("https://heidi.test/api/certificates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scene: "nope" }),
      }),
    );
    assert.equal(res.status, 404);
  });
});
