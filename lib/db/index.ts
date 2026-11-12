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

/**
 * ONE POOL PER SERVER PROCESS, NOT ONE PER BUNDLE.
 *
 * Routes are built separately, and each bundle that imports this module gets
 * its own copy of it (`lib/auth/sender.ts` met the same thing). The handle
 * used to live in a module variable, so every such copy opened its own pool
 * of up to ten connections against a Postgres the box shares between
 * products. A deploy of this site was refused at its schema step with «too
 * many clients already»; this is the part of that sum this repo controls.
 *
 * On `globalThis`, under a registered symbol, every copy finds the same pool.
 */
const SLOT = Symbol.for("heidi.db");
const shared = globalThis as { [SLOT]?: DbInstance };

/** The most connections this process holds. pg's own default, now said once. */
const POOL_MAX = 10;

export function getDb(): DbInstance {
  if (!shared[SLOT]) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    shared[SLOT] = drizzle(new Pool({ connectionString: url, max: POOL_MAX }), { schema });
  }
  return shared[SLOT];
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
