import { dbConfigured } from "../../../lib/db/index.ts";
import { schemaProblems, type SchemaProblem } from "../../../lib/db/usable.ts";

export const dynamic = "force-dynamic";

/**
 * Liveness for the box watchdog and the deploy check: process up, which build
 * — and whether this build can actually use its own database.
 *
 * The schema half is here because `lib/db/usable.ts` has always SAID it runs
 * on every deploy via this endpoint, and it did not: nothing outside the test
 * suite called it. A check that exists, is correct, and is wired to nothing
 * catches exactly as many outages as no check at all, and the failure it
 * catches is invisible by construction — migrations run as `postgres`, so a
 * new table is owned by `postgres`, the app's own role is granted nothing on
 * it, and every query against it fails with "permission denied" while the
 * process, the connection and `select 1` all stay perfectly healthy. CI cannot
 * see it either, because in CI the test user owns everything.
 *
 * **It still answers 200.** The process is alive and a restart cannot fix a
 * missing GRANT, so reporting 503 would only teach the watchdog to restart a
 * healthy process forever while the actual problem sat in the database. The
 * answer goes in the body, where an operator and a deploy log can read it.
 *
 * Computed ONCE per process. A grant changes when a migration runs, a
 * migration runs during a deploy, and a deploy starts a new process — so once
 * per process is precisely the right frequency, and the watchdog's polling
 * costs one cached value rather than a catalogue query every few seconds.
 */

type Schema =
  | { state: "ok" }
  /** No DATABASE_URL: a valid way to run Heidi, with groups and chat history off. */
  | { state: "unconfigured" }
  | { state: "unreachable" }
  | { state: "unusable"; problems: SchemaProblem[] };

let cached: Promise<Schema> | null = null;

function checkSchema(): Promise<Schema> {
  cached ??= (async (): Promise<Schema> => {
    if (!dbConfigured()) return { state: "unconfigured" };
    try {
      const problems = await schemaProblems();
      return problems.length === 0 ? { state: "ok" } : { state: "unusable", problems };
    } catch {
      // Deliberately not memoised as a permanent verdict: a database that was
      // down while the process started should be re-checked, or one blip
      // brands this build broken until the next deploy.
      cached = null;
      return { state: "unreachable" };
    }
  })();
  return cached;
}

export async function GET() {
  const schema = await checkSchema();
  return Response.json({
    ok: true,
    commit: process.env.COMMIT_SHA ?? "unknown",
    schema,
  });
}
