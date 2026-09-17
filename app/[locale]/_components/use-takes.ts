"use client";

import { useCallback } from "react";
import { createBrowserStore, useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { TAKES_KEY, decodeTakes, previousTake, withTake, withoutTake, type Take } from "@/lib/domain/speaking/take";

/**
 * The learner's recordings, in their browser and nowhere else.
 *
 * All the judgement is in `lib/domain/speaking` (pure, tested) and all the
 * storage mechanics in `lib/browser/store` (written once), so this file is
 * only wiring — and it staying short is the check that the seam was cut in
 * the right place. Same shape as `use-saved`, deliberately.
 */

const store = createBrowserStore(TAKES_KEY, decodeTakes);

const EMPTY: Take[] = [];

export function useTakes() {
  const takes = useBrowserStore(store) ?? EMPTY;
  const ready = useStorageReady();

  const keep = useCallback((take: Take) => {
    const current = store.read() ?? EMPTY;
    store.write(withTake(current, take));
  }, []);

  const forget = useCallback((id: string) => {
    const current = store.read() ?? EMPTY;
    store.write(withoutTake(current, id));
  }, []);

  /** The take before a given one, for "fewer pauses than last time". */
  const before = useCallback((id: string) => previousTake(store.read() ?? EMPTY, id), []);

  return {
    takes,
    /**
     * False during the server pass, when storage cannot be read. Anything that
     * would otherwise flash "nothing recorded" before the real answer waits.
     */
    ready,
    keep,
    forget,
    before,
  };
}
