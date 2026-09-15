import { complete, freeChain, usableChain, type HealthTracker } from "@bitbaum/ai-kit";
import type { Thread } from "threadkit";
import { VARIETY } from "../../variety/active.ts";
import { systemPrompt } from "../../variety/prompt.ts";
import { EXPLANATION_LANGUAGE, type Locale } from "../../i18n/locales.ts";
import { heidiTurn } from "./thread.ts";
import { parseAnswer } from "./parse.ts";
import type { Answer, ChatMessage } from "./types.ts";
import { byokChain, readByok } from "../model/byok.ts";
import { visionMessage } from "./image.ts";

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
 */

/** Per link, not shared — a shared deadline is spent by the first vendor. */
const TIMEOUT_MS = 25_000;

export type RespondResult =
  | { status: "answered"; answer: Answer }
  | { status: "silent"; reason: string }
  | { status: "unconfigured" };

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
}): Promise<RespondResult> {
  const own = readByok(args.byok);
  const byokLinks = own.ok ? byokChain(own.config) : null;

  // A brought key REPLACES the free chain rather than extending it: falling
  // through to our free models after their paid model failed would answer a
  // picture with something that cannot see.
  const chain = byokLinks ? byokLinks.chain : usableChain(freeChain("HEIDI"), process.env);
  const env = byokLinks ? { ...process.env, ...byokLinks.env } : process.env;
  if (chain.length === 0) return { status: "unconfigured" };

  const pictures = args.pictures ?? [];

  const turn = await heidiTurn(args.thread, args.messages, {
    systemPrompt: systemPrompt(VARIETY, EXPLANATION_LANGUAGE[args.locale]),
    model: chain[0]?.model ?? "unknown",
    complete: async ({ system, prompt, maxTokens, temperature }) => {
      const { text: raw } = await complete({
        chain,
        env,
        health: args.health,
        temperature,
        maxTokens,
        timeoutMs: TIMEOUT_MS,
        signal: args.signal,
        messages: [
          { role: "system", content: system },
          // ai-kit's `ChatMessage.content` accepts content parts since 1.x, so
          // this is now typed all the way through. It used to be an
          // `as unknown as` cast with a note asking for exactly that widening.
          pictures.length > 0
            ? { role: "user" as const, content: visionMessage(prompt, pictures) }
            : { role: "user" as const, content: prompt },
        ],
      });
      return raw;
    },
  });

  // Silence is a normal outcome in a group — threadkit's rule is that the
  // assistant waits to be addressed once there are three or more people. It
  // spends no model call and is not an error.
  if (turn.status === "skipped") return { status: "silent", reason: turn.reason };

  return { status: "answered", answer: parseAnswer(turn.raw, VARIETY, turn.model) };
}
