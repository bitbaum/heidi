import { ImageResponse } from "next/og";
import { LANDING } from "@/lib/config/landing";
import { OG_IMAGE_COLORS } from "@/lib/config/og-image";
import { DISPLAY } from "@/lib/variety/display";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const { brand, headline } = LANDING;
  // Linguistic content comes from the pack, so the link preview cannot drift
  // from the page — and needs no edit when the variety changes.
  const { correspondences } = DISPLAY;

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
        <div style={{ display: "flex", fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>{brand}</div>

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
