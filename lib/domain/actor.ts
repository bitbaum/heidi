import { auth, authEnabled } from "../auth/index.ts";
import { dbConfigured } from "../db/index.ts";

/**
 * Who is asking, for any route that needs an account.
 *
 * Lifted out of `groups/session.ts` when private conversations needed the same
 * three checks in the same order. The feature is named by the caller so the
 * 503 can say which thing is unconfigured — "study groups are not set up here"
 * and "the chat is not set up here" send an operator to different places.
 *
 * The two preconditions stay separate because they fail differently: a
 * deployment without OrangeCat configured is an operator problem, and a
 * visitor who has not signed in is a visitor problem. Collapsing them into one
 * 401 once told a visitor to sign in on an install where signing in was
 * impossible.
 */

export type Caller =
  | { ok: true; actorId: string; displayName: string }
  | { ok: false; status: 401 | 503; error: string };

export async function requireActor(feature: {
  /** For the operator-facing 503, e.g. "Study groups". */
  name: string;
  /** For the visitor-facing 401, e.g. "to use study groups". */
  toDo: string;
}): Promise<Caller> {
  if (!dbConfigured()) {
    return { ok: false, status: 503, error: `${feature.name} are not configured on this deployment.` };
  }
  if (!authEnabled) {
    return { ok: false, status: 503, error: "Signing in is not configured on this deployment." };
  }

  const session = await auth();
  const actorId = session?.actorId;
  if (!actorId) return { ok: false, status: 401, error: `Sign in ${feature.toDo}.` };

  // Denormalised onto rows that need an author, because there is no users
  // table to join to. Falling back to the actor id keeps a row writable when a
  // provider returns no profile — ugly, but attributable, which is the
  // property that matters.
  const displayName = session?.user?.name?.trim() || session?.user?.email?.trim() || actorId;

  return { ok: true, actorId, displayName };
}
