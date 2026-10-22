import { dbConfigured } from "../../../../lib/db/index.ts";
import { sweepAll } from "../../../../lib/channels/service.ts";

export const dynamic = "force-dynamic";

/**
 * POST — read every followed channel's feed and wake the people who asked.
 *
 * Called hourly by the box's app-cron timer (loki
 * `scripts/hetzner/install-app-crons.sh`, which sends the app's own
 * `CRON_SECRET` as a bearer token). Without that secret in the environment
 * the route refuses everything, and the channels page refreshes a person's
 * own channels inline instead — slower to notice a video, never wrong.
 *
 * Nothing here calls a model. See `lib/channels/sweep.ts`.
 */
export function authorised(request: Request, secret: string | undefined = process.env.CRON_SECRET): boolean {
  const expected = (secret ?? "").trim();
  if (!expected) return false;
  const given = request.headers.get("authorization") ?? "";
  return given === `Bearer ${expected}`;
}

export async function POST(request: Request) {
  if (!authorised(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured()) return Response.json({ error: "No database" }, { status: 503 });
  const report = await sweepAll();
  return Response.json({ ok: true, ...report });
}
