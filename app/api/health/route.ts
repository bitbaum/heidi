export const dynamic = "force-dynamic";

/** Liveness for the box watchdog and the deploy check: process up, which build. */
export function GET() {
  return Response.json({ ok: true, commit: process.env.COMMIT_SHA ?? "unknown" });
}
