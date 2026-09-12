"use client";

import { useCallback } from "react";
import { createBrowserStore, useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { add, decode, has, remove } from "@/lib/domain/saved/collection";
import { EMPTY, type SavedWord } from "@/lib/domain/saved/types";

/**
 * The learner's kept words, in their browser.
 *
 * All the judgement lives in `lib/domain/saved` (pure, tested) and all the
 * storage mechanics in `lib/browser/store` (written once). This file is only
 * the wiring, which is why it is short — and it staying short is the check
 * that the seam was cut in the right place.
 */

const store = createBrowserStore("heidi.saved.v1", decode);

export function useSaved() {
  const collection = useBrowserStore(store) ?? EMPTY;
  const ready = useStorageReady();

  const save = useCallback((word: Omit<SavedWord, "savedAt">) => {
    // The clock is read here rather than in the domain, so `add` stays pure
    // and the tests can pin a date instead of mocking time.
    const current = store.read() ?? EMPTY;
    store.write(add(current, { ...word, savedAt: new Date().toISOString() }));
  }, []);

  const forget = useCallback((target: string) => {
    const current = store.read() ?? EMPTY;
    store.write(remove(current, target));
  }, []);

  const clear = useCallback(() => store.clear(), []);

  return {
    words: collection.words,
    /**
     * False during the server pass, when storage cannot be read. Anything that
     * would otherwise flash "nothing saved" before the real answer waits here.
     */
    ready,
    count: collection.words.length,
    isSaved: useCallback((target: string) => has(collection, target), [collection]),
    save,
    forget,
    clear,
  };
}
