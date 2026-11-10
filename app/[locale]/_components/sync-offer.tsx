"use client";

import type { Dictionary } from "@/lib/i18n";
import { useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { syncSettingStore } from "./sync-stores";
import { keepSyncOff, turnSyncOn } from "./sync-switch";

/**
 * The one time a signed-in learner is asked whether their progress should
 * travel with them.
 *
 * Sync stays OFF until somebody says so (HEIDI.md: nothing about what a
 * person cannot understand leaves the browser without a switch). But the
 * switch lived only in the settings, so a person who made an account to keep
 * their progress on their phone and their laptop had an account that did not
 * do it, and nothing said so. Asked here once; either answer is written down
 * and the question does not come back. Settings is where it changes later.
 */
export function SyncOffer({ t }: { t: Dictionary["sync"] }) {
  const setting = useBrowserStore(syncSettingStore);
  const ready = useStorageReady();
  if (!ready || setting) return null;

  return (
    <section aria-labelledby="sync-offer" className="rounded-control border border-border-strong p-5 sm:p-6">
      <h2 id="sync-offer" className="font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">
        {t.offerTitle}
      </h2>
      <p className="mb-0 mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.body}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={turnSyncOn}
          className="inline-flex min-h-12 items-center justify-center rounded-control bg-action px-3 text-center font-medium text-on-action transition-opacity hover:opacity-90"
        >
          {t.turnOn}
        </button>
        <button
          type="button"
          onClick={keepSyncOff}
          className="inline-flex min-h-12 items-center justify-center rounded-control border border-border-strong px-3 text-center font-medium text-fg-primary transition-colors hover:bg-surface-raised"
        >
          {t.offerKeepHere}
        </button>
      </div>
    </section>
  );
}
