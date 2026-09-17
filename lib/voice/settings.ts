import { DEFAULT_CORRECTION, isCorrectionLevel, type CorrectionLevel } from "./correction.ts";

/**
 * What the learner has chosen about the spoken channel.
 *
 * ON THE DEVICE, NOT IN THE DATABASE, and not behind an account — the same
 * decision saved words already record. These three values say something about
 * how well somebody understands a language, which is exactly the kind of fact
 * §10 keeps out of our tables when it does not have to be in them. They also
 * need to work signed out, because the home page conversation does.
 *
 * Pure: the decode is here, the storage binding is in `use-voice-settings`.
 * A validator that cannot be unit-tested without a browser is a validator
 * nobody writes tests for.
 */

export type VoiceSettings = {
  /**
   * Read Heidi's answers aloud as they arrive.
   *
   * OFF by default, which is not timidity: a page that starts talking is the
   * single most hostile default on the web — in an open-plan office, on a
   * tram, next to a sleeping child. Speech is something you ask for.
   */
  speak: boolean;
  /**
   * How fast, as a multiplier. Slower is a real comprehension aid and the
   * first thing a learner reaches for; it is here rather than buried because
   * "say that again, slower" is the most common thing anybody says to a Swiss
   * person in the first year.
   */
  rate: number;
  /** How much to say about the learner's own production. See `correction.ts`. */
  correction: CorrectionLevel;
  /**
   * Read aloud even when the device has no German voice installed.
   *
   * OFF by default, and the default is the honest one. With no German voice,
   * `pickVoice` returns nothing, and an engine handed an utterance with no
   * voice substitutes the SYSTEM DEFAULT — on a device configured in English,
   * an English voice reading Zurich German. That is not a degraded version of
   * the feature; it is a pronunciation model for a language nobody speaks, fed
   * to the one person who cannot tell.
   *
   * It is a setting rather than a flat refusal because a learner may
   * reasonably judge a wrong-accented reading better than silence for getting
   * the WORDS — and that is their call to make, once told. What the product
   * must not do is make it for them silently, which is what it did.
   */
  speakWithoutGermanVoice: boolean;
};

/** Below this it stops sounding like speech; above it, a learner loses the ends of words. */
export const RATE_RANGE = { min: 0.5, max: 1.25 } as const;

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  speak: false,
  // Slightly under natural. The whole audience is people who cannot follow
  // this language at speed, so full speed is the wrong default for everyone
  // here even though it is the right default for a general-purpose reader.
  rate: 0.9,
  correction: DEFAULT_CORRECTION,
  speakWithoutGermanVoice: false,
};

export function clampRate(rate: number): number {
  if (!Number.isFinite(rate)) return DEFAULT_VOICE_SETTINGS.rate;
  return Math.min(RATE_RANGE.max, Math.max(RATE_RANGE.min, rate));
}

/**
 * Read what is in storage, keeping whatever is intelligible.
 *
 * FIELD BY FIELD, rather than rejecting the whole object on one bad value.
 * Storage is not ours: it holds what a previous version of this code wrote,
 * and dropping every setting because one field grew a new value is how a
 * person's preferences vanish on deploy day.
 */
export function decodeVoiceSettings(raw: string): VoiceSettings | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const value = parsed as Partial<Record<keyof VoiceSettings, unknown>>;

  return {
    speak: typeof value.speak === "boolean" ? value.speak : DEFAULT_VOICE_SETTINGS.speak,
    rate: typeof value.rate === "number" ? clampRate(value.rate) : DEFAULT_VOICE_SETTINGS.rate,
    correction: isCorrectionLevel(value.correction) ? value.correction : DEFAULT_VOICE_SETTINGS.correction,
    speakWithoutGermanVoice:
      typeof value.speakWithoutGermanVoice === "boolean"
        ? value.speakWithoutGermanVoice
        : DEFAULT_VOICE_SETTINGS.speakWithoutGermanVoice,
  };
}

/** One key, versioned, so a future shape change does not have to read this one. */
export const VOICE_SETTINGS_KEY = "heidi.voice.v1";
