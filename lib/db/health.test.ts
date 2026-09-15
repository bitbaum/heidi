import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { dbConfigured } from "./index.ts";
import { GET } from "../../app/api/health/route.ts";

/**
 * The health endpoint has two jobs and used to do one.
 *
 * Liveness it always did. The schema check existed, was correct, was tested —
 * and was wired to nothing, so the one failure it was written to catch (a
 * table owned by `postgres` that the app's own role cannot touch) would still
 * have reached production silently, with `select 1` green the whole time.
 */
describe("health", { skip: dbConfigured() ? false : "DATABASE_URL unset" }, () => {
  test("reports liveness AND whether the schema is usable", async () => {
    const res = await GET();
    assert.equal(res.status, 200, "the process is alive; a GRANT is not fixed by restarting it");

    const body = (await res.json()) as { ok: boolean; commit: string; schema: { state: string } };
    assert.equal(body.ok, true);
    assert.ok(body.commit, "the deploy check reads this to confirm which build is serving");
    assert.equal(body.schema.state, "ok", "the test database should be fully usable by the test role");
  });

  test("answers 200 even when it has bad news, because the news is in the body", async () => {
    // A 503 here would teach the box watchdog to restart a healthy process in
    // a loop while the actual problem sat in the database, untouched.
    const res = await GET();
    assert.equal(res.status, 200);
  });
});
