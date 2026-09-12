/**
 * A conversation with Heidi.
 *
 * The thing this replaces was a form with a mode switch — "Understand" or
 * "Say it" — and the switch was the bug. Someone arrives with a communication
 * problem, not with a decision about which of our tools to use, and making
 * them classify their own problem before we help is the oldest way to make
 * software feel like software.
 *
 * So there is one input, the model decides what was wanted, and the exchange
 * is a thread rather than a vending machine: a follow-up ("why did they say it
 * like that?") is an ordinary next message instead of a new query with no past.
 */

/** What the model decided the person wanted. Not asked of them. */
export type Mode =
  /** They pasted something in the target variety and need it decoded. */
  | "understand"
  /** They said what they mean and need it in the target variety. */
  | "produce"
  /** A question about the language or the conversation so far. */
  | "answer";

export const MODES: readonly Mode[] = ["understand", "produce", "answer"];

export type Tone = "warm" | "neutral" | "formal" | "curt" | "playful" | "annoyed";
export const TONES: readonly Tone[] = ["warm", "neutral", "formal", "curt", "playful", "annoyed"];

/** One word worth keeping, tied back to the language the learner already has. */
export type Gloss = {
  form: string;
  /** The bridge-language equivalent, when there is one. */
  standard: string;
  /** The explanation, in the reader's language. */
  english: string;
  /** A correspondence the PACK vouches for, or "" — never the model's invention. */
  rule: string;
};

/** Something sendable. `clean` is the deterministic gate's verdict, not the model's. */
export type Suggestion = {
  label: string;
  text: string;
  english: string;
  clean: boolean;
  /** Why it is not clean. Shown, not hidden — drift we cannot see is drift we ship. */
  flags: string[];
};

/** One turn from Heidi. */
export type Answer = {
  mode: Mode;
  /** The main body: the meaning, the sentence to send, or the answer. */
  text: string;
  /**
   * Present when the answer itself is target-variety text the person could
   * send. Split from `text` so the gate has something unambiguous to check and
   * the UI has something unambiguous to offer a copy button for.
   */
  dialect?: string;
  /** The gate's verdict on `dialect`, when there is one. */
  dialectClean?: boolean;
  dialectFlags?: string[];
  tone?: Tone;
  toneNote?: string;
  glosses: Gloss[];
  suggestions: Suggestion[];
  note?: string;
  /** Which model answered. An answer with no provenance is a rumour. */
  model: string;
};

/** A message in the thread, as the UI holds it. */
export type ChatMessage = {
  id: string;
  /** `me` is the learner; `heidi` is the assistant. Humans join later. */
  authorId: string;
  /** What the person typed, for their own turns. */
  body: string;
  createdAt: string;
  /** Present on Heidi's turns. */
  answer?: Answer;
  /** Set on an optimistic send, cleared when the server confirms. */
  clientId?: string;
  /** Set when this turn failed, so the UI can offer a retry instead of a void. */
  error?: string;
};

export const LEARNER_ID = "me";
export const HEIDI_ID = "heidi";
