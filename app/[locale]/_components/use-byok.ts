"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ByokConfig } from "@/lib/domain/model/byok";
import { findProvider } from "@/lib/domain/model/providers";

/**
 * The visitor's own key, held in their browser and nowhere else.
 *
 * localStorage rather than a cookie, deliberately: a cookie is attached to
 * every request to this origin whether or not it is one they chose to make,
 * which is precisely the property a bearer credential must not have. This is
 * read only when a message is sent.
 *
 * Exposed through `useSyncExternalStore` rather than state-plus-effect. Two
 * reasons, and the second is the one that matters: reading storage in an
 * effect and calling setState causes a cascading render, and localStorage is a
 * genuinely external store that can change underneath us — removing the key in
 * one tab should not leave another tab believing it is still connected.
 */

const STORAGE_KEY = "heidi.byok.v1";

/** Local edits fire no `storage` event, so the store announces its own writes. */
const listeners = new Set<() => void>();
function announce() {
  for (const l of listeners) l();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Cached, because `getSnapshot` must return a stable reference for unchanged
 * data — returning a fresh object each call makes React re-render forever.
 */
let cachedRaw: string | null = null;
let cachedValue: ByokConfig | null = null;

function parse(raw: string | null): ByokConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ByokConfig>;
    if (!parsed?.key || !parsed.model || !parsed.provider) return null;
    // A provider since removed from the allowlist must not be resurrected out
    // of an old browser's storage.
    if (!findProvider(parsed.provider)) return null;
    return { provider: parsed.provider, key: parsed.key, model: parsed.model };
  } catch {
    return null;
  }
}

function getSnapshot(): ByokConfig | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // private mode
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

/** The server has no storage, and must render the not-connected tree. */
const getServerSnapshot = (): ByokConfig | null => null;

export function useByok() {
  const config = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const save = useCallback((next: ByokConfig) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode or storage full — nothing useful to do, and the key still
      // works for this page's lifetime because the sheet holds it.
    }
    announce();
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // As above.
    }
    announce();
  }, []);

  const provider = config ? findProvider(config.provider) : undefined;

  return {
    config,
    provider,
    /**
     * True once the client has rendered. The first server-rendered pass always
     * reports no key, so anything that would otherwise flash "not connected"
     * waits for this.
     */
    ready: typeof window !== "undefined",
    /** Whether the connected model can be shown a picture. */
    canSee: Boolean(config && provider?.visionModel),
    save,
    clear,
  };
}
