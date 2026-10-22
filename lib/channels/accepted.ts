import type { VarietyPack } from "../variety/pack.ts";

/**
 * Which caption languages a transcript may be in, read from the pack.
 *
 * THE RULE, in the pack's own terms rather than any language's name: a
 * publisher's captions in the TARGET variety are the best possible transcript
 * and are taken first; captions in a BRIDGE the pack calls a sibling or a
 * roof are the normal case — subtitled dialect is, per HEIDI.md §3, the most
 * effective listening material there is, because the bridge is on screen
 * while the target goes past the ear. A `gloss` bridge (a language the
 * learner merely also reads) is NOT a transcript of what was said and is
 * refused: questions written from an English translation would test
 * translation, not listening.
 *
 * Automatic captions are allowed only when the pack says its own speech
 * recognition returns the spoken variety OR the track is in a bridge that
 * has a recogniser worth trusting (`bridgeRecognition.available`). For the
 * Zurich pack that means: automatic captions in the bridge are accepted and
 * labelled as automatic; a recogniser's guess at the dialect is not a
 * transcript (§8) and the page says so when that is all there was.
 */
export function acceptedLanguages(pack: VarietyPack): string[] {
  const bridges = pack.bridges.filter((b) => b.relation === "sibling" || b.relation === "roof").map((b) => b.tag);
  return [pack.tag, ...bridges];
}

export function allowAutomatic(pack: VarietyPack): boolean {
  const { recognition, bridgeRecognition } = pack.capabilities;
  return Boolean(bridgeRecognition?.available) || (recognition.available && recognition.returnsSpokenVariety);
}

/** The bridge the questions are written in — the first sibling, else the first bridge. */
export function questionLanguage(pack: VarietyPack): string {
  return (pack.bridges.find((b) => b.relation === "sibling") ?? pack.bridges[0]).name;
}
