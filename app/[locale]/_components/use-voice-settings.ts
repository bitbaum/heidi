"use client";

import { createBrowserStore, useBrowserStore, useStoreWriter } from "../../../lib/browser/store.ts";
import {
  decodeVoiceSettings,
  DEFAULT_VOICE_SETTINGS,
  VOICE_SETTINGS_KEY,
  type VoiceSettings,
} from "../../../lib/voice/settings.ts";

/**
 * The voice settings, bound to this browser.
 *
 * MODULE-LEVEL STORE, deliberately. Every component that reads these — the
 * speak button on each suggestion, the settings page, the composer — has to
 * subscribe to the SAME store or changing the speed in settings leaves eight
 * buttons on the previous value until a reload. `store.ts` records why that
 * has to be one external store rather than state per component.
 *
 * Nothing here reaches the server. These three values describe how well
 * somebody understands a language, which §10 keeps out of our tables when it
 * does not have to be in them, and they have to work signed out because the
 * conversation does.
 */
const store = createBrowserStore<VoiceSettings>(VOICE_SETTINGS_KEY, decodeVoiceSettings);

export function useVoiceSettings() {
  const stored = useBrowserStore(store);
  const { write } = useStoreWriter(store);
  // The server pass and a browser with nothing stored are the same state, and
  // it is the defaults — which is why `speak` defaulting to false matters:
  // the first render of a page must never be one that starts talking.
  const settings = stored ?? DEFAULT_VOICE_SETTINGS;

  return {
    settings,
    /** Change one field, keeping the rest. */
    set: (patch: Partial<VoiceSettings>) => write({ ...settings, ...patch }),
  };
}
