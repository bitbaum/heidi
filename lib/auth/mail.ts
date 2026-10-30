import { createAuthMailer } from "@bitbaum/accountkit/auth/mail";
import type { AuthMailer } from "@bitbaum/accountkit/auth/server";
import { ASSISTANT_NAME, SITE_URL } from "../config/site.ts";

/**
 * Account mail for Heidi: the reset link, the email sign-in link and the
 * address check. It is the fleet's shared adapter (@bitbaum/accountkit's
 * `createAuthMailer`, which sends through @bitbaum/mail-kit), not a sender of
 * Heidi's own.
 *
 * Whether it is configured is read from the env on every request, never at
 * build time. With no RESEND_API_KEY (or a placeholder one) it reports
 * unconfigured, and the sign-in page then offers no "Forgot your password?"
 * and no sign-in link: nothing is advertised that cannot arrive.
 *
 * Env: RESEND_API_KEY (required), RESEND_FROM (optional; defaults to
 * mail-kit's `conventionalFrom("Heidi")` on the fleet's verified sender
 * domain).
 */
export const authSite = { url: SITE_URL, title: ASSISTANT_NAME, slug: "heidi" };

export function heidiAuthMailer(
  env?: () => Record<string, string | undefined>,
): AuthMailer {
  return createAuthMailer({ site: authSite, ...(env ? { env } : {}) });
}
