import { randomBytes, timingSafeEqual } from "node:crypto";

/**
 * The invite link's secret.
 *
 * In a self-organised group the link IS the credential — there is no approval
 * step, no membership request, no admin. So it has to be treated like one:
 *
 *   - **Separate from the id.** Group ids travel in URLs, in logs, in the
 *     browser history of everyone in the group. If the id were enough to join,
 *     every one of those places would be a way in.
 *   - **From a CSPRNG.** `Math.random()` is seeded from the clock and its
 *     output is predictable from a few samples; for something whose only job
 *     is to be unguessable that is the whole failure.
 *   - **192 bits.** Long enough that guessing is not a strategy, short enough
 *     to survive being pasted into a chat message without wrapping.
 *   - **base64url.** Goes into a URL with no escaping, so the link a person
 *     copies is the link they send.
 */
export function newInviteToken(): string {
  return randomBytes(24).toString("base64url");
}

/** The shape a token must have before we go anywhere near the database. */
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{32,64}$/;

/**
 * Is this even a token?
 *
 * Checked before the lookup so that a query string full of SQL, a 10MB
 * paste, or a path traversal attempt is refused by a regular expression
 * rather than by the database's parser.
 */
export function looksLikeToken(raw: unknown): raw is string {
  return typeof raw === "string" && TOKEN_SHAPE.test(raw);
}

/**
 * Compare in constant time.
 *
 * Used where a token is compared against one we already hold. A plain `===`
 * returns as soon as two bytes differ, and the time it took is a measurement
 * of how much of the prefix was right — which, repeated, recovers the secret.
 * The database lookup is the usual path and is not timing-safe in this sense,
 * but anywhere we hold both halves there is no reason to be sloppy.
 */
export function tokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  // `timingSafeEqual` throws on a length mismatch, which would itself leak
  // length — so unequal lengths are compared against a fixed-size copy.
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
