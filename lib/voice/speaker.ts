/**
 * Heidi's voice, in the shape the fleet's speech hook takes.
 *
 * `useSpeech` in `@bitbaum/chatkit` owns the lifecycle every product had
 * written for itself: one reading at a time, stop, silence on the way out. It
 * reads through a `Speaker` — two methods, `speak` and `cancel`. This module
 * is that speaker for Heidi, and it holds only what is Heidi's:
 *
 *  1. WHICH VOICE. The German voice `variety.ts` picked, named on the
 *     utterance; never the engine's default, which on a device configured in
 *     English is an English voice reading Zurich German.
 *  2. THE REFUSAL. No German voice on the device and none on the server means
 *     nothing is said, and the outcome says why (`no-voice`), instead of a
 *     control that flicks back to rest in silence.
 *  3. THE SERVER VOICE (`/api/speak`), for a device with no German voice of
 *     its own. The device's voice is always tried first: it is free and
 *     nothing leaves the device.
 *
 * The browser is handed in rather than reached for, so every branch is held
 * by a test under `node:test` with no synthesiser.
 */

import type { VoiceLike } from "./variety.ts";
import { SPEECH_LANG } from "./variety.ts";
import { clampRate } from "./settings.ts";

/** chatkit's `Speaker`, restated so this module imports no React package. */
export type SpeakerLike = {
  /** Resolves when the text has been read, or cut off. Never rejects. */
  speak(text: string): Promise<void>;
  cancel(): void;
};

/**
 * How one reading ended.
 *
 * `no-voice` is known BEFORE trying: there is no German voice to read with.
 * `failed` is the engine or the player refusing AFTER being asked. Measured on
 * the live site: a browser with a synthesiser and zero installed voices fires
 * `onerror` with `synthesis-failed` and says nothing.
 *
 * Kept apart because the honest sentence differs: one is "this device cannot",
 * the other is "that did not work". A reading the learner stopped is neither,
 * and reports nothing.
 */
export type SpeakOutcome = "done" | "no-voice" | "failed";

export type UtteranceLike = {
  lang: string;
  rate: number;
  voice: VoiceLike | null;
  onend: (() => void) | null;
  /** `error` is the engine's own word: `interrupted`, `canceled`, `synthesis-failed`… */
  onerror: ((event?: { error?: string }) => void) | null;
};

export type SynthLike = {
  speak: (u: UtteranceLike) => void;
  cancel: () => void;
  getVoices: () => VoiceLike[];
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

/** One clip from the server voice: resolves with how it ended. */
export type ServerClip = { done: Promise<SpeakOutcome>; cancel: () => void };

export type SpeakerOptions = {
  synth: SynthLike | null;
  /** `SpeechSynthesisUtterance`, or null where the browser has none. */
  Utterance: (new (text: string) => UtteranceLike) | null;
  /** The German voice this device has, from `pickVoice`; null when it has none. */
  voice: VoiceLike | null;
  rate: number;
  /**
   * The learner's own informed override: read with whatever the engine has.
   * Off unless asked for, because its other setting produces confident
   * nonsense.
   */
  allowAnyVoice: boolean;
  /** Plays the line through the server voice; null where there is none. */
  server: ((text: string, rate: number) => ServerClip) | null;
  /** Told how each reading ended, unless it was cut off. */
  onOutcome: (outcome: SpeakOutcome) => void;
};

/**
 * May we even try to speak with what this device has?
 *
 * The rule is short and the reason is the whole module: with no German voice
 * the engine either says nothing or says it with an English mouth, and the
 * learner cannot tell which happened.
 */
export function shouldAttempt(voice: VoiceLike | null): boolean {
  return voice !== null;
}

export function createHeidiSpeaker(options: SpeakerOptions): SpeakerLike {
  const { synth, Utterance, voice, allowAnyVoice, server, onOutcome } = options;
  const rate = clampRate(options.rate);
  // The reading in flight. Cancelling swaps it out first, so the `onerror`
  // every engine fires for an interrupted utterance is not reported as a
  // failure: the learner pressed Stop, and nothing went wrong.
  let current: { cut: boolean; cancel: () => void } | null = null;

  const cancel = () => {
    const was = current;
    current = null;
    if (was) {
      was.cut = true;
      was.cancel();
    }
  };

  return {
    cancel,
    speak(text) {
      cancel();
      return new Promise<void>((resolve) => {
        const refuse = (outcome: SpeakOutcome) => {
          onOutcome(outcome);
          resolve();
        };

        const canSynth = synth !== null && Utterance !== null;

        // No German voice here (or no synthesiser at all): the server reads it.
        if ((!canSynth || !shouldAttempt(voice)) && server) {
          synth?.cancel();
          const clip = server(text, rate);
          const mine = { cut: false, cancel: clip.cancel };
          current = mine;
          void clip.done.then((outcome) => {
            if (current === mine) current = null;
            if (!mine.cut) onOutcome(outcome);
            resolve();
          });
          return;
        }

        // Nothing to read with. Assigning no voice and speaking anyway makes
        // the engine substitute its default — a pronunciation model for a
        // language nobody speaks, delivered with confidence.
        if (!canSynth || (!shouldAttempt(voice) && !allowAnyVoice)) return refuse("no-voice");

        // Always cancel first. A second `speak` while one is in flight QUEUES
        // on every engine rather than replacing it.
        synth.cancel();

        const utterance = new Utterance(text);
        utterance.lang = SPEECH_LANG;
        utterance.rate = rate;
        // Naming the voice as well as the language matters: with only `lang`
        // set, engines fall back to the system default.
        if (voice) utterance.voice = voice;

        const mine = { cut: false, cancel: () => synth.cancel() };
        const end = (outcome: SpeakOutcome) => () => {
          if (current === mine) current = null;
          if (!mine.cut) onOutcome(outcome);
          resolve();
        };
        utterance.onend = end("done");
        // An error is silence the learner cannot tell from a dead button —
        // unless it is the engine saying another line took over. Every Speak
        // control has its own speaker and they share one synthesiser, so
        // pressing a second line interrupts the first; that is not a failure
        // of the first.
        utterance.onerror = (event) => {
          if (event?.error === "interrupted" || event?.error === "canceled") mine.cut = true;
          end("failed")();
        };

        current = mine;
        synth.speak(utterance);
      });
    },
  };
}
