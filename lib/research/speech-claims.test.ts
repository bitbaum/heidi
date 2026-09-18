import { test } from "node:test";
import assert from "node:assert/strict";
import { SPEAKING } from "./language-tech.ts";
import { ZURICH_GERMAN } from "../variety/packs/gsw-zh.ts";

/**
 * The register's claims, and the one thing that must stay in step with them.
 *
 * §7 records that most "Swiss German" TTS on the market is Standard German in
 * a Swiss accent, and §2 explains why that is worse here than elsewhere: the
 * learner is buying the variety BECAUSE they cannot tell, so a vendor's own
 * label is the one piece of evidence that cannot settle anything.
 */

test("nothing claims to have been verified, because nobody here has listened", () => {
  for (const system of SPEAKING) {
    assert.equal(
      system.verified,
      false,
      `${system.id} claims verification. If somebody has genuinely sat down with real Zurich audio, this test is what has to change first — and the page copy with it.`,
    );
  }
});

test("every speech system says whether it produces dialect at all", () => {
  for (const system of SPEAKING) {
    assert.equal(typeof system.dialect, "boolean", `${system.id} does not say`);
    assert.ok(system.note.trim().length > 40, `${system.id} has no real note`);
  }
});

/**
 * THE ONE THAT MATTERS. A vendor advertising dialect-preserving recognition
 * does not change what the product may do — the pack does. If somebody flips
 * the pack on the strength of a sales page, this fails and says why.
 */
test("an unverified vendor claim has NOT been allowed to change the pack", () => {
  const vendors = SPEAKING.find((s) => s.id === "swissVendors");
  assert.ok(vendors, "the Swiss specialist vendors belong in the register");
  assert.equal(vendors.dialect, true, "they claim dialect — that is the claim, recorded as a claim");
  assert.equal(vendors.verified, false);

  // And while that is so, Zurich German recognition still translates the
  // variety away, so a transcript is not evidence about the learner's forms.
  assert.equal(
    ZURICH_GERMAN.capabilities.recognition.returnsSpokenVariety,
    false,
    "the pack was changed on a marketing page — verify the vendor first, then flip this, then this test",
  );
});

test("the research rows still carry the numbers somebody published", () => {
  // The contrast the vendor row is measured against: these came from people
  // who named a test set.
  const research = SPEAKING.filter((s) => s.status === "research");
  assert.ok(research.length >= 2, "the published work is what makes the sales claim checkable");
  for (const row of research) assert.ok(row.source, `${row.id} is research with no source`);
});
