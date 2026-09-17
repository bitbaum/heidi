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

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <button
        type="button"
        onClick={() => (speaking ? speech.stop() : speech.speak(text))}
        aria-live="off"
        className="min-h-9 shrink-0 text-sm text-link underline underline-offset-4 hover:text-accent"
      >
        {speaking ? t.stop : t.speak}
      </button>
      {/* Shown once it has spoken, not before: an explanation of a sound
          nobody has heard yet is noise on the page. */}
      {speaking && (
        <span className="max-w-measure text-[11px] leading-snug text-fg-muted">
          {t.claim[speech.claim]}
          {dialect && speech.claim !== "none" && ` ${t.dialectCaveat}`}
        </span>
      )}
    </span>
  );
}
