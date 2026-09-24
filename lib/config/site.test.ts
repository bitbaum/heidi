import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { CONTACT_EMAIL, OPERATOR, SITE_URL } from "./site.ts";

/**
 * The address a legal notice publishes has to be one that receives mail.
 *
 * WHAT THIS EXISTS FOR. `CONTACT_EMAIL` was `heidi@fleetcrown.orangecat.ch`
 * for months. `fleetcrown.orangecat.ch` is the fleet's verified SENDER domain
 * and has no MX record at all — `dig MX fleetcrown.orangecat.ch` returns
 * nothing — so every message sent to it bounced. It was published on the
 * legal notice, the privacy page, the contribute page and the data room: the
 * four pages whose entire purpose is being reachable.
 *
 * Nothing failed. No test went red, no page 404'd, no log filled up. A
 * send-only domain looks exactly like a working one from inside the
 * repository, which is why this check is about the DOMAIN rather than about
 * the string being non-empty.
 *
 * WHY AN ALLOW-LIST RATHER THAN A DNS LOOKUP. A test that resolves MX records
 * fails on a plane, in CI without egress, and whenever the resolver is slow —
 * and a flaky test about contact details is a test somebody deletes. The
 * allow-list encodes the fact that was checked by hand, with the command to
 * re-check it in the comment. Adding a domain here is then a deliberate act
 * that requires running `dig` first.
 */

/**
 * Domains verified to accept mail, and how that was verified.
 *
 *   orangecat.ch   `dig +short MX orangecat.ch` → 5 mta-gw.infomaniak.ch.
 *                  Checked 2026-09-24.
 *
 * Deliberately NOT here: every `*.orangecat.ch` subdomain. The fleet's
 * sending domains live under subdomains and none of them has an MX record.
 * That is the whole bug this file is about.
 */
const RECEIVES_MAIL = ["orangecat.ch"];

describe("the site's own identity", () => {
  test("the contact address is on a domain that accepts mail", () => {
    const domain = CONTACT_EMAIL.split("@")[1];
    assert.ok(domain, `${CONTACT_EMAIL} has no domain`);
    assert.ok(
      RECEIVES_MAIL.includes(domain),
      `${CONTACT_EMAIL} is on "${domain}", which is not known to accept mail. ` +
        `Run \`dig +short MX ${domain}\` — if it answers, add it to RECEIVES_MAIL with the date.`,
    );
  });

  test("no page writes an address out instead of importing the constant", () => {
    /**
     * The duplication that hid the bug. `organisations/page.tsx` and
     * `roles.ts` each had `cato@orangecat.ch` written in by hand, so the site
     * published TWO different contact addresses and `site.ts` was authoritative
     * for neither. The irony was that the `MailLink` component next to one of
     * them carries a comment about why a second copy is dangerous.
     */
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        if (entry === "node_modules" || entry === ".next") continue;
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".test.ts")) files.push(path);
      }
    };
    walk("app");
    walk("lib");

    for (const path of files) {
      // `site.ts` is where it is allowed to be written down.
      if (path.endsWith(join("lib", "config", "site.ts"))) continue;
      const text = readFileSync(path, "utf8");

      for (const [index, line] of text.split("\n").entries()) {
        // A doc comment may discuss the old address; only real code counts.
        const code = line.split("//")[0];
        if (!/@[a-z0-9.-]*orangecat\.ch/.test(code)) continue;
        assert.fail(
          `${path}:${index + 1} writes an address instead of importing CONTACT_EMAIL\n  ${line.trim()}`,
        );
      }
    }
  });

  test("the origin has no trailing slash, because everything concatenates onto it", () => {
    assert.ok(SITE_URL.startsWith("https://"), "the canonical origin should be https");
    assert.ok(!SITE_URL.endsWith("/"), `${SITE_URL} would produce a double slash in every built URL`);
  });

  test("the operator is named", () => {
    // A legal notice naming nobody is the first thing a careful reader notices.
    assert.ok(OPERATOR.trim().length > 0);
  });
});
