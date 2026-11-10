"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { othersStore, syncSettingStore } from "../_components/sync-stores";
import { turnSyncOn } from "../_components/sync-switch";

/**
 * Progress on every device — the switch.
 *
 * OFF BY DEFAULT, and only offered signed in. Everything Heidi knows about a
 * learner's progress lives in this browser until they say otherwise, and the
 * privacy page says so; this is where they say otherwise, and where they take
 * it back. Turning it off removes this device's copy from the server; "delete"
 * removes every device's.
 */
export function SyncSection({
  t,
  signedIn,
}: {
  t: Dictionary["sync"];
  signedIn: boolean;
}) {
  const setting = useBrowserStore(syncSettingStore);
  const ready = useStorageReady();
  const [state, setState] = useState<"idle" | "busy" | "failed" | "deleted">(
    "idle",
  );

  if (!ready) return null;
  if (!signedIn)
    return (
      <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">
        {t.signInFirst}
      </p>
    );

  const on = setting?.on === true;

  const turnOn = () => {
    turnSyncOn();
    setState("idle");
  };

  const remove = async (all: boolean) => {
    setState("busy");
    try {
      const query =
        all || !setting ? "" : `?device=${encodeURIComponent(setting.device)}`;
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
    <>
      <div className="mt-6 border-t border-border-subtle pt-6">
        <h3 className="font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">
          {t.title}
        </h3>
        <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">
          {t.body}
        </p>
        {on && (
          <p className="mt-3 font-mono text-caption uppercase tracking-caps text-fg-muted">
            {t.on}
          </p>
        )}
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
        {state === "deleted" && (
          <p className="mt-3 text-sm text-fg-secondary">{t.deleted}</p>
        )}
        {state === "failed" && (
          <p role="alert" className="mt-3 text-sm text-fg-secondary">
            {t.failed}
          </p>
        )}
      </div>
      <ReminderSwitch t={t} syncOn={on} />
    </>
  );
}

/**
 * The reminder switch: off until they turn it on, and offered only where it
 * can work — the server can read what is due only for a device that syncs.
 * The time zone is the browser's own, read when it is switched on, so the mail
 * arrives in their evening and not the server's.
 */
function ReminderSwitch({
  t,
  syncOn,
}: {
  t: Dictionary["sync"];
  syncOn: boolean;
}) {
  const [on, setOn] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/mail/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (body: { reminders?: boolean } | null) =>
          live && setOn(body?.reminders === true),
      )
      .catch(() => live && setOn(false));
    return () => {
      live = false;
    };
  }, []);

  const change = async (next: boolean) => {
    setFailed(false);
    setOn(next);
    try {
      const res = await fetch("/api/mail/preferences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reminders: next,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setOn(!next);
      setFailed(true);
    }
  };

  return (
    <div id="reminders" className="mt-6 border-t border-border-subtle pt-6">
      <h3 className="font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">
        {t.reminderTitle}
      </h3>
      <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">
        {t.reminderBody}
      </p>
      {syncOn ? (
        <label className="mt-4 flex min-h-11 max-w-measure items-center justify-between gap-4">
          <span className="text-base text-fg-primary">{t.reminderLabel}</span>
          <input
            type="checkbox"
            checked={on === true}
            disabled={on === null}
            onChange={(e) => void change(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
        </label>
      ) : (
        <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-muted">
          {t.reminderNeedsSync}
        </p>
      )}
      {failed && (
        <p role="alert" className="mt-3 text-sm text-fg-primary">
          {t.failed}
        </p>
      )}
    </div>
  );
}
