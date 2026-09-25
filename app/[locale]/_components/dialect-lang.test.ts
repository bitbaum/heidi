import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Dialect text has to SAY it is dialect, not merely be coloured like it.
 *
 * `text-dialect` is how this site renders a line of Zurich German, and
 * `lang` is how it tells a screen reader to switch phonology. They are two
 * halves of one decision and they were being made separately: 20 elements
 * paired them and 5 did not, so on five surfaces a dialect line was painted
 * as dialect and then read aloud in the page's own language — the exact
 * confusion the variety field exists to remove.
 *
 * The clearest one was `chat/answer-view.tsx`, which carried a comment
 * explaining that a bridge line "is not coloured or tagged as dialect" —
 * above an element that set the colour conditionally and the language never.
 * The rule was written down and not implemented, which is the failure mode a
 * comment cannot catch and a test can.
 *
 * WHY A SOURCE SCAN. The same reason `header.test.ts` gives: there is no jsdom
 * here, and buying a renderer to assert an attribute exists would cost more
 * than it returns. This reads the JSX the way a reviewer does, and it is
 * deliberately shallow — see DECORATION.
 */

/**
 * Where `text-dialect` is a COLOUR and not a claim about language.
 *
 * Each entry is a judgement someone made once, written down so the next
 * person does not have to make it again. Adding to this list should feel
 * like a decision, because it is one: the question is always "would a screen
 * reader be wrong to switch here?"
 *
 *   technology/page.tsx   The word-error-rate NUMBER, set in the dialect
 *                         colour because it is the dialect's score. "14%" is
 *                         not a Swiss German word.
 *   site-header.tsx       A nav link is coloured to mark the areas Heidi
 *                         teaches. The label is the area's own name and is
 *                         tagged where the name is the CONTENT, on the
 *                         dialect pages; in the bar it is chrome.
 */
const DECORATION = new Set(["technology/page.tsx", "_components/site-header.tsx"]);

function tsxUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...tsxUnder(path));
    else if (entry.endsWith(".tsx")) out.push(path);
  }
  return out;
}

describe("dialect text is marked as dialect", () => {
  test("every element styled `text-dialect` also declares its language", () => {
    const root = join("app", "[locale]");
    const offences: string[] = [];

    for (const path of tsxUnder(root)) {
      const rel = path.slice(root.length + 1);
      if (DECORATION.has(rel)) continue;
      const text = readFileSync(path, "utf8");

      for (const match of text.matchAll(/text-dialect/g)) {
        // Walk back to the opening `<` of the element this class belongs to,
        // and forward to the `>` that closes its attribute list.
        const open = text.lastIndexOf("<", match.index);
        if (open === -1) continue;
        const close = text.indexOf(">", match.index);
        const tag = close === -1 ? text.slice(open) : text.slice(open, close + 1);

        // A className constant rather than an element — the user carries lang.
        if (!/^<[A-Za-z]/.test(tag)) continue;
        if (/\blang\b/.test(tag)) continue;

        // The element may be a wrapper whose CHILDREN each declare their own,
        // which `choice.tsx` does deliberately for a mixed line.
        const body = text.slice(close + 1, close + 400);
        if (/<[a-z]+[^>]*\blang\b/.test(body)) continue;

        const line = text.slice(0, match.index).split("\n").length;
        offences.push(`${rel}:${line}\n    ${tag.replace(/\s+/g, " ").trim().slice(0, 100)}`);
      }
    }

    assert.deepEqual(
      offences,
      [],
      `dialect-coloured text with no language declared:\n\n  ${offences.join("\n  ")}\n\n` +
        `Add \`lang={DISPLAY.tag}\` — or, if this is colour rather than language, ` +
        `add the file to DECORATION with the reason.`,
    );
  });
});
