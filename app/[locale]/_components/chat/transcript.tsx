"use client";

import type { RefObject } from "react";
import type { ChatMessage } from "@/lib/domain/chat/types";
import { HEIDI_ID } from "@/lib/domain/chat/types";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { AnswerView } from "./answer-view";
import { Failed, FromHeidi, Mine, Said } from "./bubble";
import { Dot } from "./icons";
import { useSpokenAnswers } from "./use-spoken-answers";

/**
 * The conversation, whoever is in it.
 *
 * One routing decision per message — mine, Heidi's, or another person's — in
 * one place, so the solo chat and a group cannot disagree about what a message
 * looks like. They disagreed badly before this existed: the group rendered
 * Heidi's answers as plain paragraphs and dropped everything underneath them.
 *
 * `className` is how the surfaces keep their own chrome. The home page wants a
 * bordered panel, a group wants a minimum height, the full-screen chat wants to
 * be the scrolling element. Markup differs where it should; the routing does
 * not.
 */
export function Transcript({
  messages,
  me,
  t,
  voiceT,
  busy,
  streaming,
  nameFor,
  onRetry,
  onMove,
  locale,
  endRef,
  className,
}: {
  messages: ChatMessage[];
  /** The reader's own actor id — `LEARNER_ID` solo, the OIDC sub in a group. */
  me: string;
  t: Dictionary["chat"];
  voiceT: Dictionary["voice"];
  busy?: boolean;
  /**
   * The explanation arriving, before the answer has been checked.
   *
   * Rendered in place of the thinking dots, in the same muted grey — it is
   * deliberately NOT styled like a finished answer, because it is not one yet:
   * the dialect line, the glosses and the suggestions are still with the
   * variety gate and appear together when it is done.
   */
  streaming?: string;
  /** Resolve another human's display name. Absent in a two-party chat. */
  nameFor?: (actorId: string) => string;
  onRetry?: (message: ChatMessage) => void;
  /**
   * Send a follow-up on the reader's behalf, for the chips under an answer.
   * Absent on a surface that cannot send, where chips would be dead buttons.
   */
  onMove?: (say: string) => void;
  /** For the grammar link on a chip. Absent means no grammar chips. */
  locale?: Locale;
  endRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  // Here rather than in each surface: every transcript is a place an answer
  // can arrive, and a rule about what happens when one does belongs with the
  // component that renders them all.
  useSpokenAnswers(messages);

  return (
    <div className={className} aria-live="polite">
      {messages.map((m, i) => {
        if (m.authorId === me) return <Mine key={m.id} body={m.body} label={t.you} />;

        if (m.authorId === HEIDI_ID) {
          return (
            <FromHeidi key={m.id}>
              {m.error ? (
                <Failed error={m.error} t={t} onRetry={onRetry ? () => onRetry(m) : undefined} />
              ) : m.answer ? (
                // The learner's line immediately before this reply, so a word
                // kept from it carries the sentence it came from. Walking back
                // from THIS message rather than from the end matters: taking
                // the last question would tag every kept word in a long thread
                // with whatever was asked most recently.
                <AnswerView
                  answer={m.answer}
                  t={t}
                  voiceT={voiceT}
                  context={askedBefore(messages, i, me)}
                  onMove={onMove}
                  locale={locale}
                />
              ) : (
                <p className="whitespace-pre-wrap text-base leading-relaxed text-fg-primary">{m.body}</p>
              )}
            </FromHeidi>
          );
        }

        return <Said key={m.id} body={m.body} name={nameFor?.(m.authorId) ?? m.authorId} />;
      })}

      {busy &&
        (streaming ? (
          // `aria-live` on the container already announces this; the dots
          // carried `role="status"` and a second live region inside a live
          // region makes a screen reader repeat the whole thing on every token.
          <p className="whitespace-pre-wrap text-base leading-relaxed text-fg-muted">
            {streaming}
            <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-fg-muted" aria-hidden="true" />
          </p>
        ) : (
          <p role="status" className="flex items-center gap-2 text-sm text-fg-muted">
            <span className="inline-flex gap-1" aria-hidden="true">
              <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
            </span>
            {t.thinking}
          </p>
        ))}

      {endRef && <div ref={endRef} />}
    </div>
  );
}

/** The reader's own last line before position `at`. */
function askedBefore(messages: ChatMessage[], at: number, me: string): string | undefined {
  for (let i = at - 1; i >= 0; i--) {
    if (messages[i].authorId === me) return messages[i].body;
  }
  return undefined;
}
