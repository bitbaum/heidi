/**
 * Does the speaking surface actually work — with a microphone, in a browser?
 *
 * WHY THIS FILE EXISTS. "I don't think that the speaking part works, at least
 * with regards to the dialect" was reported from a phone, and the answer given
 * back was a question: what did you see? That was the wrong answer. Everything
 * needed to find out was available here — Chrome takes a fake microphone, the
 * page is three clicks, and the network tab says whether audio was sent.
 *
 * `audit/responsive.mjs` exists for exactly this reason one floor down: layout
 * facts need a real viewport and reading the source finds none of them. A
 * microphone fact needs a real getUserMedia, a real MediaRecorder and a real
 * upload, and reading the source finds none of THOSE either. Six unit tests
 * cover `useRecorder`'s state machine and every one of them passes whether or
 * not a single byte of audio ever leaves the page.
 *
 * WHAT IT PROVES, precisely — because a test that overstates its reach is
 * worse than none:
 *
 *   ✓ the browser grants the microphone and `getUserMedia` resolves
 *   ✓ audio is genuinely FLOWING — the level meter moves, which is the one
 *     signal that separates "recording" from "a button that changed colour"
 *   ✓ MediaRecorder produces a take
 *   ✓ whether `/api/speaking/transcribe` is called, per variety, and what it
 *     answers
 *   ✓ what the page SAYS afterwards, as text a person would read
 *   ✓ whether `SpeechRecognition` exists and fires events, which is the
 *     separate fast path the chat composer uses
 *
 * WHAT IT CANNOT PROVE. Whether a transcript is CORRECT. Chrome's fake device
 * emits a tone, not speech, so the accuracy question needs a real recording of
 * a real person. Pass one with `AUDIO=/path/to/speech.wav` (16-bit PCM) and
 * this harness will feed it to the page as the microphone; without one it
 * reports the pipeline and says nothing about quality. That distinction is the
 * whole point — the pipeline is what "it doesn't work" usually means.
 *
 *   pnpm run dev                                    # in another terminal
 *   node scripts/audit/speaking.mjs                 # against localhost
 *   BASE=https://heidi.orangecat.ch node scripts/audit/speaking.mjs
 *   AUDIO=~/zuerich.wav node scripts/audit/speaking.mjs
 *   LOCALE=en node scripts/audit/speaking.mjs
 */

import { chromium } from "playwright";
import { existsSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3000";
const LOCALE = process.env.LOCALE ?? "de";
const AUDIO = process.env.AUDIO;

/**
 * BOTH LENGTHS, ALWAYS — which is why there is no knob for it.
 *
 * `MIN_USEFUL_MS` is 3,000, so a shorter take is `too-short` and therefore
 * UNUSABLE: the product already refuses to say anything about one. An
 * unusable take must never reach the transcriber either, because a
 * Whisper-family model answers non-speech with plausible words rather than
 * with nothing — measured against production on 2026-09-22, where a 1.5s take
 * of a synthetic tone came back as «Bis zum nächsten Mal.»
 *
 * Running one length alone proves nothing: "not called" is also what a
 * completely broken upload looks like. So the harness always runs both and
 * reports the pair as a verdict.
 */


/**
 * The labels the harness clicks, per locale.
 *
 * FROM THE DICTIONARY, not guessed: a harness that matches on a string the
 * product no longer uses reports "no record button" and looks like a finding.
 * Only the locales somebody would run this in; add one by copying its three
 * strings out of `lib/i18n/dictionaries/<locale>.ts`.
 */
const WORDS = {
  de: { record: "Aufnehmen", again: "Nochmals", stop: "Fertig" },
  en: { record: "Record", again: "Again", stop: "Done" },
};

const words = WORDS[LOCALE] ?? WORDS.de;

/**
 * Chrome's flags for a microphone that is not a microphone.
 *
 * `--use-fake-ui-for-media-stream` answers the permission prompt, which would
 * otherwise block forever in a headless run. `--use-fake-device-for-media-
 * stream` supplies a synthetic input. `--use-file-for-fake-audio-capture`
 * replaces the synthetic tone with a real recording when one is given, and
 * wants 16-bit PCM WAV — an mp3 is accepted silently and then produces
 * nothing, which is the confusing failure worth naming here.
 */
/**
 * Audio loud enough to be a recording, made here rather than committed.
 *
 * WHY THE HARNESS HAS TO MAKE ITS OWN. Chrome's synthetic device emits a tone
 * at roughly −50 dB peak, and this product's floor for "there was anything
 * here" (`AUDIBLE_PEAK_DB`) is −45. So EVERY take through the synthetic device
 * is `too-quiet`, which is `usable() === false`, which means the transcript
 * guard suppresses it — and the run then reports "never transcribes" for a
 * variety that transcribes perfectly well. The harness measured its own
 * microphone and blamed the page.
 *
 * Pink noise under a 4 Hz tremolo is not speech and is not pretending to be:
 * it is loud, it has a syllable-ish envelope, so the delivery analyser finds
 * runs and pauses and the take comes out usable. That is all this needs to
 * exercise — whether audio reaches the recorder, and whether the right takes
 * reach the transcriber.
 *
 * FOR TRANSCRIPTION QUALITY, pass a real recording: `AUDIO=zuerich.wav`, 16-bit
 * PCM. Nothing generated here can tell you whether a transcript is CORRECT,
 * and a harness that implied otherwise would be worse than none.
 *
 * Without ffmpeg it falls back to the synthetic device and says loudly what
 * that costs, rather than producing a confident wrong answer.
 */
function fakeMicrophone() {
  if (AUDIO) {
    if (!existsSync(AUDIO)) {
      console.error(`AUDIO=${AUDIO} does not exist`);
      process.exit(2);
    }
    return { path: AUDIO, note: `file ${AUDIO}` };
  }

  const out = join(mkdtempSync(join(tmpdir(), "heidi-speaking-")), "loud.wav");
  try {
    execFileSync(
      "ffmpeg",
      [
        "-hide_banner", "-loglevel", "error", "-y",
        "-f", "lavfi",
        "-i", "anoisesrc=d=20:c=pink:a=0.9,tremolo=f=4:d=0.85,highpass=f=120,lowpass=f=3400",
        "-ar", "48000", "-ac", "1", "-acodec", "pcm_s16le",
        out,
      ],
      { stdio: "ignore" },
    );
    return { path: out, note: "generated pink noise, loud enough to be a recording (not speech)" };
  } catch {
    return {
      path: null,
      note:
        "Chrome's synthetic tone — NO ffmpeg, so every take will read as `too-quiet`, " +
        "and a variety that transcribes will report as one that does not. Install ffmpeg or pass AUDIO=.",
    };
  }
}

function launchArgs(mic) {
  const args = ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"];
  if (mic.path) {
    args.push(`--use-file-for-fake-audio-capture=${mic.path}`, "--allow-file-access-from-files");
  }
  return args;
}

/**
 * Is a recogniser present, and does it ever SAY anything?
 *
 * The distinction this measures is the one `use-dictation.ts` was written
 * around: a Chromium without Google's speech service accepts `start()` and
 * then fires nothing at all — no result, no error, no end. "Present" is
 * therefore not an answer; the only answer is how long it stayed silent.
 */
async function probeRecogniser(page) {
  return page.evaluate(async () => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return { present: false };

    return await new Promise((resolve) => {
      const events = [];
      const rec = new Ctor();
      rec.lang = "de-CH";
      rec.interimResults = true;

      const done = (verdict) => {
        try {
          rec.abort();
        } catch {
          /* already dead */
        }
        resolve({ present: true, verdict, events });
      };

      rec.onstart = () => events.push("start");
      rec.onaudiostart = () => events.push("audiostart");
      rec.onspeechstart = () => events.push("speechstart");
      rec.onresult = (e) => {
        events.push("result");
        done(e.results?.[0]?.[0]?.transcript ?? "(empty)");
      };
      rec.onerror = (e) => {
        events.push(`error:${e.error}`);
        done(`error: ${e.error}`);
      };
      rec.onend = () => events.push("end");

      // Longer than the app's own START_TIMEOUT_MS (4s), so a run that the app
      // would have given up on still shows here as the silence it is.
      setTimeout(() => done("SILENT — no result and no error"), 9000);

      try {
        rec.start();
      } catch (err) {
        done(`threw: ${String(err)}`);
      }
    });
  });
}

/** The visible text of the practice panel, collapsed to one line per idea. */
async function panelText(page) {
  return page.evaluate(() => {
    const section = document.querySelector('section[aria-labelledby="practice-heading"]');
    if (!section) return "(no practice panel on this page)";
    return section.innerText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" · ");
  });
}

async function main() {
  const mic = fakeMicrophone();
  const browser = await chromium.launch({ args: launchArgs(mic) });
  const context = await browser.newContext({ permissions: ["microphone"] });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

  /** Every transcribe attempt, with what came back. */
  const uploads = [];
  page.on("response", async (res) => {
    if (!res.url().includes("/transcribe")) return;
    let body = "";
    try {
      body = (await res.text()).slice(0, 300);
    } catch {
      body = "(unreadable)";
    }
    uploads.push({ url: new URL(res.url()).pathname, status: res.status(), body });
  });

  const url = `${BASE}/${LOCALE}/speaking`;
  console.log(`speaking: ${url}`);
  console.log(`microphone: ${mic.note}\n`);

  await page.goto(url, { waitUntil: "domcontentloaded" });

  // The recogniser probe first: it is about the browser, not the page, and it
  // is the one measurement worth having even if the page below is broken.
  const rec = await probeRecogniser(page);
  console.log("SpeechRecognition (the chat composer's fast path)");
  if (!rec.present) {
    console.log("  absent — the composer falls back to recording. That is the designed path.\n");
  } else {
    console.log(`  present, lang=de-CH`);
    console.log(`  events: ${rec.events.join(", ") || "(none)"}`);
    console.log(`  verdict: ${rec.verdict}\n`);
  }

  /** The varieties the page offers, read from the page rather than assumed. */
  const varieties = await page.$$eval('input[name="practice-variety"]', (inputs) =>
    inputs.map((input) => ({
      id: input.value,
      label: input.closest("label")?.innerText.trim() ?? input.value,
    })),
  );

  if (varieties.length === 0) {
    console.log("varieties: none offered — a single-variety pack renders no switch.");
  }

  const targets = varieties.length > 0 ? varieties : [{ id: "(only)", label: "(the only variety)" }];

  /**
   * ONE VARIETY, BOTH LENGTHS — because either length alone proves nothing.
   *
   * A short take that is not uploaded looks identical to an upload that is
   * simply broken, and a long take that IS uploaded says nothing about the
   * guard. Run together they are a truth table with one bad row:
   *
   *   long uploaded, short not   → the variety transcribes and the guard holds
   *   neither uploaded           → the variety does not transcribe at all
   *   both uploaded              → THE GUARD IS BROKEN — a take the product
   *                                calls unreadable was sent anyway, and a
   *                                Whisper-family model answers that with
   *                                invented words rather than with silence
   *   long not, short yes        → something is very wrong; read the output
   */
  const LENGTHS = [
    { ms: 6000, name: "long (usable)" },
    { ms: 1500, name: "short (under MIN_USEFUL_MS)" },
  ];

  for (const variety of targets) {
    console.log(`── ${variety.label} (${variety.id})`);
    const seen = {};

    for (const length of LENGTHS) {
      uploads.length = 0;

      await page.goto(url, { waitUntil: "domcontentloaded" });
      if (varieties.length > 0) {
        /**
         * CLICK THE LABEL, NOT THE INPUT.
         *
         * The radios are `sr-only` on purpose — the platform keeps the roving
         * focus and arrow keys while the label carries the styling — so the
         * input is a 1px box underneath a label that intercepts every pointer
         * event. `page.check()` on it retries for thirty seconds and then
         * fails with "label intercepts pointer events", which reads like a
         * broken page and is a broken HARNESS. Checking it programmatically
         * would be worse: it would bypass the click a person actually makes.
         */
        await page.locator(`label:has(input[value="${variety.id}"])`).first().click();
        await page.waitForFunction(
          (id) => document.querySelector(`input[name="practice-variety"][value="${id}"]`)?.checked === true,
          variety.id,
          { timeout: 5000 },
        );
      }

      const button = page.locator(`button:has-text("${words.record}"), button:has-text("${words.again}")`).first();
      if ((await button.count()) === 0) {
        console.log("  FAIL  no record button — is the page signed-out or the mic unsupported?");
        console.log(`  page says: ${await panelText(page)}`);
        break;
      }

      await button.click();

      /**
       * THE LEVEL METER IS THE MEASUREMENT.
       *
       * A record button that turns into a stop button proves a state change
       * and nothing else. The meter is scaled from the live analyser, so a
       * value that MOVES is the only evidence in the DOM that audio is
       * arriving — and a dead or muted microphone is exactly the failure that
       * otherwise looks identical to a working one.
       */
      const scales = [];
      const samples = Math.max(2, Math.round(length.ms / 400));
      for (let i = 0; i < samples; i++) {
        await page.waitForTimeout(400);
        const transform = await page
          .locator('[aria-hidden="true"].rounded-full.border-2')
          .first()
          .evaluate((el) => el.style.transform)
          .catch(() => "");
        const m = /scale\(([\d.]+)\)/.exec(transform);
        if (m) scales.push(Number(m[1]));
      }

      const moved = scales.length > 1 && Math.max(...scales) - Math.min(...scales) > 0.001;

      const stop = page.locator(`button:has-text("${words.stop}")`).first();
      if ((await stop.count()) === 0) {
        console.log(`  ${length.name}: FAIL — no stop button while recording`);
        break;
      }
      await stop.click();

      // Long enough for an upload to be made and answered, short enough that
      // four runs do not take two minutes.
      await page.waitForTimeout(6000);

      seen[length.ms] = uploads.length > 0;

      const audio = moved ? "audio flowing" : "FLAT — no audio reaching the page";
      if (uploads.length === 0) {
        console.log(`  ${length.name}: ${audio} · transcribe NOT called`);
      } else {
        for (const up of uploads) {
          console.log(`  ${length.name}: ${audio} · transcribe ${up.status} → ${up.body}`);
        }
      }
    }

    const long = seen[6000];
    const short = seen[1500];
    let verdict;
    if (long && !short) verdict = "OK — transcribes, and refuses a take it cannot read";
    else if (!long && !short) verdict = "OK — this variety never transcribes, by design";
    else if (long && short) verdict = "BROKEN — an unreadable take was sent; expect invented words";
    else verdict = "ODD — the short take uploaded and the long one did not";
    console.log(`  verdict: ${verdict}\n`);
  }

  if (consoleErrors.length > 0) {
    console.log("console errors");
    for (const err of [...new Set(consoleErrors)].slice(0, 10)) console.log(`  ${err}`);
  } else {
    console.log("console: clean");
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
