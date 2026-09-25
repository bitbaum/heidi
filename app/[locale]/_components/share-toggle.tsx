"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { fill } from "@/lib/i18n/fill";

/** A team member's own switch: show the organiser my standings, or not. */
export function ShareToggle({
  groupId,
  organiser,
  initial,
  t,
}: {
  groupId: string;
  organiser: string;
  initial: boolean;
  t: Dictionary["team"];
}) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const flip = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/groups/${groupId}/share`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ share: !on }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setOn(!on);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-measure">
      <p className="text-base leading-relaxed text-fg-secondary">{fill(t.shareBody, { name: organiser })}</p>
      {on && <p className="mt-3 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.sharing}</p>}
      <button
        type="button"
        disabled={busy}
        onClick={() => void flip()}
        className={`mt-4 inline-flex min-h-11 items-center px-5 text-sm font-medium disabled:opacity-60 ${
          on
            ? "border border-border-strong text-fg-primary hover:bg-fg-primary hover:text-surface-page"
            : "bg-action text-on-action hover:opacity-90"
        }`}
      >
        {on ? t.shareOff : fill(t.shareOn, { name: organiser })}
      </button>
      {failed && (
        <p role="alert" className="mt-3 text-sm text-fg-secondary">
          {t.failed}
        </p>
      )}
    </div>
  );
}
