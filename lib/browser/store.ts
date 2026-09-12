/**
 * One way to keep something in the visitor's browser, and only one.
 *
 * `use-byok` worked this out first and got it right, and the reasoning is
 * worth keeping where the second and third users can find it:
 *
 *   - **localStorage, not a cookie.** A cookie is attached to every request to
 *     this origin whether or not the visitor chose to make it. For a bearer
 *     credential that is precisely the wrong property, and for saved words it
 *     is pointless weight on every page load.
 *   - **`useSyncExternalStore`, not state-plus-effect.** Reading storage in an
 *     effect and calling `setState` causes a cascading render. It is also
 *     genuinely external: clearing it in one tab must not leave another tab
 *     believing the data is still there.
 *   - **The snapshot must be cached.** `getSnapshot` has to return a stable
 *     reference for unchanged data; parsing fresh on every call returns a new
 *     object each time and React re-renders forever.
 *   - **Local writes fire no `storage` event.** That event is for OTHER tabs,
 *     so a store has to announce its own writes or the page that made the
 *     change is the one place that does not see it.
 *
 * Every one of those is a bug someone has to hit before they believe it. This
 * file is here so nobody hits them twice.
 *
 * Deliberately NOT generic over the storage backend. If saved words outgrow
 * localStorage the answer is IndexedDB, which is async and would change every
 * caller's shape — a seam pretending otherwise would be a lie. Swapping it is
 * a rewrite of this file and nothing else, which is the property that matters.
 */

import { useCallback, useSyncExternalStore } from "react";

/** Parse and validate what came out of storage. Return null to treat as absent. */
export type Decode<T> = (raw: string) => T | null;

export type BrowserStore<T> = {
  /** Read once, outside React. */
  read: () => T | null;
  write: (value: T) => void;
  clear: () => void;
  subscribe: (onChange: () => void) => () => void;
  /** For `useSyncExternalStore`; cached, so the reference is stable. */
  getSnapshot: () => T | null;
};

/**
 * Storage can throw rather than return null — Safari in private mode, and a
 * browser configured to block site data. Every access is guarded, because the
 * feature failing is acceptable and the page crashing is not.
 */
function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function createBrowserStore<T>(key: string, decode: Decode<T>): BrowserStore<T> {
  const listeners = new Set<() => void>();
  const announce = () => {
    for (const l of listeners) l();
  };

  // The cache is keyed on the RAW string: if storage has not changed, the
  // previously parsed value is returned by reference.
  let cachedRaw: string | null = null;
  let cachedValue: T | null = null;

  function getSnapshot(): T | null {
    const raw = safeGet(key);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedValue = raw === null ? null : decode(raw);
    }
    return cachedValue;
  }

  return {
    read: () => (typeof window === "undefined" ? null : getSnapshot()),
    getSnapshot,
    write(value: T) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Private mode or quota. Nothing useful to do — the value still holds
        // for this page's lifetime in whatever called us.
      }
      announce();
    },
    clear() {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // As above.
      }
      announce();
    },
    subscribe(onChange: () => void) {
      listeners.add(onChange);
      window.addEventListener("storage", onChange);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener("storage", onChange);
      };
    },
  };
}

/** The server has no storage and must render the empty tree. */
const NOTHING = () => null;

/** Subscribe a component to a store. */
export function useBrowserStore<T>(store: BrowserStore<T>): T | null {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, NOTHING);
}

/**
 * Subscribe that announces once, on the next tick.
 *
 * A note on why this is belt-and-braces rather than a fix, because the
 * investigation that produced it went down a wrong path first and the wrong
 * path is plausible enough to be worth naming:
 *
 * React's `useSyncExternalStore` DOES re-read the snapshot after hydration, in
 * a passive effect, even when `subscribe` never fires. A store whose value
 * cannot change after load is therefore safe with a no-op subscribe, and the
 * code that did that was correct.
 *
 * What made it look broken was the sandboxed dev server, where the HMR
 * websocket fails and the page never hydrates AT ALL — so every client
 * component is inert, not just this one. A microphone button that never
 * appeared and a saved-words list that rendered empty were the same
 * environment problem wearing two costumes. Check that something simple and
 * interactive works (open the menu) before concluding a hook is at fault.
 *
 * Announcing once is kept anyway: it costs one timer, it makes the
 * "unknowable on the server → known on the client" transition explicit rather
 * than implicit in React's hydration behaviour, and it is the only variant
 * that neither relies on that behaviour nor trips the React Compiler's
 * cascading-render rule (which is what rules out a mount effect calling
 * `setState`, and is what pushed the original author to `useSyncExternalStore`
 * in the first place).
 *
 * Module-level so its identity is stable — a fresh `subscribe` each render
 * makes React re-subscribe every render, and with a timer inside that is a
 * loop.
 */
const announceOnce = (onChange: () => void) => {
  const id = setTimeout(onChange, 0);
  return () => clearTimeout(id);
};

/**
 * A value only the client can compute, without a hydration mismatch.
 *
 * `read` MUST return a primitive or a stable reference: it is called on every
 * render, and returning a fresh object each time re-renders forever.
 */
export function useClientValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(announceOnce, read, () => serverValue);
}

/**
 * True once the client has hydrated.
 *
 * The first server-rendered pass cannot read storage, so anything that would
 * otherwise flash "nothing here" before the real answer arrives waits on this
 * rather than on the value itself.
 */
export function useStorageReady(): boolean {
  return useClientValue(TRUE, false);
}

const TRUE = () => true;

/** `write`/`clear` bound to a store, stable across renders. */
export function useStoreWriter<T>(store: BrowserStore<T>) {
  const write = useCallback((value: T) => store.write(value), [store]);
  const clear = useCallback(() => store.clear(), [store]);
  return { write, clear };
}
