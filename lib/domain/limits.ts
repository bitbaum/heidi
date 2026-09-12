import { clientIp, slidingWindow, toHeaders, type LimitResult } from "limitkit";

/**
 * How much of Heidi one stranger may use.
 *
 * `limitkit` deliberately ships no limit values — how many a route allows is
 * app semantics. So the numbers live here, with the reason each one is what it
 * is, because a limit with no stated reason gets "temporarily" raised.
 *
 * Every public endpoint had NO limit until this file existed, which was a real
 * hole rather than an oversight of style: two of them spend money on every
 * call, and both are reachable by anyone with curl.
 */

/**
 * The assistant. Each call spends from a shared free-tier budget that is the
 * same pool every other visitor draws on — so the ceiling protects other
 * learners, not the server.
 *
 * Generous on purpose: a real conversation is a dozen turns, and someone
 * working through a long WhatsApp thread should never meet this.
 */
export const chat = slidingWindow({ limit: 30, windowMs: 5 * 60_000 });

/**
 * The connection probe. Tighter, because it makes a real outbound call per
 * request and takes an arbitrary key — which makes it the one endpoint here
 * that could be pointed at a vendor to test stolen credentials in bulk.
 * Nobody legitimately needs more than a few attempts to paste a key correctly.
 */
export const modelCheck = slidingWindow({ limit: 6, windowMs: 5 * 60_000 });

/**
 * Dictation that falls back to the server.
 *
 * The browser's own recogniser is free and local; this path is neither. It
 * uploads audio and pays a vendor per second of it, so it needs a tighter
 * ceiling than the chat — and unlike the chat, one abusive caller here costs
 * bandwidth as well as budget. Enough for a long conversation dictated a
 * sentence at a time; nowhere near enough to transcribe a podcast.
 */
export const dictation = slidingWindow({ limit: 20, windowMs: 5 * 60_000 });

/**
 * The dialect checker. Pure, local, costs nothing but CPU — so this is only
 * about not letting one client monopolise the box.
 */
export const dialectCheck = slidingWindow({ limit: 120, windowMs: 60_000 });

/**
 * Identify the caller.
 *
 * Behind Caddy the socket address is the proxy's, so `clientIp()` reads the
 * forwarded headers — which is also why this is a rate limit and not a
 * security boundary: a header can be forged. It exists to stop accidental and
 * casual abuse from spending a budget shared with everybody else.
 */
export function callerKey(request: Request, prefix: string): string {
  return `${prefix}:${clientIp(request.headers) ?? "unknown"}`;
}

/** A 429 that says how long to wait, in the shape every client already reads. */
export function tooMany(result: LimitResult): Response {
  return Response.json(
    { error: "Too many requests. Give it a moment.", operator: false },
    { status: 429, headers: toHeaders(result) },
  );
}
