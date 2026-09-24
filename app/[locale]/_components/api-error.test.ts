import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * The client speaks the reader's language, or it says nothing.
 *
 * `rule-check.tsx` wrote the rule down:
 *
 *   "Never the server's own string: those are written once, in English, for a
 *    log. This client speaks the reader's language or nothing."
 *
 * Three components obeyed it. Three call sites did not, and put the API's
 * English on the page of a seven-language site — including
 * "Check the meetingUrl: too long.", which names a JSON key at a learner.
 * `topic-board.tsx` did it both ways in the same file, ninety lines apart.
 *
 * A rule with no mechanism behind it is a comment, and this is the mechanism.
 * The point is not that `data.error` is forbidden forever — it is that a
 * component showing a server string has to argue for it in the allow-list
 * below, where the next reader can see the argument.
 */

/** Files permitted to read a server-sent message, and why. Currently none. */
const MAY_SHOW_SERVER_TEXT = new Set<string>();

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

describe("error messages reach the reader in their own language", () => {
  test("no component renders a message the server wrote", () => {
    const root = join("app", "[locale]");
    const offences: string[] = [];

    for (const path of tsxUnder(root)) {
      const rel = path.slice(root.length + 1);
      if (MAY_SHOW_SERVER_TEXT.has(rel)) continue;

      for (const [i, line] of readFileSync(path, "utf8").split("\n").entries()) {
        const code = line.split("//")[0];
        // Reading the shape, or using what was read.
        if (/\{\s*error\?:\s*string\s*\}/.test(code) || /\bdata\.error\b/.test(code)) {
          offences.push(`${rel}:${i + 1}  ${line.trim().slice(0, 90)}`);
        }
      }
    }

    assert.deepEqual(
      offences,
      [],
      `these put the server's own words on the page:\n\n  ${offences.join("\n  ")}\n\n` +
        `Map the status to a dictionary string instead — see \`apiErrorMessage\`.`,
    );
  });
});
