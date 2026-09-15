"use client";

import { useCallback } from "react";
import { createBrowserStore, useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { add, decode, has, identity, remove, update } from "@/lib/domain/saved/collection";
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

  const save = useCallback(
    (word: Omit<SavedWord, "savedAt">, byok?: unknown) => {
      // The clock is read here rather than in the domain, so `add` stays pure
      // and the tests can pin a date instead of mocking time.
      const current = store.read() ?? EMPTY;
      const next = add(current, { ...word, savedAt: new Date().toISOString() });
      store.write(next);

      /**
       * Then, separately, ask for a sentence or two using it elsewhere.
       *
       * AFTER the write and never awaited, because saving must not depend on a
       * network. Someone on a tram taps keep, the word is theirs immediately,
       * and the examples either arrive a second later or never — the card
       * falls back to the sentence it came from, which is what it showed
       * before this feature existed.
       *
       * Skipped if the word was already in the list: `add` is a no-op on a
       * duplicate, so generating here would spend a call to overwrite examples
       * the learner already has.
       */
      if (next === current) return;

      void (async () => {
        try {
          const res = await fetch("/api/example", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ target: word.target, bridge: word.bridge, byok }),
          });
          if (!res.ok) return;

          const { examples } = (await res.json()) as { examples?: unknown };
          if (!Array.isArray(examples) || examples.length === 0) return;

          // Re-read rather than reusing `next`: a minute may have passed, and
          // the learner may have saved or removed other words meanwhile.
          const latest = store.read() ?? EMPTY;
          const mine = latest.words.find((w) => identity(w) === identity(word));
          if (!mine) return;

          store.write(
            update(latest, {
              ...mine,
              examples: examples.filter((e): e is string => typeof e === "string").slice(0, 2),
            }),
          );
        } catch {
          // No examples. The word is saved, which was the thing they asked for.
        }
      })();
    },
    [],
  );

  const forget = useCallback((target: string) => {
    const current = store.read() ?? EMPTY;
    store.write(remove(current, target));
  }, []);

  /**
   * Write a word back in place — how a review answer is recorded.
   *
   * `update`, not remove-then-add: the list is newest-first, and re-adding
   * would move a word to the top every time the learner answered a question
   * about it, quietly reordering their vocabulary as a side effect of using it.
   */
  const grade = useCallback((word: SavedWord) => {
    const current = store.read() ?? EMPTY;
    store.write(update(current, word));
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
    grade,
    forget,
    clear,
  };
}
