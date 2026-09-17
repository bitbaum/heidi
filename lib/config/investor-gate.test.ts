import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { investorPasswordConfigured, isInvestorPassword } from "./investor-gate.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

describe("the data room's lock", () => {
  test("an unconfigured deployment is CLOSED, not open", () => {
    /**
     * The failure this prevents is the one that looks like working software:
     * a default password in an open-source repository is not a lock, and
     * everybody believes there is one. No password set means nobody gets in.
     */
    assert.equal(investorPasswordConfigured({}), false);
    assert.equal(isInvestorPassword("anything", {}), false);
    assert.equal(isInvestorPassword("", {}), false);
    assert.equal(isInvestorPassword("aaaaaa11", {}), false);
  });

  test("it accepts the configured password and nothing else", () => {
    const env = { HEIDI_INVESTOR_PASSWORD: "correct horse" };
    assert.equal(isInvestorPassword("correct horse", env), true);
    assert.equal(isInvestorPassword("correct hors", env), false);
    assert.equal(isInvestorPassword("correct horsee", env), false);
    assert.equal(isInvestorPassword("CORRECT HORSE", env), false);
    assert.equal(isInvestorPassword("", env), false);
  });

  test("a non-string attempt is refused rather than coerced", () => {
    const env = { HEIDI_INVESTOR_PASSWORD: "x" };
    // A form can post anything; `String(null)` is "null", which is a password.
    assert.equal(isInvestorPassword(null, env), false);
    assert.equal(isInvestorPassword(undefined, env), false);
    assert.equal(isInvestorPassword(["x"], env), false);
    assert.equal(isInvestorPassword({}, env), false);
  });

  test("no password is committed to this public repository", () => {
    /**
     * The whole point. `bitbaum/heidi` is public and MIT, so a password in a
     * source file is a published password — and the page would still look
     * locked, which is the worst of both.
     *
     * Scans for an assignment of the env var to a literal, and for the
     * placeholder that was discussed in chat, which is exactly the string most
     * likely to be pasted in "just for now".
     */
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if ([".git", "node_modules", ".next"].includes(e.name)) continue;
        const full = join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (/\.(ts|tsx|json|mjs|yml|yaml|env.*)$/.test(e.name)) files.push(full);
      }
    };
    walk(join(ROOT, "lib"));
    walk(join(ROOT, "app"));
    walk(join(ROOT, ".github"));

    for (const file of files) {
      if (file.endsWith("investor-gate.test.ts")) continue;
      const src = readFileSync(file, "utf8");
      assert.ok(
        !/HEIDI_INVESTOR_PASSWORD\s*[=:]\s*["'][^"']+["']/.test(src),
        `${file.slice(ROOT.length)} assigns the investor password a literal value`,
      );
      assert.ok(!src.includes("aaaaaa11"), `${file.slice(ROOT.length)} contains a password placeholder`);
    }
  });
});
