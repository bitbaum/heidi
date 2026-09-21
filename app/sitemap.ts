import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config/site";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, type Locale } from "@/lib/i18n/locales";
import { INDEXED_ROUTES } from "@/lib/i18n/routes";
import { essaysFor } from "@/lib/essays/registry";
import { SCENES } from "@/lib/situations/display";
import { DISPLAY } from "@/lib/variety/display";

/**
 * Every page in every language, with each entry naming its translations.
 *
 * Both lists are derived — ROUTES and LOCALES — so a page added to the menu is
 * in the sitemap by construction. Hand-maintaining this is how a site ends up
 * with four of its six pages uncrawled.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  /**
   * Each essay, in each language it can be READ in.
   *
   * Derived, like everything else here — but from `essaysFor`, not from the
   * registry crossed with every locale. An essay written in German and English
   * is served to a Russian reader in German, which is a real page worth
   * crawling; listing it under seven locales as though seven translations
   * existed would be the sitemap making a claim the pages do not keep.
   */
  const essays = LOCALES.flatMap((locale) =>
    essaysFor(locale).map((served) => ({
      url: `${SITE_URL}/${locale}/essays/${served.essay.slug}`,
      lastModified: new Date(served.essay.published),
      changeFrequency: "yearly" as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          // Only the languages the piece is actually in. An hreflang pointing
          // at a fallback tells Google there is a translation there.
          (Object.keys(served.essay.text) as Locale[]).map((l) => [
            LOCALE_TAGS[l],
            `${SITE_URL}/${l}/essays/${served.essay.slug}`,
          ]),
        ),
      },
    })),
  );

  /**
   * Each scene, in every language — because unlike an essay, every scene IS
   * translated into all seven: the lines are the variety's own and the prose
   * around them lives in the dictionaries, which are typed against German so
   * a missing one is a build error rather than a fallback.
   *
   * Worth crawling on their own rather than only through the index: "Züritüütsch
   * Übergabe" and "Schweizerdeutsch Pflege" are searches somebody makes the
   * evening before a shift, and the page that answers them is the scene, not a
   * list of six links to scenes.
   */
  const scenes = LOCALES.flatMap((locale) =>
    SCENES.map((scene) => ({
      url: `${SITE_URL}/${locale}/situations/${scene.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.65,
      alternates: {
        languages: Object.fromEntries([
          ...LOCALES.map((l) => [LOCALE_TAGS[l], `${SITE_URL}/${l}/situations/${scene.id}`]),
          ["x-default", `${SITE_URL}/${DEFAULT_LOCALE}/situations/${scene.id}`],
        ]),
      },
    })),
  );

  /**
   * Each grammar topic, in every language.
   *
   * New here because topics became pages: while they were sections of one
   * document there was one URL to crawl, and now there are eight. Left out,
   * the pages exist and nothing points a crawler at them — which is the way a
   * site quietly stops being findable for exactly the queries it answers best
   * ("kein präteritum schweizerdeutsch" is a real search).
   */
  const topics = LOCALES.flatMap((locale) =>
    DISPLAY.grammar.map((topic) => ({
      url: `${SITE_URL}/${locale}/grammar/${topic.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries([
          ...LOCALES.map((l) => [LOCALE_TAGS[l], `${SITE_URL}/${l}/grammar/${topic.id}`]),
          ["x-default", `${SITE_URL}/${DEFAULT_LOCALE}/grammar/${topic.id}`],
        ]),
      },
    })),
  );

  return [
    ...essays,
    ...scenes,
    ...topics,
    ...LOCALES.flatMap((locale) =>
    INDEXED_ROUTES.map((route) => {
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
  ),
  ];
}
