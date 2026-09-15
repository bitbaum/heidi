"use client";

import { useCallback } from "react";
import { createBrowserStore, useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { DRAFT_KEY, decodeDraft, toDraft, type Draft } from "@/lib/domain/chat/draft";
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
    // An empty thread clears rather than storing an empty envelope, so
    // "is there a draft?" stays a null check for every caller.
    const next = toDraft(messages, locale);
    if (next.messages.length === 0) store.clear();
    else store.write(next);
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
