"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";

/**
 * «Folgen» on a register row — the one action that turns the catalogue into
 * something Heidi watches for you.
 *
 * The register page is public and cached for everyone, so this button does
 * not know whether you are signed in or already following. It asks the
 * server; a 401 sends you to the channels page, whose door explains and
 * signs you in and brings you back. A success says so in place, and the next
 * visit to `/channels` has the show in it.
 */
export function FollowButton({ input, register, t, locale }: { input: string; register: string; t: Dictionary["channels"]; locale: Locale }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done" | "failed">("idle");

  async function follow() {
    if (state === "busy" || state === "done") return;
    setState("busy");
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input, register }),
      });
      if (res.status === 401 || res.status === 503) {
        router.push(href(locale, "channels"));
        return;
      }
      setState(res.ok ? "done" : "failed");
    } catch {
      setState("failed");
    }
  }

  if (state === "done") return <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.followedAlready}</span>;

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={state === "busy"}
        onClick={() => void follow()}
        className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-4 text-sm font-medium text-fg-primary transition-colors hover:bg-fg-primary hover:text-surface-page disabled:opacity-60"
      >
        {state === "busy" ? t.following : t.follow}
      </button>
      {state === "failed" && (
        <span role="alert" className="text-sm text-danger">
          {t.errors.failed}
        </span>
      )}
    </span>
  );
}
