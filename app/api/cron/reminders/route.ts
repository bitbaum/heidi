import { dbConfigured } from "../../../../lib/db/index.ts";
import { sweepReminders } from "../../../../lib/mail/reminder-sweep.ts";
import { authorised } from "../channels/route.ts";

export const dynamic = "force-dynamic";

/**
 * POST — send the "questions are due" reminders to whoever's evening it is.
 *
 * Called hourly by the box's app-cron timer with the app's own `CRON_SECRET`
 * (loki `scripts/hetzner/install-app-crons.sh`), exactly as the channels sweep
 * is. Hourly because "their evening" is a different hour in every time zone;
 * the policy sends at most one reminder per person every other day, whatever
 * the cadence of this call. Nothing here calls a model.
 */
export async function POST(request: Request) {
  if (!authorised(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured()) return Response.json({ error: "No database" }, { status: 503 });
  return Response.json({ ok: true, ...(await sweepReminders()) });
}
