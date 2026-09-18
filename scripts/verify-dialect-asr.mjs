#!/usr/bin/env node
/**
 * Does this recogniser actually keep the dialect?
 *
 * The experiment `lib/research/language-tech.ts` names beside the
 * `swissVendors` row, made runnable. Swiss vendors advertise two things and
 * this settles exactly one of them:
 *
 *   "returns dialect text"  → SETTLED HERE. Feed it dialect speech and read
 *                             which variety came back. No ground truth needed,
 *                             because the question is about the VARIETY of the
 *                             output rather than its correctness.
 *   "97.4% accuracy"        → NOT settled here, and this script will not
 *                             pretend to. A word error rate needs a transcript
 *                             a Zurich speaker wrote; nobody here has one, and
 *                             a WER computed against a guess is a number with
 *                             nothing underneath it.
 *
 * WHY THAT SPLIT IS THE RIGHT ONE. `lib/speech/evidence.ts` turns exactly one
 * boolean into the whole speaking surface — `returnsSpokenVariety`. Accuracy
 * decides how much to trust the findings; variety decides whether there may be
 * findings at all. The second is the gate, and it is the cheap one.
 *
 *   node scripts/verify-dialect-asr.mjs <audio-file> [--json]
 *
 *   SPEECH_API_KEY=...       required. A LIVE key: the vendor's sandbox is
 *                            synthetic and cannot answer a question about real
 *                            dialect.
 *   SPEECH_API_URL=...       the STT endpoint.
 *   SPEECH_DIALECT=auto      passed through as the dialect hint.
 *
 * The audio must be REAL ZURICH SPEECH that you know the content of. A clip
 * whose dialect you cannot vouch for tests nothing: if the output is Standard
 * German you will not know whether the recogniser translated it or the speaker
 * simply spoke Standard German.
 */

import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { markerVerdict, returnsSpokenVariety } from "../lib/speech/dialect-marker.ts";
import { ZURICH_GERMAN } from "../lib/variety/packs/gsw-zh.ts";

const [file, ...flags] = process.argv.slice(2);
const asJson = flags.includes("--json");

if (!file) {
  console.error("usage: node scripts/verify-dialect-asr.mjs <audio-file> [--json]");
  process.exit(2);
}

const key = process.env.SPEECH_API_KEY;
if (!key) {
  console.error("SPEECH_API_KEY is not set. A LIVE key — the sandbox is synthetic and settles nothing.");
  process.exit(2);
}
if (key.startsWith("sv_test_")) {
  // Named explicitly because it is the mistake that would produce a confident
  // and worthless answer: the sandbox returns canned text.
  console.error("That is a sandbox key. It returns synthetic text and cannot answer this question.");
  process.exit(2);
}

const url = process.env.SPEECH_API_URL ?? "https://suisse-line.ch/api/v1/stt";

const audio = await readFile(file);
const form = new FormData();
form.set("file", new Blob([audio]), basename(file));
form.set("language", "de-CH");
form.set("dialect", process.env.SPEECH_DIALECT ?? "auto");

const started = Date.now();
let response;
try {
  response = await fetch(url, { method: "POST", headers: { "X-API-Key": key }, body: form });
} catch (error) {
  console.error(`the request failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const body = await response.text();
if (!response.ok) {
  // The body is printed because a vendor's refusal usually says what is wrong
  // — a wrong endpoint, an exhausted credit, an unsupported container.
  console.error(`HTTP ${response.status}\n${body.slice(0, 600)}`);
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(body);
} catch {
  console.error(`the response was not JSON:\n${body.slice(0, 400)}`);
  process.exit(1);
}

// Vendors disagree about where the text lives; look in the usual places rather
// than guessing one and reporting "no transcript" for a successful call.
const transcript =
  parsed.text ?? parsed.transcript ?? parsed.result?.text ?? parsed.results?.[0]?.transcript ?? "";

if (typeof transcript !== "string" || !transcript.trim()) {
  console.error(`no transcript in the response:\n${JSON.stringify(parsed).slice(0, 400)}`);
  process.exit(1);
}

const markers = ZURICH_GERMAN.speech.markers;
if (!markers) {
  console.error("the pack declares no markers, so nothing can be decided from the text");
  process.exit(2);
}

const verdict = markerVerdict(transcript, markers);
const keeps = returnsSpokenVariety(verdict);

const result = {
  file: basename(file),
  ms: Date.now() - started,
  transcript,
  verdict: verdict.variety,
  targetHits: verdict.targetHits,
  bridgeHits: verdict.bridgeHits,
  returnsSpokenVariety: keeps,
};

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`\n  transcript  ${transcript}\n`);
  console.log(`  dialect markers   ${verdict.targetHits.join(", ") || "—"}`);
  console.log(`  standard markers  ${verdict.bridgeHits.join(", ") || "—"}`);
  console.log(`  answered in       ${verdict.variety}\n`);

  if (keeps === true) {
    console.log("  KEEPS THE DIALECT.");
    console.log("  If this holds over several real clips, the pack may change:");
    console.log("    lib/variety/packs/gsw-zh.ts → capabilities.recognition.returnsSpokenVariety: true");
    console.log("    lib/research/language-tech.ts → the swissVendors row's `verified`");
    console.log("    lib/research/speech-claims.test.ts → the test that currently forbids both\n");
    console.log("  Accuracy is still unmeasured. That needs a transcript a Zurich speaker wrote.\n");
  } else if (keeps === false) {
    console.log("  TRANSLATED INTO STANDARD GERMAN — the same thing every published system does.");
    console.log("  The pack stays as it is, and the sales claim is not supported by this clip.\n");
  } else {
    console.log("  UNCLEAR: too few marker words to decide. Try a longer clip with ordinary speech in it.\n");
  }
}

process.exit(0);
