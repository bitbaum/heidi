"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";

/**
 * Accept an invitation.
 *
 * A deliberate button rather than a join-on-load: opening a link should not
 * enrol you in a group you have not decided to be in, and a page that acts on
 * arrival cannot be shared, previewed or prefetched safely.
 *
 * The two refusals say different things because they send a person to
 * different places — a dead link means ask for a new one, a full group means
 * ask to be let in when someone leaves.
 */
export function JoinButton({ token, t, locale }: { token: string; t: Dictionary["groups"]; locale: Locale }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.status === 409) {
        setError(t.full);
        return;
      }
      if (!res.ok) {
        setError(t.joinFailed);
        return;
      }

      const data = (await res.json()) as { group: { id: string } };
      router.push(href(locale, `groups/${data.group.id}`));
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={join}
        disabled={busy}
        className="inline-flex min-h-11 items-center rounded-control bg-action px-6 font-medium text-on-action transition-colors hover:opacity-90 disabled:bg-surface-sunk disabled:text-fg-muted"
      >
        {busy ? t.joining : t.join}
      </button>
      {error && (
        <p role="alert" className="mt-3 max-w-measure text-base text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
