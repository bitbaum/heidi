"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createBrowserStore, useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { DRAFT_KEY, decodeDraft, firstLine, isStillGoing, toDraft, type Draft } from "@/lib/domain/chat/draft";
import type { ChatMessage } from "@/lib/domain/chat/types";

/**
 * The signed-out conversation, in this browser.
 *
 * Wiring only — the judgement is in `lib/domain/chat/draft` and the storage
 * mechanics in `lib/browser/store`. Both surfaces that can hold a signed-out
 * conversation use this one store, which is what makes "expand" feel like the
 * same conversation getting bigger rather than a new one starting.
 */

const store = createBrowserStore<Draft>(DRAFT_KEY, decodeDraft);

export function useDraft() {
  const draft = useBrowserStore(store);
  const ready = useStorageReady();

  const keep = useCallback((messages: ChatMessage[], locale: string) => {
    // An empty thread is NOT written, and it does not clear either.
    //
    // It used to clear, so "is there a draft?" stayed a null check. That was
    // right while every open restored the stored thread. Now an old thread is
    // not put on screen — it is OFFERED (`useRestoreDraft`) — so the box is
    // empty on purpose while the stored thread is still there, and a write of
    // "nothing" on mount would delete the very thing on offer. Starting again
    // goes through `forget()`, which is explicit.
    const next = toDraft(messages, locale);
    if (next.messages.length > 0) store.write(next);
  }, []);

  return {
    draft,
    /**
     * False during the server pass, when storage cannot be read. Anything that
     * would otherwise flash an empty conversation before the real one arrives
     * waits on this.
     */
    ready,
    keep,
    forget: useCallback(() => store.clear(), []),
  };
}

/** Read once, outside React — for the moment after signing in. */
export function readDraft(): Draft | null {
  return store.read();
}

export function forgetDraft(): void {
  store.clear();
}

/** The earlier thread, offered as one row instead of being put back on screen. */
export type EarlierThread = {
  /** The learner's own first line, so the row is recognisable. */
  line: string;
  /** When it was last written, ISO — empty for a draft that predates the field. */
  when: string;
  /** Put it back, in place. */
  resume: () => void;
};

/**
 * What opening Heidi shows, decided once for every surface that holds a
 * signed-out conversation.
 *
 * A thread the learner was in a moment ago comes back exactly as it was. An
 * older one does NOT: the box opens empty and ready for the new sentence they
 * came with, and the old thread is one quiet row away (`earlier`). See
 * `STILL_GOING_MS` for why the line is where it is.
 *
 * `ready` is the committed restore, which is the moment anything that SENDS
 * may start (see `useDraftChat`). It is true after an empty restore too —
 * "nothing to put back" is also a finished restore.
 *
 * `earlier` goes away by itself when it stops being true: the first message of
 * the new conversation overwrites the stored thread, and starting again
 * forgets it, and either way the store no longer holds the thread that was on
 * offer. It is compared by its timestamp, not remembered as a flag.
 */
export function useRestoreDraft(setMessages: (messages: ChatMessage[]) => void, enabled = true) {
  const draft = useDraft();
  const ran = useRef(false);
  // One state for both facts — "the restore has been committed" and "what, if
  // anything, was left on offer" — because they are decided in the same moment
  // and a render must never see one without the other.
  const [arrival, setArrival] = useState<{ offered: Draft | null } | null>(null);

  useEffect(() => {
    // The server pass cannot read storage, and rendering the thread before it
    // can is a hydration mismatch. Read the store DIRECTLY rather than through
    // the subscribed value: `draft.ready` and the stored draft are two
    // independent subscriptions and nothing orders them.
    if (!enabled || ran.current || !draft.ready) return;
    ran.current = true;
    const stored = readDraft();
    const going = Boolean(stored) && isStillGoing(stored);
    if (stored && going) setMessages(stored.messages);
    setArrival({ offered: stored && !going && stored.messages.length > 0 ? stored : null });
  }, [enabled, draft.ready, setMessages]);

  const offered = arrival?.offered ?? null;
  const onOffer = offered && draft.draft?.updatedAt === offered.updatedAt ? offered : null;
  const line = onOffer ? firstLine(onOffer) : "";
  const earlier: EarlierThread | null =
    onOffer && line ? { line, when: onOffer.updatedAt, resume: () => setMessages(onOffer.messages) } : null;

  return { ready: arrival !== null, earlier, store: draft };
}
