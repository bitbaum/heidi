/**
 * What the speaking evaluation can honestly say, per variety, derived.
 *
 * WHY THIS FILE EXISTS. `evidence.ts` states the rule that decides whether a
 * transcript may be judged; the engine files each obey it. But a PAGE wanting
 * to describe the feature — the technology page, a pitch, a sector page — had
 * no way to ask "what does this amount to for the language we actually teach?"
 * without a human re-deriving the answer in prose. Prose derived by hand from
 * a rule is prose that goes stale the first time the rule's inputs change, and
 * the input here is a vendor's word error rate, which changes every few months.
 *
 * So the claim is COMPUTED. A measure declares the least evidence it needs;
 * the pack declares what recognition exists; the verdict falls out. Nobody
 * writes "we can check your grammar" anywhere — the page reads a verdict and
 * renders the label for it, in whichever language the reader is using.
 *
 * WHAT THIS BUYS, concretely: when Zurich German recognition improves past
 * `FORM_JUDGEMENT_MAX_WER`, one number in one pack changes and the technology
 * page starts saying grammar is checkable on the dialect — in seven languages,
 * with no copy edit and no chance of the page and the engine disagreeing. And
 * until that day, the page cannot overclaim even if somebody wants it to.
 *
 * THE REFUSAL IS DATA TOO. Pronunciation is listed here and marked refused, so
 * the absence is a row on the page rather than a silence. §8 forbids the claim
 * and this is where that shows up in the product: the one measure every
 * competitor advertises is the one this engine declines to produce, stated
 * next to the four it does.
 *
 * Pure: no I/O, no model, same input -> same output.
 */

import { evidenceFrom, type EvidenceKind, type Recognition } from "@bitbaum/speechkit";

/**
 * What a measure needs before it may say anything.
 *
 * `signal` is the fourth level and sits below `evidence.ts`'s three: it needs
 * no transcript at all, because it is measured from where the sound was and
 * where it was not. That is the level that makes the feature work for a
 * dialect nothing transcribes — silence, hesitation and phonation are real
 * properties of an utterance, and measuring them requires understanding none
 * of it.
 */
export type Needs = "signal" | EvidenceKind;

export type MeasureId = "delivery" | "fluency" | "words" | "grammar" | "pronunciation";

export type Measure = {
  id: MeasureId;
  needs: Needs;
  /**
   * Also needs a grammar service that covers the variety.
   *
   * Separate from `needs` because it fails independently: a variety can have
   * excellent recognition and still have nobody offering a rule checker for
   * it, and collapsing the two would report the wrong reason.
   */
  needsGrammarService?: true;
  /**
   * Never produced, at any evidence level, by decision rather than by limit.
   *
   * §8. A pronunciation score is the claim the register bans, and it is banned
   * because no amount of better recognition would make it honest: scoring an
   * accent against a native ideal is a judgement about a person, not a
   * measurement of an utterance. This flag is what stops a future contributor
   * reading the verdicts as "not yet" and implementing it when the WER drops.
   */
  refused?: true;
  /**
   * Where the code is, as `repo/path`, so a reader can go and check rather
   * than trust. The technology page links it to GitHub.
   */
  module: string;
  /**
   * The function the product must call for this measure to be real.
   *
   * `capability.wired.test.ts` requires something reachable from `app/` to
   * import it. A file path could not carry that check once the engine moved
   * into `@bitbaum/speechkit`: nothing in this repo imports a package's
   * internal file, it imports the package's name for the thing.
   */
  entry: string;
};

/** A measure's `module` as a URL a reader can open. */
export function sourceUrl(module: string): string {
  const [repo, ...path] = module.split("/");
  return `https://github.com/bitbaum/${repo}/blob/main/${path.join("/")}`;
}

/**
 * The five, in the order a learner meets them.
 *
 * Delivery first because it works everywhere and is the honest core; grammar
 * and pronunciation last because they are the two a buyer asks about, and the
 * page should answer those questions having already shown its working.
 */
export const MEASURES: readonly Measure[] = [
  { id: "delivery", needs: "signal", module: "speechkit/src/delivery.ts", entry: "measureDelivery" },
  { id: "fluency", needs: "words", module: "speechkit/src/spoken.ts", entry: "measureSpoken" },
  { id: "words", needs: "words", module: "heidi/lib/variety/check.ts", entry: "check" },
  {
    id: "grammar",
    needs: "words",
    needsGrammarService: true,
    module: "speechkit/src/languagetool.ts",
    entry: "checkGrammar",
  },
  { id: "pronunciation", needs: "words", refused: true, module: "—", entry: "—" },
];

/**
 * What a variety offers a measure.
 *
 * `bridge` is the interesting value and the reason this is four-valued rather
 * than a boolean. In a diglossic situation the learner has two varieties in
 * play, and "we cannot check your Zurich German grammar, we can check the
 * Standard German you will actually speak at the doctor's desk" is both true
 * and the more useful half — but only if the product says which one it did.
 */
export type Verdict = "target" | "bridge" | "none" | "refused";

const RANK: Record<Needs, number> = { signal: 0, none: 0, "meaning-only": 1, words: 2 };

export type VarietySpeech = {
  recognition: Recognition;
  bridgeRecognition?: Recognition;
  /** A grammar service code for the variety itself, or null if none covers it. */
  grammarCode: string | null;
  bridgeGrammarCode?: string | null;
};

function satisfies(measure: Measure, recognition: Recognition | undefined, grammarCode: string | null): boolean {
  if (measure.needs === "signal") return true;
  if (!recognition) return false;
  if (RANK[evidenceFrom(recognition)] < RANK[measure.needs]) return false;
  if (measure.needsGrammarService && !grammarCode) return false;
  return true;
}

/**
 * The verdict for one measure against one variety's capabilities.
 *
 * Order matters: the target variety is preferred over the bridge wherever both
 * would work, because the bridge is a fallback and reporting it when the real
 * thing is available would understate what the product does.
 */
export function verdictFor(measure: Measure, speech: VarietySpeech): Verdict {
  if (measure.refused) return "refused";
  if (satisfies(measure, speech.recognition, speech.grammarCode)) return "target";
  if (satisfies(measure, speech.bridgeRecognition, speech.bridgeGrammarCode ?? null)) return "bridge";
  return "none";
}

export function verdicts(speech: VarietySpeech): Array<{ id: MeasureId; verdict: Verdict }> {
  return MEASURES.map((measure) => ({ id: measure.id, verdict: verdictFor(measure, speech) }));
}

/**
 * Is there anything to show at all?
 *
 * A variety with no recognition in either direction still gets delivery, so
 * this is never false today — it exists so a future pack that somehow has
 * neither does not render an empty panel with a confident heading over it.
 */
export function anyMeasureAvailable(speech: VarietySpeech): boolean {
  return verdicts(speech).some((v) => v.verdict === "target" || v.verdict === "bridge");
}
