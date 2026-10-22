import { requireActor } from "../../../../../lib/domain/actor.ts";
import { actorKey, tooMany, videoTranscript } from "../../../../../lib/domain/limits.ts";
import { acceptedLanguages, allowAutomatic } from "../../../../../lib/channels/accepted.ts";
import { fetchCaptions } from "../../../../../lib/channels/remote.ts";
import { isFollowing, saveTranscript, videoById } from "../../../../../lib/channels/store.ts";
import { MAX_PASTE_CHARS, parsePasted, type Transcript } from "../../../../../lib/channels/transcript.ts";
import { isVideoId } from "../../../../../lib/channels/youtube.ts";
import { VARIETY } from "../../../../../lib/variety/active.ts";
import { FEATURE } from "../../../channels/route.ts";

export const dynamic = "force-dynamic";

/**
 * POST — get this video a transcript.
 *
 * Without a body: ask YouTube for the captions, in a language the pack
 * accepts, and keep what comes back — including the answer "refused", which
 * is what tells the screen to offer the paste path. With `{ pasted }`: the
 * learner copied the platform's own transcript panel; it is parsed into timed
 * lines and kept as `pasted`, so the page can say where it came from.
 *
 * Only a follower of the channel may write; what is written is shared with
 * every follower, because the transcript is the publisher's text and not
 * anybody's progress. A paste replaces the questions, which were about the
 * old text.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const allowed = videoTranscript.check(actorKey(who.actorId, "video-transcript"));
  if (!allowed.allowed) return tooMany(allowed);

  const { id } = await context.params;
  if (!isVideoId(id)) return Response.json({ error: "invalid" }, { status: 400 });
  const video = await videoById(id);
  if (!video) return Response.json({ error: "not-found" }, { status: 404 });
  if (!(await isFollowing(who.actorId, video.channelId))) return Response.json({ error: "not-following" }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as { pasted?: unknown };
  if (typeof body?.pasted === "string") {
    if (body.pasted.length > MAX_PASTE_CHARS) return Response.json({ error: "too-long" }, { status: 413 });
    const lines = parsePasted(body.pasted);
    if (!lines) return Response.json({ error: "not-a-transcript" }, { status: 422 });
    const transcript: Transcript = { lines, source: "pasted", lang: "" };
    await saveTranscript(id, transcript, "ready");
    return Response.json({ state: "ready", transcript });
  }

  // Already there: do not ask YouTube twice for one video.
  if (video.transcript) return Response.json({ state: "ready", transcript: video.transcript });

  const result = await fetchCaptions(id, fetch, { accepted: acceptedLanguages(VARIETY), allowAuto: allowAutomatic(VARIETY) });
  if (result.state === "ready") {
    await saveTranscript(id, result.transcript, "ready");
    return Response.json({ state: "ready", transcript: result.transcript });
  }
  await saveTranscript(id, null, result.state);
  return Response.json({ state: result.state });
}
