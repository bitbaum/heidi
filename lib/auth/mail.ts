import { createAuthMailer } from "@bitbaum/accountkit/auth/mail";
import type { AuthMailer } from "@bitbaum/accountkit/auth/server";
import { ASSISTANT_NAME, SITE_URL } from "../config/site.ts";
import { renderAuthMail } from "./mail-copy.ts";
import { sender } from "./sender.ts";

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
 * The words are Heidi's, in the reader's language (`mail-copy.ts`), through
 * the package's `render` slot. `codes: true` because that template prints the
 * sign-in code, which the package only mints when a template says it will.
 *
 * Env: RESEND_API_KEY (required), RESEND_FROM (optional; defaults to
 * mail-kit's `conventionalFrom("Heidi")` on the fleet's verified sender
 * domain).
 */
export const authSite = { url: SITE_URL, title: ASSISTANT_NAME, slug: "heidi" };

export function heidiAuthMailer(
  env?: () => Record<string, string | undefined>,
): AuthMailer {
  // The From line: Heidi's own domain once the mail service has verified one
  // for this deployment, the fleet's shared sender until then (`sender.ts`).
  const read = env ?? (() => process.env);
  return createAuthMailer({
    site: authSite,
    render: renderAuthMail,
    codes: true,
    env: () => {
      const values = read();
      const from = sender.from(values);
      return from ? { ...values, RESEND_FROM: from } : values;
    },
  });
}
