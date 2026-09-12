/**
 * What a speech model returns when it hears nothing.
 *
 * Whisper does not answer "silence" — it answers with the most likely sentence
 * given no evidence, which for German audio is reliably a broadcast subtitle
 * credit and for English a politeness. Measured on this project's own endpoint:
 * a pure tone came back as "Amen.", and silence from a synthetic microphone as
 * "Untertitelung des ZDF, 2020".
 *
 * Left alone, dictating into a muted microphone types a sentence the person
 * never said into their message. That is worse than saying nothing: it is the
 * machine inventing words and attributing them to them.
 *
 * A denylist is a blunt instrument, and it is the right one here. These strings
 * are not things anybody dictates — they are the model's failure mode written
 * down. Anything genuinely spoken passes through untouched.
 */

/** Matched after lowercasing and stripping punctuation and whitespace. */
const SILENCE_ARTEFACTS = [
  // German — subtitle credits, the dominant artefact.
  "untertitelung des zdf",
  "untertitel im auftrag des zdf",
  "untertitel von stephanie geiges",
  "untertitelung im auftrag des zdf",
  "vielen dank",
  "vielen dank fürs zuschauen",
  "vielen dank für die aufmerksamkeit",
  // English.
  "thank you",
  "thanks for watching",
  "you",
  "bye",
  // Both, and the one this project's own probe produced.
  "amen",
  "musik",
  "music",
  "applaus",
  "applause",
  "copyright wdr",
];

/** Digits and punctuation carry no signal here: "Untertitelung des ZDF, 2020". */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[0-9]/g, " ")
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when the transcript is the model's silence artefact rather than speech.
 *
 * Only exact matches after normalisation. A prefix or substring rule would eat
 * "Vielen Dank für Ihre Hilfe, können Sie …", which is a real thing to dictate.
 */
export function looksLikeSilence(text: string): boolean {
  const t = normalise(text);
  if (!t) return true;
  return SILENCE_ARTEFACTS.includes(t);
}
