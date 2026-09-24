import {
  NoVisionLinkError,
  complete,
  completeStream,
  freeChain,
  usableChain,
  type HealthTracker,
} from "@bitbaum/ai-kit";
import type { Thread } from "threadkit";
import { VARIETY } from "../../variety/active.ts";
import { systemPrompt } from "../../variety/prompt.ts";
import { EXPLANATION_LANGUAGE, type Locale } from "../../i18n/locales.ts";
import { heidiTurn } from "./thread.ts";
import { parseAnswer } from "./parse.ts";
import type { Answer, ChatMessage } from "./types.ts";
import { byokChain, readByok } from "../model/byok.ts";
import { visionMessage } from "./image.ts";
import { describeMessage, parseMessage } from "./email.ts";
import { partialField } from "./partial.ts";
import { withReply } from "./moves.ts";
import { HEIDI_ID } from "./types.ts";

/**
 * Ask Heidi to take a turn in a thread — ANY thread.
 *
 * Lifted out of `/api/chat` when groups needed the identical thing: pick a
 * chain, honour a brought key, hand threadkit a `complete` callback, parse
 * what comes back through the dialect gate. Copying thirty lines of ai-kit
 * wiring into a second route is how two endpoints end up with different
 * timeouts, different fallbacks, and only one of them redacting keys.
 *
 * What stays in the routes is what genuinely differs: who is allowed to speak,
 * what a rate limit means there, and where the reply is stored.
 *
 * STREAMING IS AN OBSERVATION, NOT A SECOND PATH. Pass `onText` and the model
 * call goes through ai-kit's `completeStream` instead of `complete`; the turn
 * is assembled exactly as before and every guard still runs on the whole
 * answer. A separate "streaming respond" would be the third copy of this
 * wiring, and the second one already drifted (see the cast `/api/chat` was
 * still carrying).
 */

/** Per link, not shared — a shared deadline is spent by the first vendor. */
const TIMEOUT_MS = 25_000;

/**
 * If the reader's latest turn was a pasted message, say so — in structure.
 *
 * Only the LATEST turn. An email pasted four messages ago has already been
 * answered; re-describing it every turn would spend the budget re-explaining a
 * letter while the reader is asking about something else, and would make the
 * model drift back to it.
 *
 * Returns "" for ordinary text, which is most turns. See `email.ts` for why
 * this is a deterministic parse rather than something the model is asked to do.
 */
export function pastedContext(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    /**
     * "Not Heidi", NOT "is the learner".
     *
     * The obvious test is `authorId === LEARNER_ID`, and it is wrong here in a
     * way that fails silently: `LEARNER_ID` is the id the SOLO thread stamps
     * on the reader's turns, and this function also serves groups — where
     * every human carries their own OrangeCat actor id and none of them is
     * `LEARNER_ID`. Written that way, pasting a letter into a study group
     * would quietly get none of this, and nothing would look broken.
     */
    if (message.authorId === HEIDI_ID) continue;
    const parsed = parseMessage(message.body);
    // A bare quoted chain with no envelope is not worth a note: the model can
    // read it perfectly well, and the only thing to say would be "some of this
    // is older", which the quoting already shows.
    return parsed && parsed.kind === "headers" ? describeMessage(parsed) : "";
  }
  return "";
}

export type RespondResult =
  | { status: "answered"; answer: Answer }
  | { status: "silent"; reason: string }
  | { status: "unconfigured" }
  /**
   * A picture arrived and nothing reachable can read one.
   *
   * Its own outcome rather than a failed turn, because the two need opposite
   * sentences. "Heidi could not answer just now, try again" invites a retry
   * that cannot work: no model in reach has eyes, and none will grow them in a
   * minute. The honest answer names the one thing that does help — their own
   * key — and that is only sayable if this is distinguishable from a vendor
   * blip. ai-kit decides it BEFORE any request, so this costs nothing.
   */
  | { status: "blind" };

export async function respondInThread(args: {
  thread: Thread;
  messages: ChatMessage[];
  locale: Locale;
  /** The caller's own key, unvalidated — `readByok` decides. */
  byok?: unknown;
  /** Inline data URLs. Only a brought key can see them. */
  pictures?: string[];
  health?: HealthTracker;
  signal?: AbortSignal;
  /**
   * Called as the explanation arrives, with the whole of it so far.
   *
   * ONLY the explanation — never the dialect line. `text` is prose in the
   * reader's own language and is explicitly not judged by the variety gate;
   * everything the gate DOES judge waits for `parseAnswer`. A learner cannot
   * audit dialect, so showing them an ungated form even briefly is the failure
   * this product exists to prevent. See `partial.ts`.
   *
   * Absent means the old request/response path, unchanged.
   */
  onText?: (soFar: string) => void;
}): Promise<RespondResult> {
  const own = readByok(args.byok);
  const byokLinks = own.ok ? byokChain(own.config) : null;

  // A brought key REPLACES the free chain rather than extending it: falling
  // through to ours after their paid model failed would spend our budget
  // answering a turn they are paying for, and would silently downgrade the
  // answer they chose.
  //
  // It used to say the fallback would "answer a picture with something that
  // cannot see". That reason is gone as of ai-kit 1.11 — `complete()` routes
  // on vision now and will not hand a picture to a blind link, ours or
  // theirs. The rule survives on the budget argument alone, which was always
  // the stronger half.
  const chain = byokLinks ? byokLinks.chain : usableChain(freeChain("HEIDI"), process.env);
  const env = byokLinks ? { ...process.env, ...byokLinks.env } : process.env;
  if (chain.length === 0) return { status: "unconfigured" };

  const pictures = args.pictures ?? [];

  // Recognised deterministically, before any model is asked. Used twice: to
  // tell the model what it is looking at, and — after the answer comes back —
  // to guarantee the reply offer the model may have forgotten.
  const pasted = pastedContext(args.messages);

  /**
   * `heidiTurn` wraps the model call, so the vision refusal surfaces from in
   * there rather than from a line we can guard directly. Catching it around
   * the whole turn is correct anyway: ai-kit throws it BEFORE any request, so
   * nothing has been spent and nothing partial has been shown.
   *
   * Narrow on purpose. Every other failure stays a failure — a chain that
   * genuinely died must not be reported to a learner as "bring your own key".
   */
  let turn;
  try {
    turn = await heidiTurn(args.thread, args.messages, {
      // The pasted-message note is appended HERE rather than by each caller, so
      // every surface that can hold a conversation gets it without having to
      // remember. That is the whole reason this function exists.
      systemPrompt: [systemPrompt(VARIETY, EXPLANATION_LANGUAGE[args.locale]), pasted].filter(Boolean).join("\n\n"),
      model: chain[0]?.model ?? "unknown",
      complete: async ({ system, prompt, maxTokens, temperature }) => {
        const call = {
          chain,
          env,
          health: args.health,
          temperature,
          maxTokens,
          timeoutMs: TIMEOUT_MS,
          signal: args.signal,
          messages: [
            { role: "system" as const, content: system },
            // ai-kit's `ChatMessage.content` accepts content parts since 1.x, so
            // this is now typed all the way through. It used to be an
            // `as unknown as` cast with a note asking for exactly that widening.
            pictures.length > 0
              ? { role: "user" as const, content: visionMessage(prompt, pictures) }
              : { role: "user" as const, content: prompt },
          ],
        };

        if (!args.onText) {
          const { text: raw } = await complete(call);
          return raw;
        }

        /**
         * The same chain, watched as it produces.
         *
         * `end` carries the assembled turn, so the accumulator is a fallback
         * rather than the source of truth — a vendor that stops mid-array still
         * reaches `parseAnswer`, which repairs truncated JSON and is the only
         * thing allowed to decide what an answer is.
         *
         * ai-kit stops falling back once a link has produced its first token,
         * because replaying from another vendor would make the reader watch the
         * answer restart. A break after that is `StreamInterrupted`, which
         * reaches the caller as an ordinary failed turn — the partial is
         * discarded rather than kept, since half an explanation with no gated
         * dialect under it is not an answer.
         */
        let raw = "";
        for await (const delta of completeStream(call)) {
          if (delta.type === "text") {
            raw += delta.text;
            args.onText(partialField(raw));
          } else if (delta.type === "end") {
            raw = delta.text;
          }
        }
        return raw;
      },
    });
  } catch (error) {
    if (error instanceof NoVisionLinkError) return { status: "blind" };
    throw error;
  }

  // Silence is a normal outcome in a group — threadkit's rule is that the
  // assistant waits to be addressed once there are three or more people. It
  // spends no model call and is not an error.
  if (turn.status === "skipped") return { status: "silent", reason: turn.reason };

  const answer = parseAnswer(turn.raw, VARIETY, turn.model);

  // The one follow-up we can be sure about without asking a model. See
  // `withReply` for why an instruction in the prompt is not enough.
  if (pasted) return { status: "answered", answer: { ...answer, next: withReply(answer.next ?? []) } };

  return { status: "answered", answer };
}
