import { db, dbConfigured } from "../../../../lib/db/index.ts";
import { clampLimit, collectTranscripts, sinceFrom } from "../../../../lib/domain/chat-review/export.ts";
import { chatScope } from "../../../../lib/domain/chat-review/scope.ts";
import { checkReviewToken } from "../../../../lib/domain/chat-review/token.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// this handler directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

/** The product key Loki files findings under (`src/config/chat-review.ts` there). */
export const PRODUCT = "heidi";

/**
 * The night's conversations, for the fleet's reviewer.
 *
 * `GET /api/chat/review-export?since=<ISO>&limit=50`, bearer `CHAT_REVIEW_TOKEN`.
 * Answers `{ product, scope, transcripts }` — the scope read from Heidi's own
 * prompt so the judge scores her against what she was told to be. Loki's
 * `review-chats` cron reads every product this way and files each gap it
 * finds into its feedback inbox, where the fixes are built; see HEIDI.md §10.
 */
export async function GET(request: Request) {
  const token = checkReviewToken(request, process.env.CHAT_REVIEW_TOKEN);
  if (token === "unconfigured") {
    return Response.json({ error: "CHAT_REVIEW_TOKEN is not set on this deployment." }, { status: 503 });
  }
  if (token === "unauthorised") return Response.json({ error: "Unauthorised." }, { status: 401 });
  if (!dbConfigured()) return Response.json({ error: "No database on this deployment." }, { status: 503 });

  const url = new URL(request.url);
  const transcripts = await collectTranscripts(db, {
    since: sinceFrom(url.searchParams.get("since")),
    limit: clampLimit(url.searchParams.get("limit")),
  });

  return Response.json(
    { product: PRODUCT, scope: chatScope(), transcripts },
    // Somebody's conversations: never cached by anything between here and Loki.
    { headers: { "cache-control": "no-store" } },
  );
}
