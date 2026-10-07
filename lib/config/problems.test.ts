import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getDictionary } from "../i18n/index.ts";
import { LOCALES } from "../i18n/locales.ts";
import { ROUTES } from "../i18n/routes.ts";
import { SCENES } from "../situations/display.ts";
import { PROBLEM_SCALES, problemHref, problemLinkLabel } from "./problems.ts";

/**
 * "What Heidi solves" is a promise on the home page, so the parts of it a
 * machine can check are checked: every card has words in every language,
 * every link lands on a page that exists, and no card's copy is orphaned.
 *
 * What a machine cannot check — that each `solution` describes something that
 * works today — is the honesty rule in `problems.ts`, held in review.
 */

const ROOT = join(import.meta.dirname, "..", "..");
const ITEMS = PROBLEM_SCALES.flatMap((scale) => scale.items);

test("every card id is used once", () => {
  const ids = ITEMS.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, `a card appears twice: ${ids.join(", ")}`);
  const scales = PROBLEM_SCALES.map((scale) => scale.id);
  assert.equal(new Set(scales).size, scales.length);
});

test("one person's moments come first, then society's, each a handful rather than a wall", () => {
  assert.deepEqual(
    PROBLEM_SCALES.map((scale) => scale.id),
    ["people", "society"],
  );
  for (const scale of PROBLEM_SCALES) {
    assert.ok(scale.items.length >= 4 && scale.items.length <= 6, `${scale.id} has ${scale.items.length} cards`);
  }
});

test("the dictionaries hold copy for exactly the cards the config shows", () => {
  // A card in the config without words is a blank box; words without a card
  // are copy somebody keeps translating for a page that never renders it.
  const configured = ITEMS.map((item) => item.id).sort();
  for (const locale of LOCALES) {
    const t = getDictionary(locale).home.problems;
    assert.deepEqual(Object.keys(t.items).sort(), configured, `${locale} has copy for a different set of cards`);
    assert.deepEqual(
      Object.keys(t.scales).sort(),
      PROBLEM_SCALES.map((scale) => scale.id).sort(),
      `${locale} has headings for a different set of groups`,
    );
  }
});

test("every card is written in every language, and translated rather than copied", () => {
  const de = getDictionary("de").home.problems;
  for (const locale of LOCALES) {
    const t = getDictionary(locale).home.problems;
    for (const field of ["title", "sub", "closing", "closingCta"] as const) {
      assert.ok(t[field].trim().length > 0, `${locale} problems.${field} is empty`);
    }
    for (const item of ITEMS) {
      const card = t.items[item.id];
      assert.ok(card.problem.trim().length > 0, `${locale} ${item.id} has no problem`);
      assert.ok(card.solution.trim().length > 0, `${locale} ${item.id} has no solution`);
      if (locale !== "de") {
        assert.notEqual(card.problem, de.items[item.id].problem, `${locale} ${item.id} problem is the German`);
        assert.notEqual(card.solution, de.items[item.id].solution, `${locale} ${item.id} solution is the German`);
      }
      assert.ok(problemLinkLabel(getDictionary(locale), item.link).trim().length > 0, `${locale} ${item.id} link has no label`);
    }
  }
});

test("every scene a card links to is a scene the site renders", () => {
  const scenes = new Set(SCENES.map((scene) => scene.id));
  for (const item of ITEMS) {
    if (item.link.kind !== "scene") continue;
    assert.ok(scenes.has(item.link.scene), `${item.id} links to a scene no pack has: ${item.link.scene}`);
  }
});

test("every route a card links to is a public page with a file behind it", () => {
  for (const item of ITEMS) {
    if (item.link.kind !== "route") continue;
    const key = item.link.route;
    const route = ROUTES.find((r) => r.key === key);
    assert.ok(route, `${item.id} links to a route that does not exist: ${key}`);
    // Signed-out visitors read this section; a personal or gated page would be
    // a locked door, and an unindexed one is usually a redirect.
    assert.ok(route.indexed, `${item.id} links to ${key}, which is not a public page`);
    const page = join(ROOT, "app", "[locale]", route.segment, "page.tsx");
    assert.ok(existsSync(page), `${item.id} links to ${key}, but ${page} does not exist`);
    if (item.link.hash) {
      assert.ok(
        readFileSync(page, "utf8").includes(`id="${item.link.hash}"`),
        `${item.id} links to #${item.link.hash} on ${key}, and that page has no such anchor`,
      );
    }
  }
});

test("every card's address is a clean path under its locale", () => {
  for (const locale of LOCALES) {
    for (const item of ITEMS) {
      const path = problemHref(locale, item.link);
      assert.ok(path.startsWith(`/${locale}/`), `${path} is not under /${locale}/`);
      assert.ok(!path.includes("//"), `${path} has a double slash`);
      assert.ok(!/\/(#|$)/.test(path), `${path} has a trailing slash`);
    }
  }
});
