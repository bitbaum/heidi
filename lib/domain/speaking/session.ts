import { auth, authEnabled } from "../../auth/index.ts";
import { dbConfigured } from "../../db/index.ts";
import { requireActor, type Caller } from "../actor.ts";

/**
 * Who is asking, for a speaking route.
 *
 * Kept thin and kept HERE for the same reason `groups/session.ts` is:
 * `routes.test.ts` stubs authorisation by mocking this module at its resolved
 * file URL, so moving or deleting it would silently stop the route tests from
 * controlling who the caller is — and a test that no longer controls the actor
 * still passes.
 */
export type { Caller };

export function caller(): Promise<Caller> {
  return requireActor({ name: "Speaking rounds", toDo: "to propose a topic or join a round" });
}

/**
 * Who is asking, when not being anybody is a legitimate answer.
 *
 * The board of topics and the list of rounds are readable signed out, on
 * purpose: the point of a proposals board is that somebody browsing can see
 * there is something here worth making an account for. A wall in front of it
 * would hide the only evidence that the room is not empty.
 *
 * Returns null rather than an error, so the caller renders the same page with
 * the personal bits — "you said you would come" — simply absent.
 */
export async function optionalActor(): Promise<string | null> {
  if (!dbConfigured() || !authEnabled) return null;
  try {
    const session = await auth();
    return session?.actorId ?? null;
  } catch {
    return null;
  }
}
