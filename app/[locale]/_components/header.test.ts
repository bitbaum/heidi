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

  test("every navigable route sits in a group the header renders", () => {
    // The other half: a route with a group that `navGroups()` does not return
    // is a page in the sitemap that no menu links to.
    const grouped = new Set(navGroups().flatMap(({ routes }) => routes.map((r) => r.key)));
    for (const route of NAV_ROUTES) {
      assert.ok(grouped.has(route.key), `${route.key} is navigable but reaches no menu`);
    }
  });
});
