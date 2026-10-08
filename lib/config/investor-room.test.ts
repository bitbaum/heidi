import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { investorRoomContent, isoDate, ROOM_HEADLINE } from "./investor-room.ts";
import { METRICS, SECTIONS } from "./investors.ts";

/**
 * The room on OrangeCat is filled from `investors.ts`, so it must fit what the
 * room accepts (OrangeCat src/config/project-room.ts) — a payload it rejects is
 * a room that silently stays on its last version.
 */
describe("Heidi's investor room payload", () => {
  const room = investorRoomContent();

  test("carries every section and every number, dated", () => {
    assert.equal(room.sections.length, SECTIONS.length);
    assert.equal(room.metrics.length, METRICS.length);
    assert.match(room.metrics_as_of, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(isoDate("1 October 2026"), "2026-10-01");
  });

  test("fits OrangeCat's room limits", () => {
    assert.ok(ROOM_HEADLINE.length <= 200);
    assert.ok(room.sections.length <= 12);
    assert.ok(room.metrics.length <= 16);
    assert.ok(room.documents.length <= 20);
    for (const s of room.sections) assert.ok(s.title.length <= 80 && s.body.length <= 6000, s.title);
    for (const m of room.metrics) {
      assert.ok(m.label.length <= 120 && m.value.length <= 120 && m.verify.length <= 120, m.label);
    }
    for (const d of room.documents) {
      assert.ok(d.title.length <= 120, d.title);
      assert.match(d.url, /^https:\/\//, d.url);
    }
  });

  test("lists each document once", () => {
    const urls = room.documents.map((d) => d.url);
    assert.equal(new Set(urls).size, urls.length);
  });
});
