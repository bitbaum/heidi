import type { MetadataRoute } from "next";

/**
 * The web app manifest. Without it Android and desktop browsers never offer
 * "Install app", so the site could only be pinned as a bookmark. The PNGs in
 * public/app-icons/ are rasterised from the app icon (192, 512, and a maskable
 * 512 with the icon inside the 80% safe zone); regenerate them when it changes.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Heidi — Schweizerdeutsch verstehen",
    short_name: "Heidi",
    description:
      "Verstehen, was um Sie herum wirklich gesprochen wird. Heidi übersetzt echte Nachrichten, erklärt die Wörter, die Sie noch nicht kennen, und prüft jede Antwort auf echte Dialektformen.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/app-icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
