import type { Answer } from "./types.ts";

/**
 * What a streaming turn sends, and nothing else.
 *
 * A CLOSED union, for the same reason the follow-up moves are a closed
 * vocabulary: both ends switch on `type`, so a frame shape invented on one
 * side and not the other is a type error rather than a silently ignored event.
 *
 * IT LIVES IN THE DOMAIN, NOT IN THE ROUTE. The client needs this type and the
 * route produces it, so the obvious home is the route file — and that would
 * make a browser module import a server module for its types. `import type` is
 * erased, so it would work; it would also be the kind of edge that stops being
 * erased the day somebody adds a value import next to it. The wire contract
 * between two halves of this product is a fact about the product.
 *
 * WHY A TERMINAL EVENT IS MANDATORY. An event stream has already sent its
 * headers by the time anything goes wrong, so it cannot report a status. A
 * stream that simply ended would be indistinguishable from a vendor dying
 * mid-sentence — and that is the most likely failure here, not the least. So
 * every turn ends with exactly one of `answer`, `silent` or `error`, and a
 * stream that closes without one is treated by the client as a failure.
 */
export type StreamEvent =
  /**
   * The explanation so far — the WHOLE of it, not a fragment to append.
   *
   * Sending the accumulated value rather than the delta costs a few bytes and
   * buys idempotence: a duplicated frame changes nothing, and the client needs
   * no accumulator that could drift from the server's.
   */
  | { type: "text"; text: string }
  /**
   * The finished answer, after the deterministic variety gate has run.
   *
   * It REPLACES whatever the text events showed. Only the explanation is ever
   * streamed; the dialect line, the glosses and the suggestions appear for the
   * first time here, checked. A learner cannot audit dialect, so nothing the
   * gate judges is shown before the gate has judged it.
   */
  | { type: "answer"; answer: Answer }
  /** Heidi declined to speak. Normal in a group, never an error. */
  | { type: "silent" }
  /**
   * `blind` is not a synonym for `failed`, and merging them costs the reader
   * the one sentence that helps. A failed turn invites a retry; a blind one
   * cannot be retried into working, because nothing in reach has eyes. It is
   * decided before any request, so it is always cheap and always certain.
   */
  | { type: "error"; kind: "unconfigured" | "failed" | "blind" };
