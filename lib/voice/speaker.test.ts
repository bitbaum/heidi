import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createHeidiSpeaker,
  shouldAttempt,
  type ServerClip,
  type SpeakOutcome,
  type SynthLike,
  type UtteranceLike,
} from "./speaker.ts";

/**
 * A synthesiser that does what real ones do: `speak` holds the utterance,
 * `cancel` fires `onerror` on it (every engine reports an interrupted reading
 * as an error), and the test ends a reading by hand.
 */
function fakeSynth() {
  const spoken: UtteranceLike[] = [];
  let live: UtteranceLike | null = null;
  const synth: SynthLike = {
    speak: (u) => {
      spoken.push(u);
      live = u;
    },
    cancel: () => {
      const was = live;
      live = null;
      was?.onerror?.();
    },
    getVoices: () => [],
  };
  class Utterance implements UtteranceLike {
    lang = "";
    rate = 1;
    voice = null;
    onend: (() => void) | null = null;
    onerror: ((event?: { error?: string }) => void) | null = null;
    text: string;
    constructor(text: string) {
      this.text = text;
    }
  }
  return { synth, Utterance, spoken };
}

const petra = { name: "Petra", lang: "de-CH" };

function speaker(over: Partial<Parameters<typeof createHeidiSpeaker>[0]> = {}) {
  const outcomes: SpeakOutcome[] = [];
  const { synth, Utterance, spoken } = fakeSynth();
  const s = createHeidiSpeaker({
    synth,
    Utterance,
    voice: petra,
    rate: 1,
    allowAnyVoice: false,
    server: null,
    onOutcome: (o) => outcomes.push(o),
    ...over,
  });
  return { s, outcomes, spoken };
}

test("a device with no German voice is not asked to speak", () => {
  // Measured on the live site with a browser that has a synthesiser and zero
  // installed voices: `speechSynthesis.speak()` fired `onerror` with
  // `synthesis-failed`, never fired `onstart`, and said nothing.
  assert.equal(shouldAttempt(null), false);
  assert.equal(shouldAttempt(petra), true);
});

test("with a German voice, the line is read by that voice at the learner's rate", async () => {
  const { s, outcomes, spoken } = speaker({ rate: 0.8 });
  const read = s.speak("Grüezi mitenand");
  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].voice, petra, "the voice is named, not left to the engine's default");
  assert.equal(spoken[0].rate, 0.8);
  spoken[0].onend?.();
  await read;
  assert.deepEqual(outcomes, ["done"]);
});

test("no German voice and no server voice: nothing is said, and the outcome says why", async () => {
  const { s, outcomes, spoken } = speaker({ voice: null });
  await s.speak("Grüezi");
  assert.equal(spoken.length, 0, "the engine would have read it with its default voice");
  assert.deepEqual(outcomes, ["no-voice"]);
});

test("the learner's override reads with whatever the engine has", async () => {
  const { s, spoken } = speaker({ voice: null, allowAnyVoice: true });
  void s.speak("Grüezi");
  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].voice, null);
});

test("an engine that refuses after being asked is a failure, not silence", async () => {
  const { s, outcomes, spoken } = speaker();
  const read = s.speak("Grüezi");
  spoken[0].onerror?.();
  await read;
  assert.deepEqual(outcomes, ["failed"]);
});

test("a line interrupted by another control's line is not a failure", async () => {
  // Each Speak button has its own speaker; they share the one synthesiser.
  const { s, outcomes, spoken } = speaker();
  const read = s.speak("Grüezi");
  spoken[0].onerror?.({ error: "interrupted" });
  await read;
  assert.deepEqual(outcomes, []);
});

test("stopping a reading is not reported as a failure", async () => {
  // `cancel()` fires `onerror` on the utterance in flight. Reported as a
  // failure, pressing Stop would leave "that did not work" under the button.
  const { s, outcomes } = speaker();
  const read = s.speak("Grüezi");
  s.cancel();
  await read;
  assert.deepEqual(outcomes, []);
});

test("a second line replaces the first, and only the second reports", async () => {
  const { s, outcomes, spoken } = speaker();
  const first = s.speak("eis");
  const second = s.speak("zwei");
  await first;
  assert.equal(spoken.length, 2);
  spoken[1].onend?.();
  await second;
  assert.deepEqual(outcomes, ["done"]);
});

test("no German voice on the device: the server voice reads it, and the device stays silent", async () => {
  const asked: { text: string; rate: number }[] = [];
  let finish: (o: SpeakOutcome) => void = () => {};
  const server = (text: string, rate: number): ServerClip => {
    asked.push({ text, rate });
    return { done: new Promise((r) => (finish = r)), cancel: () => finish("failed") };
  };
  const { s, outcomes, spoken } = speaker({ voice: null, server, rate: 1.2 });
  const read = s.speak("Grüezi");
  assert.deepEqual(asked, [{ text: "Grüezi", rate: 1.2 }]);
  assert.equal(spoken.length, 0);
  finish("done");
  await read;
  assert.deepEqual(outcomes, ["done"]);
});

test("a device with a German voice never calls the server", () => {
  let called = false;
  const server = (): ServerClip => {
    called = true;
    return { done: Promise.resolve("done"), cancel: () => {} };
  };
  const { s, spoken } = speaker({ server });
  void s.speak("Grüezi");
  assert.equal(called, false, "the device's own voice is free and nothing leaves the device");
  assert.equal(spoken.length, 1);
});

test("stopping the server voice reports nothing", async () => {
  let finish: (o: SpeakOutcome) => void = () => {};
  const server = (): ServerClip => ({ done: new Promise((r) => (finish = r)), cancel: () => finish("failed") });
  const { s, outcomes } = speaker({ voice: null, server });
  const read = s.speak("Grüezi");
  s.cancel();
  await read;
  assert.deepEqual(outcomes, []);
});
