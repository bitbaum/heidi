import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "../../db/schema.ts";

/**
 * The database as this module sees it: any Drizzle Postgres handle over
 * Heidi's schema. The app passes the real one (`lib/db`); the tests pass an
 * in-memory PGlite with the same migrations applied, which is what lets the
 * export's SQL be run rather than read.
 */
export type ReviewDb = PgDatabase<PgQueryResultHKT, typeof schema>;
