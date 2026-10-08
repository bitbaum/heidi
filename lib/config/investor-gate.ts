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

/**
 * Where the door leads: Heidi's investor room on OrangeCat (OrangeCat ADR-0012).
 *
 * This page is the DOOR — the address people are told, with the password for
 * people told in person. The room itself lives on OrangeCat, where each
 * investor can also get a link of their own and the founder sees who opened
 * what. The door hands its visitors into the room through one shared link.
 *
 * FROM THE ENVIRONMENT, NEVER THE REPOSITORY, for the same reason as the
 * password and more so: the link IS the credential, and the room behind it can
 * hold what a public repository must not (financials, terms). Only an
 * `https://orangecat.ch/room/…` address counts; anything else is treated as
 * unset, and the page shows the room from `investors.ts` as before.
 */
const ROOM_URL = /^https:\/\/orangecat\.ch\/room\/[0-9a-f-]{36}$/i;

export function investorRoomUrl(env: Record<string, string | undefined> = process.env): string | null {
  const url = env.HEIDI_INVESTOR_ROOM_URL?.trim();
  return url && ROOM_URL.test(url) ? url : null;
}

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
