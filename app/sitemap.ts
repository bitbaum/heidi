import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config/site";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS } from "@/lib/i18n/locales";
import { ROUTES } from "@/lib/i18n/routes";

/**
 * Every page in every language, with each entry naming its translations.
 *
 * Both lists are derived — ROUTES and LOCALES — so a page added to the menu is
 * in the sitemap by construction. Hand-maintaining this is how a site ends up
 * with four of its six pages uncrawled.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return LOCALES.flatMap((locale) =>
    ROUTES.map((route) => {
      const path = route.segment ? `/${locale}/${route.segment}` : `/${locale}`;
      return {
        url: `${SITE_URL}${path}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries([
            ...LOCALES.map((l) => [
              LOCALE_TAGS[l],
              `${SITE_URL}${route.segment ? `/${l}/${route.segment}` : `/${l}`}`,
            ]),
            [
              "x-default",
              `${SITE_URL}${route.segment ? `/${DEFAULT_LOCALE}/${route.segment}` : `/${DEFAULT_LOCALE}`}`,
            ],
          ]),
        },
      };
    }),
  );
}
