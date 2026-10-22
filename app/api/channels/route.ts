import { requireActor } from "../../../lib/domain/actor.ts";
import { actorKey, channelWrite, tooMany } from "../../../lib/domain/limits.ts";
import { resolveChannel } from "../../../lib/channels/remote.ts";
import { sweepFor } from "../../../lib/channels/service.ts";
import { follow, followsFor, recentVideosFor } from "../../../lib/channels/store.ts";
import { LISTENING_SOURCES } from "../../../lib/listening/sources.ts";
import type { Spoken } from "../../../lib/channels/source.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

export const FEATURE = { name: "Channels", toDo: "to follow channels" };

/** How many channels one person may follow. Enough for anybody's YouTube. */
export const MAX_FOLLOWS = 30;

/**
 * GET — this learner's channels and the newest videos across them.
 *
 * Stale channels are read first, inline, with a short list and the same
 * sweep the hourly timer runs. So the page is right on a box where the timer
 * was never installed, and on one where it was, this is a no-op because
 * nothing is stale.
 */
export async function GET() {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  try {
    await sweepFor(who.actorId);
  } catch (error) {
    // A refresh that fails must not take the page with it: the list is still
    // what it was an hour ago, and the row says when it was last read.
    console.warn("[heidi/channels] refresh failed:", error instanceof Error ? error.message : String(error));
  }
  const [channels, videos] = await Promise.all([followsFor(who.actorId), recentVideosFor(who.actorId)]);
  return Response.json({ channels, videos });
}

/**
 * POST — follow a channel, from whatever was pasted.
 *
 * The feed is read before the follow is written, so a channel that cannot be
 * read is never followed, and the back catalogue arrives marked as already
 * dealt with: following rings for the NEXT video, not the last fifteen.
 */
export async function POST(request: Request) {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const allowed = channelWrite.check(actorKey(who.actorId, "channel-write"));
  if (!allowed.allowed) return tooMany(allowed);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
  }
  const input = typeof (body as { input?: unknown })?.input === "string" ? (body as { input: string }).input.trim().slice(0, 300) : "";
  if (!input) return Response.json({ error: "invalid", reason: "invalid" }, { status: 400 });
  // A row of the register, when the button was on one: it carries what is
  // spoken, which is the fact that decides whether Heidi may transcribe it.
  const register = typeof (body as { register?: unknown })?.register === "string" ? (body as { register: string }).register : null;

  const existing = await followsFor(who.actorId);
  if (existing.length >= MAX_FOLLOWS) return Response.json({ error: "too-many", reason: "too-many" }, { status: 409 });

  const resolved = await resolveChannel(input, fetch);
  if (!resolved.ok) {
    const status = resolved.reason === "invalid" || resolved.reason === "spotify" ? 400 : resolved.reason === "not-found" ? 404 : 502;
    // `reason` is a code the page maps to the reader's language; `error` is
    // the shape every other route answers with, for a caller that only reads that.
    return Response.json({ error: resolved.reason, reason: resolved.reason }, { status });
  }

  const { source, items } = resolved.feed;
  await follow(who.actorId, source, items, spokenFor(source.url, register));
  return Response.json({ channel: source, videos: items.length }, { status: 201 });
}

/** What the register says is spoken on this source, by the row pressed or by its address. */
export function spokenFor(url: string, register: string | null): Spoken | null {
  const same = (a: string, b: string) => a.replace(/\/+$/, "").toLowerCase() === b.replace(/\/+$/, "").toLowerCase();
  const row = LISTENING_SOURCES.find((s) => (register && s.id === register) || same(s.url, url));
  return row ? row.spoken : null;
}
