import { auth, authEnabled } from "../../auth/index.ts";
import { dbConfigured } from "../../db/index.ts";

/**
 * Who is asking, for a group route.
 *
 * Groups are the one part of Heidi that REQUIRES an account, and the reason is
 * not policy — it is that a message needs an author other people can see, and
 * an anonymous visitor has no stable name to attribute anything to. Everything
 * else on the site works signed out and stays that way.
 *
 * Both preconditions are answered separately because they fail differently:
 * a deployment without OrangeCat configured is an operator problem, and a
 * visitor who has not signed in is a visitor problem. Collapsing them into one
 * 401 told a visitor to sign in on an install where signing in was impossible.
 */

export type Caller =
  | { ok: true; actorId: string; displayName: string }
  | { ok: false; status: 401 | 503; error: string };

export async function caller(): Promise<Caller> {
  if (!dbConfigured()) {
    return { ok: false, status: 503, error: "Study groups are not configured on this deployment." };
  }
  if (!authEnabled) {
    return { ok: false, status: 503, error: "Signing in is not configured on this deployment." };
  }

  const session = await auth();
  const actorId = session?.actorId;
  if (!actorId) return { ok: false, status: 401, error: "Sign in to use study groups." };

  // The display name is denormalised onto the membership row because there is
  // no users table to join to. Falling back to the actor id keeps a row
  // writable when a provider returns no profile — ugly, but attributable,
  // which is the property that matters.
  const displayName = session?.user?.name?.trim() || session?.user?.email?.trim() || actorId;

  return { ok: true, actorId, displayName };
}
