/**
 * Heidi's mark: a patch of Swiss cow.
 *
 * Two irregular patches, clipped by the outline so they run off the edge. That
 * clipping is the whole idea — patches that fit neatly INSIDE a circle read as
 * dots, and three evenly spaced dots read as a face (two eyes and a mouth,
 * unmistakably, which the first draft was). Hide reads as hide only when it
 * looks cut from something larger.
 *
 * Two, not three: three fuse into a mass at 16px and the white channel between
 * them disappears. Drawn at 32 and checked at 16, 18, 24, 32, 48 and 80 before
 * being chosen.
 *
 * `currentColor` throughout, so the mark inverts on a dark ground without a
 * second asset — the black-and-white palette already in globals.css does the
 * work.
 */
export function CowMark({
  size = 28,
  className,
  title,
}: {
  size?: number;
  className?: string;
  /** Give it a title only where it is the ONLY thing naming the site. */
  title?: string;
}) {
  // Unique per instance so two marks on one page cannot share a clip path.
  const id = `cow-${size}-${title ? "t" : "p"}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <clipPath id={id}>
          <circle cx="16" cy="16" r="15.1" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <g fill="currentColor">
          <path d="M-4 -4C6 -6 13 2 11 8c-2 6-10 8-15 4-4-3-4-12 0-16Z" />
          <path d="M20 34c-6-2-6-11-1-14 5-3 13-2 16 3 3 5 1 12-5 13-4 1-7 0-10-2Z" />
        </g>
      </g>
      <circle cx="16" cy="16" r="15.1" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Mark plus wordmark, the way the site signs itself. */
export function CowLockup({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <CowMark size={size} />
      <span className="font-heading text-xl font-bold tracking-display sm:text-2xl">Heidi</span>
    </span>
  );
}
