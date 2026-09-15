"use client";

import { useCallback, useState } from "react";
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
  const [attached, setAttached] = useState<string[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);

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

      const result = await transport({ text: trimmed, history, locale, byok, images });

      setBusy(false);

      if (result.status === "ok") {
        setMessages((prev) => [...prev, ...result.messages.filter((m) => m.authorId !== me || !retry)]);
        return;
      }
      // Silence spends no model call and is a normal outcome in a group.
      if (result.status === "silent") return;

      const message =
        result.kind === "unconfigured" ? t.notConfigured : result.kind === "unreachable" ? t.unreachable : t.failed;

      setMessages((prev) => [
        ...prev,
        { id: localId("err"), authorId: HEIDI_ID, body: "", createdAt: new Date().toISOString(), error: message },
      ]);
    },
    [attached, busy, byok, locale, me, messages, t.failed, t.notConfigured, t.unreachable, transport],
  );

  const send = useCallback((text: string) => void run(text), [run]);

  const retry = useCallback(() => {
    const last = lastOwn(messages, me);
    if (last) void run(last, true);
  }, [messages, me, run]);

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
    send,
    retry,
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
