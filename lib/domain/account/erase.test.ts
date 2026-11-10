import { test } from "node:test";
import assert from "node:assert/strict";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import * as schema from "../../db/schema.ts";
import { ERASED } from "./erase.ts";

// Columns that mean "this row is about a person".
const PERSON = new Set(["actor_id", "author_id", "created_by", "proposed_by"]);
// Tables whose person column is the account service's own, or that hold a person only by design elsewhere.
const NOT_OURS = new Set(["users", "accounts", "sessions", "verifications", "passkeys", "two_factors"]);

test("every table that holds a person is erased, or says what happens to it", () => {
  const holders: string[] = [];
  for (const value of Object.values(schema)) {
    if (!(value instanceof PgTable)) continue;
    const { name, columns } = getTableConfig(value);
    if (NOT_OURS.has(name)) continue;
    if (columns.some((c) => PERSON.has(c.name))) holders.push(name);
  }
  assert.ok(holders.length >= 10, `found only ${holders.join(", ")}`);
  const missing = holders.filter((t) => !(t in ERASED));
  assert.deepEqual(missing, [], `a table with a person column is not handled by eraseActorData: ${missing.join(", ")}`);
  // …and nothing in ERASED names a table that no longer exists.
  const real = new Set(holders);
  const stale = Object.keys(ERASED).filter((t) => !real.has(t));
  assert.deepEqual(stale, [], `ERASED names tables with no person column: ${stale.join(", ")}`);
});
