import NextAuth from "next-auth";
import { orangecatProvider } from "./provider.ts";

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
 * The provider config mirrors Solon's, which mirrors Loki's, because
 * OrangeCat's authorization server has two quirks that cost a debugging cycle
 * to find the first time: its token endpoint accepts ONLY client_secret_post
 * (Auth.js defaults to client_secret_basic, which OC rejects with a 400
 * "client_id is required" at the code exchange), and it requires PKCE even for
 * confidential clients.
 */

const clientId = process.env.ORANGECAT_OAUTH_CLIENT_ID;
const clientSecret = process.env.ORANGECAT_OAUTH_CLIENT_SECRET;

/**
 * True only when the OrangeCat pair is configured. The UI hides the sign-in
 * control rather than mounting a provider that fails opaquely at the code
 * exchange — a half-configured provider that looks present is worse than an
 * absent one, because the failure surfaces to the visitor as a dead button.
 */
export const authEnabled = Boolean(clientId && clientSecret);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Behind Caddy the app never sees its own public URL. `trustHost` lets
  // Auth.js believe the forwarded host — but it does NOT fix redirect
  // construction, which is why AUTH_URL must also be pinned in the box env.
  // The fleet has an audit for exactly this class (nextauth-origin-audit.mjs)
  // because one app shipped localhost callback URLs to production twice.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { error: "/auth/error" },

  providers: authEnabled ? [orangecatProvider(clientId!, clientSecret!)] : [],

  callbacks: {
    jwt({ token, profile }) {
      if (profile?.sub) {
        // id_token.sub is the OrangeCat actor id. It — never the email — is
        // the cross-product identity boundary: two accounts can share an
        // email string and must not thereby become the same person.
        token.actorId = profile.sub;
      }
      return token;
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
