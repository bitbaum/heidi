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
    /**
     * Whether a picture can be attached at all.
     *
     * NO KEY MEANS YES. That is the change, and it is the whole point: Heidi's
     * free chain reads pictures as of ai-kit 1.11, which routes an image to a
     * model that can see instead of handing it to the text model at the front
     * of the chain. The button used to be an explanation-opener for everyone
     * without a key, on the strength of a sentence — "the free models cannot
     * read pictures" — that was never true of free models, only of a chain
     * with no vision routing.
     *
     * A CONNECTED key still decides for itself, and this is the case that
     * keeps the check alive rather than deleting it: a brought key REPLACES
     * the free chain (see `respondInThread`), so someone connected to Groq or
     * DeepSeek — text-only, both in the allowlist — genuinely cannot send a
     * picture, and telling them to attach one would be a worse lie than the
     * old one.
     *
     * Optimistic where we have no evidence, which matches what the chain does
     * underneath: if the deployment turns out to have no sighted vendor keyed,
     * the turn comes back `blind` and says so in one sentence. Refusing up
     * front would be this file guessing at something the chain answers.
     */
    canSee: config ? Boolean(provider?.visionModel) : true,
    save,
    clear,
  };
}
