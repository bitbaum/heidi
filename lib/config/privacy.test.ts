import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { BROUGHT_KEY_VENDORS, FLOWS, MODEL_VENDORS, NOT_DONE } from "./privacy.ts";
import { BYOK_PROVIDERS } from "../domain/model/providers.ts";
import { STORAGE_KEY_PATTERN } from "../browser/stores.ts";

/**
 * A privacy page is only worth having if it is true, and it is the page most
 * likely to stop being true without anyone noticing.
 *
 * The settings page already proved it: it told readers their conversation
 * "disappears when you close the tab" — it is in `localStorage` and survives —
 * and that nothing of it is on our servers, which is false once they sign in.
 * Nobody wrote that in bad faith; it was true when it was written.
 *
 * These are the claims that can rot, tied to the code that would rot them.
 */

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === "node_modules" || e.name === ".next" || e.name === ".git") return [];
    const full = join(dir, e.name);
    if (e.isDirectory()) return sources(full);
    return /\.tsx?$/.test(e.name) ? [full] : [];
  });
}

describe("the claims that must stay true", () => {
  test("there is still no analytics, advertising or tracking", () => {
    /**
     * The page says this in so many words. It is unusual enough to be worth
     * saying, and cheap enough for a reader to check — so it has to be kept,
     * not just asserted once.
     *
     * A source scan, because the honest question is whether any such script
     * exists ANYWHERE in what ships, not whether one module imports one.
     */
    const files = [...sources(join(ROOT, "app")), ...sources(join(ROOT, "lib"))].filter(
      (f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx"),
    );

    const TRACKERS =
      /\b(gtag|googletagmanager|google-analytics|plausible\.io|posthog|mixpanel|segment\.com|matomo|fathom|hotjar|fbq|clarity\.ms)\b/i;

    const offenders = files.filter((f) => TRACKERS.test(readFileSync(f, "utf8")));
    assert.deepEqual(
      offenders.map((f) => f.slice(ROOT.length)),
      [],
      "the privacy page claims there is no analytics — something here disagrees",
    );
    assert.ok(NOT_DONE.includes("analytics"));
  });

  test("every flow points at something a reader could verify", () => {
    for (const flow of FLOWS) {
      assert.ok(flow.where.trim().length > 0, `${flow.id} does not say where it lives`);
      // A flow that stays on the device cannot have recipients; one that
      // leaves without naming any is the shape of an undisclosed transfer.
      if (!flow.leavesDevice) {
        assert.deepEqual(flow.recipients, [], `${flow.id} never leaves the device but names recipients`);
      }
    }
  });

  test("the browser-storage flows name keys the code actually uses", () => {
    /**
     * The page prints the storage key so a reader can open their own dev tools
     * and check. A key that has been renamed makes that invitation a dead end.
     */
    const code = [...sources(join(ROOT, "app")), ...sources(join(ROOT, "lib"))]
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");

    for (const flow of FLOWS) {
      const key = flow.where.match(STORAGE_KEY_PATTERN)?.[0];
      if (!key) continue;
      assert.ok(code.includes(`"${key}"`), `the page names ${key}, which no longer appears in the code`);
    }
  });

  test("the brought-key vendors are the allowlist, not a second copy of it", () => {
    // Naming a vendor the allowlist does not contain would promise a choice
    // that the request-forgery guard in `providers.ts` refuses to honour.
    assert.deepEqual([...BROUGHT_KEY_VENDORS].sort(), BYOK_PROVIDERS.map((p) => p.label).sort());
    assert.ok(BROUGHT_KEY_VENDORS.length >= 3);
  });

  test("the free chain's vendors are all disclosed", () => {
    /**
     * Pinned rather than derived at runtime, because `freeChain` reads env to
     * decide which links are USABLE and the page must name everyone who could
     * receive a message on any deployment — not just whoever has a key today.
     * If ai-kit's declared chain grows, this fails and the page gets updated,
     * which is the entire point.
     */
    assert.deepEqual([...MODEL_VENDORS], ["Groq", "Google", "OpenRouter"]);
  });
});
