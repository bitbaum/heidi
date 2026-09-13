import type { Config } from "drizzle-kit";

/**
 * Matches the layout `loki/scripts/hetzner/apply-schema.sh` probes for —
 * `<app_dir>/drizzle`, and heidi's `app_dir` is the repo root. Putting the
 * migrations anywhere else means the deploy's schema step finds nothing and
 * says "no drizzle dir — skipping", which looks benign in the log and ships
 * code against a database that never got its tables.
 */
export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
