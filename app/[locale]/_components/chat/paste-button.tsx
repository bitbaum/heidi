"use client";

import { useSyncExternalStore } from "react";
import { PasteIcon } from "./icons";

const noop = () => () => {};

/**
 * Paste what was just copied — one tap, in the box.
 *
 * Nearly every first message in Heidi is a line somebody else wrote: a
 * WhatsApp from the neighbour, a sentence off a poster. The person has just
 * copied it in another app and came here to ask what it means. Long-pressing
 * into a textarea and finding the little "Paste" bubble is three steps on a
 * phone; this is one, and it sits among the composer's other tools.
 *
 * It only reads the clipboard because a person pressed it (the browser asks
 * for permission on that gesture, and says no on its own where it does not
 * allow reading) and it only fills an EMPTY box, so it can never overwrite
 * something being written. It does not send — the learner reads the line
 * first. Where the clipboard cannot be read at all the button is not drawn,
 * rather than shown and dead.
 */
export function PasteButton({
  label,
  value,
  onPaste,
}: {
  label: string;
  /** The box's text; the button is only offered while it is empty. */
  value: string;
  onPaste: (text: string) => void;
}) {
  // False on the server and during hydration, so markup matches; true after.
  const canRead = useSyncExternalStore(
    noop,
    () => typeof navigator !== "undefined" && typeof navigator.clipboard?.readText === "function",
    () => false,
  );
  if (!canRead || value.trim()) return null;

  return (
    <button
      type="button"
      className="ck-icon-btn"
      aria-label={label}
      title={label}
      onClick={async () => {
        try {
          const text = (await navigator.clipboard.readText()).trim();
          if (text) onPaste(text);
        } catch {
          // Refused or empty: leave the box as it is. The ordinary long-press
          // paste still works, so there is nothing to explain.
        }
      }}
    >
      <PasteIcon />
    </button>
  );
}
