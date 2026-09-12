"use client";

import { useCallback } from "react";
import { createBrowserStore, useBrowserStore, useStorageReady } from "@/lib/browser/store";
import type { ByokConfig } from "@/lib/domain/model/byok";
import { findProvider } from "@/lib/domain/model/providers";

/**
 * The visitor's own key, held in their browser and nowhere else.
 *
 * The storage mechanics that used to live here — the cached snapshot, the
 * self-announcing writes, the guards around a localStorage that throws in
 * private mode — moved to `lib/browser/store` when saved words needed the
 * same four non-obvious things. They are explained there. This file keeps
 * only what is true about a KEY specifically, which is the validation below.
 */

const store = createBrowserStore<ByokConfig>("heidi.byok.v1", (raw) => {
  try {
    const parsed = JSON.parse(raw) as Partial<ByokConfig>;
    if (!parsed?.key || !parsed.model || !parsed.provider) return null;
    // A provider since removed from the allowlist must not be resurrected out
    // of an old browser's storage — that allowlist is the SSRF defence, and it
    // would be worth nothing if yesterday's storage could reopen a host.
    if (!findProvider(parsed.provider)) return null;
    return { provider: parsed.provider, key: parsed.key, model: parsed.model };
  } catch {
    return null;
  }
});

export function useByok() {
  const config = useBrowserStore(store);
  const ready = useStorageReady();

  const save = useCallback((next: ByokConfig) => store.write(next), []);
  const clear = useCallback(() => store.clear(), []);

  const provider = config ? findProvider(config.provider) : undefined;

  return {
    config,
    provider,
    /**
     * True once the client has rendered. The first server-rendered pass always
     * reports no key, so anything that would otherwise flash "not connected"
     * waits for this.
     */
    ready,
    /** Whether the connected model can be shown a picture. */
    canSee: Boolean(config && provider?.visionModel),
    save,
    clear,
  };
}
