import { test } from "node:test";
import assert from "node:assert/strict";
import { getDictionary } from "./index.ts";
import {
  DEFAULT_LOCALE,
  GROUP_ORDER,
  LOCALES,
  LOCALE_NAMES,
  LOCALE_TAGS,
  isLocale,
  localesInGroup,
  negotiate,
} from "./locales.ts";
import { INDEXED_ROUTES, NAV_ROUTES, ROUTES, href } from "./routes.ts";
import { BYOK_PROVIDERS } from "../domain/model/providers.ts";

test("German is the default, not English", () => {
  // The site is about living in a German-speaking city. Defaulting to English
  // quietly concedes that you never really arrive.
  assert.equal(DEFAULT_LOCALE, "de");
});

test("all four national languages plus English and Russian are present", () => {
  for (const l of ["de", "fr", "it", "rm", "en", "ru"]) assert.ok(LOCALES.includes(l as never), `${l} missing`);
});

test("every locale belongs to exactly one switcher group", () => {
  // A locale missing from LOCALE_GROUP would silently vanish from the menu
  // while still being reachable by URL.
  const grouped = GROUP_ORDER.flatMap((g) => localesInGroup(g));
  assert.equal(grouped.length, LOCALES.length);
  assert.deepEqual([...grouped].sort(), [...LOCALES].sort());
});

test("the Swiss national languages are grouped apart from the others", () => {
  assert.deepEqual(localesInGroup("national"), ["de", "gsw", "fr", "it", "rm"]);
  assert.deepEqual(localesInGroup("other"), ["en", "ru"]);
});

test("Russian is negotiated from an Accept-Language header", () => {
  assert.equal(negotiate("ru-RU,ru;q=0.9"), "ru");
});

test("every locale has a name and a BCP-47 tag", () => {
  for (const l of LOCALES) {
    assert.ok(LOCALE_NAMES[l], `${l} has no endonym`);
    assert.ok(LOCALE_TAGS[l], `${l} has no tag`);
  }
});

test("every locale's dictionary has the same shape as German", () => {
  // The types enforce this at build time; this catches a dictionary that
  // type-checks because someone widened a type to make it compile.
  const walk = (a: unknown, b: unknown, path: string): void => {
    if (Array.isArray(a)) {
      assert.ok(Array.isArray(b), `${path} should be an array`);
      assert.equal((b as unknown[]).length, a.length, `${path} has a different number of entries`);
      a.forEach((item, i) => walk(item, (b as unknown[])[i], `${path}[${i}]`));
      return;
    }
    if (a && typeof a === "object") {
      assert.ok(b && typeof b === "object", `${path} should be an object`);
      for (const key of Object.keys(a as object)) {
        walk((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}.${key}`);
      }
      return;
    }
    assert.equal(typeof b, "string", `${path} is missing or not a string`);
    assert.ok((b as string).length > 0, `${path} is empty`);
  };

  const source = getDictionary("de");
  for (const locale of LOCALES) walk(source, getDictionary(locale), locale);
});

test("no locale left a German string in place of a translation", () => {
  // Catches a copy-paste that never got translated. The dialect examples are
  // deliberately identical across locales — they are Zurich German, not UI —
  // so they are exempt.
  const de = getDictionary("de");
  for (const locale of LOCALES) {
    if (locale === "de") continue;
    const dict = getDictionary(locale);
    assert.notEqual(dict.home.headline, de.home.headline, `${locale} headline is untranslated`);
    // nav.method is exempt: "Methode" is genuinely the word in Züritüütsch as
    // well as in German. A translation test that forbids agreement would be
    // demanding difference for its own sake.
    if (locale !== "gsw") {
      assert.notEqual(dict.nav.method, de.nav.method, `${locale} nav is untranslated`);
    }
    assert.notEqual(dict.research.lead, de.research.lead, `${locale} research lead is untranslated`);
  }
});

test("dialect examples stay identical across locales; instructions get translated", () => {
  // The example list deliberately mixes two kinds of prompt. The dialect ones
  // are the thing being LEARNED — translating them would destroy the example.
  // The instruction one ("tell them I am late") is something the reader says
  // in their own language, so it must NOT stay German.
  const de = getDictionary("de");
  for (const locale of LOCALES) {
    const examples = getDictionary(locale).chat.examples;
    assert.equal(examples.length, de.chat.examples.length);
    assert.equal(examples[0], de.chat.examples[0], `${locale} translated a dialect example`);
    assert.equal(examples[2], de.chat.examples[2], `${locale} translated a dialect example`);
    if (locale !== "de") {
      assert.notEqual(examples[1], de.chat.examples[1], `${locale} left the instruction untranslated`);
    }
  }
});

test("Swiss Standard German uses no ß anywhere", () => {
  // The dialect gate rejects ß; the site around it must be coherent.
  const flat = JSON.stringify(getDictionary("de"));
  assert.equal(flat.includes("ß"), false, "ß found in the German dictionary");
});

test("negotiate prefers the reader's language and falls back to German", () => {
  assert.equal(negotiate("fr-CH,fr;q=0.9,en;q=0.8"), "fr");
  assert.equal(negotiate("it-IT,it;q=0.9"), "it");
  assert.equal(negotiate("en-US,en;q=0.9"), "en");
  assert.equal(negotiate("rm"), "rm");
  assert.equal(negotiate("es-ES,es;q=0.9"), DEFAULT_LOCALE, "an unsupported language falls back");
  assert.equal(negotiate(null), DEFAULT_LOCALE);
  assert.equal(negotiate(""), DEFAULT_LOCALE);
});

test("negotiate respects quality ordering rather than position", () => {
  assert.equal(negotiate("en;q=0.2,it;q=0.9"), "it");
});

test("isLocale rejects anything not offered", () => {
  assert.equal(isLocale("de"), true);
  assert.equal(isLocale("es"), false);
  assert.equal(isLocale(""), false);
  assert.equal(isLocale("DE"), false);
});

test("href never produces a double or trailing slash", () => {
  assert.equal(href("de", ""), "/de");
  assert.equal(href("fr", "method"), "/fr/method");
  for (const route of ROUTES) {
    for (const locale of LOCALES) {
      const path = href(locale, route.segment);
      assert.ok(!path.includes("//"), `${path} has a double slash`);
      assert.ok(!path.endsWith("/"), `${path} has a trailing slash`);
    }
  }
});

test("every navigable route has a label in every language", () => {
  for (const locale of LOCALES) {
    const dict = getDictionary(locale);
    for (const route of NAV_ROUTES) {
      assert.ok(dict.nav[route.key]?.length > 0, `${locale} has no label for ${route.key}`);
    }
  }
});

test("the portal is never in the sitemap", () => {
  // It is noindex. A sitemap that advertises it contradicts the page's own
  // robots meta, and search engines distrust both signals when they disagree.
  // Neither the portal nor settings: both are noindex, and both are personal.
  assert.ok(!INDEXED_ROUTES.some((r) => r.key === "portal"));
  assert.ok(!INDEXED_ROUTES.some((r) => r.key === "settings"));
  assert.equal(INDEXED_ROUTES.length, ROUTES.length - 2);
});

test("no English source copy from the provider list reaches a page", () => {
  // The provider `note` fields are maintainer copy. Rendering them put English
  // sentences into a German dropdown; anything a visitor reads comes from a
  // dictionary instead. This asserts the notes are not smuggled into one.
  for (const locale of LOCALES) {
    const flat = JSON.stringify(getDictionary(locale));
    for (const provider of BYOK_PROVIDERS) {
      assert.ok(!flat.includes(provider.note), `${locale} embeds ${provider.id}'s English note`);
    }
  }
});

test("every provider a visitor can choose is named in the allowlist", () => {
  // The dropdown renders labels only, so a provider with no label would be an
  // empty option the person cannot reason about.
  for (const provider of BYOK_PROVIDERS) assert.ok(provider.label.length > 0);
});

test("route segments are the same in every language", () => {
  // Translated URLs would break every shared link the moment a translation is
  // reworded. The content translates; the address does not.
  assert.deepEqual(
    ROUTES.map((r) => r.segment),
    ["", "check", "method", "research", "contribute", "about", "portal", "settings"],
  );
});
