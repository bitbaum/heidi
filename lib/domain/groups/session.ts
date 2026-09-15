import { requireActor, type Caller } from "../actor.ts";

/**
 * Who is asking, for a group route.
 *
 * Groups are one of two parts of Heidi that REQUIRE an account, and the reason
 * is not policy — a message needs an author other people can see, and an
 * anonymous visitor has no stable name to attribute anything to. The chat and
 * the dialect gate work signed out and stay that way.
 *
 * THIS FILE STAYS, thin, on purpose. `groups/routes.test.ts` stubs
 * authorisation by mocking this module at its resolved file URL
 * (`mock.module(new URL("./session.ts", …))`), so moving or deleting it would
 * silently stop the group route tests from controlling who the caller is —
 * and a test that no longer controls the actor still passes.
 */
export type { Caller };

export function caller(): Promise<Caller> {
  return requireActor({ name: "Study groups", toDo: "to use study groups" });
}
