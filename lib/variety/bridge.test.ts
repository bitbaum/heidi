import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { checkAgainst } from "./check.ts";
import { ZURICH_GERMAN } from "./packs/gsw-zh.ts";
import { bridgeRules, siblingOf } from "./bridge.ts";

/**
 * The gate over Swiss Standard German.
 *
 * Zurich is diglossic and the product has only ever produced the spoken half.
 * The written half — the one an email to a landlord is in — is where a model
 * is most likely to hand back Germany's German with nothing Swiss about it,
 * fluently, to somebody who cannot tell.
 */
describe("Swiss Standard German", () => {
  const rules = bridgeRules(ZURICH_GERMAN);

  test("the sibling bridge carries a rule set at all", () => {
    // If this is empty, every "Swiss Standard German" line ships unchecked and
    // the feature is a label rather than a claim.
    assert.ok(rules.length > 0);
    assert.equal(siblingOf(ZURICH_GERMAN)?.tag, "de-CH");
  });

  test("ß is not a Swiss letter", () => {
    // Not a preference — Switzerland dropped it from its orthography, so a ß
    // in text claiming to be Swiss is as wrong as a word that does not exist.
    const verdict = checkAgainst("Ich weiß nicht, ob das eine gute Straße ist.", rules);
    assert.equal(verdict.ok, false);
    assert.equal(verdict.findings.length, 2, "every occurrence, not just the first");
    assert.equal(verdict.findings[0].severity, "unattested");
    assert.equal(verdict.findings[0].suggest, "ss");
  });

  test("Germany's words are caught, with the Swiss one to use instead", () => {
    const verdict = checkAgainst("Ich stelle mein Fahrrad auf dem Bürgersteig ab.", rules);
    assert.equal(verdict.ok, false);
    assert.deepEqual(verdict.findings.map((f) => f.suggest), ["Velo", "Trottoir"]);
    assert.ok(verdict.findings.every((f) => f.origin === "Germany"));
  });

  test("ordinary Swiss Standard German passes clean", () => {
    const fine = [
      "Guten Tag, ich schreibe Ihnen wegen der Wohnung an der Bahnhofstrasse.",
      "Darf ich mein Velo im Hof parkieren?",
      "Ich nehme das Tram bis zum Hauptbahnhof.",
      "Nach der Matura habe ich ein Jahr gearbeitet.",
    ];
    for (const text of fine) {
      const verdict = checkAgainst(text, rules);
      assert.equal(verdict.ok, true, `${text} — flagged ${verdict.findings.map((f) => f.form).join(", ")}`);
    }
  });

  test("a word is matched whole, not inside another word", () => {
    // "parken" must not fire inside "parkieren", or the gate flags its own
    // suggested replacement and tells the learner the right answer is wrong.
    assert.equal(checkAgainst("Ich möchte dort parkieren.", rules).ok, true);
    assert.equal(checkAgainst("Ich möchte dort parken.", rules).ok, false);
  });

  test("this gate catches what the dialect gate cannot", () => {
    // Two different claims about two different varieties, and they genuinely
    // disagree. Worth stating plainly, because it is easy to assume the
    // dialect gate already covers this: it does NOT. It is a denylist of
    // forms belonging to other DIALECTS, so ordinary written German sails
    // through it untouched — which is correct, and exactly why a line labelled
    // Swiss Standard German needs its own rules rather than the target's.
    const germanNotSwiss = "Ich stelle mein Fahrrad ab.";

    assert.equal(
      checkAgainst(germanNotSwiss, ZURICH_GERMAN.rules).ok,
      true,
      "the dialect gate has no opinion about Germany-vs-Switzerland word choice",
    );
    assert.equal(
      checkAgainst(germanNotSwiss, rules).ok,
      false,
      "the bridge gate does, which is the whole reason it exists",
    );
  });

  test("every rule offers the Swiss form to use instead", () => {
    // A finding that says only "wrong" leaves the learner exactly where they
    // started — they could not have known, which is why it was flagged.
    for (const rule of rules) {
      assert.ok(rule.suggest, `"${rule.display ?? String(rule.match)}" flags without offering a replacement`);
      assert.ok(rule.reason.trim(), "and without saying why");
    }
  });

  test("no rule flags a form that another rule recommends", () => {
    // The self-contradiction that would tell somebody their corrected text is
    // still wrong.
    const suggestions = rules.map((r) => r.suggest).filter((s): s is string => typeof s === "string");
    for (const suggestion of suggestions) {
      const verdict = checkAgainst(suggestion, rules);
      assert.equal(verdict.ok, true, `"${suggestion}" is recommended by one rule and flagged by another`);
    }
  });
});
