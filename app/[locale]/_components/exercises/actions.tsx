"use client";

import { createContext, useContext } from "react";
import { createPortal } from "react-dom";

/**
 * Where a question's buttons go: the bar at the bottom of the session screen.
 *
 * WHY A SLOT AND NOT A PROP. Every view owns its own controls, keyboard and
 * verdict (`view.ts`), and that seam is worth keeping. What changed is WHERE
 * the controls sit. On a phone, "Auflösen", "Gewusst", "Weiter" used to follow
 * the question down the page, so their position depended on how long the
 * prompt and the explanation were, and the thumb had to hunt for them after
 * every answer. In an app they are in one place, at the bottom, always. So a
 * view still decides WHICH buttons it has, and the session screen decides
 * where they appear: `Actions` portals into the bar the screen provides.
 *
 * Outside a session screen there is no bar (`undefined`), and the buttons
 * render in place, as they always did. While the screen's bar is still
 * mounting (`null`) they render nowhere for one frame, instead of flashing
 * inline and jumping.
 */
export const ActionSlot = createContext<HTMLElement | null | undefined>(undefined);

export function Actions({
  status,
  children,
}: {
  /** "Richtig" / "Nicht ganz": the verdict, read where the thumb already is. */
  status?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const slot = useContext(ActionSlot);
  const body = (
    <div className="flex flex-col gap-2">
      {status}
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
  if (slot === undefined) return <div className="mt-5">{body}</div>;
  if (slot === null) return null;
  return createPortal(<div className="mx-auto w-full max-w-2xl">{body}</div>, slot);
}

/**
 * The three weights a control can have, shared so seven views cannot drift.
 * Full width on a phone, where the bar is the thumb's; their own width above.
 */
export const PRIMARY =
  "min-h-12 flex-1 rounded-control bg-action px-5 font-medium text-on-action hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none";
export const SECONDARY =
  "min-h-12 flex-1 rounded-control border border-border-strong px-5 font-medium text-fg-primary hover:bg-surface-raised sm:flex-none";
export const QUIET = "min-h-12 rounded-control px-4 text-sm text-fg-muted hover:text-fg-primary";
