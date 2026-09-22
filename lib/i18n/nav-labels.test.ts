import { test } from "node:test";
import assert from "node:assert/strict";
import { getDictionary } from "./index.ts";
import { LOCALES } from "./locales.ts";
import { NAV_GROUPS, NAV_ROUTES, type NavGroup } from "./routes.ts";

/**
 * A menu may not say the same word twice.
 *
 * WHY THIS FILE EXISTS. The English header had a dropdown headed "Practise"
 * whose first entry was "Practise", which is what a reader sees as the product
 * not knowing what its own pages are called. It was reported from the screen,
 * which is the only place it was visible: every type checked, every test
 * passed, and both strings were individually correct.
 *
 * It was not one slip either. FIVE of the seven locales had the identical
 * collision — de, en, fr, gsw, rm all had a route label equal to its own
 * group's label — because the group was named with the verb and the page was
 * named with the same verb. Fixing the English one would have left four.
 *
 * So the class ends here rather than the instance. Two rules, both about what
 * a person can actually distinguish in a menu:
 *
 *   1. No route may be labelled the same as the group it sits in.
 *   2. No two routes in one group may share a label.
 *
 * Deliberately NOT a rule: two routes in DIFFERENT groups sharing a label.
 * That is legitimate — the same word can head a section and name an unrelated
 * page — and a check that forbade it would be a check people route around.
 */

/** How a reader compares two labels: not by bytes. */
function normalise(label: string): string {
  return label.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

const GROUP_LABEL: Record<NavGroup, "groupUse" | "groupLearn" | "groupPractise" | "groupAbout"> = {
  use: "groupUse",
  learn: "groupLearn",
  practise: "groupPractise",
  about: "groupAbout",
};

test("no page is labelled the same as the menu it sits in", () => {
  for (const locale of LOCALES) {
    const nav = getDictionary(locale).nav;

    for (const group of NAV_GROUPS) {
      const heading = normalise(nav[GROUP_LABEL[group]]);

      for (const route of NAV_ROUTES.filter((r) => r.group === group)) {
        const label = normalise(nav[route.key as keyof typeof nav] as string);
        assert.notEqual(
          label,
          heading,
          `${locale}: "${nav[route.key as keyof typeof nav]}" is both the ${group} menu's name and a page inside it`,
        );
      }
    }
  }
});

test("no two pages in one menu share a label", () => {
  for (const locale of LOCALES) {
    const nav = getDictionary(locale).nav;

    for (const group of NAV_GROUPS) {
      const seen = new Map<string, string>();

      for (const route of NAV_ROUTES.filter((r) => r.group === group)) {
        const raw = nav[route.key as keyof typeof nav] as string;
        const label = normalise(raw);
        const already = seen.get(label);
        assert.equal(already, undefined, `${locale}: ${group} lists "${raw}" twice — as ${already} and as ${route.key}`);
        seen.set(label, route.key);
      }
    }
  }
});

test("every navigable route actually has a label in every locale", () => {
  // The two checks above pass trivially against an undefined label, which
  // would then render as nothing at all in the menu.
  for (const locale of LOCALES) {
    const nav = getDictionary(locale).nav;
    for (const route of NAV_ROUTES) {
      const label = nav[route.key as keyof typeof nav];
      assert.equal(typeof label, "string", `${locale}: ${route.key} has no label`);
      assert.ok((label as string).trim().length > 0, `${locale}: ${route.key} has an empty label`);
    }
  }
});

/**
 * Pages whose heading is their NAME rather than a headline.
 *
 * THE DISTINCTION, because it is the whole reason this is a list and not a
 * rule over every page. Most pages here open with an editorial line — the
 * situations page is headed "Where you need it", `/contribute` with "We are
 * looking for Zurich voices" — and those SHOULD differ from a four-character
 * menu label. A headline is not a second name.
 *
 * These two are not that. `/practice` was headed "Practise" while the menu
 * called it "Exercises", and `/essays` was headed "Reading" while the menu
 * called it "Blog" — in all seven languages, two plain nouns for one page,
 * neither of them a headline. The second one had already been reported once
 * ("lesen under über heidi? are you referring to the blog? then call it
 * blog") and was fixed in the menu only, which is how a page ends up
 * disagreeing with the link that got you there.
 *
 * Adding a page here is a decision that its heading is a name. Leaving one out
 * is a decision that its heading is writing.
 */
const NAMED_PAGES = ["practice", "essays"] as const;

test("a page whose heading is its name uses the name the menu uses", () => {
  for (const locale of LOCALES) {
    const dict = getDictionary(locale);

    for (const key of NAMED_PAGES) {
      const heading = (dict[key] as { title: string }).title;
      const label = dict.nav[key];
      assert.equal(
        normalise(heading),
        normalise(label),
        `${locale}: the menu says "${label}" and the page says "${heading}"`,
      );
    }
  }
});
