/**
 * Which varieties a learner may practise SPEAKING in, and what each one may
 * honestly be told about itself.
 *
 * THE FILE THAT WAS MISSING, and its absence is what made the speaking screen
 * feel like a demo. Every part below already existed and was tested:
 *
 *   `speech/evidence.ts`    when a transcript is the learner's own words
 *   `speech/capability.ts`  which measures that unlocks, per variety
 *   `speech/fluency.ts`     the measures themselves
 *   `speech/spoken.ts`      joining them to the signal
 *   `packs/gsw-zh.ts`       `bridgeRecognition: returnsSpokenVariety: true`
 *
 * What nothing did was ASK. The practice surface offered one path — measure
 * the signal, have the learner type out their own sentence — and offered it to
 * everybody, for every language, forever, because the branch that would have
 * offered anything else was never written. `capability.ts` computed a verdict
 * of `bridge` for fluency, words and grammar and the only thing that read it
 * was a claims table on the technology page.
 *
 * So this file is the join, and it is deliberately dull: it takes a pack and
 * returns a list. Nothing here knows what German is. A pack with a faithful
 * TARGET recogniser gets dialect practice with words in it and no code
 * changes; a pack with neither gets one signal-only entry and the screen
 * renders the honest version of itself.
 *
 * WHY "target" AND "bridge" ARE THE ONLY IDS. They are the two roles a
 * variety plays for a learner, not two languages: the one being learned and
 * the one already held. A pack with three bridges still has one SIBLING —
 * `siblingOf` picks it — because the sibling is the one close enough to be
 * worth speaking rather than merely translating from. Adding a third id would
 * mean a learner choosing between two things they already speak.
 *
 * Pure: no I/O, no model, same input -> same output.
 */

import { siblingOf, type VarietyPack } from "../../variety/pack.ts";
import { evidenceFrom, isFaithfulRendering, type EvidenceKind, type Recognition } from "../../speech/evidence.ts";

export type SpokenVarietyId = "target" | "bridge";

export type SpokenVariety = {
  id: SpokenVarietyId;
  /**
   * What speakers call it — `Züritüütsch`, `Swiss Standard German`.
   *
   * A NAME, so it survives the projection into `DISPLAY` and reads correctly
   * in every locale, for the reason `display.ts` gives at length: a name is
   * not in any language. Nothing else here is prose.
   */
  name: string;
  /** The BCP-47 tag, e.g. `gsw-zh`, `de-CH`. */
  tag: string;
  /**
   * The primary subtag, which is what a recogniser wants: `de`, not `de-CH`.
   *
   * Derived rather than stored, because a second field is a second thing to
   * keep in agreement with the first and the derivation is a `split`.
   */
  recognitionLang: string;
  /** What recognition does to this variety, or undefined if there is none. */
  recognition?: Recognition;
  /** What a transcript of it may be used for. */
  evidence: EvidenceKind;
  /**
   * May a machine transcript be shown to the learner AS what they said?
   *
   * The whole question, and the reason the dialect half asks people to type.
   * A translated transcript under the heading "what you said" is a false
   * statement in the one place a learner cannot check it — they do not know
   * the target variety, which is why they are here.
   */
  transcribable: boolean;
  /** A grammar service code for this variety, or null where none covers it. */
  grammarCode: string | null;
};

/** `de-CH` -> `de`. Lowercased, because a tag's case is not meaningful. */
function primarySubtag(tag: string): string {
  return tag.split("-")[0]!.toLowerCase();
}

/**
 * The practice varieties this pack offers, target first.
 *
 * Target first because it is the subject: a learner here is learning the
 * dialect, and a screen that led with the bridge would be quietly telling them
 * the real thing is unavailable. It is not unavailable — it is measured from
 * the signal, which is the honest version of what every competitor scores.
 *
 * The bridge appears ONLY when it is a sibling AND its recogniser returns what
 * was said. A bridge that merely exists is a language the learner already
 * speaks, and offering it without the measurement it unlocks would be a second
 * button that does the same thing as the first.
 */
export function spokenVarieties(pack: VarietyPack): SpokenVariety[] {
  const out: SpokenVariety[] = [
    {
      id: "target",
      name: pack.endonym,
      tag: pack.tag,
      recognitionLang: primarySubtag(pack.tag),
      recognition: pack.capabilities.recognition,
      evidence: evidenceFrom(pack.capabilities.recognition),
      transcribable: isFaithfulRendering(pack.capabilities.recognition),
      grammarCode: pack.speech.grammarCode,
    },
  ];

  const sibling = siblingOf(pack);
  const bridgeRecognition = pack.capabilities.bridgeRecognition;
  if (sibling && bridgeRecognition && isFaithfulRendering(bridgeRecognition)) {
    out.push({
      id: "bridge",
      name: sibling.name,
      tag: sibling.tag,
      recognitionLang: primarySubtag(sibling.tag),
      recognition: bridgeRecognition,
      evidence: evidenceFrom(bridgeRecognition),
      transcribable: true,
      grammarCode: pack.speech.bridgeGrammarCode ?? null,
    });
  }

  return out;
}

/**
 * Is there a choice to put in front of the learner at all?
 *
 * One entry is not a choice, it is a label — and a radio group with one option
 * is a control that cannot be operated. The page shows the switch only when
 * this is true, which for a pack with no faithful recogniser anywhere means
 * never, and the screen is exactly what it is today.
 */
export function hasSpokenChoice(pack: VarietyPack): boolean {
  return spokenVarieties(pack).length > 1;
}
