import { ImageResponse } from "next/og";
import { LANDING } from "@/lib/config/landing";
import { OG_IMAGE_COLORS } from "@/lib/config/og-image";
import { VARIETY } from "@/lib/variety/active";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const { brand, headline } = LANDING;
  // Linguistic content comes from the pack, so the link preview cannot drift
  // from the page — and needs no edit when the variety changes.
  const { correspondences } = VARIETY;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: OG_IMAGE_COLORS.paper,
          color: OG_IMAGE_COLORS.ink,
          fontFamily: "serif",
        }}
      >
        {/* The mark travels with every shared link. Satori renders inline SVG
            but resolves no CSS custom properties, so the ink colour is passed
            explicitly from the same config the rest of this card reads. */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <defs>
              <clipPath id="og-cow">
                <circle cx="16" cy="16" r="15.1" />
              </clipPath>
            </defs>
            <g clipPath="url(#og-cow)">
              <g fill={OG_IMAGE_COLORS.ink}>
                <path d="M-4 -4C6 -6 13 2 11 8c-2 6-10 8-15 4-4-3-4-12 0-16Z" />
                <path d="M20 34c-6-2-6-11-1-14 5-3 13-2 16 3 3 5 1 12-5 13-4 1-7 0-10-2Z" />
              </g>
            </g>
            <circle cx="16" cy="16" r="15.1" fill="none" stroke={OG_IMAGE_COLORS.ink} strokeWidth="1.5" />
          </svg>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>{brand}</div>
        </div>

        <div style={{ display: "flex", maxWidth: 980, fontSize: 56, fontWeight: 600, lineHeight: 1.1 }}>
          {headline}
        </div>

        <div style={{ display: "flex", gap: 48 }}>
          {correspondences.map((p) => (
            <div key={p.bridge} style={{ display: "flex", alignItems: "baseline", fontSize: 32 }}>
              <span style={{ color: OG_IMAGE_COLORS.inkMuted }}>{p.bridge}</span>
              <span style={{ margin: "0 10px", color: OG_IMAGE_COLORS.inkMuted }}>→</span>
              <span style={{ color: OG_IMAGE_COLORS.isogloss, fontWeight: 600 }}>{p.target}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
