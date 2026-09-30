/**
 * Where the learner was when a session opened, so that closing it puts them
 * back exactly there: the same page, scrolled to the same line.
 *
 * WHY NOT A LINK BACK. A link to the page they came from renders it afresh at
 * the top. Somebody who tapped "Üben" half way down a scene, answered eight
 * questions and closed would have to find their place again — the opposite of
 * "open Heidi, do it, close her". Stepping back in history returns to the
 * entry they left, and the remembered offset covers the browsers that do not
 * restore it on their own after a full-height screen.
 *
 * IN MEMORY, NOT STORAGE. It only has to survive client-side navigation, and
 * after a reload the history entry it points at is not ours to step back to
 * anyway — then the close button is an ordinary link to the page.
 */

type Origin = { path: string; y: number };

let origin: Origin | null = null;
let returning: Origin | null = null;

/** On the way in: the page, and how far down it the learner was. */
export function rememberOrigin(): void {
  origin = { path: window.location.pathname, y: window.scrollY };
}

/**
 * On the way out: whether the page to close to is the one this session was
 * opened from in this tab — then stepping back is the same page, in place.
 */
export function openedFrom(path: string): boolean {
  return origin !== null && origin.path === path;
}

/** Step back, and leave the offset for the page to pick up once it is there. */
export function stepBack(back: () => void): void {
  returning = origin;
  origin = null;
  back();
}

/** The offset to restore on `path`, once. */
export function takeReturn(path: string): number | null {
  if (!returning || returning.path !== path) return null;
  const { y } = returning;
  returning = null;
  return y;
}
