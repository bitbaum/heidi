"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSpeech as useFleetSpeech } from "@bitbaum/chatkit/react";
// Relative, not the `@/` alias: this module is covered by a node:test suite,
// which resolves neither tsconfig paths nor extensionless imports.
import { useClientValue } from "../../../lib/browser/store.ts";
import { claimFor, pickVoice, type VoiceClaim, type VoiceLike } from "../../../lib/voice/variety.ts";
import {
  createHeidiSpeaker,
  type ServerClip,
  type SpeakOutcome,
  type SynthLike,
  type UtteranceLike,
} from "../../../lib/voice/speaker.ts";

/**
 * Heidi reading a line out loud, using the browser's own synthesiser.
 *
 * THE READING ITSELF IS THE FLEET'S: `useSpeech` from `@bitbaum/chatkit` owns
 * one-reading-at-a-time, stop, and silence when the page is left. What is
 * Heidi's is which voice may read (`lib/voice/speaker.ts`) and what the
 * learner is told about it (`lib/voice/variety.ts`); this hook joins the two.
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

function synth(): SynthLike | null {
  if (typeof window === "undefined") return null;
  const s = (window as unknown as { speechSynthesis?: SynthLike }).speechSynthesis;
  return s ?? null;
}

/** Stable identity: `useSyncExternalStore` calls this on every render. */
const detectSupport = () => synth() !== null;

/**
 * THE SERVER VOICE (`/api/speak`, `lib/voice/server-tts.ts`), for a device
 * with no German voice of its own. Asked once per page load whether this
 * deployment has one; the device's own voice is always tried first, because
 * it is free and nothing leaves the device.
 */
let serverVoice: Promise<boolean> | null = null;
function hasServerVoice(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  serverVoice ??= fetch("/api/speak")
    .then((r) => (r.ok ? r.json() : { available: false }))
    .then((j: { available?: boolean }) => j.available === true)
    .catch(() => false);
  return serverVoice;
}

/**
 * One line through the server voice. A request the server turns down is
 * `no-voice` (it had none after all); a clip that will not play is `failed`.
 */
function playFromServer(text: string, rate: number): ServerClip {
  let player: HTMLAudioElement | null = null;
  // Stopped while the clip was still being fetched: it must not start playing
  // when it arrives, over whatever the learner did next.
  let cut = false;
  let finish: (outcome: SpeakOutcome) => void = () => {};
  const done = new Promise<SpeakOutcome>((resolve) => {
    finish = resolve;
  });
  void fetch("/api/speak", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  })
    .then(async (r) => {
      if (!r.ok) throw new Error(String(r.status));
      const blob = await r.blob();
      if (cut) return;
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = rate;
      player = audio;
      const end = (outcome: SpeakOutcome) => () => {
        URL.revokeObjectURL(url);
        finish(outcome);
      };
      audio.onended = end("done");
      audio.onerror = end("failed");
      await audio.play();
    })
    .catch(() => finish("no-voice"));
  return {
    done,
    cancel: () => {
      cut = true;
      player?.pause();
      finish("done");
    },
  };
}

/**
 * Two ways for speech not to happen, and they are not the same thing: see
 * `SpeakOutcome` in `lib/voice/speaker.ts`. Returning to `idle` for either is
 * what made the control look broken, since idle and finished-speaking look
 * identical to a learner.
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
  const deviceSupported = useClientValue(detectSupport, false);
  const [voice, setVoice] = useState<VoiceLike | null>(null);
  const [server, setServer] = useState(false);
  // How the last reading ended, when it ended badly. Cleared by the next one.
  const [trouble, setTrouble] = useState<"no-voice" | "failed" | null>(null);

  useEffect(() => {
    let live = true;
    void hasServerVoice().then((yes) => live && setServer(yes));
    return () => {
      live = false;
    };
  }, []);
  const supported = deviceSupported || server;
  // Which voice WILL speak: the device's German one, else the server's —
  // which is a German voice too, and labelled as one.
  const claim: VoiceClaim = voice ? claimFor(voice) : server ? "german" : "none";

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

  const speaker = useMemo(() => {
    if (!supported) return null;
    return createHeidiSpeaker({
      synth: synth(),
      Utterance:
        (window as unknown as { SpeechSynthesisUtterance?: new (t: string) => UtteranceLike })
          .SpeechSynthesisUtterance ?? null,
      voice,
      rate,
      allowAnyVoice,
      server: server ? playFromServer : null,
      onOutcome: (outcome) => setTrouble(outcome === "done" ? null : outcome),
    });
  }, [supported, voice, rate, allowAnyVoice, server]);

  const fleet = useFleetSpeech(speaker);
  const { speak: read, stop: silence } = fleet;

  const speak = useCallback(
    (text: string) => {
      setTrouble(null);
      read(text);
    },
    [read],
  );
  const stop = useCallback(() => {
    setTrouble(null);
    silence();
  }, [silence]);

  const state: SpeechState = trouble ?? (fleet.speaking ? "speaking" : "idle");
  return { supported, state, claim, speak, stop };
}
