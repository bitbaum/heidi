import { timingSafeEqual } from "node:crypto";

/**
 * The lock on the data room.
 *
 * WHAT THIS IS NOT. `bitbaum/heidi` is a public MIT repository, so the CONTENTS
 * of the room are readable by anyone regardless of this check. The password
 * stops the page being stumbled upon, shared onward, or indexed. It is not a
 * secret store, and the content was written on that assumption — see
 * `investors.ts`.
 *
 * WHY THE PASSWORD IS NOT IN THE REPOSITORY. Committing it would publish it,
 * which is not a subtle failure: a repository is the first place anyone looks.
 * It comes from the environment, and a deployment that has not set one grants
 * nobody access rather than falling back to a default — a default in open
 * source is the same as no lock at all, with the added problem that everyone
 * believes there is one.
 */
export const INVESTOR_COOKIE = "heidi.investors";

export function investorPasswordConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.HEIDI_INVESTOR_PASSWORD?.trim());
}

/**
 * Whether what somebody typed is the password.
 *
 * Constant-time, which for a shared password is closer to hygiene than to
 * necessity — but it costs three lines, and the alternative leaks length and
 * prefix to anyone patient. Returns false when nothing is configured, so an
 * unset deployment is closed rather than open.
 */
export function isInvestorPassword(
  attempt: unknown,
  env: Record<string, string | undefined> = process.env,
): boolean {
  const expected = env.HEIDI_INVESTOR_PASSWORD?.trim();
  if (!expected) return false;
  if (typeof attempt !== "string") return false;

  const a = Buffer.from(attempt);
  const b = Buffer.from(expected);
  // `timingSafeEqual` throws on a length mismatch, which would itself be the
  // timing signal. Compare lengths first and always run the comparison.
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
