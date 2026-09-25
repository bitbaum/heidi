import { createFeedbackHandler, type FeedbackAction } from "bip-kit";
import { feedbackStore } from "../../../lib/feedback/store.ts";
import { isFeedbackTarget } from "../../../lib/feedback/targets.ts";
import { callerKey, feedbackRead, feedbackWrite } from "../../../lib/domain/limits.ts";
import { dbConfigured } from "../../../lib/db/index.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// this handler directly, and the alias only resolves inside Next's build.

/**
 * Votes, comments and suggestions on the roadmap and the changelog.
 *
 * The rules — what counts as spam, one stance per voter, duplicate
 * suggestions, the honeypot — are bip-kit's, shared with every product that
 * renders a roadmap through it. This file supplies only Heidi's storage, what
 * may be voted on, and the rate limit.
 */
const handler = createFeedbackHandler({
  store: feedbackStore,
  isTarget: isFeedbackTarget,
  allow: (request: Request, action: FeedbackAction) =>
    action === "read"
      ? feedbackRead.check(callerKey(request, "feedback-read")).allowed
      : feedbackWrite.check(callerKey(request, "feedback-write")).allowed,
});

// A deployment without a database still renders the roadmap; the buttons
// simply have nothing to talk to, and say so with a status rather than a 500.
const unavailable = () => Response.json({ error: "unavailable" }, { status: 503 });

export async function GET(request: Request) {
  return dbConfigured() ? handler.GET(request) : unavailable();
}

export async function POST(request: Request) {
  return dbConfigured() ? handler.POST(request) : unavailable();
}
