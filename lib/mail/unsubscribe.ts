import { signUnsubscribe, verifyUnsubscribe } from "@bitbaum/mail-kit";
import { SITE_URL } from "../config/site.ts";

/**
 * The reminder list's unsubscribe token. Signed with the session secret under
 * its own label, so a token cannot be replayed as anything else and nothing
 * else's token can unsubscribe anybody. It does not expire: a link in a
 * six-month-old mail must still work.
 */
export const REMINDER_LIST = "reminders";

function secret(): string {
  const base = process.env.BETTER_AUTH_SECRET ?? "";
  return base ? `${base}:mail-unsubscribe` : "";
}

export function unsubscribeToken(actorId: string, list = REMINDER_LIST): string {
  return signUnsubscribe(secret(), { user: actorId, list });
}

/** The person the token names, only for the reminder list, only if it is genuine. */
export function actorOfToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const subject = verifyUnsubscribe(secret(), token);
  return subject && subject.list === REMINDER_LIST ? subject.user : null;
}

/** The URL the mail client's own Unsubscribe button POSTs to. */
export const oneClickUrl = (token: string) => `${SITE_URL}/api/mail/unsubscribe?t=${encodeURIComponent(token)}`;
