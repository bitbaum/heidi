import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Nothing NAVIGATES through a route that only redirects.
 *
 * `/portal` used to be the signed-in dashboard. The dashboard moved back to
 * the locale root — `/` and `/portal` were rendering the identical page, which
 * is what made "start and chat show the same thing" a fair complaint — and the
 * old route stayed, answering 307, for bookmarks and for the sign-in return.
 *
 * Which is correct, and which is exactly why the links to it survived. Nothing
 * 404s, nothing throws, no type is wrong: every one of them still works, and
 * costs the reader who presses it a round trip to a Location header before the
 * page they wanted begins loading. It was four links — settings, the group
 * page, the vocabulary page and the auth error page — and it would have been
 * five the next time somebody wanted to link to "their space", because the
 * route is still in `ROUTES` and still autocompletes.
 *
 * THE ONE PLACE IT IS RIGHT is `signIn(..., { redirectTo })`. That is not
 * navigation: it is the URL the OAuth provider returns to, it is where the
 * session is established, and `/portal` exists precisely so that the return
 * has a stable address that does not change when the dashboard moves again.
 *
 * So the rule is not "never mention portal" — it is "mention it only as a
 * sign-in return". A source scan, for the reason `grammar.test.ts` gives: this
 * project has no jsdom, and what can be checked cheaply and exactly is whether
 * the files say the wrong thing.
 */

const ROOTS = ["app", "lib"];

/** The only expression allowed to name it, and what makes it allowed. */
const SIGN_IN_RETURN = /redirectTo:\s*href\([^)]*"portal"\)/;

/** Any other way a file can build the URL. */
const PORTAL_HREF = /href\(\s*\w+\s*,\s*"portal"\s*\)/g;

function sources(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) sources(path, found);
    else if ((entry.endsWith(".tsx") || entry.endsWith(".ts")) && !entry.endsWith(".test.ts")) found.push(path);
  }
  return found;
}

test("nothing links to `/portal` except the sign-in return", () => {
  for (const root of ROOTS) {
    for (const path of sources(root)) {
      const text = readFileSync(path, "utf8");

      for (const line of text.split("\n")) {
        const uses = line.match(PORTAL_HREF);
        if (!uses) continue;

        assert.ok(
          SIGN_IN_RETURN.test(line),
          `${path}: links to /portal, which only redirects — link to the locale root instead.\n  ${line.trim()}`,
        );
      }
    }
  }
});
