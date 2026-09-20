"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Dictionary } from "@/lib/i18n";
import { useStorageReady } from "@/lib/browser/store";
import {
  NO_STORES,
  exportAll,
  forget,
  humanSize,
  storesSnapshot,
  subscribeStores,
} from "@/lib/browser/stores";

/**
 * Everything this browser is holding for Heidi, and a button to remove it.
 *
 * WHY THIS CAN EXIST HERE AND NOT IN MOST PRODUCTS. The privacy section of
 * HEIDI.md is not a policy, it is an architecture: saved words, the signed-out
 * conversation, a brought key and the speaking takes all live in this browser
 * and nowhere else. So "show me what you have and delete it" is four
 * localStorage reads rather than a subject-access request, an export pipeline
 * and a deletion job. The page that was here before said that in a paragraph
 * and linked away; this does it.
 *
 * THE LIST COMES FROM THE PRIVACY PAGE. Not a second copy — `lib/browser/stores`
 * derives the keys from the same `FLOWS` the privacy page renders, and a test
 * asserts the two agree. A settings page with its own list is a settings page
 * that will one day forget a key and leave data behind while promising it is
 * gone.
 *
 * SIZES, NOT CONTENTS. "4.2 kB" needs no knowledge of any store's shape and
 * cannot go stale; "11 saved words" needs four decoders that rot one at a
 * time. The question somebody opening this page actually has is whether there
 * is anything of theirs in here.
 */
export function DataSection({ t, labels }: { t: Dictionary["settings"]; labels: Dictionary["privacy"]["flows"] }) {
  // Storage is an external store, subscribed to rather than mirrored into
  // state: the server pass cannot read it, a delete in this tab announces
  // itself, and a delete in another tab arrives on the `storage` event. None of
  // that needs an effect, which is the hydration mismatch this codebase has
  // already been bitten by twice.
  const stores = useSyncExternalStore(subscribeStores, storesSnapshot, () => NO_STORES);
  const ready = useStorageReady();

  const drop = useCallback((key: string) => forget(key), []);

  const download = useCallback(() => {
    const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heidi-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    // Revoked on the next tick rather than immediately: Safari has not always
    // finished reading the blob by the time `click()` returns.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  const held = stores.filter((s) => s.bytes > 0);
  const total = held.reduce((sum, s) => sum + s.bytes, 0);

  return (
    <div>
      <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.dataBody}</p>

      {/* "Not read yet" is not "nothing stored": showing the empty state during
          the server pass would tell somebody their data is gone for the length
          of a hydration. */}
      {!ready ? null : held.length === 0 ? (
        <p className="mt-4 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.dataEmpty}</p>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-safe gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle">
            {held.map((store) => (
              <li key={store.key} className="flex flex-wrap items-center justify-between gap-3 bg-surface-page p-3">
                <span className="min-w-0">
                  <span className="block text-sm text-fg-primary">
                    {labels[store.id as keyof typeof labels] ?? store.key}
                  </span>
                  {/* The key itself, so the invitation the privacy page makes —
                      open your own dev tools and check — is actionable here too. */}
                  <span className="mt-0.5 block font-mono text-caption text-fg-muted">
                    {store.key} · {humanSize(store.bytes)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => drop(store.key)}
                  className="min-h-11 shrink-0 rounded-control border border-border-strong px-3 text-sm font-medium text-fg-primary hover:text-accent"
                >
                  {t.dataForget}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* Export before delete, in that order and on that side. Somebody
                who wants to leave should meet the way to keep their things
                before the way to destroy them. */}
            <button
              type="button"
              onClick={download}
              className="min-h-11 rounded-control border border-border-strong px-4 text-sm font-semibold text-fg-primary"
            >
              {t.dataExport}
            </button>
            <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{humanSize(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}
