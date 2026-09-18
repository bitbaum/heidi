"use client";

import { useCallback, useEffect, useRef, useState } from "react";
// Relative, not the `@/` alias: this module is covered by a node:test suite,
// which resolves neither tsconfig paths nor extensionless imports.
import { useClientValue } from "../../../lib/browser/store.ts";
import { claimFor, pickVoice, SPEECH_LANG, type VoiceClaim, type VoiceLike } from "../../../lib/voice/variety.ts";
import { clampRate } from "../../../lib/voice/settings.ts";

/**
 * Heidi reading a line out loud, using the browser's own synthesiser.
 *
 * The same choice dictation made, for the same two reasons and in the same
 * order: it is free and instant, and nothing leaves the device. A vendor voice
 * would mean every answer becoming an API call billed by the character, on a
 * product whose free tier is already rationed — and it would mean shipping the
 * learner's text to a third party to have it read back.
 *
 * WHAT IT CANNOT DO, said plainly because the learner cannot hear it:
 * NO BROWSER SHIPS A ZURICH GERMAN VOICE. `de-CH` is Swiss Standard German —
 * the written language read aloud in a Swiss accent — and that is the best any
 * device here offers. `lib/voice/variety.ts` holds that rule and refuses to
 * report any synthetic voice as dialect; this hook surfaces its verdict as
 * `claim`, so every control that speaks can say what is about to speak.
 *
 * Reading a DIALECT line with that voice is an approximation and never a model
 * to imitate: Swiss German spelling is close enough to phonetic that a German
 * voice gets the words roughly right and the `ch`, the vowels and the melody
 * wrong. Useful for "which word is that in the sentence"; useless for "how do
 * I say it". Callers pass the claim through to the learner rather than hiding
 * it — the one thing this product must not do is let somebody tune their ear
 * to something we know is not the target.
 */

type UtteranceLike = {
  lang: string;
  rate: number;
  voice: VoiceLike | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SynthLike = {
  speak: (u: UtteranceLike) => void;
  cancel: () => void;
  getVoices: () => VoiceLike[];
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

/**
 * May we even try to speak with what this device has?
 *
 * Exported and pure so the rule can be held by a test rather than inferred
 * from a hook nobody can call outside React. The rule is short and the reason
 * is the whole module: with no German voice the engine either says nothing or
 * says it with an English mouth, and the learner cannot tell which happened.
 */
export function shouldAttempt(voice: VoiceLike | null): boolean {
  return voice !== null;
}

function synth(): SynthLike | null {
  if (typeof window === "undefined") return null;
  const s = (window as unknown as { speechSynthesis?: SynthLike }).speechSynthesis;
  return s ?? null;
}

/** Stable identity: `useSyncExternalStore` calls this on every render. */
const detectSupport = () => synth() !== null;

/**
 * Two ways for speech not to happen, and they are not the same thing.
 *
 * `no-voice` is known BEFORE trying: the engine has no German voice installed,
 * so speaking would substitute the system default — an English voice reading
 * Zurich German, which is the thing `lib/voice/variety.ts` exists to refuse and
 * the thing a listener actually reported hearing. The hook declines to speak.
 *
 * `failed` is the engine refusing AFTER being asked. Measured on the live site:
 * a browser with a synthesiser and zero installed voices fires `onerror` with
 * `synthesis-failed` and never fires `onstart`, so the button flicked back to
 * its resting label and nothing was said — precisely the dead control
 * `use-dictation.ts` refuses to ship.
 *
 * Kept apart rather than collapsed into one "did not speak", because the
 * honest sentence differs: one is "this device cannot", the other is "that did
 * not work". Returning to `idle` for either is what made the control look
 * broken, since idle and finished-speaking look identical to a learner.
 */
export type SpeechState = "idle" | "speaking" | "no-voice" | "failed";

export type Speech = {
  /** Whether this browser can speak at all. False on the server's first pass. */
  supported: boolean;
  state: SpeechState;
  /**
   * What the available voice actually speaks. `"none"` means a browser that
   * has a synthesiser but no German voice installed — which happens, and in
   * which case speaking would teach the wrong sounds rather than none.
   */
  claim: VoiceClaim;
  speak: (text: string) => void;
  stop: () => void;
};

/**
 * `allowAnyVoice` defaults to false so a caller that has not been updated
 * refuses rather than performs — the safe direction for a flag whose other
 * setting produces confident nonsense.
 */
export function useSpeech(rate: number, allowAnyVoice = false): Speech {
  const supported = useClientValue(detectSupport, false);
  const [state, setState] = useState<SpeechState>("idle");
  const [voice, setVoice] = useState<VoiceLike | null>(null);

  // The utterance currently in flight, so `stop` and unmount can silence it.
  // A ref rather than state: nothing renders from it, and it must not be a
  // render's worth of latency behind the synthesiser.
  const speaking = useRef(false);

  /**
   * The voice list arrives LATE and sometimes EMPTY.
   *
   * Chrome returns nothing from `getVoices()` until it has fetched the list,
   * then fires `voiceschanged`. Reading once on mount gets an empty array and
   * concludes the device has no German voice — so the control would say "your
   * device has no voice for this" on the one browser where it does.
   */
  useEffect(() => {
    const s = synth();
    if (!s) return;
    const read = () => setVoice(pickVoice(s.getVoices() ?? []));
    read();
    s.addEventListener?.("voiceschanged", read);
    return () => s.removeEventListener?.("voiceschanged", read);
  }, []);

  /**
   * Silence on the way out. Without this, navigating away from a page that is
   * mid-sentence leaves the browser talking over the next one — speech is not
   * scoped to the document that started it.
   */
  useEffect(() => {
    return () => {
      if (speaking.current) synth()?.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    synth()?.cancel();
    speaking.current = false;
    setState("idle");
  }, []);

  const speak = useCallback(
    (text: string) => {
      const s = synth();
      const body = text.trim();
      if (!s || !body) return;

      // No German voice on this device means the engine will either say
      // nothing or say it with an English mouth. Both are worse than saying
      // so, and `claim` already carries the sentence that explains it.
      if (!shouldAttempt(voice)) {
        setState("failed");
        return;
      }

      // Always cancel first. A second `speak` while one is in flight QUEUES on
      // every engine rather than replacing, so pressing two lines in a row
      // reads both, one after the other, for as long as the learner keeps
      // pressing. Pressing a new line means "read this one".
      s.cancel();

      const Utterance = (window as unknown as { SpeechSynthesisUtterance?: new (t: string) => UtteranceLike })
        .SpeechSynthesisUtterance;
      if (!Utterance) return;

      // THE REFUSAL — which the comment below already described, and which the
      // code then went ahead and did anyway.
      //
      // With no German voice installed, `voice` is null. Assigning that and
      // calling `speak` makes the engine substitute the system default, and on
      // a device configured in English that is an English voice reading Zurich
      // German. For a learner who cannot yet hear the difference that is not a
      // degraded feature, it is a pronunciation model for a language nobody
      // speaks, delivered with confidence — exactly what `variety.ts` exists to
      // refuse, arriving through the one path that never asked it.
      //
      // `allowAnyVoice` is the learner's own informed override and is off by
      // default. See `speakWithoutGermanVoice` in lib/voice/settings.ts.
      if (!voice && !allowAnyVoice) {
        setState("no-voice");
        return;
      }

      const utterance = new Utterance(body);
      utterance.lang = SPEECH_LANG;
      utterance.rate = clampRate(rate);
      // Naming the voice as well as the language matters: with only `lang`
      // set, engines fall back to the system default, which on a device
      // configured in English is an English voice reading German.
      if (voice) utterance.voice = voice;
      utterance.onend = () => {
        speaking.current = false;
        setState("idle");
      };
      // An error is silence the learner cannot distinguish from a dead button,
      // so it resets the state rather than leaving it stuck on "speaking".
      utterance.onerror = () => {
        speaking.current = false;
        setState("failed");
      };

      speaking.current = true;
      setState("speaking");
      s.speak(utterance);
    },
    [rate, voice, allowAnyVoice],
  );

  return { supported, state, claim: claimFor(voice), speak, stop };
}
