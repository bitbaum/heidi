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

  /**
   * The take before a given one, for "fewer pauses than last time".
   *
   * Reads the SUBSCRIBED array rather than calling `store.read()`. Both give
   * the same answer, but `read` parses storage afresh, so the take it returns
   * is a new object on every render — and a caller that feeds it to `useMemo`
   * then recomputes forever. `useBrowserStore`'s snapshot is cached, which is
   * the property that makes memoising above it work at all.
   */
  const before = useCallback((id: string) => previousTake(takes, id), [takes]);

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
