import { VARIETY } from "./active.ts";
import { areasOf, isTaught, marksFor } from "./family.ts";
import { ruleLabel, type Severity } from "./pack.ts";
import type { Atlas } from "./pack.ts";
import { FORM_JUDGEMENT_MAX_WER } from "../speech/evidence.ts";
import { verdicts, type MeasureId, type Verdict } from "../speech/capability.ts";

/**
 * The pack, minus everything written in English for developers.
 *
 * A variety pack is authored in one language — ours — because it is data about
 * a language, read by whoever maintains it and by the model. Several of its
 * fields are prose: `learner.who`, `learner.because`, `rules[].reason`,
 * `correspondences[].cue`, `orthography.note`. They are correct, useful, and
 * must never reach a reader.
 *
 * They did. Three times:
 *
 *   - `orthography.note` rendered a paragraph of English at the bottom of the
 *     dialect checker, in all seven locales, including Russian.
 *   - `learner.because` rendered another on the About page, likewise.
 *   - a finding's `reason` explained a Bernese form in English to a French
 *     reader, inside the one feature whose entire job is telling a learner
 *     which regional form they are looking at.
 *
 * Each was fixed where it was found, which is why there was a third. The fix
 * that ends it is not vigilance: it is that a component cannot reach the
 * field at all. `app/**\/*.tsx` imports THIS, never `active.ts`, and
 * `display.test.ts` fails the build if that ever stops being true.
 *
 * API routes still import the full pack — they build the model's prompt, and
 * the prompt is meant to be English.
 */

export type DisplayRule = {
  /** What to print. Literal matches show themselves; regexes carry a label. */
  label: string;
  severity: Severity;
  /** A PLACE, e.g. "Bern" — not a sentence. Safe in any locale. */
  origin?: string;
  /** The form this variety uses instead. A dialect word, not prose. */
  suggest?: string;
};

export type DisplayCorrespondence = {
  bridge: string;
  target: string;
  /** e.g. `k → ch`. Letters, not prose. */
  rule: string;
};

/** A grammar topic, forms only. Its words live in the dictionaries, by id. */
export type DisplayGrammar = {
  id: string;
  examples: readonly { target: string; bridge: string }[];
};

/**
 * A dialect area, projected.
 *
 * Everything here survives because none of it is in any language: a slug, an
 * endonym (which is a NAME, and a name does not translate), canton codes, a
 * town and a point. The sentence explaining the dialect is translated and
 * lives in the dictionaries, keyed by `id` — the same split the grammar topics
 * make.
 *
 * `marks` is projected too, and it is the interesting one: it is READ from the
 * pack's rules rather than stored, so a page cannot show a form the gate does
 * not enforce. An empty list is the honest "Heidi cannot place this yet".
 */
export type DisplayArea = {
  id: string;
  endonym: string;
  cantons: readonly string[];
  town: string;
  place: { lon: number; lat: number };
  marks: readonly { theirs: string; ours: string }[];
  /**
   * Ids into `lib/research/sources.ts`. An id is not English prose — it is a
   * key — so it survives the projection, and a page can render the citation
   * without reaching past this file for the pack.
   */
  sources: readonly string[];
  /** True for the one variety this deployment actually teaches. */
  taught: boolean;
};

export type DisplayVariety = {
  tag: string;
  name: string;
  endonym: string;
  region: string;
  family?: { name: string; endonym: string; planned: readonly string[]; atlas?: Atlas };
  rules: readonly DisplayRule[];
  correspondences: readonly DisplayCorrespondence[];
  /**
   * Survives the projection intact: a pair of forms is not English prose. The
   * sentence explaining each one is translated and lives in the dictionaries,
   * looked up by `id`.
   */
  grammar: readonly DisplayGrammar[];
  /** Every dialect area of the family. Empty for a pack that has not mapped one. */
  areas: readonly DisplayArea[];
  /**
   * The words worth knowing first. A form, its bridge equivalent and a group
   * key — all three survive the projection because none is English prose; the
   * group's LABEL is translated and lives in the dictionaries.
   */
  vocabulary: readonly {
    target: string;
    bridge: string;
    group: string;
    /**
     * The article, the forms and an example all project for the same reason
     * the rest does: they are the variety's own words and a closed-set key,
     * never English prose. `FormLabel` is a key the dictionaries translate,
     * which is exactly why it was made closed rather than a free string.
     */
    article?: string;
    forms?: readonly { label: string; target: string; bridge: string }[];
    example?: { target: string; bridge: string };
    /** An id into `lib/research/sources.ts`, so a page can cite per word. */
    source?: string;
  }[];
  /** Ids into `lib/research/sources.ts` — keys, not prose, so they project. */
  vocabularySources: readonly string[];
  /** `note` is deliberately absent — it is a paragraph of English. */
  orthography: { convention: string };
  /**
   * What language technology exists for this variety.
   *
   * Three booleans, so it projects: there is no prose here to leak. A page
   * needs them because they decide which surfaces can exist at all — the
   * speaking screen explains that nothing transcribes this variety reliably,
   * which is true of Zurich German and false of Ukrainian, and a component
   * that assumed rather than read would be asserting a fact about a language
   * it is not teaching.
   */
  capabilities: { asr: boolean; tts: boolean; licensedAudio: boolean };
  /**
   * What the speaking evaluation can honestly offer for THIS variety.
   *
   * Ids and verdicts — enum values, not prose, so they project like everything
   * else here. The page holds the labels for each verdict in seven languages
   * and renders whichever one it is handed; nobody writes "we can check your
   * grammar" in any dictionary, because the sentence would then be a claim
   * made by a translator rather than by the engine.
   *
   * The error rates come along so the page can show its working: a verdict
   * without the number behind it is exactly the unfalsifiable marketing §8
   * exists to prevent.
   */
  speech: {
    measures: readonly { id: MeasureId; verdict: Verdict }[];
    wer: { target?: number; bridge?: number };
    /** The rate above which no form is judged — a decision, stated. */
    formMaxWer: number;
  };
  /**
   * One line of the variety itself, for the hero to show and then answer.
   * Only the line — its meaning is language, so it lives in the dictionaries.
   * Nothing here is English prose, which is the whole point of this file.
   */
  showcase?: { line: string };
};

/**
 * Everything a page may say about the variety it teaches.
 *
 * What survives the projection is names, places and letters: `Bern`, `nöd`,
 * `k → ch`. Those read correctly in every locale because they are not in any
 * locale — which is exactly why they are the safe half.
 */
export const DISPLAY: DisplayVariety = {
  tag: VARIETY.tag,
  name: VARIETY.name,
  endonym: VARIETY.endonym,
  region: VARIETY.region,
  family: VARIETY.family
    ? {
        name: VARIETY.family.name,
        endonym: VARIETY.family.endonym,
        planned: VARIETY.family.planned,
        atlas: VARIETY.family.atlas,
      }
    : undefined,
  rules: VARIETY.rules.map((rule) => ({
    label: ruleLabel(rule),
    severity: rule.severity,
    origin: rule.origin,
    suggest: rule.suggest,
  })),
  correspondences: VARIETY.correspondences.map((c) => ({
    bridge: c.bridge,
    target: c.target,
    rule: c.rule,
  })),
  grammar: (VARIETY.grammar ?? []).map((t) => ({
    id: t.id,
    examples: t.examples.map((e) => ({ target: e.target, bridge: e.bridge })),
  })),
  vocabulary: (VARIETY.vocabulary ?? []).map((w) => ({
    target: w.target,
    bridge: w.bridge,
    group: w.group,
    ...(w.article ? { article: w.article } : {}),
    ...(w.forms?.length ? { forms: w.forms.map((f) => ({ label: f.label, target: f.target, bridge: f.bridge })) } : {}),
    ...(w.example ? { example: { target: w.example.target, bridge: w.example.bridge } } : {}),
    ...(w.source ? { source: w.source } : {}),
  })),
  vocabularySources: VARIETY.vocabularySources ?? [],
  areas: areasOf(VARIETY).map((area) => ({
    id: area.id,
    endonym: area.endonym,
    cantons: area.cantons,
    town: area.town,
    place: { lon: area.place.lon, lat: area.place.lat },
    marks: marksFor(VARIETY, area),
    sources: area.sources,
    taught: isTaught(VARIETY, area),
  })),
  orthography: { convention: VARIETY.orthography.convention },
  capabilities: {
    asr: VARIETY.capabilities.recognition.available,
    tts: VARIETY.capabilities.tts,
    licensedAudio: VARIETY.capabilities.licensedAudio,
  },
  speech: {
    measures: verdicts({
      recognition: VARIETY.capabilities.recognition,
      bridgeRecognition: VARIETY.capabilities.bridgeRecognition,
      grammarCode: VARIETY.speech.grammarCode,
      bridgeGrammarCode: VARIETY.speech.bridgeGrammarCode,
    }),
    wer: {
      target: VARIETY.capabilities.recognition.wer,
      bridge: VARIETY.capabilities.bridgeRecognition?.wer,
    },
    formMaxWer: FORM_JUDGEMENT_MAX_WER,
  },
  showcase: VARIETY.showcase ? { line: VARIETY.showcase.line } : undefined,
};
