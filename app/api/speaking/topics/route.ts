import { caller, optionalActor } from "../../../../lib/domain/speaking/session.ts";
import { checkPitch, checkTitle } from "../../../../lib/domain/speaking/rules.ts";
import { createTopic, listTopics } from "../../../../lib/domain/speaking/store.ts";
import { callerKey, speakingWrite, tooMany } from "../../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// these handlers directly, and the alias only resolves inside Next's build.

export const dynamic = "force-dynamic";

/**
 * The proposals board.
 *
 * Readable signed out. A board behind a wall cannot do the one job a board
 * has, which is to show a stranger that there is something here worth turning
 * up for.
 */
export async function GET() {
  const actorId = await optionalActor();
  return Response.json({ topics: await listTopics(actorId) });
}

/** Propose one. You are counted as interested in your own idea. */
export async function POST(request: Request) {
  const allowed = speakingWrite.check(callerKey(request, "speaking-topic"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  const input = body as { title?: unknown; pitch?: unknown };
  const title = checkTitle(input?.title);
  if (!title.ok) return Response.json({ error: `That title is ${title.problem.replace("-", " ")}.` }, { status: 400 });

  const pitch = checkPitch(input?.pitch);
  if (!pitch.ok) return Response.json({ error: `That line is ${pitch.problem.replace("-", " ")}.` }, { status: 400 });

  const topic = await createTopic({
    title: title.text,
    pitch: pitch.text,
    actorId: who.actorId,
    displayName: who.displayName,
  });
  return Response.json({ topic }, { status: 201 });
}
