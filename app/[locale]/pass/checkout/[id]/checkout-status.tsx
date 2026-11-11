"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fill } from "@/lib/i18n/fill";
import { formatDate } from "@/lib/i18n/dates";
import type { Locale } from "@/lib/i18n/locales";

type State = "pending" | "paid" | "expired" | "failed";

type Words = {
  scan: string;
  openWallet: string;
  copy: string;
  copied: string;
  waiting: string;
  paid: string;
  expired: string;
  again: string;
  qrLabel: string;
};

const POLL_MS = 4000;

/**
 * Whether the invoice has been paid, asked every few seconds while this page
 * is open and visible.
 *
 * The webhook is the fast path; this is what still works when it is late,
 * unregistered or lost. Each poll makes the server ask OrangeCat, and a
 * `paid` answer grants the pass there, so the page never decides anything.
 */
export function CheckoutStatus({
  id,
  locale,
  initial,
  invoice,
  payUrl,
  words,
  backHref,
  children,
}: {
  id: string;
  locale: Locale;
  initial: { state: State; expiresAt: string | null };
  invoice: string | null;
  payUrl: string | null;
  words: Words;
  backHref: string;
  children?: React.ReactNode;
}) {
  const [status, setStatus] = useState(initial);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status.state !== "pending") return;
    let stopped = false;
    const timer = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch(`/api/pay/checkout/${id}`, { cache: "no-store" });
        if (!response.ok || stopped) return;
        const view = (await response.json()) as { state: State; entitlement: { expiresAt: string } | null };
        if (view.state !== "pending") setStatus({ state: view.state, expiresAt: view.entitlement?.expiresAt ?? null });
      } catch {
        // Offline for a moment: the next tick asks again.
      }
    }, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [id, status.state]);

  if (status.state === "paid") {
    return (
      <p role="status" className="mt-6 rounded-control border border-border-strong p-4 font-medium text-fg-primary">
        {fill(words.paid, { date: status.expiresAt ? formatDate(status.expiresAt, locale) : "…" })}
      </p>
    );
  }

  if (status.state === "expired" || status.state === "failed") {
    return (
      <div className="mt-6">
        <p role="status" className="text-fg-secondary">
          {words.expired}
        </p>
        <Link
          href={backHref}
          className="mt-4 inline-flex min-h-11 items-center rounded-control bg-action px-5 font-medium text-on-action hover:opacity-90"
        >
          {words.again}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {children}
      <p className="mt-5 leading-relaxed text-fg-secondary">{words.scan}</p>
      <div className="mt-4 flex flex-col gap-3">
        {payUrl && (
          <a
            href={payUrl}
            className="inline-flex min-h-11 items-center justify-center rounded-control bg-action px-5 font-medium text-on-action hover:opacity-90"
          >
            {words.openWallet}
          </a>
        )}
        {invoice && (
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(invoice).catch(() => undefined);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-control border border-border-strong px-5 font-medium text-fg-primary hover:bg-surface-sunk"
          >
            {copied ? words.copied : words.copy}
          </button>
        )}
      </div>
      <p role="status" aria-live="polite" className="mt-5 font-mono text-caption uppercase tracking-caps text-fg-muted">
        {words.waiting}
      </p>
    </div>
  );
}
