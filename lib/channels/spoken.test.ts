import { test } from "node:test";
import assert from "node:assert/strict";
import { spokenFor } from "./spoken.ts";

test("a show followed by its feed is known by its name on the publisher's domain", () => {
  const feed = "https://www.srf.ch/feed/podcast/hd/1a2b3c4d.xml";
  assert.equal(spokenFor("https://www.srf.ch/audio/input?id=x", null, { name: "Input", feedUrl: feed }), "dialect");
  assert.equal(spokenFor(feed, null, { name: "input ", feedUrl: feed }), "dialect", "case and spaces do not matter");
});

test("the same name from another publisher is not the register's show", () => {
  assert.equal(spokenFor("https://example.com/input", null, { name: "Input", feedUrl: "https://example.com/feed.xml" }), null);
});

test("the row pressed and the exact address still decide first", () => {
  assert.equal(spokenFor("https://anything.test/x", "input"), "dialect");
  assert.equal(spokenFor("https://www.srf.ch/audio/input", null), "dialect");
});
