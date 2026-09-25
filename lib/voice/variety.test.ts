import { test } from "node:test";
import assert from "node:assert/strict";
import { claimFor, pickVoice, spokenAs, SPEECH_LANG, type VoiceLike } from "./variety.ts";

const voice = (name: string, lang: string, localService?: boolean): VoiceLike => ({ name, lang, localService });

test("a de-CH voice is Swiss Standard German, never dialect", () => {
  // The claim this module exists to refuse. If this ever returns "dialect",
  // Heidi is telling a learner that a newsreader voice is the lunch table.
  assert.equal(spokenAs(voice("Petra", "de-CH")), "swiss-standard");
  assert.equal(spokenAs(voice("Sandra", "de-DE")), "german");
  assert.equal(spokenAs(voice("Daniel", "en-GB")), "foreign");
});

test("no voice, of any description, is reported as dialect", () => {
  // Deliberately adversarial: these are the names a pattern-matching
  // implementation would fall for, and every one of them is a Standard German
  // voice with a Swiss-sounding label.
  const tempting = [
    voice("Züridütsch", "de-CH"),
    voice("Swiss German", "gsw"),
    voice("Schweizerdeutsch Mundart", "de-CH"),
    voice("Heidi", "gsw-ZH"),
  ];
  for (const v of tempting) {
    assert.notEqual(spokenAs(v), "dialect", `${v.name} was reported as dialect`);
  }
});

test("platforms spell the same tag three ways and mean the same thing", () => {
  for (const lang of ["de-CH", "de_CH", "de-ch", "DE-CH"]) {
    assert.equal(spokenAs(voice("x", lang)), "swiss-standard", lang);
  }
});

test("Swiss beats German, and on-device beats a server voice", () => {
  const voices = [voice("Remote DE", "de-DE"), voice("Remote CH", "de-CH"), voice("Local CH", "de-CH", true)];
  assert.equal(pickVoice(voices)?.name, "Local CH");
  assert.equal(pickVoice([voice("Remote DE", "de-DE"), voice("Anna", "de-AT")])?.name, "Anna");
});

test("a device with no German voice gets nothing, not an English one", () => {
  // Reading Zurich German with an English voice does not produce accented
  // Swiss German; it produces sounds that teach the wrong thing.
  assert.equal(pickVoice([voice("Daniel", "en-GB"), voice("Amélie", "fr-FR")]), null);
  assert.equal(pickVoice([]), null);
});

test("the pick is stable when nothing distinguishes two voices", () => {
  const a = [voice("Bea", "de-CH"), voice("Ada", "de-CH")];
  assert.equal(pickVoice(a)?.name, "Ada");
  assert.equal(pickVoice([...a].reverse())?.name, "Ada");
});

test("the claim matches what will actually be heard", () => {
  assert.equal(claimFor(voice("Petra", "de-CH")), "swissStandard");
  assert.equal(claimFor(voice("Sandra", "de-DE")), "german");
  assert.equal(claimFor(null), "none");
});

test("speech is requested as de-CH, because no synthesiser implements gsw", () => {
  // Asking for the CORRECT code gets silence or an English voice reading
  // Züridütsch as English, which is the worst outcome available.
  assert.equal(SPEECH_LANG, "de-CH");
});
