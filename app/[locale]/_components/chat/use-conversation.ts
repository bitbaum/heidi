"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/domain/chat/types";
import { HEIDI_ID } from "@/lib/domain/chat/types";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { MAX_IMAGES } from "@/lib/domain/chat/image";
import { downscale } from "../downscale";
import { localId, type Transport } from "./transports";

/**
 * Sending a message, and everything that can go wrong with it.
 *
 * This is the half of a chat that genuinely is shareable — the markup is not,
 * which is why the pieces around it take a `className` instead of becoming a
 * package. It was written once in `chat.tsx`, correctly, and then the group
 * chat was written again without: no retry, no failure bubble, no distinction
 * between "not configured" and "vendor blipped", no optimistic append.
 */
export function useConversation({
  transport,
  locale,
  t,
  imageTooBig,
  byok,
  initial = [],
  me,
}: {
  transport: Transport;
  locale: Locale;
  t: Dictionary["chat"];
  /** From `dict.model`, which is where the image strings live. */
  imageTooBig: string;
  /** The visitor's own key, forwarded untouched. Never read here. */
  byok: unknown;
  initial?: ChatMessage[];
  /** The author id to stamp on the reader's own messages. */
  me: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  /**
   * The turn in flight, so it can be stopped.
   *
   * THERE WAS NO WAY TO CANCEL A TURN. Every transport accepted a `signal` and
   * nothing ever passed one, so a slow answer could only be waited out — the
   * standard's item 4, "a turn you cannot cancel is the thing that makes a
   * slow answer feel broken" (fleet `SHARED.md`, from loki `Composer.tsx`).
   */
  const inFlight = useRef<AbortController | null>(null);
  const [attached, setAttached] = useState<string[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  /**
   * The explanation as it arrives, for the surfaces whose transport streams.
   *
   * NOT a message. It is a preview of a turn that has not been checked yet, and
   * it is replaced wholesale by the real message the moment the answer lands —
   * so nothing downstream can mistake it for something that passed the gate,
   * and a failed turn leaves no half-answer behind.
   */
  const [streaming, setStreaming] = useState("");

  const accept = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setAttachError(null);
      // Capped by the updater, not by a count read here: downscaling is async,
      // so a length captured now is already stale by the time the picture is
      // ready. Only the count inside `prev` is true at the moment of the write.
      for (const file of files.slice(0, MAX_IMAGES)) {
        try {
          const prepared = await downscale(file);
          setAttached((prev) => (prev.length >= MAX_IMAGES ? prev : [...prev, prepared.dataUrl]));
        } catch {
          setAttachError(imageTooBig);
        }
      }
    },
    [imageTooBig],
  );

  const removeAttachment = useCallback((index: number) => {
    setAttached((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const run = useCallback(
    async (text: string, retry = false) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      // Taken before the optimistic update so a failure could put them back.
      const images = attached;
      setAttached([]);
      setAttachError(null);

      // On a retry the question is already on screen and the failed reply is
      // dropped, so it replaces that turn rather than stacking under it.
      const base = retry ? dropTrailingFailure(messages) : messages;
      const mine: ChatMessage = {
        id: localId("local"),
        authorId: me,
        body: trimmed,
        createdAt: new Date().toISOString(),
      };
      const history = retry ? base.slice(0, -1) : base;

      setMessages(retry ? base : [...base, mine]);
      setInput("");
      setBusy(true);
      setStreaming("");

      const controller = new AbortController();
      inFlight.current = controller;

      const result = await transport({
        text: trimmed,
        history,
        locale,
        byok,
        images,
        signal: controller.signal,
        onText: setStreaming,
      });

      inFlight.current = null;
      setBusy(false);
      // Cleared BEFORE the message lands, so there is never a frame showing
      // the preview and the finished answer at the same time.
      setStreaming("");

      /*
       * STOPPED. The partial text is DISCARDED, not kept as an answer, and that
       * is specific to this product: the streamed preview is the model's text
       * before the variety gate has read it. Keeping it would make Stop a way
       * to publish dialect nobody checked — the one thing every answer here is
       * built to prevent. What stays is the learner's question and a bubble
       * with Retry, which is the standard's item 5.
       */
      if (controller.signal.aborted) {
        setMessages((prev) => [
          ...prev,
          { id: localId("stop"), authorId: HEIDI_ID, body: "", createdAt: new Date().toISOString(), error: t.stopped },
        ]);
        return;
      }

      if (result.status === "ok") {
        setMessages((prev) => [...prev, ...result.messages.filter((m) => m.authorId !== me || !retry)]);
        return;
      }
      // Silence spends no model call and is a normal outcome in a group.
      if (result.status === "silent") return;

      const message =
        result.kind === "unconfigured"
          ? t.notConfigured
          : result.kind === "unreachable"
            ? t.unreachable
            : // Its own sentence. `t.failed` says "try again in a moment",
              // which is advice that cannot work here — nothing in reach has
              // eyes, and a minute will not change that.
              result.kind === "blind"
              ? t.cannotSeePicture
              : t.failed;

      setMessages((prev) => [
        ...prev,
        { id: localId("err"), authorId: HEIDI_ID, body: "", createdAt: new Date().toISOString(), error: message },
      ]);
    },
    [attached, busy, byok, locale, me, messages, t.cannotSeePicture, t.failed, t.notConfigured, t.stopped, t.unreachable, transport],
  );

  const send = useCallback((text: string) => void run(text), [run]);

  const retry = useCallback(() => {
    const last = lastOwn(messages, me);
    if (last) void run(last, true);
  }, [messages, me, run]);

  /** Abandon the turn in flight. A no-op when nothing is. */
  const stop = useCallback(() => {
    inFlight.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setInput("");
  }, []);

  return {
    messages,
    setMessages,
    input,
    setInput,
    busy,
    /** The unchecked explanation so far. "" whenever nothing is in flight. */
    streaming,
    send,
    retry,
    stop,
    reset,
    attached,
    attachError,
    accept,
    removeAttachment,
  };
}

/** The last thing the reader said, so a failed turn can be retried as-is. */
function lastOwn(messages: ChatMessage[], me: string): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].authorId === me) return messages[i].body;
  }
  return undefined;
}

/** Drop the failed reply so a retry replaces it rather than stacking under it. */
function dropTrailingFailure(messages: ChatMessage[]): ChatMessage[] {
  const last = messages[messages.length - 1];
  return last?.error ? messages.slice(0, -1) : messages;
}
