import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Whether a caller may read the chat export.
 *
 * One shared secret, `CHAT_REVIEW_TOKEN`, the same value in every product's
 * runtime env on the box (Loki's `share-chat-review-token.yml` writes it). It
 * is compared in constant time — through a hash, so two secrets of different
 * length take the same time to reject as two of the same length — because the
 * thing behind it is a day of people's conversations, and a timing oracle on
 * a bearer token is the oldest way a secret is read one byte at a time.
 *
 * `unconfigured` is its own answer rather than a refusal: a deployment with no
 * token set has not been added to the loop, which is an operator fact (503),
 * not a caller's mistake (401).
 */
export type TokenCheck = "ok" | "unauthorised" | "unconfigured";

export function checkReviewToken(request: Request, expected: string | undefined): TokenCheck {
  const secret = expected?.trim();
  if (!secret) return "unconfigured";

  const presented = /^Bearer\s+(\S+)\s*$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!presented) return "unauthorised";

  const a = createHash("sha256").update(presented).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b) ? "ok" : "unauthorised";
}
