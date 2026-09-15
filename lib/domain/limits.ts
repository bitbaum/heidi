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
 * Making and joining study groups.
 *
 * Tight, because both write rows nobody asked for: a script could otherwise
 * fill the table with groups, or walk invite tokens looking for one that
 * resolves. Guessing a 192-bit token is not a strategy anyway, but a ceiling
 * turns "not a strategy" into "not worth attempting".
 *
 * Nowhere near what a person does — you make a study group about once.
 */
export const groupWrite = slidingWindow({ limit: 20, windowMs: 10 * 60_000 });

/**
 * Posting into a group.
 *
 * Looser than making one and tighter than the solo chat: every message may
 * wake Heidi, which spends from the same shared budget, and a group has
 * several people drawing on it at once.
 */
export const groupMessage = slidingWindow({ limit: 40, windowMs: 5 * 60_000 });

/**
 * Private conversations: creating, renaming, deleting.
 *
 * Keyed by ACTOR rather than by IP where the caller is signed in — an office
 * or a university shares one address, and rate-limiting a signed-in person by
 * their neighbours' traffic is a limit on the wrong thing.
 */
export const conversationWrite = slidingWindow({ limit: 40, windowMs: 10 * 60_000 });

/**
 * Posting into a private conversation.
 *
 * The same ceiling as the solo chat, because it is the same act — the only
 * difference is that the server now remembers it.
 */
export const conversationMessage = slidingWindow({ limit: 30, windowMs: 5 * 60_000 });

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
/**
 * Identify a SIGNED-IN caller by who they are.
 *
 * `clientIp` is the right key for an anonymous route and the wrong one here:
 * everyone behind one office NAT shares an address, so an IP limit on a
 * signed-in feature rations a person by their colleagues' traffic.
 */
export function actorKey(actorId: string, prefix: string): string {
  return `${prefix}:actor:${actorId}`;
}

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
