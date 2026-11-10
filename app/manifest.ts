import type { MetadataRoute } from "next";
import { ASSISTANT_NAME } from "@/lib/config/site";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

/**
 * The web app manifest. Without it Android and desktop browsers never offer
 * "Install app", so the site could only be pinned as a bookmark. The PNGs in
 * public/app-icons/ are rasterised from the app icon (192, 512, and a maskable
 * 512 with the icon inside the 80% safe zone); regenerate them when it changes.
 */
export default function manifest(): MetadataRoute.Manifest {
  const { meta } = getDictionary(DEFAULT_LOCALE);
  return {
    // The default language's own title and description, and the one product
    // name: a clone changes the dictionary and `site.ts`, not this file.
    name: meta.title,
    short_name: ASSISTANT_NAME,
    description: meta.description,
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
