import { dbConfigured } from "../../../../lib/db/index.ts";
import { localeIn } from "../../../../lib/auth/paths.ts";
import { href } from "../../../../lib/i18n/routes.ts";
import { setReminders } from "../../../../lib/mail/store.ts";
import { actorOfToken } from "../../../../lib/mail/unsubscribe.ts";

export const dynamic = "force-dynamic";

/**
 * POST — stop the reminders for whoever the token names. No sign-in: the link
 * is in an email, on a phone that may not be signed in to anything.
 *
 * Two callers, one effect. The mail client's own "Unsubscribe" button POSTs
 * `List-Unsubscribe=One-Click` here (RFC 8058) and gets a bare 200; the page a
 * person reaches from the mail's footer submits a form here and is sent back
 * to that page, which then says it is done. Idempotent either way.
 *
 * GET only redirects to the page: a link scanner that opens every URL in a
 * mail must not be able to unsubscribe people by prefetching.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const actorId = actorOfToken(url.searchParams.get("t"));
  if (!actorId) return Response.json({ error: "invalid" }, { status: 400 });
  if (!dbConfigured()) return Response.json({ error: "No database" }, { status: 503 });
  await setReminders(actorId, false);

  const fromPage = (request.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded") && request.headers.has("origin");
  if (!fromPage) return Response.json({ ok: true });
  const locale = localeIn(url.searchParams.get("next") ?? "");
  return new Response(null, { status: 303, headers: { Location: `${href(locale, "unsubscribe")}?done=1` } });
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t") ?? "";
  return new Response(null, { status: 303, headers: { Location: `${href("de", "unsubscribe")}?t=${encodeURIComponent(token)}` } });
}
