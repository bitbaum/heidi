import { sql } from "drizzle-orm";
import { db } from "./index.ts";

/**
 * CAN THIS APPLICATION ACTUALLY USE ITS OWN DATABASE?
 *
 * `select 1` answers "is the database reachable", which is a different
 * question and has reported health on a broken app twice in this fleet.
 *
 * The failure: migrations are applied to the box by the `postgres` superuser,
 * so a table a migration creates is OWNED by `postgres`. The application
 * connects as its own role, which is granted nothing on a table it does not
 * own. The table exists, the connection works, every query against it fails
 * with "permission denied", and CI cannot see it — CI has its own database
 * where the test user owns everything.
 *
 * heidi's provisioning sets `ALTER DEFAULT PRIVILEGES FOR ROLE postgres` so
 * that grant happens automatically for tables created in future. This is the
 * belt to that braces: it asserts the property directly, against the real
 * database.
 *
 * `app/api/health` calls it once per process and reports the answer in its
 * body. That wiring was missing for a while — this docblock claimed it and
 * only the test suite actually ran it, which catches exactly as many outages
 * as no check at all.
 *
 * One catalogue query. It reads no group's messages.
 */

/** The verbs the application performs. Missing any one breaks a real page. */
const REQUIRED = ["SELECT", "INSERT", "UPDATE", "DELETE"] as const;

/** Every table the app owns. Kept here so the check cannot silently narrow. */
export const APP_TABLES = [
  "study_groups",
  "group_members",
  "group_messages",
  "conversations",
  "conversation_messages",
] as const;

export type SchemaProblem = { table: string; problem: string };

/**
 * Every table the application cannot fully use, with the reason.
 * Empty means the schema is usable.
 *
 * Throws only if the database is unreachable — the caller has a distinct
 * answer for that and should not have it disguised as a permission problem.
 */
export async function schemaProblems(): Promise<SchemaProblem[]> {
  // `current_user` rather than a hardcoded role name: the check must follow
  // whoever the app actually connected as, or it verifies the wrong grant.
  const rows = await db.execute<{ table_name: string; granted: string | null }>(sql`
    SELECT t.table_name,
           string_agg(DISTINCT g.privilege_type, ',') AS granted
      FROM unnest(${sql.raw(`ARRAY[${APP_TABLES.map((t) => `'${t}'`).join(",")}]`)}::text[]) AS t(table_name)
      LEFT JOIN information_schema.role_table_grants g
             ON g.table_name = t.table_name
            AND g.table_schema = 'public'
            AND g.grantee = current_user
     GROUP BY t.table_name
  `);

  const problems: SchemaProblem[] = [];
  for (const row of rows.rows) {
    const granted = (row.granted ?? "").split(",").filter(Boolean);
    if (granted.length === 0) {
      // Either the table is missing (migration never ran) or the role holds
      // nothing on it. Both are fatal and the operator needs to know which.
      problems.push({ table: row.table_name, problem: "no privileges, or the table does not exist" });
      continue;
    }
    const missing = REQUIRED.filter((p) => !granted.includes(p));
    if (missing.length > 0) {
      problems.push({ table: row.table_name, problem: `missing ${missing.join(", ")}` });
    }
  }
  return problems;
}
