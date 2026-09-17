import { caller, optionalActor } from "../../../../lib/domain/speaking/session.ts";
import { checkRound, mayHost } from "../../../../lib/domain/speaking/rules.ts";
import { DEFAULT_TIME_ZONE } from "../../../../lib/domain/speaking/schedule.ts";
import { createRound, listUpcomingRounds, topicExists } from "../../../../lib/domain/speaking/store.ts";
import { callerKey, speakingWrite, tooMany } from "../../../../lib/domain/limits.ts";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** What is coming up, soonest first, with the recurrence already resolved. */
export async function GET() {
  const actorId = await optionalActor();
  return Response.json({ rounds: await listUpcomingRounds({ actorId, now: new Date() }) });
}

/**
 * Open a round.
 *
 * Anyone signed in may host, including on somebody else's topic — see
 * `mayHost`. Every field is checked by `checkRound` in one place so a new one
 * cannot be added to the form and quietly skipped here.
 */
export async function POST(request: Request) {
  const allowed = speakingWrite.check(callerKey(request, "speaking-round"));
  if (!allowed.allowed) return tooMany(allowed);

  const who = await caller();
  if (!who.ok) return Response.json({ error: who.error }, { status: who.status });
  if (!mayHost(who.actorId)) return Response.json({ error: "Sign in to open a round." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Could not read that request." }, { status: 400 });
  }

  const input = (body ?? {}) as Record<string, unknown>;
  const checked = checkRound(input, new Date(), DEFAULT_TIME_ZONE);
  if (!checked.ok) {
    const { field, problem } = checked.problem;
    return Response.json({ error: `Check the ${field}: ${String(problem).replace(/-/g, " ")}.` }, { status: 400 });
  }

  // A topic that does not exist is dropped rather than refused: the round is
  // the thing people are coming to, and losing it over a stale link on the
  // proposals page would be the wrong half to throw away.
  const rawTopic = typeof input.topicId === "string" && UUID.test(input.topicId) ? input.topicId : null;
  const topicId = rawTopic && (await topicExists(rawTopic)) ? rawTopic : null;

  const round = await createRound({
    draft: checked.draft,
    topicId,
    hostId: who.actorId,
    hostName: who.displayName,
  });
  return Response.json({ round }, { status: 201 });
}
