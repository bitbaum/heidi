import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Nothing opens over the page with its own dismiss logic.
 *
 * THE DEFECT THIS PINS. Escape-to-close and click-outside-to-close were written
 * twice, independently, and the two copies disagreed: `nav-panel` returned
 * focus to its trigger and listened in the capture phase, `language-switcher`
 * did neither. A keyboard user who dismissed the language menu lost their place
 * in the page and their next Tab restarted at the skip link. Both files passed
 * review, nothing failed, and the defect was invisible to anyone using a mouse.
 *
 * Two more surfaces then wanted the same three behaviours — the account menu
 * and the chat dock — which is the point at which a third copy stops being a
 * shortcut and becomes a policy. `useDismiss` is the one implementation. This
 * test is what keeps it the only one.
 *
 * A SOURCE SCAN, and deliberately so. The project has no jsdom and no
 * testing-library, and buying both to assert that a keydown listener exists
 * would spend heidi's zero-UI-dependency position on one test. What can be
 * checked cheaply and exactly is the thing that actually regressed: whether a
 * component reaches for `document.addEventListener` on its own.
 */

// fileURLToPath, not `.pathname`: the route segment is a literal `[locale]`
// directory on disk, and a URL percent-encodes the brackets.
const COMPONENTS = fileURLToPath(new URL("./", import.meta.url));
const HOOK = join(COMPONENTS, "use-dismiss.ts");

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return sources(full);
    return e.name.endsWith(".tsx") || e.name.endsWith(".ts") ? [full] : [];
  });
}

describe("overlays share one dismiss implementation", () => {
  test("only the hook listens on the document for Escape or an outside pointer", () => {
    const offenders = sources(COMPONENTS)
      .filter((file) => file !== HOOK && !file.endsWith(".test.ts"))
      .filter((file) => {
        const src = readFileSync(file, "utf8");

        /**
         * `document` AND `window`, because they are the same hole.
         *
         * This matched only `document.` and a global keydown handler written
         * on `window` therefore passed it — not by argument but by spelling,
         * which is how a guard quietly stops covering the thing it names.
         *
         * What is forbidden is DISMISSAL, not the keyboard. The pointer family
         * bound globally has one purpose here — closing on a click outside —
         * so it is always an offender. A global `keydown` is only dismissal
         * when it is watching for Escape; `use-dictation` binds keys for
         * recording and `practice-session` binds digits to answer a question,
         * and neither has anything to do with closing a panel.
         */
        const target = String.raw`(?:document|window)\.addEventListener\(\s*["']`;
        const bindsPointer = new RegExp(`${target}(pointerdown|mousedown|click)["']`).test(src);
        const bindsKeys = new RegExp(`${target}keydown["']`).test(src);
        return bindsPointer || (bindsKeys && src.includes("Escape"));
      });

    assert.deepEqual(
      offenders.map((f) => f.slice(COMPONENTS.length)),
      [],
      "these components hand-roll dismissal instead of using useDismiss — see the note in use-dismiss.ts",
    );
  });

  test("every component that opens a panel actually uses the hook", () => {
    // `aria-expanded` is the marker: a control that claims to expand something
    // is a disclosure, and a disclosure that cannot be dismissed is the bug.
    const disclosures = sources(COMPONENTS).filter((file) => {
      if (file.endsWith(".test.ts")) return false;
      return readFileSync(file, "utf8").includes("aria-expanded");
    });

    assert.ok(disclosures.length >= 3, "expected several disclosures in the header and the dock");

    for (const file of disclosures) {
      const src = readFileSync(file, "utf8");
      assert.match(
        src,
        /useDismiss\(/,
        `${file.slice(COMPONENTS.length)} renders aria-expanded but never calls useDismiss — Escape will not close it`,
      );
    }
  });

  test("the hook restores focus when Escape closes a panel", () => {
    // The half that was missing from one of the two originals, and the half
    // nobody notices is gone. Asserted on the source because the alternative is
    // a DOM the project has no runtime for.
    const src = readFileSync(HOOK, "utf8");
    assert.match(
      src,
      /if \(event\.key !== "Escape"\) return;\s*\n\s*onDismiss\(\);\s*\n\s*focusRef\?\.current\?\.focus\(\);/,
      "Escape must both dismiss and return focus to the trigger",
    );
  });
});
