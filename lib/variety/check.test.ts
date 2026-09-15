import { test } from "node:test";
import assert from "node:assert/strict";
import { check } from "./check.ts";
import { frontDoor, siblingOf, type VarietyPack } from "./pack.ts";
import { ZURICH_GERMAN } from "./packs/gsw-zh.ts";
import { areasOf, isTaught } from "./family.ts";
import { UKRAINIAN } from "./packs/uk.ts";

const PACKS: ReadonlyArray<[string, VarietyPack]> = [
  ["gsw-zh", ZURICH_GERMAN],
  ["uk", UKRAINIAN],
];

// ---------------------------------------------------------------------------
// The contract. Every pack must satisfy these, so adding Lesya cannot quietly
// ship a half-pack — the suite goes red before the product does.
// ---------------------------------------------------------------------------

for (const [id, pack] of PACKS) {
  test(`${id}: declares the learner's broken skill`, () => {
    assert.ok(pack.learner.priority.length > 0, "priority must not be empty");
    assert.equal(new Set(pack.learner.priority).size, pack.learner.priority.length, "no repeats");
    assert.ok(frontDoor(pack), "front door is derived, never assumed");
  });

  test(`${id}: has a sibling bridge to build correspondences from`, () => {
    const sibling = siblingOf(pack);
    assert.ok(sibling, "a variety with no sibling has nothing to teach from");
    assert.ok(pack.correspondences.length > 0);
  });

  test(`${id}: every correspondence carries an attentional cue`, () => {
    // A correspondence without a cue is a lecture, and the lecture is the one
    // design that was tested and failed (Bergsma, Swarte & Gooskens 2014).
    for (const c of pack.correspondences) {
      assert.ok(c.cue.length > 0, `${c.bridge} -> ${c.target} has no cue`);
      assert.notEqual(c.bridge, c.target);
    }
  });

  test(`${id}: every rule explains itself and names its origin when foreign`, () => {
    for (const rule of pack.rules) {
      assert.ok(rule.reason.length > 0);
      if (rule.severity === "foreign") {
        assert.ok(rule.origin, `foreign rule ${String(rule.match)} must name the variety it came from`);
      }
    }
  });

  test(`${id}: clean text in the target passes`, () => {
    assert.equal(check("", pack).ok, true);
  });

  test(`${id}: findings are ordered by position in the text`, () => {
    const text = pack.rules.map((r) => (typeof r.match === "string" ? r.match : "")).join(" ");
    const { findings } = check(text, pack);
    const offsets = findings.map((f) => f.index);
    assert.deepEqual(offsets, [...offsets].sort((a, b) => a - b));
  });
}

test("a pack with a standardised orthography may call spelling wrong; one without may not", () => {
  // The single field that stops the same checker from nagging Swiss users and
  // waving through Ukrainian mistakes.
  assert.equal(ZURICH_GERMAN.orthography.standardised, false);
  assert.equal(UKRAINIAN.orthography.standardised, true);
});

test("the two packs disagree about which skill is broken", () => {
  // If this ever goes green by both packs agreeing, someone has copied Heidi's
  // assumptions into a population that does not share them.
  assert.notEqual(frontDoor(ZURICH_GERMAN), frontDoor(UKRAINIAN));
  assert.equal(frontDoor(ZURICH_GERMAN), "listening");
  assert.equal(frontDoor(UKRAINIAN), "texting");
});

test("Zurich German is one dialect of a family, not the whole language", () => {
  // Heidi is for Swiss German and starts with Zurich. Without a family the
  // product reads as "Zurich only", and a future Bern pack rejecting Zurich
  // forms would look like a contradiction rather than a sibling.
  const family = ZURICH_GERMAN.family;
  assert.ok(family, "Zurich German must name the family it belongs to");
  assert.equal(family?.name, "Swiss German");
  assert.ok((family?.planned.length ?? 0) > 0, "the dialects we do not teach yet must be named");
  assert.ok(family?.planned.includes("baerndueuetsch"));
});

test("every planned dialect is a real area", () => {
  // The roadmap used to hold display names and the map held its own copy of
  // the same points, matched by string. They did not match: "Aargau" and
  // "Wallis" refer to areas named after Aarau and Brig, so both drew as "not
  // on the roadmap" while sitting on it. One list of areas, referenced by id,
  // and a planned id with no area is now a failure rather than a silent
  // downgrade on the map.
  const family = ZURICH_GERMAN.family;
  const ids = new Set(areasOf(ZURICH_GERMAN).map((a) => a.id));

  for (const id of family?.planned ?? []) {
    assert.ok(ids.has(id), `planned "${id}" is not an area in family.areas`);
  }
});

test("the taught variety is not also on the roadmap", () => {
  // "Coming soon" for the thing that is already here.
  const taught = areasOf(ZURICH_GERMAN).find((a) => isTaught(ZURICH_GERMAN, a));
  assert.ok(taught);
  assert.equal(ZURICH_GERMAN.family?.planned.includes(taught.id), false);
});

test("the dialects sit inside the country they are spoken in", () => {
  // Coordinates are easy to transpose — lon/lat the wrong way round puts Bern
  // in Somalia, and the figure would still render, just wrongly.
  const atlas = ZURICH_GERMAN.family?.atlas;
  const points = [atlas?.home, ...areasOf(ZURICH_GERMAN).map((a) => a.place)];
  for (const p of points) {
    assert.ok(p, "every place is defined");
    assert.ok(p!.lon > 5.9 && p!.lon < 10.5, `lon ${p!.lon} is outside Switzerland`);
    assert.ok(p!.lat > 45.8 && p!.lat < 47.9, `lat ${p!.lat} is outside Switzerland`);
  }
});

test("every region the gate rejects is a named sibling, not a mystery", () => {
  // The gate rejects Bernese because we teach Zurich, not because Bernese is
  // wrong. A rejected origin we have no plan for means the scope claimed on
  // the home page has drifted from what the checker actually does.
  // Tied to the atlas rather than to the roadmap, which is the real invariant:
  // the gate may reject a form for belonging to a dialect area we have mapped,
  // or to the roof language. Anything else is an origin nobody can place.
  const known = new Set([
    ...areasOf(ZURICH_GERMAN)
      .map((a) => a.ruleOrigin)
      .filter((o): o is string => Boolean(o)),
    // Germany is not a Swiss dialect area. It is the roof language, and its
    // forms are rejected for a different reason — see the bridge rules.
    "Germany",
  ]);
  const rejected = ZURICH_GERMAN.rules
    .filter((r) => r.severity === "foreign" && r.origin)
    .map((r) => r.origin as string);
  assert.ok(rejected.length > 0);
  for (const origin of rejected) {
    assert.ok(known.has(origin), `${origin} is rejected but is not a named sibling`);
  }
});

test("capabilities differ, so the same engine must build different products", () => {
  assert.equal(ZURICH_GERMAN.capabilities.asr, false);
  assert.equal(UKRAINIAN.capabilities.asr, true);
  assert.equal(ZURICH_GERMAN.capabilities.licensedAudio, false);
});

// ---------------------------------------------------------------------------
// Zurich German — every case from the original purity.test.ts, unchanged in
// intent. The port must not have quietly lost a rule.
// ---------------------------------------------------------------------------

const ZH_FORBIDDEN: Array<[string, string]> = [
  ["tüütsch", "Ostschweiz"],
  ["tütsch", "Ostschweiz"],
  ["nid", "Ostschweiz"],
  ["güet", "Bernese"],
  ["gäu", "Bernese"],
  ["öu", "Bernese"],
  ["Löu", "Bernese"],
  ["sai", "Basel"],
  ["Strasse mit ß", "ß"],
];

const ZH_ALLOWED = [
  "nöd",
  "chli",
  "guet",
  "grad",
  "au",
  "mer gönd",
  "mer mached",
  "mer händ",
  "Züri",
  "Züritüütsch",
  "Schwiizertüütsch",
];

for (const [form, why] of ZH_FORBIDDEN) {
  test(`zh rejects ${JSON.stringify(form)} (${why})`, () => {
    const r = check(`Das isch ${form} gsi.`, ZURICH_GERMAN);
    assert.equal(r.ok, false);
    assert.ok(r.findings.length >= 1);
    assert.ok(r.findings[0].reason.length > 0);
  });
}

for (const form of ZH_ALLOWED) {
  test(`zh passes ${JSON.stringify(form)}`, () => {
    const r = check(`Ja, ${form} — das stimmt.`, ZURICH_GERMAN);
    assert.deepEqual(r, { ok: true, findings: [] });
  });
}

test("zh is case-insensitive and reports the offset", () => {
  const r = check("Nid so.", ZURICH_GERMAN);
  assert.equal(r.ok, false);
  assert.equal(r.findings[0].form, "Nid");
  assert.equal(r.findings[0].index, 0);
});

test("zh reports multiple findings in text order", () => {
  const r = check("gäu, das isch nid güet", ZURICH_GERMAN);
  assert.deepEqual(
    r.findings.map((f) => f.form),
    ["gäu", "nid", "güet"],
  );
});

test("zh offers the Zurich form to use instead", () => {
  const r = check("Das isch nid guet.", ZURICH_GERMAN);
  assert.equal(r.findings[0].suggest, "nöd");
  assert.equal(r.findings[0].origin, "Ostschweiz");
});

// ---------------------------------------------------------------------------
// Ukrainian — the same engine, no code shared with Zurich beyond check().
// ---------------------------------------------------------------------------

test("uk rejects letters that do not exist in the Ukrainian alphabet", () => {
  const r = check("Это кава.", UKRAINIAN);
  assert.equal(r.ok, false);
  assert.equal(r.findings[0].severity, "unattested");
  assert.equal(r.findings[0].origin, "Russian");
});

test("uk passes text using only the Ukrainian alphabet", () => {
  const r = check("Я хочу брати участь у заході.", UKRAINIAN);
  assert.deepEqual(r, { ok: true, findings: [] });
});

test("the engine carries no Latin-script assumption", () => {
  // Zurich rules must not fire on Cyrillic, and vice versa — the check is the
  // pack's, not the language family's.
  assert.equal(check("Я хочу брати участь.", ZURICH_GERMAN).ok, true);
  assert.equal(check("Das isch nid güet.", UKRAINIAN).ok, true);
});

// ---------------------------------------------------------------------------
// Threshold behaviour — one rule set, two callers.
// ---------------------------------------------------------------------------

test("a house-style preference does not fail the generation gate", () => {
  const pack: VarietyPack = {
    ...ZURICH_GERMAN,
    rules: [{ match: "velo", severity: "dispreferred", reason: "we write Velo" }],
  };
  assert.equal(check("s velo", pack, "foreign").ok, true, "generation gate ignores house style");
  assert.equal(check("s velo", pack, "dispreferred").ok, false, "our own copy does not");
  assert.equal(check("s velo", pack).findings.length, 1, "but it is always reported");
});

test("a literal dot in a pack rule does not match every character", () => {
  const pack: VarietyPack = {
    ...ZURICH_GERMAN,
    rules: [{ match: "a.b", severity: "foreign", origin: "test", reason: "literal" }],
  };
  assert.equal(check("axb", pack).ok, true);
  assert.equal(check("a.b", pack).ok, false);
});

test("a pack RegExp without the global flag still finds every occurrence", () => {
  const pack: VarietyPack = {
    ...ZURICH_GERMAN,
    rules: [{ match: /öu/iu, severity: "foreign", origin: "Bernese", reason: "diphthong" }],
  };
  assert.equal(check("löu und höu", pack).findings.length, 2);
});
