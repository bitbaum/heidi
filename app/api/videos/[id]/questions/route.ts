import { complete, freeChain, usableChain } from "@bitbaum/ai-kit";
import { requireActor } from "../../../../../lib/domain/actor.ts";
import { actorKey, tooMany, videoQuestions } from "../../../../../lib/domain/limits.ts";
import { byokChain, readByok, redact } from "../../../../../lib/domain/model/byok.ts";
import { questionLanguage } from "../../../../../lib/channels/accepted.ts";
import { parseQuestions, questionsPrompt } from "../../../../../lib/channels/questions.ts";
import { isFollowing, saveQuestions, videoById } from "../../../../../lib/channels/store.ts";
import { isItemId } from "../../../../../lib/channels/rss.ts";
import { VARIETY } from "../../../../../lib/variety/active.ts";
import { llmHealth } from "../../../chat/route.ts";
import { FEATURE } from "../../../channels/route.ts";

export const dynamic = "force-dynamic";

/** Long enough to write five questions from nine thousand characters. */
const TIMEOUT_MS = 40_000;

/**
 * POST — the questions for this video, written once and kept.
 *
 * ON A LEARNER'S REQUEST, never in the sweep: this spends a model call from
 * the shared free pool, and the fleet's rule is that nothing in the
 * background does. The first follower to open the video pays the call;
 * everyone after reads the stored set. A brought key replaces the free
 * chain, as everywhere else.
 *
 * The model is asked twice at most. What it sends is read by
 * `parseQuestions`, which refuses a set whose answers are not in the
 * transcript; a second refusal is reported as "could not write questions"
 * rather than shown.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const who = await requireActor(FEATURE);
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  const { id } = await context.params;
  if (!isItemId(id)) return Response.json({ error: "invalid" }, { status: 400 });
  const video = await videoById(id);
  if (!video) return Response.json({ error: "not-found" }, { status: 404 });
  if (!(await isFollowing(who.actorId, video.channelId))) return Response.json({ error: "not-following" }, { status: 403 });
  if (!video.transcript) return Response.json({ error: "no-transcript" }, { status: 409 });
  if (video.questions) return Response.json({ questions: video.questions });

  const allowed = videoQuestions.check(actorKey(who.actorId, "video-questions"));
  if (!allowed.allowed) return tooMany(allowed);

  const body = (await request.json().catch(() => ({}))) as { byok?: unknown };
  const own = readByok(body?.byok);
  const byokLinks = own.ok ? byokChain(own.config) : null;
  const chain = byokLinks ? byokLinks.chain : usableChain(freeChain("HEIDI"), process.env);
  const env = byokLinks ? { ...process.env, ...byokLinks.env } : process.env;
  if (chain.length === 0) return Response.json({ error: "unconfigured" }, { status: 503 });

  const prompt = questionsPrompt({ title: video.title, lines: video.transcript.lines, askIn: questionLanguage(VARIETY) });
  const lineCount = video.transcript.lines.length;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { text, id: model } = await complete({
        chain,
        env,
        health: llmHealth,
        temperature: 0.3,
        maxTokens: 1500,
        timeoutMs: TIMEOUT_MS,
        signal: request.signal,
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
      });
      const set = parseQuestions(text, { lineCount, linesUsed: prompt.linesUsed, truncated: prompt.truncated, model });
      if (set) {
        await saveQuestions(id, set);
        return Response.json({ questions: set });
      }
      console.warn("[heidi/video-questions] refused the model's set for", id, "attempt", attempt + 1);
    } catch (error) {
      console.error("[heidi/video-questions]", redact(error instanceof Error ? error.message : String(error)));
      return Response.json({ error: "failed" }, { status: 502 });
    }
  }
  return Response.json({ error: "unusable" }, { status: 502 });
}
