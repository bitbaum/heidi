/**
 * What one exchange with Heidi produces.
 *
 * Deliberately a structure and not markdown. The UI renders components from
 * these fields — a gloss is a row, a reply is a button you can copy — and a
 * blob of prose would make all of that impossible and untestable besides.
 */

/** The two things a person ever wants: decode what arrived, or produce what they mean. */
export type Intent = "understand" | "produce";

export type Tone = "warm" | "neutral" | "formal" | "curt" | "playful" | "annoyed";

export const TONES: readonly Tone[] = ["warm", "neutral", "formal", "curt", "playful", "annoyed"];

/** One word worth knowing, tied back to the language the learner already has. */
export type Gloss = {
  /** The form as it appeared. */
  form: string;
  /** The bridge-language equivalent, when there is one. */
  standard: string;
  english: string;
  /** The sound correspondence that explains it, when one applies. */
  rule: string;
};

/** A sendable message. `clean` is the deterministic gate's verdict, not the model's opinion. */
export type Reply = {
  label: string;
  text: string;
  english: string;
  clean: boolean;
  /** Why it is not clean, when it is not. Shown to us, not hidden. */
  flags: string[];
};

export type Answer = {
  intent: Intent;
  /** For `understand`, the meaning. For `produce`, the sentence to send. */
  meaning: string;
  tone: Tone;
  toneNote: string;
  glosses: Gloss[];
  replies: Reply[];
  note: string;
  /** Which model answered. Shown, because an answer with no provenance is a rumour. */
  model: string;
};

export type AskFailure = {
  error: string;
  /** True when the operator can fix it — no key, no budget — vs. a bad request. */
  operator: boolean;
};
