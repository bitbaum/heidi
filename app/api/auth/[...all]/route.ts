import { GET, POST as accounts, auth } from "@/lib/auth";
import { eraseActorData } from "@/lib/domain/account/erase";

/** Accounts: sign-up, sign-in (password, passkey, OrangeCat), two-step codes, sessions. */
export const dynamic = "force-dynamic";
export { GET };

/**
 * Everything is the account package's, except that deleting an account also
 * deletes what Heidi itself holds about the person (`lib/domain/account/erase`).
 * The package removes the login; the rows keyed by `actor_id` are ours, and
 * without this they stayed behind, attached to nobody.
 *
 * The person is read BEFORE the package runs (afterwards there is no session
 * to read), and their data is erased only if the deletion succeeded — a wrong
 * password must not cost anybody their progress.
 */
export async function POST(request: Request) {
  if (!new URL(request.url).pathname.endsWith("/delete-user")) return accounts(request);
  const who = await auth();
  const response = await accounts(request);
  if (response.ok && who?.actorId) {
    await eraseActorData(who.actorId).catch((error) =>
      console.error("[heidi/account] erase failed after the account was deleted", {
        actorId: who.actorId,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
  return response;
}
