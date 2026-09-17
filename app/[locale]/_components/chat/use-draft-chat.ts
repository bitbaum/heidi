"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { LEARNER_ID } from "@/lib/domain/chat/types";
import { useByok } from "../use-byok";
import { readDraft, useDraft } from "../use-draft";
import { useConversation } from "./use-conversation";
import { draftTransport } from "./transports";

/**
 * The signed-out conversation, wired up — once, for every surface that holds
 * one.
 *
 * WHY IT IS A HOOK AND NOT A COMPONENT. There are now three places a visitor
 * can talk to Heidi without an account: the home fold, the full-screen chat,
 * and the dock that floats over every other page. They cannot share MARKUP —
 * a four-column example grid is right in a page fold and absurd in a 380px
 * panel, and this repo's position is that chat markup is not shareable, which
 * is why the pieces take a `className`. What they must share is the WIRING,
 * because the wiring is what makes them one conversation rather than three:
 *
 *   the same `draftTransport`, so every surface posts to the same route;
 *   the same draft store, so a question asked in the dock is already there
 *     when the reader opens the full-screen chat;
 *   the same seed guard, which is load-bearing and easy to get wrong.
 *
 * THE SEED GUARD. Writing to the store on mount, before the restore has run,
 * clears the stored conversation every time anyone merely visits a page — the
 * box looks untouched and the thread is gone. It was correct in one place and
 * about to be copied into two more. Now it exists once.
 *
 * WHAT IS DELIBERATELY NOT IN HERE. The full-screen workspace keeps its own
 * wiring, and that is not an oversight. It does something this hook does not:
 * it SWITCHES transport on whether the reader is signed in, and when they sign
 * in mid-thread it offers to adopt the device-local conversation into their
 * account. Folding that in would mean a `signedIn` branch through every line
 * below, so the hook would carry a condition that two of its three callers can
 * never take. The shared part is the signed-out draft; that is what is shared.
 */
export function useDraftChat({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const byok = useByok();
  const draft = useDraft();
  const [sheetOpen, setSheetOpen] = useState(false);

  const chat = useConversation({
    transport: draftTransport(),
    locale,
    t: dict.chat,
    imageTooBig: dict.model.imageTooBig,
    byok: byok.config,
    me: LEARNER_ID,
  });

  const { messages, setMessages } = chat;

  /**
   * Two guards for one restore, and they are not redundant.
   *
   * The REF stops the restore happening twice. The STATE is how a caller knows
   * the restore has been COMMITTED — which is a different moment, and the one
   * that matters if you intend to send something.
   *
   * The bug it prevents: the dock can be opened by a page handing it a
   * question. Sending it in the same flush that restores the thread would send
   * it with `useConversation`'s closure still holding the pre-restore
   * messages — so the optimistic append would be `[question]` and the
   * conversation the reader already had would be dropped. Waiting for a
   * committed render means the send starts from the restored thread.
   */
  const restored = useRef(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (restored.current || !draft.ready) return;
    restored.current = true;
    const stored = readDraft();
    if (stored?.messages.length) setMessages(stored.messages);
    setReady(true);
  }, [draft.ready, setMessages]);

  const keepDraft = draft.keep;
  useEffect(() => {
    if (!restored.current) return;
    keepDraft(messages, locale);
  }, [messages, locale, keepDraft]);

  /**
   * Start again — the stored thread AND the one on screen.
   *
   * Both, always. Clearing only the component's state leaves the old
   * conversation in storage, where the next surface to mount restores it and
   * the reader watches the thread they just cleared come back.
   */
  const reset = useCallback(() => {
    draft.forget();
    chat.reset();
  }, [draft, chat]);

  return {
    chat,
    byok,
    reset,
    /**
     * The stored thread has been read and committed.
     *
     * Anything that SENDS on behalf of the reader must wait for this, or it
     * sends from an empty thread and drops whatever they had. Merely rendering
     * does not need to wait.
     */
    ready,
    /** Whether there is a conversation, as opposed to an empty box. */
    started: chat.messages.length > 0,
    modelSheet: { open: sheetOpen, show: () => setSheetOpen(true), hide: () => setSheetOpen(false) },
  };
}
