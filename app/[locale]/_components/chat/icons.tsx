/**
 * The chat's own icons, and the thinking indicator.
 *
 * Inline SVG rather than an icon package: four shapes at 16px, each one line of
 * path data, against a dependency that ships a thousand. They moved here from
 * `chat.tsx` unchanged when the chat surfaces started sharing a composer.
 */

export function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-fg-muted"
      style={{ animationDelay: delay }}
    />
  );
}

export function NewChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PasteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0">
      <rect x="8" y="3" width="8" height="4" rx="1" strokeLinejoin="round" />
      <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
