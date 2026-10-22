import { requireActor } from "../../../../../lib/domain/actor.ts";
import { actorKey, episodeTranscribe, tooMany, videoTranscript } from "../../../../../lib/domain/limits.ts";
import { acceptedLanguages, allowAutomatic, questionLanguageTag } from "../../../../../lib/channels/accepted.ts";
import { fetchCaptions, fetchPublisherTranscript, transcribeOpening } from "../../../../../lib/channels/remote.ts";
import { isItemId } from "../../../../../lib/channels/rss.ts";
import { isFollowing, saveTranscript, videoById, type VideoDetail } from "../../../../../lib/channels/store.ts";
import { MAX_PASTE_CHARS, parsePasted, type Transcript } from "../../../../../lib/channels/transcript.ts";
import { VARIETY } from "../../../../../lib/variety/active.ts";
import { FEATURE } from "../../../channels/route.ts";

export const dynamic = "force-dynamic";

/**
 * POST — get this item a transcript.
 *
 * A YouTube video: ask YouTube for the captions, in a language the pack
 * accepts, and keep what comes back — including the answer "refused", which
 * is what tells the screen to offer the paste path. With `{ pasted }`: the
 * learner copied the platform's own transcript panel; it is parsed into
 * timed lines and kept as `pasted`.
 *
 * A podcast episode: the publisher's transcript if the feed linked one;
 * otherwise Heidi's own transcription of the opening minutes, where the
 * pack trusts a recogniser for the bridge AND the register does not say the
 * source is dialect — a recogniser translates dialect away, and a text that
 * is not what was said is not a transcript (HEIDI.md §8). Labelled as
 * automatic, with how far it reaches.
 *
 * Only a follower may write; what is written is shared with every follower,
 * because the transcript is the publisher's text and not anybody's progress.
 * A paste replaces the questions, which were about the old text.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  const allowed = videoTranscript.check(actorKey(who.actorId, "video-transcript"));
  if (!allowed.allowed) return tooMany(allowed);

  const { id } = await context.params;
  if (!isItemId(id)) return Response.json({ error: "invalid" }, { status: 400 });
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

  // Already there: do not ask the platform twice for one item.
  if (video.transcript) return Response.json({ state: "ready", transcript: video.transcript });

  if (video.kind === "podcast") return episode(video, who.actorId, request.signal);

  const result = await fetchCaptions(id, fetch, { accepted: acceptedLanguages(VARIETY), allowAuto: allowAutomatic(VARIETY) });
  if (result.state === "ready") {
    await saveTranscript(id, result.transcript, "ready");
    return Response.json({ state: "ready", transcript: result.transcript });
  }
  await saveTranscript(id, null, result.state);
  return Response.json({ state: result.state });
}

async function episode(video: VideoDetail, actorId: string, signal: AbortSignal) {
  if (video.transcriptLink) {
    const transcript = await fetchPublisherTranscript(video.transcriptLink, fetch);
    if (transcript) {
      await saveTranscript(video.id, transcript, "ready");
      return Response.json({ state: "ready", transcript });
    }
  }

  // The register's word, when it has one, decides: a dialect source gets no
  // machine transcript, however good the recogniser is at the bridge.
  if (video.channelSpoken === "dialect" || !allowAutomatic(VARIETY) || !video.mediaUrl) {
    await saveTranscript(video.id, null, "none");
    return Response.json({ state: "none", reason: video.channelSpoken === "dialect" ? "dialect" : "no-recogniser" });
  }

  const allowed = episodeTranscribe.check(actorKey(actorId, "episode-transcribe"));
  if (!allowed.allowed) return tooMany(allowed);

  try {
    const result = await transcribeOpening(video.mediaUrl, fetch, { language: questionLanguageTag(VARIETY), signal });
    if (result.state === "ready") {
      await saveTranscript(video.id, result.transcript, "ready");
      return Response.json({ state: "ready", transcript: result.transcript });
    }
    if (result.state === "unconfigured") return Response.json({ state: "none", reason: "no-recogniser" });
    await saveTranscript(video.id, null, "none");
    return Response.json({ state: "none" });
  } catch (error) {
    // Not written down: a vendor that was down for a minute should not brand
    // the episode as having no transcript until somebody clears it.
    console.error("[heidi/episode-transcript]", error instanceof Error ? error.message : String(error));
    return Response.json({ state: "none", reason: "failed" });
  }
}
