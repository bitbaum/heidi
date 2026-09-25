import { test } from "node:test";
import assert from "node:assert/strict";
import { teamOverview } from "./overview.ts";
import { EMPTY_MODEL, lineKey } from "../practice/model.ts";

const askable = new Map([
  ["handover", new Set([0, 1])],
  ["pain", new Set([0, 1])],
]);
const sure = (scene: string) => ({
  ...EMPTY_MODEL,
  lines: { [lineKey(scene, 0)]: { asked: 3, missed: 0 }, [lineKey(scene, 1)]: { asked: 3, missed: 0 } },
});

test("a member who does not share shows nothing but their name", () => {
  const [row] = teamOverview(
    [{ actorId: "a", displayName: "Ana", shares: false, models: [sure("handover")], certificates: 2 }],
    ["handover"],
    askable,
  );
  assert.deepEqual(row, { actorId: "a", displayName: "Ana", state: "private" });
});

test("sharing without sync is 'cannot see', not 'has not started'", () => {
  const [row] = teamOverview([{ actorId: "b", displayName: "Ben", shares: true, models: [], certificates: 0 }], ["handover"], askable);
  assert.equal(row.state, "no-sync");
});

test("a sharing member shows a standing per focus situation — and nothing about which lines", () => {
  const [row] = teamOverview(
    [{ actorId: "c", displayName: "Cem", shares: true, models: [sure("handover")], certificates: 1 }],
    ["handover", "pain"],
    askable,
  );
  assert.equal(row.state, "shared");
  if (row.state !== "shared") return;
  assert.deepEqual(
    row.scenes.map((s) => [s.scene, s.standing]),
    [
      ["handover", "sure"],
      ["pain", "new"],
    ],
  );
  assert.equal(row.ready, 1);
  assert.ok(!JSON.stringify(row).includes("lines"), "no per-line evidence reaches the lead");
});

test("two devices count together for the lead as they do for the member", () => {
  const phone = { ...EMPTY_MODEL, lines: { [lineKey("pain", 0)]: { asked: 3, missed: 0 } } };
  const laptop = { ...EMPTY_MODEL, lines: { [lineKey("pain", 1)]: { asked: 3, missed: 0 } } };
  const [row] = teamOverview([{ actorId: "d", displayName: "Dua", shares: true, models: [phone, laptop], certificates: 0 }], ["pain"], askable);
  assert.equal(row.state === "shared" && row.scenes[0].standing, "sure");
});
