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

test("the recap names the Zurich side and the German side, never one for the other", async () => {
  const { recapOf } = await import("./answer.ts");
  const kept = recallItems([{ target: "däm", bridge: "diesem", savedAt: "2026-09-30T10:00:00Z" }]);
  for (const item of [...PACK_ITEMS, ...kept]) {
    const { dialect } = recapOf(item);
    assert.ok(dialect.trim(), `${item.id}: no dialect side`);
  }
  const meaning = PACK_ITEMS.find((item) => item.kind === "meaning" && "optionsIn" in item && item.optionsIn === "bridge");
  assert.ok(meaning && meaning.kind === "meaning");
  const recap = recapOf(meaning);
  assert.equal(recap.german, answerOf(meaning));
  assert.notEqual(recap.dialect, recap.german);
  assert.deepEqual(recapOf(kept[0]), { dialect: "däm", german: "diesem" });
});
