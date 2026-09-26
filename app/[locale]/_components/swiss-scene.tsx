/**
 * The home page's picture: a cow with a bell in front of the Alps, a Swiss
 * flag on the peak, and the one thing she says.
 *
 * DRAWN IN THE PRODUCT'S OWN INK. The palette is a cow's — page white, ink
 * black, and Swiss red as the only colour (see the tokens in globals.css) — so
 * the picture uses exactly those, through the same tokens, and flips with dark
 * mode for free. The flag is the one exception that must NOT flip: a Swiss
 * cross is white on red in every theme, hence its two fixed tokens.
 *
 * Decorative apart from the bubble, which is real Zurich German and is marked
 * as such; the whole figure carries one accessible name.
 */
export function SwissScene({ label, bubble }: { label: string; bubble: string }) {
  const ink = "var(--color-fg-primary)";
  const page = "var(--color-surface-page)";
  const rock = "var(--color-surface-sunk)";
  const haze = "var(--color-surface-raised)";

  return (
    <svg viewBox="0 0 520 440" role="img" aria-label={label} className="h-auto w-full">
      <defs>
        <clipPath id="cow-body">
          <path d="M150 272c0-24 24-34 55-34h86c27 0 39 14 39 37v40c0 16-12 25-30 25H181c-20 0-31-10-31-28z" />
        </clipPath>
        <clipPath id="cow-head">
          <path d="M318 236c0-20 14-30 34-30h20c18 0 26 14 24 34l-4 46c-2 16-14 24-30 24h-14c-16 0-26-10-26-26z" />
        </clipPath>
      </defs>

      {/* The far range, then the peak with its snow and its flag. */}
      <path d="M0 300 60 208l34 34 58-96 44 66 34-40 52 70 28-30 40 58 30-20 80 50v8H0z" fill={haze} />
      <path
        d="M0 300 60 208l34 34 58-96 44 66 34-40 52 70 28-30 40 58 30-20 80 50"
        fill="none"
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M232 300 356 74l34 62 30-26 100 190z" fill={rock} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path
        d="M326 128 356 74l24 44-12-5-12 14-12-10z"
        fill={page}
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <line x1="356" y1="76" x2="356" y2="30" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <rect x="356" y="30" width="34" height="28" fill="var(--color-flag)" />
      <rect x="370" y="35" width="6" height="18" fill="var(--color-flag-cross)" />
      <rect x="364" y="41" width="18" height="6" fill="var(--color-flag-cross)" />

      {/* The meadow — only its horizon is drawn, so the picture has no box. */}
      <path d="M0 322c90-18 190-20 290-10s170 6 230-6v134H0z" fill={page} />
      <path d="M0 322c90-18 190-20 290-10s170 6 230-6" fill="none" stroke={ink} strokeWidth="3" />
      {/* Edelweiss in the grass: six petals and a heart, in ink. */}
      {[
        [48, 360, 1],
        [104, 408, 0.8],
        [440, 368, 0.9],
        [488, 414, 0.75],
        [252, 414, 0.7],
      ].map(([x, y, s]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse
              key={a}
              cx="0"
              cy="-8"
              rx="3.6"
              ry="7"
              transform={`rotate(${a})`}
              fill={page}
              stroke={ink}
              strokeWidth="2"
            />
          ))}
          <circle r="3.4" fill={ink} />
        </g>
      ))}

      {/* The cow. Tail first, so the body sits over its root. */}
      <path d="M152 262c-16 8-20 30-18 58" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M126 318c4-8 16-8 18 0 2 10-4 18-9 18s-11-8-9-18z" fill={ink} />

      {[165, 197, 280, 306].map((x) => (
        <g key={x}>
          <rect x={x} y="330" width="17" height="52" fill={page} stroke={ink} strokeWidth="3" />
          <rect x={x} y="372" width="17" height="10" fill={ink} />
        </g>
      ))}

      <path
        d="M150 272c0-24 24-34 55-34h86c27 0 39 14 39 37v40c0 16-12 25-30 25H181c-20 0-31-10-31-28z"
        fill={page}
        stroke={ink}
        strokeWidth="3"
      />
      <g clipPath="url(#cow-body)" fill={ink}>
        <path d="M150 236h58c6 14-4 30-22 34-14 3-30-2-36 10z" />
        <path d="M232 238h40c4 20-6 38-26 42-18 3-26-12-20-26 3-7 8-10 6-16z" />
        <path d="M262 340c2-18 18-30 38-28 14 1 26 10 32 22v6z" />
      </g>

      {/* Horns and ears, behind the head. */}
      <path d="M330 214c-10-6-14-16-10-24" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M388 214c10-6 14-16 10-24" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="312" cy="232" rx="16" ry="8" transform="rotate(-18 312 232)" fill={page} stroke={ink} strokeWidth="3" />
      <ellipse cx="404" cy="232" rx="16" ry="8" transform="rotate(18 404 232)" fill={page} stroke={ink} strokeWidth="3" />

      <path
        d="M318 236c0-20 14-30 34-30h20c18 0 26 14 24 34l-4 46c-2 16-14 24-30 24h-14c-16 0-26-10-26-26z"
        fill={page}
        stroke={ink}
        strokeWidth="3"
      />
      <g clipPath="url(#cow-head)" fill={ink}>
        <path d="M366 204h34v44c-10 6-26 4-32-8-4-8-6-20-2-36z" />
      </g>
      <circle cx="344" cy="242" r="4.5" fill={ink} />
      <circle cx="378" cy="242" r="4.5" fill={page} />
      <circle cx="378" cy="242" r="2" fill={ink} />
      <ellipse cx="357" cy="290" rx="30" ry="17" fill={rock} stroke={ink} strokeWidth="3" />
      <ellipse cx="347" cy="290" rx="3.5" ry="5" fill={ink} />
      <ellipse cx="367" cy="290" rx="3.5" ry="5" fill={ink} />

      {/* The bell, on a red strap: the one bit of colour on the animal. */}
      <path d="M326 300c10 14 50 14 62 0" stroke="var(--color-accent)" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M345 314h26l7 28h-40z" fill={rock} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="358" cy="344" r="4" fill={ink} />

      {/* What she says — real Zurich German, marked as such. */}
      <g>
        <rect x="286" y="134" width="206" height="48" fill={page} stroke={ink} strokeWidth="3" />
        <path d="M346 182l-4 18 20-18" fill={page} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        <path d="M344 180h20" stroke={page} strokeWidth="4" />
        <text
          x="389"
          y="165"
          textAnchor="middle"
          lang="gsw"
          fontSize="19"
          fontWeight="600"
          fill="var(--color-dialect)"
          fontFamily="var(--font-heading)"
        >
          {bubble}
        </text>
      </g>
    </svg>
  );
}
