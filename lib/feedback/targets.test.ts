import { test } from "node:test";
import assert from "node:assert/strict";
import { changelogEntryId, roadmapItemId } from "bip-kit";
import { ROADMAP } from "../config/roadmap.ts";
import { CHANGELOG } from "../config/changelog.ts";
import { CHANGELOG_TARGETS, ROADMAP_TARGETS, isFeedbackTarget, withChangelogIds } from "./targets.ts";

test("every roadmap item has an explicit id, and both languages share it", () => {
  // Without an id an item is keyed by its title, so the German and English
  // versions would collect two tallies and a rename would reset the votes.
  const ids = (lang: "de" | "en") => ROADMAP[lang].buckets.flatMap((b) => b.items.map((i) => i.id));
  assert.ok(ids("de").every(Boolean), "a roadmap item without an id");
  assert.deepEqual(ids("de"), ids("en"));
  assert.equal(new Set(ids("de")).size, ids("de").length, "two items share an id");
  assert.deepEqual(ROADMAP_TARGETS, ROADMAP.en.buckets.flatMap((b) => b.items.map(roadmapItemId)));
});

test("changelog ids are the same in both languages", () => {
  assert.deepEqual(withChangelogIds(CHANGELOG.en).map(changelogEntryId), CHANGELOG_TARGETS);
  assert.equal(new Set(CHANGELOG_TARGETS).size, CHANGELOG_TARGETS.length);
});

test("adding an entry on top does not move the comments of the ones below", () => {
  const base = [
    { date: "2026-09-25", tag: "feature" as const, title: "B", summary: "" },
    { date: "2026-09-25", tag: "fix" as const, title: "A", summary: "" },
  ];
  const before = withChangelogIds(base).map((e) => e.id);
  const after = withChangelogIds([{ ...base[0], title: "C" }, ...base]).map((e) => e.id);
  assert.deepEqual(after.slice(1), before);
});

test("only published things can be voted on", () => {
  assert.equal(isFeedbackTarget("roadmap:teams"), true);
  assert.equal(isFeedbackTarget("roadmap:anything-i-like"), false);
  assert.equal(isFeedbackTarget(CHANGELOG_TARGETS[0]), true);
});
