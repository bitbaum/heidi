/**
 * Palette for app/opengraph-image.tsx. ImageResponse renders outside the DOM
 * and cannot read CSS custom properties, so these mirror the Tier 1
 * primitives in app/globals.css by value. Keep in sync with that file;
 * never introduce a colour that isn't already a token there.
 */
export const OG_IMAGE_COLORS = {
  paper: "#edeee8", // --primitive-paper-100
  ink: "#191c18", // --primitive-ink-950
  inkMuted: "#7c8175", // --primitive-ink-500
  isogloss: "#b0362b", // --primitive-isogloss-600
} as const;
