import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthRuntime } from "@bitbaum/accountkit/auth/next";
import { isDeliverable } from "@bitbaum/accountkit/auth";
import { dbConfigured, getDb } from "../db/index.ts";
import { signInPath } from "./paths.ts";

/**
 * Accounts for Heidi — the same account system as every fleet product
 * (@bitbaum/accountkit/auth). A learner registers here with an email and a
 * password, a sign-in link or a passkey; "Continue with OrangeCat" is one
 * button among them, never a requirement.
 *
 * Heidi's rows were keyed on the OrangeCat actor id before it had accounts.
 * `legacyIdentityProvider` keeps it that way for everyone whose first way in
 * was OrangeCat, so their groups, conversations and progress stay theirs with
 * no data migration. Everyone else is their account id.
 */
export const { GET, POST, getSession, requireUser, authStatus, getAuth } = createAuthRuntime({
  site: { url: "https://heidi.orangecat.ch", title: "Heidi", slug: "heidi" },
  // Heidi sends no mail yet: the sign-in link and address confirmation stay
  // hidden, and a password account signs in at once.
  mail: { configured: false, send: async () => {} },
  isDatabaseConfigured: () => dbConfigured(),
  getDatabase: () => getDb(),
  legacyIdentityProvider: "orangecat",
});

/** Kept for the route file: `export const { GET, POST } = handlers`. */
export const handlers = { GET, POST };

/**
 * False when this deployment has no database or no session secret. The UI
 * then hides the sign-in control rather than offering one that cannot work.
 */
export const authEnabled = authStatus().ready;

/**
 * The signed-in person as the rest of Heidi reads them. `actorId` is the id
 * every row uses. An address that cannot receive mail (one invented for a
 * person who came in through OrangeCat) is never passed on as an email.
 */
export async function auth(): Promise<{
  actorId: string;
  user: { name: string | null; email: string | null; image: string | null };
} | null> {
  const session = await getSession();
  if (!session) return null;
  const { user } = session;
  return {
    actorId: user.actorId,
    user: {
      name: user.name || null,
      email: isDeliverable(user.email) ? user.email : null,
      image: user.image ?? null,
    },
  };
}

/**
 * Start signing in: Heidi's own sign-in page, which offers every method this
 * deployment has. The provider argument is accepted for the call sites written
 * when OrangeCat was the only way in.
 */
export async function signIn(_provider: string, options: { redirectTo: string }): Promise<never> {
  redirect(signInPath(options.redirectTo));
}

/** End the session and go where the caller asked. */
export async function signOut(options: { redirectTo: string }): Promise<never> {
  try {
    await getAuth().api.signOut({ headers: await headers() });
  } catch {
    // Already signed out, or accounts unavailable: either way, go on.
  }
  redirect(options.redirectTo);
}
