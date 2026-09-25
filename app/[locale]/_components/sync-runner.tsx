"use client";

import { useEffect } from "react";
import { useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { decodeOthers, newestSaved, type SyncKey } from "@/lib/domain/progress/sync";
import { decodeModel } from "@/lib/domain/practice/model";
import { decodeHistory } from "@/lib/domain/practice/history";
import { decodeStreak } from "@/lib/domain/progress/streak";
import { decode as decodeSaved } from "@/lib/domain/saved/collection";
import { historyStore, modelStore } from "./practice-stores";
import { streakStore } from "./streak-store";
import { savedStore } from "./use-saved";
import { othersStore, syncSettingStore } from "./sync-stores";

/** What `/api/progress` returns for each OTHER device of the signed-in learner. */
type Device = {
  device: string;
  values: Partial<Record<SyncKey, unknown>>;
  updatedAt: Partial<Record<SyncKey, string>>;
};

const PUSH_AFTER_MS = 3000;
const PULL_EVERY_MS = 5 * 60_000;

/**
 * Keeps this browser's progress and the learner's other devices in step —
 * only when the learner has turned sync on (settings, signed in).
 *
 * Mounted on every page and does nothing otherwise: no request, no timer.
 * Signed out (401) it stops for the page view rather than retrying; turning
 * sync back on after signing in resumes it.
 *
 * PUSH: this device's OWN records, a few seconds after any of them changes.
 * PULL: the other devices' records into `othersStore`, on load, every few
 * minutes, and when the tab comes back into view. The saved-word list is the
 * one exception to "never merge": a newer list from another device is adopted
 * as this one's (see `newestSaved`), so a word removed there stays removed.
 */
export function SyncRunner() {
  const setting = useBrowserStore(syncSettingStore);
  const ready = useStorageReady();
  const on = ready && setting?.on === true;
  const device = setting?.device;

  useEffect(() => {
    if (!on || !device) return;
    let stopped = false;
    let adopting = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const headers = { "content-type": "application/json", "x-heidi-device": device };

    const push = async () => {
      if (stopped) return;
      const values = {
        model: modelStore.read(),
        history: historyStore.read(),
        streak: streakStore.read(),
        saved: savedStore.read(),
      };
      try {
        const res = await fetch("/api/progress", { method: "PUT", headers, body: JSON.stringify({ device, values }) });
        if (res.status === 401 || res.status === 403) stopped = true;
      } catch {
        // Offline: the next change or the next pull tries again.
      }
    };
    const schedulePush = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void push(), PUSH_AFTER_MS);
    };

    const pull = async () => {
      if (stopped) return;
      try {
        const res = await fetch("/api/progress", { headers });
        if (res.status === 401 || res.status === 403) {
          stopped = true;
          return;
        }
        if (!res.ok) return;
        const { devices } = (await res.json()) as { devices: Device[] };
        // Through the same decoders as local storage: what comes back from the
        // server is data another browser wrote, and is trusted no further.
        const others = decodeOthers(
          JSON.stringify({
            model: devices.flatMap((d) => (d.values.model ? [d.values.model] : [])),
            history: devices.flatMap((d) => (d.values.history ? [d.values.history] : [])),
            streak: devices.flatMap((d) => (d.values.streak ? [d.values.streak] : [])),
          }),
          { model: decodeModel, history: decodeHistory, streak: decodeStreak },
        );
        if (others) othersStore.write(others);

        const current = syncSettingStore.read();
        const adopt = newestSaved(
          current?.savedChangedAt ?? null,
          devices.flatMap((d) =>
            d.values.saved && d.updatedAt.saved ? [{ value: d.values.saved, updatedAt: d.updatedAt.saved }] : [],
          ),
        );
        const list = adopt ? decodeSaved(JSON.stringify(adopt)) : null;
        if (list && current) {
          adopting = true;
          savedStore.write(list);
          adopting = false;
          syncSettingStore.write({ ...current, savedChangedAt: new Date().toISOString() });
        }
      } catch {
        // Offline: keep showing the last fetched view.
      }
    };

    const onSavedChange = () => {
      if (adopting) return;
      const current = syncSettingStore.read();
      if (current) syncSettingStore.write({ ...current, savedChangedAt: new Date().toISOString() });
      schedulePush();
    };

    const unsubscribe = [
      modelStore.subscribe(schedulePush),
      historyStore.subscribe(schedulePush),
      streakStore.subscribe(schedulePush),
      savedStore.subscribe(onSavedChange),
    ];
    const onVisible = () => {
      if (document.visibilityState === "visible") void pull();
    };
    document.addEventListener("visibilitychange", onVisible);
    const every = setInterval(() => void pull(), PULL_EVERY_MS);

    void pull().then(push);

    return () => {
      stopped = true;
      clearTimeout(timer);
      clearInterval(every);
      document.removeEventListener("visibilitychange", onVisible);
      unsubscribe.forEach((u) => u());
    };
  }, [on, device]);

  return null;
}
