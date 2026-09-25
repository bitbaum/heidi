"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";

/**
 * "Issue certificate", offered where the situation panel already says, in
 * full, that this learner can follow the situation.
 *
 * The browser's own record is what shows the button; the SERVER decides, from
 * the synced record, whether a certificate is issued. The two can disagree for
 * a minute after practice (sync pushes a few seconds late) and the answer then
 * says exactly that rather than "no".
 */
export function CertificateButton({ scene, t, locale }: { scene: string; t: Dictionary["certificate"]; locale: Locale }) {
  const [state, setState] = useState<
    { kind: "idle" | "busy" | "sync" | "failed" } | { kind: "later"; held: number; total: number } | { kind: "done"; id: string }
  >({ kind: "idle" });

  const issue = async () => {
    setState({ kind: "busy" });
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scene }),
      });
      if (res.status === 401 || res.status === 403 || res.status === 412) return setState({ kind: "sync" });
      if (res.status === 409) {
        const { held, askable } = (await res.json()) as { held: number; askable: number };
        return setState({ kind: "later", held, total: askable });
      }
      if (!res.ok) return setState({ kind: "failed" });
      setState({ kind: "done", id: ((await res.json()) as { id: string }).id });
    } catch {
      setState({ kind: "failed" });
    }
  };

  if (state.kind === "done") {
    return (
      <Link
        href={`${href(locale, "situations")}/${scene}/certificate/${state.id}`}
        className="mt-4 inline-flex min-h-11 items-center bg-action px-5 text-sm font-medium text-on-action hover:opacity-90"
      >
        {t.view} →
      </Link>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => void issue()}
        disabled={state.kind === "busy"}
        className="inline-flex min-h-11 items-center border border-border-strong px-5 text-sm font-medium text-fg-primary transition-colors hover:bg-fg-primary hover:text-surface-page disabled:opacity-60"
      >
        {state.kind === "busy" ? t.getting : t.get}
      </button>
      {state.kind === "sync" && (
        <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">
          {t.syncFirst}{" "}
          <Link href={`${href(locale, "settings")}#account`} className="text-link underline underline-offset-4">
            →
          </Link>
        </p>
      )}
      {state.kind === "later" && (
        <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">
          {fill(t.notYet, { held: String(state.held), total: String(state.total) })}
        </p>
      )}
      {state.kind === "failed" && (
        <p role="alert" className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">
          {t.failed}
        </p>
      )}
    </div>
  );
}
