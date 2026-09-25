import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { db, dbConfigured } from "../db/index.ts";
import { feedbackStore as store } from "./store.ts";

/**
 * bip-kit's store contract, against the real Postgres — the same database
 * rules its `memoryStore` tests describe, because a mocked `db` would only
 * prove the mock agrees with itself. Runs where the group store tests run
 * (see `lib/domain/groups/store.test.ts` for the local recipe); skips only
 * where there is no database at all.
 */
const HAS_DB = dbConfigured();
const A = "voter-aaaaaaaaaaaaaaaa";
const B = "voter-bbbbbbbbbbbbbbbb";
const wipe = () =>
  db.execute(sql`truncate table feedback_stances, feedback_comments, feedback_support, feedback_suggestions cascade`);

describe("feedback store", { skip: HAS_DB ? false : "DATABASE_URL unset" }, () => {
  before(wipe);
  after(wipe);

  test("one stance per voter: a second replaces the first, null withdraws", async () => {
    await store.setStance("roadmap:teams", A, "needed");
    await store.setStance("roadmap:teams", B, "needed");
    await store.setStance("roadmap:teams", A, "not-needed");
    assert.deepEqual((await store.tallies(["roadmap:teams"]))["roadmap:teams"], { needed: 1, notNeeded: 1, comments: 0 });
    await store.setStance("roadmap:teams", A, null);
    assert.deepEqual(await store.stances(["roadmap:teams"], A), {});
    assert.deepEqual(await store.stances(["roadmap:teams"], B), { "roadmap:teams": "needed" });
  });

  test("tallies answer for every id asked, including ones nobody voted on", async () => {
    const t = await store.tallies(["roadmap:pro"]);
    assert.deepEqual(t, { "roadmap:pro": { needed: 0, notNeeded: 0, comments: 0 } });
  });

  test("comments come back oldest first and are counted", async () => {
    await store.addComment("changelog:2026-09-25:0", A, "Erste");
    await store.addComment("changelog:2026-09-25:0", B, "Zweite");
    const list = await store.comments("changelog:2026-09-25:0", 10);
    assert.deepEqual(list.map((c) => c.body), ["Erste", "Zweite"]);
    assert.equal((await store.tallies(["changelog:2026-09-25:0"]))["changelog:2026-09-25:0"].comments, 2);
  });

  test("a suggestion counts its author; support is once per voter; unknown ids are refused", async () => {
    const s = await store.addSuggestion(A, "Mehr Berndeutsch");
    assert.equal(s.support, 1);
    assert.equal(await store.support(s.id, B), true);
    assert.equal(await store.support(s.id, B), true);
    assert.equal(await store.support(s.id, A), true);
    const other = await store.addSuggestion(B, "PDF-Export");
    const list = await store.suggestions(10);
    assert.deepEqual(
      list.map((x) => [x.body, x.support]),
      [
        ["Mehr Berndeutsch", 2],
        ["PDF-Export", 1],
      ],
    );
    assert.ok(list.some((x) => x.id === other.id));
    assert.equal(await store.support("not-a-uuid", A), false);
    assert.equal(await store.support("00000000-0000-0000-0000-000000000000", A), false);
  });
});
