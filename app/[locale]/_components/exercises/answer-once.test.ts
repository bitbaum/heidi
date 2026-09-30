import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * One tap is one answer.
 *
 * THE DEFECT THIS PINS. A card's "Gewusst" called `onRecall` AND `onAnswer`.
 * The practice session records a recall answer as an answer, so every card
 * was counted twice — two history writes, two model observations — and the
 * sitting advanced two places, skipping the question after the card unseen.
 * Nothing looked broken: the counter just said 4/8 where it had said 2/8.
 *
 * `onRecall` replaces `onAnswer` (`view.ts`). So a handler in a view may call
 * both only on different branches — the reveal view's `if recall … else …`.
 */

const dir = fileURLToPath(new URL(".", import.meta.url));

function handlerBodies(source: string): string[] {
  const bodies: string[] = [];
  for (const match of source.matchAll(/function \w+\([^)]*\)\s*\{/g)) {
    let depth = 1;
    let i = match.index + match[0].length;
    const start = i;
    while (depth > 0 && i < source.length) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") depth--;
      i++;
    }
    bodies.push(source.slice(start, i - 1));
  }
  return bodies;
}

test("no exercise view reports one answer through both onRecall and onAnswer", () => {
  const offenders: string[] = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
    const source = readFileSync(join(dir, file), "utf8");
    for (const body of handlerBodies(source)) {
      const recall = body.indexOf("onRecall(");
      const answer = body.indexOf("onAnswer(");
      if (recall < 0 || answer < 0) continue;
      const between = body.slice(Math.min(recall, answer), Math.max(recall, answer));
      if (!/\belse\b/.test(between)) offenders.push(`${file}: ${body.trim().slice(0, 80)}`);
    }
  }
  assert.deepEqual(offenders, []);
});
