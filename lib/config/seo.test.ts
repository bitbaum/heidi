import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { pageMetadata, OG_IMAGE } from "./seo.ts";
import { SITE_URL } from "./site.ts";
import { LOCALES, LOCALE_TAGS } from "../i18n/locales.ts";

/**
 * What was live: `/en/practice` declared `/en` as its canonical and og:url,
 * every hreflang pointed at a locale home, and no page had a share image.
 */
describe("pageMetadata", () => {
  const meta = pageMetadata("en", "practice", { title: "Practice" });

  test("canonical and og:url are the page, not the locale home", () => {
    assert.equal(meta.alternates?.canonical, `${SITE_URL}/en/practice`);
    assert.equal((meta.openGraph as { url?: string }).url, `${SITE_URL}/en/practice`);
  });

  test("hreflang names the same page in every language, and an x-default", () => {
    const languages = meta.alternates?.languages as Record<string, string>;
    for (const l of LOCALES) assert.equal(languages[LOCALE_TAGS[l]], `${SITE_URL}/${l}/practice`);
    assert.equal(languages["x-default"], `${SITE_URL}/de/practice`);
  });

  test("the share image is absolute, on both cards", () => {
    assert.match(OG_IMAGE.url, /^https:\/\//);
    assert.deepEqual((meta.openGraph as { images: unknown[] }).images, [OG_IMAGE]);
    assert.deepEqual((meta.twitter as { images: unknown[] }).images, [OG_IMAGE.url]);
  });

  test("a personal page is self-canonical, unlisted and without hreflang", () => {
    const personal = pageMetadata("fr", "settings", { noindex: true });
    assert.equal(personal.alternates?.canonical, `${SITE_URL}/fr/settings`);
    assert.equal(personal.alternates?.languages, undefined);
    assert.deepEqual(personal.robots, { index: false, follow: false });
  });

  test("a private address is written nowhere, and does not inherit the home's", () => {
    const secret = pageMetadata("de", null);
    assert.deepEqual(secret.alternates, {});
    assert.equal((secret.openGraph as { url?: string }).url, undefined);
    assert.deepEqual(secret.robots, { index: false, follow: false });
  });

  test("hreflang lists only the languages a page exists in", () => {
    const essay = pageMetadata("ru", "essays/x", { locales: ["de", "en"], canonicalLocale: "de" });
    assert.deepEqual(Object.keys(essay.alternates?.languages ?? {}).sort(), [LOCALE_TAGS.de, LOCALE_TAGS.en, "x-default"].sort());
    assert.equal(essay.alternates?.canonical, `${SITE_URL}/de/essays/x`);
  });
});
