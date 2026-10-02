import NextAuth from "next-auth";
import { orangecatClient, orangecatProvider, syncOcSession } from "@bitbaum/accountkit/orangecat";

/**
 * "Sign in with OrangeCat" — the only login Heidi will ever have.
 *
 * Heidi teaches a language. Its portal needs learners, tutors who can be paid,
 * and study groups — identity, economy and public presence, every one of which
 * OrangeCat already owns and already serves to two other consumers. So Heidi
 * has NO users table, no password, no reset flow and no session table: the JWT
 * carries the OrangeCat actor id, and anything about a person is looked up
 * fresh from OrangeCat where it matters.
 *
 * That is not laziness, it is the identity-bridge instruction applied to a
 * second app: "Do NOT build profiles, walls, or messaging inside Loki."
 * Rebuilding a user table, a payments rail and a profile directory inside
 * Heidi would be the same mistake in a different repo — and a users table you
 * do not have is a users table that cannot leak.
 *
 * The provider, the session refresh and their contract tests live once, in
 * @bitbaum/accountkit/orangecat — every bitbaum app signs in through the same
 * copy (client_secret_post, PKCE, a profile without email, and a session that
 * ends when OrangeCat revokes the grant).
 */

const orangecat = orangecatClient();

/**
 * True only when the OrangeCat pair is configured. The UI hides the sign-in
 * control rather than mounting a provider that fails opaquely at the code
 * exchange — a half-configured provider that looks present is worse than an
 * absent one, because the failure surfaces to the visitor as a dead button.
 */
export const authEnabled = orangecat !== null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Behind Caddy the app never sees its own public URL. `trustHost` lets
  // Auth.js believe the forwarded host — but it does NOT fix redirect
  // construction, which is why AUTH_URL must also be pinned in the box env.
  // The fleet has an audit for exactly this class (nextauth-origin-audit.mjs)
  // because one app shipped localhost callback URLs to production twice.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { error: "/auth/error" },

  providers: orangecat ? [orangecatProvider(orangecat)] : [],

  callbacks: {
    // Identity is id_token.sub (the OrangeCat actor id), never the email. The
    // session lives only as long as OrangeCat lets it: once the access token
    // expires it refreshes, and a refusal (Disconnect on OrangeCat, Sign out
    // everywhere, account deleted) ends the session.
    jwt({ token, profile, account }) {
      return syncOcSession({ token, profile, account }, orangecat);
    },
    session({ session, token }) {
      if (typeof token.actorId === "string") session.actorId = token.actorId;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    /** OrangeCat actor id (id_token.sub) of the signed-in learner. */
    actorId?: string;
  }
}
