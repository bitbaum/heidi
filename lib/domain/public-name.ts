/**
 * The name other people see: on a group's member list, a hosted round, and
 * the speaking-topics board — which is readable signed out.
 *
 * NEVER THE EMAIL. Sign-up asks for no name (accountkit: "no real name is
 * asked for"), so for nearly everyone who registered here the old fallback,
 * `name || email`, was the email — and proposing a topic published the
 * address on a public page. Measured on a local build, 2026-11-09:
 * `GET /api/speaking/topics`, signed out, returned
 * `"proposerName":"maria.private@example.test"`.
 *
 * Without a chosen name, a short handle from the actor id: stable, the same
 * on every row, and it says nothing about the person. They can choose a name
 * on their account page. `drizzle/0011_scrub_email_names.sql` writes the same
 * handle over rows stored before this, so the two must stay in step.
 */
export function publicName(name: string | null | undefined, actorId: string): string {
  const chosen = name?.trim();
  if (chosen && !looksLikeEmail(chosen)) return chosen;
  return `#${actorId.slice(-4).toUpperCase()}`;
}

/** A name that is an address was rebuilt from the email somewhere upstream. */
function looksLikeEmail(text: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}
