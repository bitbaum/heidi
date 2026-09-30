import { NewChatIcon } from "./icons";

/**
 * Start again — one control, the same shape everywhere it appears.
 *
 * It used to be an underlined text link wedged between icon buttons in the
 * dock's header, wrapping onto two lines on a phone, and on the full-screen
 * chat it existed only inside the off-canvas sidebar. `icon` sits among other
 * icon buttons; `labelled` is for a toolbar with room for the words.
 */
export function NewChatButton({
  label,
  onClick,
  variant = "labelled",
  className = "",
}: {
  label: string;
  onClick: () => void;
  variant?: "icon" | "labelled";
  className?: string;
}) {
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-control text-fg-secondary transition-colors hover:bg-surface-raised hover:text-fg-primary ${className}`}
      >
        <NewChatIcon />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-border-strong px-3 text-sm font-medium text-fg-primary transition-colors hover:bg-surface-raised ${className}`}
    >
      <NewChatIcon />
      {/* Shrinks to an ellipsis rather than widening the page: «Nouvelle
          conversation» beside «Conversations» is wider than a 320px phone. */}
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}
