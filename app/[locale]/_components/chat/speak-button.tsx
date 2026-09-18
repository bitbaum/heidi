"use client";

import type { Dictionary } from "@/lib/i18n";
import { useSpeech } from "../use-speech";
import { useVoiceSettings } from "../use-voice-settings";

/**
 * Hear a line, with the truth about what is saying it.
 *
 * Beside `Copy`, on the dialect block and on every suggestion, because those
 * are the lines a learner has to produce — and "what does this sound like" is
 * the question that has had no answer here at all.
 *
 * THE CLAIM IS NOT IN A TOOLTIP. Every device in reach speaks Swiss STANDARD
 * German at best, and a learner cannot hear the difference — that is why they
 * are here. So the sentence saying which one they got is rendered in the flow
 * after they press it, not hidden behind a hover that phones do not have and
 * screen readers announce last.
 *
 * On a dialect line the caveat is stronger and is the reason `dialect` is a
 * prop rather than something inferred: a Standard German voice reading Zurich
 * spelling gets the words roughly right and the `ch`, the vowels and the
 * melody wrong. Useful for locating a word in a sentence, useless as a model
 * to imitate, and silence about the difference would be exactly the lemons
 * trade §6 exists to refuse.
 */
export function Speak({ text, t, dialect = false }: { text: string; t: Dictionary["voice"]; dialect?: boolean }) {
  const { settings } = useVoiceSettings();
  const speech = useSpeech(settings.rate);

  // Before hydration `supported` is false, so the control is absent rather
  // than rendered dead — the same shape the dictation button settled on.
  if (!speech.supported) return null;

  const speaking = speech.state === "speaking";
  // A failed attempt has to explain itself and keep explaining. Pressing a
  // control and getting silence reads as a broken product, and the learner
  // has no way to discover that their device simply has no German voice.
  const failed = speech.state === "failed";
  // Declined before trying, because the device has no German voice. A
  // different sentence from "that did not work", and the same standing
  // explanation rather than a flash.
  const noVoice = speech.state === "no-voice";

  /**
   * Enough of the line to tell two buttons apart, and no more: a screen reader
   * announcing a whole paragraph before the word "button" is its own defect.
   */
  const preview = text.length > 60 ? `${text.slice(0, 60).trimEnd()}…` : text;

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <button
        type="button"
        onClick={() => (speaking ? speech.stop() : speech.speak(text))}
        aria-live="off"
        /*
         * NAMED BY WHAT IT WILL READ. An answer carries up to seven of these —
         * the explanation, the dialect line, and one per suggestion — and
         * every one of them was called "Vorlesen". Tabbing the page with a
         * screen reader gave seven identical names and no way to tell which
         * button read which line. Measured on the live site.
         *
         * The label BEGINS with the visible word, which is the shape
         * `keep-word.tsx` already uses ("Wort merken: nöd"): a voice-control
         * user saying "click Vorlesen" still matches, so this is not the
         * visible-label-and-hidden-twin that #46 removed.
         */
        aria-label={`${speaking ? t.stop : t.speak}: ${preview}`}
        // min-h-11 and the flex centring are #79's tap-target fix, kept.
        className="inline-flex min-h-11 shrink-0 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
      >
        {speaking ? t.stop : t.speak}
      </button>
      {/* While speaking: what you are hearing. After a refusal or a failure:
          why you are not. All three are the same sentence from the same
          function the audio came from, so the page cannot describe a voice the
          device lacks. */}
      {(speaking || failed || noVoice) && (
        <span
          role={failed || noVoice ? "status" : undefined}
          className="max-w-measure text-caption leading-snug text-fg-muted"
        >
          {t.claim[speech.claim]}
          {speaking && dialect && speech.claim !== "none" && ` ${t.dialectCaveat}`}
        </span>
      )}
    </span>
  );
}
