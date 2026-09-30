import { test } from "node:test";
import assert from "node:assert/strict";
import { PACK_ITEMS } from "./published.ts";
import { recallItems } from "./kinds/recall.ts";
import { answerOf, questionOf } from "./answer.ts";

test("every question can be quoted to Heidi, with its answer", () => {
  // "Heidi fragen, warum" sends both. An empty quote would be a message that
  // asks about nothing.
  const kept = recallItems([{ target: "däm", bridge: "diesem", savedAt: "2026-09-30T10:00:00Z" }]);
  for (const item of [...PACK_ITEMS, ...kept]) {
    assert.ok(questionOf(item).trim(), `${item.id}: no question`);
    assert.ok(answerOf(item).trim(), `${item.id}: no answer`);
  }
});
