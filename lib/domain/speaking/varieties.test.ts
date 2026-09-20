import { test } from "node:test";
import assert from "node:assert/strict";
import { spokenVarieties, hasSpokenChoice } from "./varieties.ts";
import { VARIETY } from "../../variety/active.ts";
import type { VarietyPack } from "../../variety/pack.ts";

/**
 * A pack is a large object and these tests are about four fields of it, so
 * they start from the real one and override. Building a fake pack here would
 * test a fake pack.
 */
function packWith(over: Partial<VarietyPack>): VarietyPack {
  return { ...VARIETY, ...over } as VarietyPack;
}

test("the target variety is always offered, and always first", () => {
  const [first] = spokenVarieties(VARIETY);
  assert.equal(first!.id, "target");
  assert.equal(first!.name, VARIETY.endonym, "called what its speakers call it");
});

/**
 * THE POINT OF THE WHOLE CHANGE.
 *
 * `packs/gsw-zh.ts` has declared a faithful bridge recogniser since the file
 * was written. Nothing asked it, so the practice screen offered one path to
 * everybody. This asserts the pack's own declaration reaches the surface.
 */
test("a faithful bridge recogniser becomes a second practice variety", () => {
  const got = spokenVarieties(VARIETY);
  assert.equal(got.length, 2, "Zurich German has a sibling whose recogniser returns what was said");

  const bridge = got[1]!;
  assert.equal(bridge.id, "bridge");
  assert.equal(bridge.transcribable, true, "so the learner need not type it out");
  assert.equal(bridge.evidence, "words", "and its transcript is their own words");
  assert.equal(bridge.recognitionLang, "de", "asked for as `de`, not `de-CH`");
  assert.ok(hasSpokenChoice(VARIETY), "which makes it a choice worth rendering");
});

test("the dialect is NOT transcribable, and that is the §7 rule rather than a gap", () => {
  const target = spokenVarieties(VARIETY)[0]!;
  assert.equal(target.transcribable, false);
  assert.equal(target.evidence, "meaning-only", "the recogniser answers in the bridge");
  assert.equal(target.grammarCode, null, "and no checker covers the variety");
});

test("a pack whose target recogniser becomes faithful needs no code change", () => {
  // The edit `lib/research/language-tech.ts` describes: a Swiss vendor's
  // dialect-preserving recognition is tested and the pack is updated. One
  // object, and the dialect gains everything the bridge has.
  const improved = packWith({
    capabilities: {
      ...VARIETY.capabilities,
      recognition: { available: true, returnsSpokenVariety: true, wer: 9 },
    },
  });
  const target = spokenVarieties(improved)[0]!;
  assert.equal(target.transcribable, true);
  assert.equal(target.evidence, "words");
});

test("an unmeasured recogniser is not an accurate one", () => {
  const unknown = packWith({
    capabilities: {
      ...VARIETY.capabilities,
      recognition: { available: true, returnsSpokenVariety: true },
    },
  });
  const target = spokenVarieties(unknown)[0]!;
  // Faithful, so it may be SHOWN — but `evidenceFrom` will not let its forms
  // be judged, because nobody published a rate. Absent is not zero.
  assert.equal(target.transcribable, true);
  assert.equal(target.evidence, "meaning-only");
});

test("a pack with no faithful recogniser anywhere offers no choice at all", () => {
  const alone = packWith({
    capabilities: {
      ...VARIETY.capabilities,
      recognition: { available: false, returnsSpokenVariety: false },
      bridgeRecognition: undefined,
    },
  });
  const got = spokenVarieties(alone);
  assert.equal(got.length, 1, "one entry is a label, not a choice");
  assert.equal(hasSpokenChoice(alone), false, "so the switch is not rendered");
  assert.equal(got[0]!.evidence, "none");
});

test("a bridge that merely exists is not offered — it must return what was said", () => {
  const translating = packWith({
    capabilities: {
      ...VARIETY.capabilities,
      bridgeRecognition: { available: true, returnsSpokenVariety: false, wer: 4 },
    },
  });
  assert.equal(spokenVarieties(translating).length, 1);
});
