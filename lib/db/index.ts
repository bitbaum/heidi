import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts";

/**
 * The database handle.
 *
 * Lazy singleton behind a Proxy, copied from vitareba because the reason is
 * the same: `next build` imports every module to analyse it, and the build
 * environment has no `DATABASE_URL`. Creating the Pool at module load would
 * therefore fail the build of a page that never touches the database.
 *
 * So nothing connects until someone actually runs a query, and a route that
 * needs the database fails at request time with a clear message rather than
 * taking the whole build down.
 */
type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

let instance: DbInstance | undefined;

export function getDb(): DbInstance {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    instance = drizzle(new Pool({ connectionString: url }), { schema });
  }
  return instance;
}

/** True when a database is configured at all. Lets a route answer honestly. */
export function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export const db = new Proxy({} as DbInstance, {
  get(_, prop: string | symbol) {
    return Reflect.get(getDb(), prop);
  },
});

export { schema };
