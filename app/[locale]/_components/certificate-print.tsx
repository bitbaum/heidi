"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

/**
 * The one personal thing on a certificate, kept in this page only: a name to
 * print above the statement. Never sent, never stored — the certificate's
 * public page carries no name by design.
 */
export function CertificatePrint({ t }: { t: Dictionary["certificate"] }) {
  const [name, setName] = useState("");
  return (
    <>
      <div className="mt-6 flex flex-wrap items-end gap-3 print:hidden">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm text-fg-secondary">
          {t.nameLabel}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            autoComplete="name"
            className="min-h-11 rounded-control border border-border-strong bg-surface-page px-3 text-base text-fg-primary"
          />
        </label>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-11 items-center bg-action px-5 text-sm font-medium text-on-action hover:opacity-90"
        >
          {t.print}
        </button>
      </div>
      {name.trim() && (
        <p className="mt-8 font-heading text-3xl font-semibold tracking-display text-fg-primary">{name}</p>
      )}
    </>
  );
}
