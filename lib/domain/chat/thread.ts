/**
 * The conversation, modelled with `threadkit`.
 *
 * Today every thread has exactly two participants — the learner and Heidi —
 * and at two participants threadkit answers every turn, so this looks like
 * overkill for a chat with a bot. It is not, and the reason is the next
 * feature rather than this one.
 *
 * The product we are heading for is a group chat with Heidi IN it: you, a
 * tutor, two other learners, and the assistant, all in one thread. Every
 * schema that encodes "one human and one bot" — a `user_id` on the thread, a
 * `read_at` flag on the message row — is correct right up to the day a third
 * participant joins, and then all of it needs a migration. threadkit's whole
 * position is that permission is participation, so the two-party case and the
 * five-party case are the same object with a longer participant list.
 *
 * It also already encodes the social rule we would otherwise get wrong: with
 * two participants the assistant answers every turn because it IS the
 * conversation; with three or more it waits to be addressed, because two
 * humans talking to each other is not an invitation. Mentions match on whole
 * words, so "I had to wait again" does not summon it.
 */

import { afterEveryMessage, runAiTurn, visibleMessages, whenMentioned, type Message, type Thread } from "threadkit";
import { ASSISTANT_NAME } from "../../config/site.ts";
import type { ChatMessage } from "./types.ts";
import { HEIDI_ID, LEARNER_ID } from "./types.ts";

/**
 * When the assistant speaks.
 *
 * threadkit's default is right in shape — answer everything in a two-party
 * thread, wait to be addressed in a group — but its aliases are the generic
 * `role` and `"ai"`. People address a bot by its NAME, so in a group
 * "heidi, was heisst das?" would have been ignored while "assistant, ..."
 * worked, which is backwards. Caught by a test rather than by a tutor.
 *
 * Mentions match on whole words, so "I had to wait again" does not summon it.
 */
function respondPolicy(ctx: Parameters<typeof afterEveryMessage>[0]): boolean {
  const active = ctx.thread.participants.filter((p) => !p.leftAt);
  if (active.length <= 2) return afterEveryMessage(ctx);
  return whenMentioned([ASSISTANT_NAME.toLowerCase(), ctx.self.role ?? "assistant", "ai"])(ctx);
}

export const THREAD_ID = "solo";

/**
 * The thread for a learner on their own.
 *
 * `visibleFrom: "thread-start"` because Heidi needs the whole conversation to
 * answer "why did they say it like that?" — a follow-up about a message the
 * assistant cannot see is the one failure that would make the chat feel broken
 * rather than merely limited. When a human tutor joins later, they get
 * threadkit's safe default instead: history is disclosed on purpose, never by
 * accident.
 */
export function soloThread(createdAt = new Date()): Thread {
  return {
    id: THREAD_ID,
    createdAt,
    participants: [
      { actorId: LEARNER_ID, kind: "human", role: "learner", joinedAt: createdAt, visibleFrom: "thread-start" },
      { actorId: HEIDI_ID, kind: "ai", role: "assistant", joinedAt: createdAt, visibleFrom: "thread-start" },
    ],
  };
}

/**
 * Our messages in threadkit's shape — only what it needs to order and gate.
 *
 * `threadId` is a parameter because this is called for GROUP threads too, and
 * it used to stamp every message with `THREAD_ID` ("solo") regardless. Harmless
 * while `runAiTurn` does not gate on it, and exactly the kind of latent
 * disagreement between a thread and its messages that stops being harmless
 * without warning.
 */
export function toThreadMessages(messages: ChatMessage[], threadId: string = THREAD_ID): Message[] {
  return messages.map((m) => ({
    id: m.id,
    threadId,
    authorId: m.authorId,
    body: m.body,
    createdAt: new Date(m.createdAt),
  }));
}

export type TurnResult =
  | { status: "responded"; raw: string; model: string }
  | { status: "skipped"; reason: string };

/**
 * How many turns the model is shown. Enough for a follow-up about something
 * a few answers up; beyond it the oldest turns stop earning their tokens and
 * start pulling the answer back towards themselves.
 */
export const MAX_CONTEXT = 20;

/**
 * What a turn SAID, as the model should remember it.
 *
 * A learner's turn is its body. Heidi's body is only the explanation — in
 * produce mode that is "here is a short sentence with X", and the sentence
 * itself lives in `answer.dialect`. Without it the model reads a history of
 * promises it never kept, and does the last one again.
 */
export function contextBody(message: ChatMessage): string {
  const dialect = message.answer?.dialect?.trim();
  return dialect ? `${message.body}\n  [the sendable line: ${dialect}]` : message.body;
}

function speaker(thread: Thread, authorId: string): string {
  if (authorId === HEIDI_ID) return ASSISTANT_NAME;
  const participant = thread.participants.find((p) => p.actorId === authorId);
  return participant?.role ?? participant?.kind ?? "unknown";
}

/**
 * The conversation as the model reads it: earlier turns marked as context,
 * and the one message to answer set apart from them.
 *
 * NOT threadkit's `renderTranscript`, which joins every turn into one
 * undifferentiated "role: body" list. Handed that, the model answers the
 * THREAD rather than the last line: asked «Pire» after three turns about «Le
 * Bilan», it wrote a fourth sentence about «Le Bilan» — twice. A short new
 * message loses to a long old topic unless something says which one is the
 * question.
 */
export function renderPrompt(thread: Thread, messages: ChatMessage[]): string {
  const recent = messages.slice(-MAX_CONTEXT);
  const latest = recent.at(-1);
  if (!latest) return "";
  const line = (m: ChatMessage) => `${speaker(thread, m.authorId)}: ${contextBody(m)}`;
  const earlier = recent.slice(0, -1);

  return [
    ...(earlier.length
      ? ["EARLIER IN THIS CONVERSATION — context only; every turn here has already been answered:", ...earlier.map(line), ""]
      : []),
    "THE MESSAGE TO ANSWER NOW:",
    line(latest),
  ].join("\n");
}

/**
 * Ask threadkit whether Heidi should speak, and if so produce the text.
 *
 * `complete` is supplied by the caller — threadkit never imports an SDK and
 * never reads a key, which is exactly why ai-kit slots underneath it without
 * either package needing to know the other exists.
 */
export async function heidiTurn(
  thread: Thread,
  messages: ChatMessage[],
  opts: {
    systemPrompt: string;
    complete: (input: {
      system: string;
      prompt: string;
      maxTokens: number;
      temperature: number;
    }) => Promise<string>;
    model: string;
  },
): Promise<TurnResult> {
  const threadMessages = toThreadMessages(messages, thread.id);
  // threadkit still decides what Heidi may SEE; only the rendering is ours.
  const seen = new Set(visibleMessages(thread, HEIDI_ID, threadMessages).map((m) => m.id));
  const prompt = renderPrompt(thread, messages.filter((m) => seen.has(m.id)));

  const result = await runAiTurn(thread, threadMessages, {
    actorId: HEIDI_ID,
    systemPrompt: opts.systemPrompt,
    model: opts.model,
    complete: (input) => opts.complete({ ...input, prompt }),
    shouldRespond: respondPolicy,
    // The chain leads with reasoning models, which spend budget on hidden
    // thinking before emitting a visible token. At 1200 a four-gloss answer
    // hit the ceiling mid-array on the first live request.
    maxTokens: 2400,
    temperature: 0.3,
  });

  if (result.status === "responded") {
    return { status: "responded", raw: result.body, model: result.generatedBy.model };
  }
  // Silence is a normal outcome and spends no model call. It surfaces as a
  // reason, never as an error the visitor has to interpret.
  return { status: "skipped", reason: result.reason };
}
