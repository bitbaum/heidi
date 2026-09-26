/**
 * One small line icon per page in the navigation — drawn in `currentColor`
 * so it follows the text colour and the theme, like everything else here.
 *
 * Keyed by route key. A route without its own icon gets the generic page
 * icon rather than nothing, so a new route never renders a hole.
 */
const PATHS: Record<string, string> = {
  home: "M4 11 12 4l8 7v9h-5v-6H9v6H4z",
  chat: "M4 5h16v11H9l-5 4z",
  situations: "M5 6h14v12H5zM5 10h14M9 6V4m6 2V4",
  grammar: "M5 5h10a4 4 0 0 1 0 8H5zM5 13h11a4 4 0 0 1 0 8H5z",
  dialect: "M12 3a6 6 0 0 1 6 6c0 5-6 11-6 11S6 14 6 9a6 6 0 0 1 6-6zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  vocabulary: "M4 5h7v14H4zM13 5h7v14h-7zM6 9h3m6 0h3M6 12h3m6 0h3",
  speaking: "M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v3",
  practice: "M5 12l4 4 10-10M5 4h8M5 20h14",
  listen: "M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H4zM17 14h3v6h-3z",
  essays: "M6 4h9l3 3v13H6zM9 10h6M9 14h6M9 18h4",
  paper: "M6 3h12v18H6zM9 7h6M9 11h6M9 15h3",
  roadmap: "M4 18 9 6l6 10 5-8M4 18h16",
  changelog: "M12 5v7l4 2M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z",
  method: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  technology: "M7 7h10v10H7zM10 3v4m4-4v4m-4 10v4m4-4v4M3 10h4m-4 4h4m10-4h4m-4 4h4",
  contribute: "M12 5v14M5 12h14",
  about: "M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM5 20a7 7 0 0 1 14 0",
  organisations: "M4 20V8l6-4v16M10 20V10l10 3v7M4 20h16M7 10h0M7 14h0M14 15h3",
};

const FALLBACK = "M6 3h9l3 3v15H6z";

export function NavIcon({ route, className = "" }: { route: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <path d={PATHS[route] ?? FALLBACK} />
    </svg>
  );
}
