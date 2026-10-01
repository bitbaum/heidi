/**
 * The words on the link preview (`app/opengraph-image.tsx`).
 *
 * This file used to hold the whole first landing page — sections, a "built in
 * the open" note, a footer — long after the page stopped reading any of it.
 * Nothing rendered that copy, so nothing kept it true: it still promised "no
 * streaks" weeks after streaks shipped. Only what the preview prints is left.
 */
export const LANDING = {
  brand: "Heidi",
  headline: "Understand Zurich German. Then text like a local.",
} as const;
