"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { othersStore, syncSettingStore } from "../_components/sync-stores";
import { savedStore } from "../_components/use-saved";

/**
 * Progress on every device — the switch.
 *
 * OFF BY DEFAULT, and only offered signed in. Everything Heidi knows about a
 * learner's progress lives in this browser until they say otherwise, and the
 * privacy page says so; this is where they say otherwise, and where they take
 * it back. Turning it off removes this device's copy from the server; "delete"
 * removes every device's.
 */
export function SyncSection({ t, signedIn }: { t: Dictionary["sync"]; signedIn: boolean }) {
  const setting = useBrowserStore(syncSettingStore);
  const ready = useStorageReady();
  const [state, setState] = useState<"idle" | "busy" | "failed" | "deleted">("idle");

  if (!ready) return null;
  if (!signedIn) return <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{t.signInFirst}</p>;

  const on = setting?.on === true;

  const turnOn = () => {
    const device = setting?.device ?? crypto.randomUUID();
    // A browser that already keeps words treats its own list as the newest,
    // so switching sync on can never replace a list with an older one.
    const hasSaved = (savedStore.read()?.words.length ?? 0) > 0;
    syncSettingStore.write({ on: true, device, savedChangedAt: hasSaved ? new Date().toISOString() : null });
    setState("idle");
  };

  const remove = async (all: boolean) => {
    setState("busy");
    try {
      const query = all || !setting ? "" : `?device=${encodeURIComponent(setting.device)}`;
      const res = await fetch(`/api/progress${query}`, { method: "DELETE" });
      if (!res.ok) throw new Error(String(res.status));
      if (setting) syncSettingStore.write({ ...setting, on: false });
      othersStore.clear();
      setState(all ? "deleted" : "idle");
    } catch {
      setState("failed");
    }
  };

  return (
    <div className="mt-6 border-t border-border-subtle pt-6">
      <h3 className="font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">{t.title}</h3>
      <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.body}</p>
      {on && <p className="mt-3 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.on}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        {on ? (
          <button
            type="button"
            disabled={state === "busy"}
            onClick={() => void remove(false)}
            className="inline-flex min-h-11 items-center border border-border-strong px-5 text-sm font-medium text-fg-primary transition-colors hover:bg-fg-primary hover:text-surface-page disabled:opacity-60"
          >
            {t.turnOff}
          </button>
        ) : (
          <button
            type="button"
            onClick={turnOn}
            className="inline-flex min-h-11 items-center bg-action px-5 text-sm font-medium text-on-action hover:opacity-90"
          >
            {t.turnOn}
          </button>
        )}
        <button
          type="button"
          disabled={state === "busy"}
          onClick={() => void remove(true)}
          className="inline-flex min-h-11 items-center px-2 text-sm text-link underline underline-offset-4 hover:text-accent disabled:opacity-60"
        >
          {t.deleteAll}
        </button>
      </div>
      {state === "deleted" && <p className="mt-3 text-sm text-fg-secondary">{t.deleted}</p>}
      {state === "failed" && (
        <p role="alert" className="mt-3 text-sm text-fg-secondary">
          {t.failed}
        </p>
      )}
    </div>
  );
}
