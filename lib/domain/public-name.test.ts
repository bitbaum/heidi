import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { publicName } from "./public-name.ts";

/**
 * The name other people see is never the email address. Sign-up asks for no
 * name, so `name || email` published the address of nearly every new account
 * on the speaking-topics board, which is readable signed out.
 */
const ACTOR = "Pk0zpZyxDP1QQImDAbfFiAfiUsjPquC3";

test("a chosen name is kept as written, trimmed", () => {
  assert.equal(publicName("  Anna  ", ACTOR), "Anna");
});

test("no name: a handle from the actor id, never anything from the email", () => {
  for (const missing of [undefined, null, "", "   "]) {
    assert.equal(publicName(missing, ACTOR), "#QUC3");
  }
});

test("a name that is an email address is not shown either", () => {
  assert.equal(publicName("maria.private@example.test", ACTOR), "#QUC3");
  // An @ in a real name is not an address.
  assert.equal(publicName("Anna @ Zürich", ACTOR), "Anna @ Zürich");
});

test("the migration writes the same handle publicName gives, and only over addresses", async () => {
  const db = new PGlite();
  await db.exec(`
    CREATE TABLE speaking_topics (proposed_by text, proposer_name text);
    CREATE TABLE speaking_rounds (host_id text, host_name text);
    CREATE TABLE round_attendance (actor_id text, display_name text);
    CREATE TABLE group_members (actor_id text, display_name text);
    INSERT INTO speaking_topics VALUES ('${ACTOR}', 'maria.private@example.test'), ('other-id-ab12', 'Anna');
    INSERT INTO speaking_rounds VALUES ('${ACTOR}', 'maria.private@example.test');
    INSERT INTO round_attendance VALUES ('${ACTOR}', 'maria.private@example.test');
    INSERT INTO group_members VALUES ('${ACTOR}', 'maria.private@example.test');
  `);
  const sql = readFileSync(new URL("../../drizzle/0011_scrub_email_names.sql", import.meta.url), "utf8");
  for (const run of [1, 2]) {
    for (const statement of sql.split("--> statement-breakpoint")) await db.exec(statement);
    const names = await db.query<{ name: string }>(`
      SELECT proposer_name AS name FROM speaking_topics
      UNION ALL SELECT host_name FROM speaking_rounds
      UNION ALL SELECT display_name FROM round_attendance
      UNION ALL SELECT display_name FROM group_members`);
    assert.deepEqual(
      names.rows.map((r) => r.name).sort(),
      [publicName(null, ACTOR), publicName(null, ACTOR), publicName(null, ACTOR), publicName(null, ACTOR), "Anna"].sort(),
      `run ${run}`,
    );
  }
  await db.close();
});
