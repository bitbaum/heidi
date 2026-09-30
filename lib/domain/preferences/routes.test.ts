import { test, before, after, describe, mock } from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { db, dbConfigured } from "../../db/index.ts";
import { afterSignIn } from "./language.ts";

/**
 * `/api/account/language` against the real database, as any learner we like —
 * the session is a module mock, as in the progress and conversation route
 * tests.
 */
const HAS_DB = dbConfigured();
let actorId: string | undefined = "alice";

describe("the saved language", { skip: HAS_DB ? false : "DATABASE_URL unset" }, () => {
  let route: typeof import("../../../app/api/account/language/route.ts");
  const save = (locale: unknown) =>
    route.POST(
      new Request("https://heidi.test/api/account/language", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale }),
      }),
    );
  const land = (path: string) => route.GET(new Request(`https://heidi.test${afterSignIn(path)}`));

  before(async () => {
    mock.module(new URL("../../auth/index.ts", import.meta.url).href, {
      namedExports: { authEnabled: true, auth: async () => (actorId ? { actorId } : null) },
    });
    route = await import("../../../app/api/account/language/route.ts");
    await db.execute(sql`truncate table preferences`);
  });
  after(async () => {
    await db.execute(sql`truncate table preferences`);
  });

  test("a language picked on one device is where the next sign-in lands", async () => {
    actorId = "alice";
    assert.equal((await save("gsw")).status, 200);
    const res = await land("/de/portal");
    assert.equal(res.status, 303);
    // Relative: behind the proxy an absolute URL would name localhost.
    assert.equal(res.headers.get("location"), "/gsw/portal");
  });

  test("someone else's choice is not yours", async () => {
    actorId = "bob";
    assert.equal((await land("/de/portal")).headers.get("location"), "/de/portal");
  });

  test("signing in from a non-German page saves that page's language", async () => {
    actorId = "carla";
    assert.equal((await land("/fr/settings")).headers.get("location"), "/fr/settings");
    assert.equal((await land("/de/portal")).headers.get("location"), "/fr/portal");
  });

  test("signing in from German saves nothing — it is where everyone starts", async () => {
    actorId = "dora";
    await land("/de/portal");
    const rows = await db.execute(sql`select 1 from preferences where actor_id = 'dora'`);
    assert.equal(rows.rows.length, 0);
  });

  test("a signed-out click stores nothing and is not an error", async () => {
    actorId = undefined;
    assert.equal((await save("gsw")).status, 204);
    const rows = await db.execute(sql`select count(*)::int as n from preferences`);
    assert.equal((rows.rows[0] as { n: number }).n, 2);
  });

  test("only a site language is kept", async () => {
    actorId = "alice";
    assert.equal((await save("xx")).status, 400);
    assert.equal((await save(42)).status, 400);
  });

  test("the return path cannot leave the site", async () => {
    actorId = "bob";
    const res = await route.GET(new Request("https://heidi.test/api/account/language?next=//evil.example"));
    assert.equal(res.headers.get("location"), "/de");
  });
});
