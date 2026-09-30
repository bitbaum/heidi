import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { NAV_GROUPS, NAV_ROUTES, navGroups } from "../../../lib/i18n/routes.ts";

/**
 * The desktop bar names some groups and folds others into panels, and it does
 * that by NAME — `group === "use"`, `group === "why" || group === "project"`.
 *
 * That is the right shape for the design and the wrong shape for growth: a
 * fifth group added to `NAV_GROUPS` matches none of those branches, so its
 * pages would simply not appear in the desktop header. Nothing else would
 * notice. The mobile sheet iterates the groups generically and would show
 * them, so the site would disagree with itself by viewport — the kind of bug
 * that survives review because whoever reviews it is on a laptop or a phone,
 * not both.
 *
 * A SOURCE SCAN, for the reason `overlays.test.ts` gives: this project has no
 * jsdom and no testing-library, and buying both to assert a branch exists
 * would spend heidi's zero-UI-dependency position on one test. What can be
 * checked cheaply and exactly is whether the file mentions every group at all.
 */
const HEADER = readFileSync(fileURLToPath(new URL("./site-header.tsx", import.meta.url)), "utf8");

describe("the desktop header", () => {
  test("accounts for every navigation group", () => {
    for (const group of NAV_GROUPS) {
      assert.ok(
        HEADER.includes(`"${group}"`),
        `site-header.tsx never mentions the "${group}" group, so its pages cannot reach the desktop bar`,
      );
    }
  });

  test("the bar does not grow past what the narrowest desktop fits", () => {
    /**
     * A PIXEL BUDGET, EXPRESSED AS A COUNT, because this project has no browser
     * to measure in and the failure mode is not subtle.
     *
     * Measured on the deployed site at 1024px — the narrowest width that still
     * shows the bar — the usable space for the nav is about 606px once the
     * brand and the real 226px account controls are paid for. The five `use`
     * links plus two panel triggers come to 562px in Russian, which is the
     * widest of the seven languages. One more link in this group is ~60-80px
     * and puts Russian, Romansh and French over, in the exact way that shipped
     * a sideways-scrolling header once already.
     *
     * So: a sixth thing to DO does not go in the bar. It goes in a panel, or
     * something else comes out. This test is here to make that a decision
     * somebody takes rather than a regression somebody ships.
     */
    const use = navGroups().find((g) => g.group === "use")?.routes ?? [];
    assert.ok(
      use.length <= 5,
      `the "use" group has ${use.length} routes; at 1024px in Russian the bar only fits five — put the next one in a panel`,
    );
  });

  test("every navigable route sits in a group the header renders", () => {
    // The other half: a route with a group that `navGroups()` does not return
    // is a page in the sitemap that no menu links to.
    const grouped = new Set(navGroups().flatMap(({ routes }) => routes.map((r) => r.key)));
    for (const route of NAV_ROUTES) {
      assert.ok(grouped.has(route.key), `${route.key} is navigable but reaches no menu`);
    }
  });

  test("the language sits left of the account, which keeps the corner", () => {
    const language = HEADER.indexOf("<LanguageSwitcher");
    const account = HEADER.indexOf("{account}");
    assert.ok(language > 0 && account > 0, "the header no longer renders both controls");
    assert.ok(language < account, "the account menu is the corner control; the language goes before it");
  });

  test("the row's dropdowns hang from the row, not from their own button", () => {
    // Anchored to its button, a panel is on screen only while that button is
    // the last in the row. Both have run off a phone's left edge that way.
    for (const file of ["./language-switcher.tsx", "./account-menu.tsx"]) {
      const src = readFileSync(fileURLToPath(new URL(file, import.meta.url)), "utf8");
      assert.doesNotMatch(src, /<div ref=\{\w+\} className="[^"]*\brelative\b/, `${file}: its wrapper must stay unpositioned`);
      assert.match(src, /absolute right-0 top-full/, `${file}: the panel anchors to the row's right edge`);
    }
  });
});
