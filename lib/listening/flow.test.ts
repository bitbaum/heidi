import { test } from "node:test";
import assert from "node:assert/strict";
import { demand, eligible, flow, byMedium } from "./flow.ts";
import { LISTENING_SOURCES, type ListeningSource } from "./sources.ts";

const source = (over: Partial<ListeningSource> = {}): ListeningSource => ({
  id: "x",
  name: "X",
  publisher: "P",
  medium: "podcast",
  url: "https://example.ch/x",
  linkKind: "play",
  spoken: "dialect",
  basis: "format",
  topics: ["everyday"],
  voices: "few",
  scripted: false,
  subtitles: "none",
  reach: "open",
  checked: "2026-09-17",
  ...over,
});

test("demand rises with the number of voices", () => {
  const one = demand(source({ voices: "one" }));
  const few = demand(source({ voices: "few" }));
  const many = demand(source({ voices: "many" }));
  assert.ok(one < few, "one voice should be easier than two");
  assert.ok(few < many, "a panel should be harder than an interview");
});

test("publisher subtitles make something easier; machine subtitles do not", () => {
  const none = demand(source({ subtitles: "none" }));
  const auto = demand(source({ subtitles: "auto" }));
  const standard = demand(source({ subtitles: "standard" }));
  assert.equal(auto, none, "machine subtitles are wrong often enough to be no help");
  assert.ok(standard < none);
});

test("demand stays inside its scale however the weights are added up", () => {
  const easiest = demand(source({ voices: "one", scripted: true, subtitles: "standard", spoken: "standard" }));
  const hardest = demand(source({ voices: "many", scripted: false, subtitles: "none", spoken: "dialect" }));
  assert.equal(easiest, 1);
  assert.equal(hardest, 4);
  for (const s of LISTENING_SOURCES) {
    const d = demand(s);
    assert.ok(d >= 1 && d <= 4, `${s.id} scored ${d}`);
  }
});

test("the register's own extremes come out in the right order", () => {
  // Named rows rather than synthetic ones: this is the assertion that the
  // weights describe the real world and not just themselves.
  const byId = (id: string) => {
    const found = LISTENING_SOURCES.find((s) => s.id === id);
    assert.ok(found, `${id} is no longer in the register`);
    return found;
  };
  assert.ok(
    demand(byId("chindermusigwaelt")) < demand(byId("arena")),
    "children's songs should not rank harder than a six-way political panel",
  );
  assert.ok(demand(byId("zambo")) < demand(byId("zivadiliring")));
});

test("Standard German is left out unless it was asked for", () => {
  const dialectOnly = eligible({ inSwitzerland: true });
  assert.ok(
    dialectOnly.every((s) => s.spoken !== "standard"),
    "someone who asked for dialect was offered the language they already have",
  );
  const both = eligible({ inSwitzerland: true, includeStandard: true });
  assert.ok(both.length > dialectOnly.length);
});

test("nothing geo-blocked is offered to someone outside Switzerland", () => {
  const abroad = eligible({ inSwitzerland: false });
  assert.ok(abroad.every((s) => s.reach === "open"));
  assert.ok(abroad.length > 0, "a learner abroad is offered nothing at all");
});

test("a topic filter narrows without emptying", () => {
  const sport = eligible({ inSwitzerland: true, topics: ["sport"] });
  assert.ok(sport.length > 0);
  assert.ok(sport.every((s) => s.topics.includes("sport")));
});

test("the same cursor gives the same answer, and a different one moves", () => {
  const want = { inSwitzerland: true } as const;
  assert.deepEqual(flow(want, { cursor: 4 }), flow(want, { cursor: 4 }));
  const a = flow(want, { cursor: 0 }).map((s) => s.id);
  const b = flow(want, { cursor: 7 }).map((s) => s.id);
  assert.notDeepEqual(a, b, "the cursor does not rotate the window");
});

test("a negative cursor is a cursor, not a crash", () => {
  const picked = flow({ inSwitzerland: true }, { cursor: -3 });
  assert.equal(picked.length, 3);
});

test("every source is reachable by some cursor", () => {
  // The bug this rules out: slicing at an offset, which shows the head of the
  // list forever and never the tail.
  const want = { inSwitzerland: true, includeStandard: true } as const;
  const seen = new Set<string>();
  const total = eligible(want).length;
  for (let cursor = 0; cursor < total; cursor++) {
    for (const s of flow(want, { cursor, take: 1 })) seen.add(s.id);
  }
  assert.equal(seen.size, total, "some sources can never be offered");
});

test("one pick is not three podcasts", () => {
  const picked = flow({ inSwitzerland: true }, { take: 3 });
  const media = new Set(picked.map((s) => s.medium));
  assert.equal(media.size, picked.length, `three of the same medium: ${picked.map((s) => s.medium).join(", ")}`);
});

test("a request that only matches one medium still returns what it can", () => {
  const onlyFilms = flow({ inSwitzerland: true, topics: ["drama"] }, { take: 3 });
  assert.ok(onlyFilms.length > 1, "medium variety was enforced into returning less than asked for");
});

test("the ceiling keeps the hard things away from a beginner", () => {
  const gentle = flow({ inSwitzerland: true, ceiling: 2 }, { take: 5 });
  assert.ok(gentle.length > 0);
  assert.ok(gentle.every((s) => demand(s) <= 2));
});

test("a preferred area comes first without hiding the rest", () => {
  const picked = flow({ inSwitzerland: true, area: "zueritueuetsch" }, { take: 3, cursor: 0 });
  assert.ok(
    picked.some((s) => s.area === "zueritueuetsch"),
    "asked for Zurich and offered none of it",
  );
  const all = eligible({ inSwitzerland: true });
  assert.ok(all.some((s) => s.area !== "zueritueuetsch"), "the area preference became a filter");
});

test("asking for nothing returns nothing rather than a default handful", () => {
  assert.deepEqual(flow({ inSwitzerland: true }, { take: 0 }), []);
});

test("a topic nothing matches returns empty, not everything", () => {
  const none = flow({ inSwitzerland: false, topics: ["sport"], ceiling: 1 }, { take: 3 });
  assert.ok(none.every((s) => s.topics.includes("sport")));
});

test("grouping covers the whole register exactly once", () => {
  const groups = byMedium();
  const ids = groups.flatMap((g) => g.sources.map((s) => s.id));
  assert.equal(ids.length, LISTENING_SOURCES.length, "a medium is missing from the grouping order");
  assert.equal(new Set(ids).size, ids.length);
});
