import { test } from "node:test";
import assert from "node:assert/strict";
import { de } from "./dictionaries/de.ts";
import { en } from "./dictionaries/en.ts";
import { fr } from "./dictionaries/fr.ts";
import { gsw } from "./dictionaries/gsw.ts";
import { it } from "./dictionaries/it.ts";
import { rm } from "./dictionaries/rm.ts";
import { ru } from "./dictionaries/ru.ts";
import { MEASURES, type Verdict } from "../speech/capability.ts";

/**
 * The overclaim register, as a build failure instead of a paragraph.
 *
 * §8 names the claims this product does not make — "93% native pronunciation",
 * "learn to speak like a local" — and until now that register lived only in
 * prose, in comments, in files a copywriter has no reason to open. Every
 * engine file obeys it; nothing stopped the SENTENCE appearing in a
 * dictionary, which is the only place a reader would ever see it.
 *
 * That gap is not hypothetical. The speaking feature now has a page describing
 * what it measures, in seven languages, aimed partly at people being pitched
 * to — which is exactly the surface on which a confident number gets added by
 * somebody who means well and does not know the register exists.
 *
 * WHY THE PATTERNS MATCH SHAPES, NOT WORDS. Banning the word "pronunciation"
 * would fail the honest copy that uses it — the listening page says adults
 * rarely reach native pronunciation, which is the register being OBEYED, in
 * public, and exactly the sentence a crude ban would delete. So each pattern
 * matches the shape of a CLAIM: a number next to an accent, a promise to make
 * somebody sound native. Honest copy about the same subject passes, and a test
 * below pins that it does.
 */

const DICTIONARIES = { de, en, fr, gsw, it, rm, ru };

/** Every string in a dictionary, flattened, with a path for the error message. */
function strings(value: unknown, path: string, out: Array<{ path: string; text: string }> = []) {
  if (typeof value === "string") {
    out.push({ path, text: value });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => strings(v, `${path}[${i}]`, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) strings(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

/**
 * Claim shapes, not vocabulary.
 *
 * Deliberately few. A long list of near-misses would fire on honest sentences
 * and get switched off, which is worse than not having one — a ratchet nobody
 * trusts is a ratchet somebody deletes.
 */
const OVERCLAIMS: Array<{ name: string; pattern: RegExp }> = [
  {
    // "93% native pronunciation", "95 % Aussprache", "точность произношения 93%"
    name: "a percentage attached to pronunciation or accent",
    pattern:
      /\d+\s?%[^.!?]{0,40}(pronunc|aussprach|uusspraach|prononc|pronunzi|произнош|accent|akzent)|(pronunc|aussprach|uusspraach|prononc|pronunzi|произнош|accent|akzent)[^.!?]{0,40}\d+\s?%/i,
  },
  {
    // A promise about how the learner will SOUND. The register's other example.
    name: "a promise that the learner will sound native or local",
    pattern:
      /(sound|klingen|klinge|tönen|töne|sonner|suonare|sunar|звучать)[^.!?]{0,30}(like a (native|local)|wie ein[e]? (Einheimisch|Muttersprachler)|wie en Iiheimische|comme un (natif|habitant)|come un (madrelingua|locale)|как (носитель|местн))/i,
  },
  {
    name: "a pronunciation score, rating or grade being offered",
    pattern:
      /(pronunciation|aussprache|uusspraach|prononciation|pronuncia|pronunzia|произношени\w*)[- ]?(score|scoring|rating|grade|bewertung|note|nota|voto|оценк)\w*\s*(:|=|\d)/i,
  },
];

/**
 * Sentences that must keep passing.
 *
 * These are real lines from the product that talk about pronunciation
 * honestly. They are listed here so that anybody tightening a pattern above
 * finds out immediately that they have broken the honest half — which is the
 * failure mode that turns a truth ratchet into a censor.
 */
const MUST_PASS = [
  "Adults rarely reach native pronunciation in a second dialect, and in Switzerland that matters less than almost anywhere.",
  "Wird nicht erstellt. Eine Note gegen ein muttersprachliches Ideal ist ein Urteil über einen Menschen.",
  "Not produced. A score against a native ideal is a judgement about a person, and no improvement in recognition would make it honest.",
  "Heidi liest vor, behauptet aber nie, Mundart zu sprechen.",
];

/**
 * Sentences that must fail.
 *
 * Rung 4: a gate is only a gate if something is known to trip it. Without
 * these, a typo in a pattern gives a permanently green test that checks
 * nothing — which is indistinguishable from clean copy.
 */
const MUST_FAIL = [
  "93% native pronunciation after four weeks.",
  "Erreichen Sie 95 % Aussprache-Genauigkeit.",
  "You will sound like a native in three months.",
  "Sprechen Sie, und klingen Sie wie ein Einheimischer.",
  "Pronunciation score: 87",
];

const offences = (text: string) => OVERCLAIMS.filter((c) => c.pattern.test(text));

test("no dictionary makes a claim the overclaim register forbids", () => {
  for (const [locale, dict] of Object.entries(DICTIONARIES)) {
    for (const { path, text } of strings(dict, "")) {
      const hits = offences(text);
      assert.equal(
        hits.length,
        0,
        `${locale}.${path} makes a forbidden claim (${hits.map((h) => h.name).join(", ")}):\n  ${text}`,
      );
    }
  }
});

test("the patterns do not fire on honest copy about the same subject", () => {
  for (const line of MUST_PASS) {
    assert.deepEqual(offences(line).map((o) => o.name), [], `an honest sentence was flagged:\n  ${line}`);
  }
});

test("the patterns DO fire on the claims the register names", () => {
  for (const line of MUST_FAIL) {
    assert.ok(offences(line).length > 0, `a forbidden claim slipped through:\n  ${line}`);
  }
});

/**
 * The speech-evaluation block, which is computed and therefore must be
 * complete: the page renders `evalNames[measure.id]` for whatever is in
 * MEASURES, so a measure added without labels is a blank heading in seven
 * languages rather than an error anybody notices.
 */
const VERDICTS: Verdict[] = ["target", "bridge", "none", "refused"];

test("every measure and every verdict has real wording in every language", () => {
  for (const [locale, dict] of Object.entries(DICTIONARIES)) {
    const t = dict.technology;
    for (const measure of MEASURES) {
      const name = t.evalNames[measure.id];
      const what = t.evalWhat[measure.id];
      assert.ok(name && name.trim().length > 2, `${locale}: no name for ${measure.id}`);
      assert.ok(what && what.trim().length > 40, `${locale}: ${measure.id} has no real description`);
    }
    for (const verdict of VERDICTS) {
      const label = t.evalVerdicts[verdict];
      assert.ok(label && label.trim().length > 2, `${locale}: no label for the verdict "${verdict}"`);
    }
  }
});

test("the refused measure's description says it is refused, not delayed", () => {
  // "not yet" invites a reader to wait for it; §8's point is that it is not
  // coming. Checked in the two languages this repo can assert meaning in.
  assert.match(en.technology.evalWhat.pronunciation, /not produced/i);
  assert.match(de.technology.evalWhat.pronunciation, /nicht erstellt/i);
});
