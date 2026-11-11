import { createAuthMailer } from "@bitbaum/accountkit/auth/mail";
import type { AuthMailer } from "@bitbaum/accountkit/auth/server";
import { ASSISTANT_NAME, CONTACT_EMAIL, SITE_URL } from "../config/site.ts";
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
 * Env: RESEND_API_KEY (required); RESEND_FROM (optional, pins the From line;
 * unset, `sender.ts` chooses it); MAIL_ADDRESS (optional, the Reply-To; unset,
 * the contact address in `config/site.ts`).
 */
export const authSite = { url: SITE_URL, title: ASSISTANT_NAME, slug: ASSISTANT_NAME.toLowerCase() };

/**
 * The environment every Heidi mail is sent with.
 *
 * From: Heidi's own domain once it is verified (`sender.ts`).
 *
 * Reply-To: mail-kit answers to `hello@<the site's host>` unless MAIL_ADDRESS
 * says otherwise, and Heidi's host receives no mail (it has no MX record), so
 * every reply bounced. Answers go to the contact address the Impressum
 * prints, which is on a domain that does receive.
 */
export function mailEnv(values: Record<string, string | undefined>): Record<string, string | undefined> {
  const from = sender.from(values);
  return {
    ...values,
    MAIL_ADDRESS: values.MAIL_ADDRESS || CONTACT_EMAIL,
    ...(from ? { RESEND_FROM: from } : {}),
  };
}

export function heidiAuthMailer(
  env?: () => Record<string, string | undefined>,
): AuthMailer {
  // The From line: Heidi's own domain once the mail service has verified one
  // for this deployment, the fleet's shared sender until then (`sender.ts`).
  const read = env ?? (() => process.env);
  // The package reads its environment synchronously, and the sender's answer
  // comes from the mail service. Its `own` slot runs, awaited, before every
  // mail: it is used here only to have that answer ready, and returns false so
  // the package then sends its usual mail with the env below.
  const ready = async () => {
    await sender.resolve(read());
    return false;
  };
  return createAuthMailer({
    site: authSite,
    render: renderAuthMail,
    codes: true,
    own: { verify: ready, magicLink: ready, reset: ready },
    env: () => mailEnv(read()),
  });
}
