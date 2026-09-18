/**
 * Which day it is, as a number the flow can rotate on.
 *
 * ITS OWN MODULE because the React Compiler is right: `Date.now()` in a
 * component's render body is an impure call, and the lint that says so caught
 * it here. A render that gets thrown away and re-run would produce a different
 * answer, which is exactly what "impure" means — and on a page that is
 * revalidated rather than rendered per request, the read wants to happen once,
 * deliberately, at the top.
 *
 * It is also the only part of the daily rotation worth a test, and a function
 * inside a server component cannot have one.
 */

/** Milliseconds in a day. The rotation is coarse; leap seconds are not its problem. */
const DAY = 86_400_000;

/**
 * Days since the start of the current UTC year.
 *
 * UTC rather than local time, so every reader gets the same three sources on
 * the same date regardless of where they are — the property that lets the page
 * be cached and stops the server and the client disagreeing about "today".
 * Zurich is one or two hours ahead of UTC, so the picks turn over shortly
 * after midnight local, which is nobody's listening hour.
 */
export function dayCursor(now: number = Date.now()): number {
  const year = new Date(now).getUTCFullYear();
  return Math.floor((now - Date.UTC(year, 0, 0)) / DAY);
}
